/**
 * AppFlowy Data Adapter & Bridge Layer for Hronika Plus
 * 
 * Unifies AppFlowy's database architecture as the central data engine and single source of truth:
 * - Schema mapping between TimelineItem and AppFlowy Database Row/Cells
 * - Bi-directional real-time synchronization between the Timeline View and AppFlowy Workspace
 * - Local-first offline persistence (IndexedDB / LocalStorage) with zero Cloud dependencies
 * - Cross-frame / cross-tab postMessage and BroadcastChannel transport
 */

import { TimelineItem, GroupConfig, TagConfig } from "../types";
import { DEFAULT_GROUPS } from "../data";

export interface AppFlowyCell {
  data: string | number | boolean | string[] | unknown[] | Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AppFlowyRow {
  id: string;
  title: string;
  cells: Record<string, AppFlowyCell>;
  meta?: {
    is_document_empty?: boolean;
    icon_id?: string;
    cover_id?: string;
  };
  documentBlocks?: Array<{
    id: string;
    type: "paragraph" | "heading" | "bulleted_list" | "callout";
    text: string;
  }>;
  updatedAt: number;
}

export interface AppFlowyDatabaseSchema {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: Record<string, {
    id: string;
    name: string;
    type: "text" | "date" | "select" | "multi_select" | "number";
    options?: unknown;
  }>;
}

const STORAGE_PREFIX = "hronika_af_db_";
const SYNC_CHANNEL_NAME = "hronika_appflowy_channel";

// Default Schema Definition for Timeline Database in AppFlowy
export const TIMELINE_DATABASE_SCHEMA: AppFlowyDatabaseSchema = {
  id: "hronika-timeline-db",
  name: "Hronika Događaji",
  primaryFieldId: "field_title",
  fields: {
    field_title: { id: "field_title", name: "Događaj / Naziv", type: "text" },
    field_date: { id: "field_date", name: "Vremenski raspon (BCE/CE)", type: "date" },
    field_category: { id: "field_category", name: "Kategorija", type: "select" },
    field_tags: { id: "field_tags", name: "Tagovi", type: "multi_select" },
    field_ruler: { id: "field_ruler", name: "Vladar", type: "text" },
    field_capital: { id: "field_capital", name: "Prestonica", type: "text" },
    field_empire: { id: "field_empire", name: "Svetska sila", type: "text" },
    field_writer: { id: "field_writer", name: "Pisac", type: "text" },
    field_place: { id: "field_place", name: "Mesto", type: "text" },
  }
};

/**
 * Format a historical year for display (BCE/CE in Serbian/English format)
 */
export function formatHistoricalYear(year: number, isApproximate?: boolean, lang: "sr" | "en" = "sr"): string {
  const prefix = isApproximate ? (lang === "sr" ? "oko " : "ca. ") : "";
  if (year < 0) {
    const absYear = Math.abs(year);
    return `${prefix}${absYear}. ${lang === "sr" ? "pre n. e." : "BCE"}`;
  }
  return `${prefix}${year}. ${lang === "sr" ? "n. e." : "CE"}`;
}

/**
 * Maps a TimelineItem to an AppFlowy Database Row
 */
export function timelineItemToAppFlowyRow(item: TimelineItem): AppFlowyRow {
  const dateData = {
    startYear: item.startYear,
    startMonth: item.startMonth || 1,
    endYear: item.endYear,
    endMonth: item.endMonth || 1,
    isApproximate: item.isApproximate || false,
    endApproximate: item.endApproximate || false,
    formatted: item.endYear !== undefined 
      ? `${formatHistoricalYear(item.startYear, item.isApproximate)} – ${formatHistoricalYear(item.endYear, item.endApproximate)}`
      : formatHistoricalYear(item.startYear, item.isApproximate)
  };

  const documentBlocks = item.description ? [
    {
      id: `block_${item.id}_p1`,
      type: "paragraph" as const,
      text: item.description
    }
  ] : [];

  return {
    id: item.id,
    title: item.title,
    cells: {
      field_title: { data: item.title },
      field_date: { 
        data: dateData.formatted,
        raw: dateData,
        is_range: item.endYear !== undefined
      },
      field_category: { 
        data: item.group, 
        color: item.color 
      },
      field_tags: { 
        data: item.tags || [] 
      },
      field_ruler: { data: item.ruler || "" },
      field_capital: { data: item.capital || "" },
      field_empire: { data: item.empire || "" },
      field_writer: { data: item.writer || "" },
      field_place: { data: item.place || "" }
    },
    meta: {
      is_document_empty: !item.description || item.description.trim() === "",
      icon_id: item.group.includes("Vladar") ? "👑" : item.group.includes("Svet") ? "🌍" : "📜",
      cover_id: item.image || ""
    },
    documentBlocks,
    updatedAt: Date.now()
  };
}

/**
 * Maps an AppFlowy Database Row to a TimelineItem
 */
export function appFlowyRowToTimelineItem(row: AppFlowyRow, fallbackColor?: string): TimelineItem {
  const cells = row.cells || {};
  const title = (cells.field_title?.data as string) || row.title || "Bez naziva";
  
  // Extract date
  const dateCell = cells.field_date;
  let startYear = 0;
  let startMonth: number | undefined;
  let endYear: number | undefined;
  let endMonth: number | undefined;
  let isApproximate = false;
  let endApproximate = false;

  if (dateCell && typeof dateCell === "object") {
    const raw = (dateCell as any).raw;
    if (raw && typeof raw.startYear === "number") {
      startYear = raw.startYear;
      startMonth = raw.startMonth;
      endYear = raw.endYear;
      endMonth = raw.endMonth;
      isApproximate = !!raw.isApproximate;
      endApproximate = !!raw.endApproximate;
    } else if (typeof dateCell.data === "string") {
      // Parse formatted date string fallback (e.g. "ca. 607 BCE" or "-607")
      const parsedNum = parseInt(dateCell.data, 10);
      if (!isNaN(parsedNum)) {
        startYear = parsedNum;
      }
    }
  }

  // Extract category / group
  const categoryCell = cells.field_category;
  const group = (categoryCell?.data as string) || "Biblijski događaji";
  const color = (categoryCell as any)?.color || fallbackColor;

  // Extract tags
  const tagsCell = cells.field_tags;
  const tags: string[] = Array.isArray(tagsCell?.data) 
    ? tagsCell.data as string[] 
    : typeof tagsCell?.data === "string" && tagsCell.data 
    ? [tagsCell.data] 
    : [];

  // Extract document body / description
  let description = "";
  if (Array.isArray(row.documentBlocks) && row.documentBlocks.length > 0) {
    description = row.documentBlocks.map(b => b.text).join("\n\n");
  }

  return {
    id: row.id,
    title,
    description,
    group,
    startYear,
    startMonth,
    endYear,
    endMonth,
    color,
    tags,
    isApproximate,
    endApproximate,
    image: row.meta?.cover_id || undefined,
    ruler: (cells.field_ruler?.data as string) || undefined,
    capital: (cells.field_capital?.data as string) || undefined,
    empire: (cells.field_empire?.data as string) || undefined,
    writer: (cells.field_writer?.data as string) || undefined,
    place: (cells.field_place?.data as string) || undefined,
  };
}

/**
 * AppFlowy Central Data Adapter
 * Manages the unified single-source-of-truth database for Hronika Plus
 */
export class AppFlowyDataAdapter {
  private projectId: string;
  private rows: Map<string, AppFlowyRow> = new Map();
  private groups: GroupConfig[] = DEFAULT_GROUPS;
  private listeners: Set<(items: TimelineItem[], groups: GroupConfig[]) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isInitialized = false;

  constructor(projectId: string = "default") {
    this.projectId = projectId;
    this.initTransport();
    this.loadFromStorage();
  }

  public setProjectId(newProjectId: string) {
    if (this.projectId === newProjectId) return;
    this.projectId = newProjectId;
    this.loadFromStorage();
    this.notify();
  }

  private initTransport() {
    if (typeof window === "undefined") return;

    // 1. BroadcastChannel for cross-tab and cross-context sync
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingSync(event.data);
        };
      } catch (_) {}
    }

    // 2. postMessage for embedded iframe communication
    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.source === "appflowy-workspace" && data.type === "HRONIKA_APPFLOWY_SYNC") {
        this.handleIncomingSync(data);
      }
    });
  }

  private handleIncomingSync(msg: any) {
    if (!msg || !msg.action) return;
    
    if (msg.action === "ROW_UPDATED" && msg.payload?.row) {
      this.rows.set(msg.payload.row.id, msg.payload.row);
      this.saveToStorage(false);
      this.notify();
    } else if (msg.action === "ROW_DELETED" && msg.payload?.id) {
      this.rows.delete(msg.payload.id);
      this.saveToStorage(false);
      this.notify();
    } else if (msg.action === "WORKSPACE_READY") {
      // When AppFlowy workspace loads, sync our full dataset to it
      this.broadcastAllRowsToWorkspace();
    }
  }

  /**
   * Broadcast current database state to the embedded workspace
   */
  public broadcastAllRowsToWorkspace() {
    if (typeof window === "undefined") return;

    const payload = {
      source: "hronika-plus",
      type: "HRONIKA_SYNC_ROWS",
      projectId: this.projectId,
      rows: Array.from(this.rows.values()),
      groups: this.groups,
      timestamp: Date.now()
    };

    // 1. Send via BroadcastChannel
    try {
      this.broadcastChannel?.postMessage(payload);
    } catch (_) {}

    // 2. Post to all iframes
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage(payload, "*");
      } catch (_) {}
    });
  }

  /**
   * Load database records from local persistence
   */
  public loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const key = `${STORAGE_PREFIX}${this.projectId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.rows)) {
          this.rows.clear();
          parsed.rows.forEach((r: AppFlowyRow) => {
            if (r && r.id) this.rows.set(r.id, r);
          });
        }
        if (Array.isArray(parsed.groups)) {
          this.groups = parsed.groups;
        }
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn("[AppFlowyDataAdapter] Failed to load from localStorage:", e);
    }
  }

  /**
   * Save database records to local persistence
   */
  private saveToStorage(broadcast: boolean = true) {
    if (typeof window === "undefined") return;

    try {
      const key = `${STORAGE_PREFIX}${this.projectId}`;
      const data = {
        projectId: this.projectId,
        rows: Array.from(this.rows.values()),
        groups: this.groups,
        updatedAt: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));

      if (broadcast) {
        this.broadcastAllRowsToWorkspace();
      }
    } catch (e) {
      console.warn("[AppFlowyDataAdapter] Failed to save to localStorage:", e);
    }
  }

  /**
   * Seed initial items into AppFlowy database if empty
   */
  public seedIfEmpty(items: TimelineItem[], groups?: GroupConfig[]) {
    if (this.rows.size === 0 && items.length > 0) {
      items.forEach(item => {
        const row = timelineItemToAppFlowyRow(item);
        this.rows.set(row.id, row);
      });
      if (groups && groups.length > 0) {
        this.groups = groups;
      }
      this.saveToStorage(true);
      this.notify();
    }
  }

  /**
   * Get all timeline items from the AppFlowy database
   */
  public getTimelineItems(): TimelineItem[] {
    const list: TimelineItem[] = [];
    this.rows.forEach(row => {
      list.push(appFlowyRowToTimelineItem(row));
    });
    return list;
  }

  public getGroups(): GroupConfig[] {
    return [...this.groups];
  }

  public setGroups(groups: GroupConfig[]) {
    this.groups = groups;
    this.saveToStorage(true);
    this.notify();
  }

  /**
   * Insert or update a timeline item as an AppFlowy row
   */
  public async saveItem(item: TimelineItem): Promise<TimelineItem> {
    const row = timelineItemToAppFlowyRow(item);
    this.rows.set(row.id, row);
    
    // Auto-register group if needed
    if (!this.groups.some(g => g.name === item.group)) {
      this.groups.push({
        name: item.group,
        color: item.color || "#3E7B5C",
        visible: true
      });
    }

    this.saveToStorage(true);
    this.notify();

    // Notify iframe
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hronika:row-saved", { detail: { row, item } }));
    }

    return item;
  }

  /**
   * Delete an item/row from the AppFlowy database
   */
  public async deleteItem(id: string): Promise<boolean> {
    const deleted = this.rows.delete(id);
    if (deleted) {
      this.saveToStorage(true);
      this.notify();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hronika:row-deleted", { detail: { id } }));
      }
    }
    return deleted;
  }

  /**
   * Bulk import items into AppFlowy database
   */
  public async importItems(items: TimelineItem[]): Promise<void> {
    items.forEach(item => {
      const row = timelineItemToAppFlowyRow(item);
      this.rows.set(row.id, row);
    });
    this.saveToStorage(true);
    this.notify();
  }

  /**
   * Open the row document in AppFlowy Workspace
   */
  public openRowInWorkspace(rowId: string) {
    if (typeof window === "undefined") return;

    const message = {
      source: "hronika-plus",
      type: "HRONIKA_OPEN_ROW",
      rowId,
      timestamp: Date.now()
    };

    // Broadcast
    try {
      this.broadcastChannel?.postMessage(message);
    } catch (_) {}

    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage(message, "*");
      } catch (_) {}
    });
  }

  /**
   * Subscribe to database state changes
   */
  public subscribe(listener: (items: TimelineItem[], groups: GroupConfig[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const items = this.getTimelineItems();
    const groups = this.getGroups();
    this.listeners.forEach(cb => {
      try {
        cb(items, groups);
      } catch (err) {
        console.error("[AppFlowyDataAdapter] Listener error:", err);
      }
    });
  }
}

// Singleton instances keyed by project ID
const adapters = new Map<string, AppFlowyDataAdapter>();

export function getAppFlowyDataAdapter(projectId: string = "default"): AppFlowyDataAdapter {
  if (!adapters.has(projectId)) {
    adapters.set(projectId, new AppFlowyDataAdapter(projectId));
  }
  return adapters.get(projectId)!;
}
