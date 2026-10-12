/**
 * React Hook: useTimelineDatabase
 * Connects Hronika's Timeline View directly to AppFlowy Database as the single source of truth.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { TimelineItem, GroupConfig } from "../types";
import { DEFAULT_GROUPS } from "../data";
import { getAppFlowyDataAdapter, AppFlowyDataAdapter } from "./appflowyDataAdapter";
import { LangType } from "../translations";

export interface UseTimelineDatabaseOptions {
  timelineId: string;
  initialItems?: TimelineItem[];
  initialGroups?: GroupConfig[];
  lang?: LangType;
  onNavigateToSvici?: () => void;
}

export function useTimelineDatabase({
  timelineId,
  initialItems = [],
  initialGroups = DEFAULT_GROUPS,
  lang = "sr",
  onNavigateToSvici,
}: UseTimelineDatabaseOptions) {
  const adapter = useMemo(() => getAppFlowyDataAdapter(timelineId), [timelineId]);
  
  const [items, setItems] = useState<TimelineItem[]>(() => {
    const loaded = adapter.getTimelineItems();
    return loaded.length > 0 ? loaded : initialItems;
  });

  const [groups, setGroupsState] = useState<GroupConfig[]>(() => {
    const loaded = adapter.getGroups();
    return loaded.length > 0 ? loaded : initialGroups;
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "offline">("connected");

  // On mount or timelineId change, update adapter and seed if needed
  useEffect(() => {
    adapter.setProjectId(timelineId);
    
    // Seed initial items if adapter is empty
    if (initialItems && initialItems.length > 0) {
      adapter.seedIfEmpty(initialItems, initialGroups);
    }

    // Load state
    setItems(adapter.getTimelineItems());
    setGroupsState(adapter.getGroups());
    setIsLoaded(true);

    // Subscribe to reactive updates from AppFlowy database
    const unsubscribe = adapter.subscribe((updatedItems, updatedGroups) => {
      setItems(updatedItems);
      setGroupsState(updatedGroups);
      setSyncStatus("connected");
    });

    return () => {
      unsubscribe();
    };
  }, [adapter, timelineId]);

  // Save Item (creates or updates row in AppFlowy database)
  const saveItem = useCallback(async (item: TimelineItem) => {
    setSyncStatus("syncing");
    try {
      await adapter.saveItem(item);
      setSyncStatus("connected");
    } catch (e) {
      console.error("[useTimelineDatabase] Failed to save item to AppFlowy database:", e);
      setSyncStatus("offline");
      throw e;
    }
  }, [adapter]);

  // Delete Item
  const deleteItem = useCallback(async (id: string) => {
    setSyncStatus("syncing");
    try {
      await adapter.deleteItem(id);
      setSyncStatus("connected");
    } catch (e) {
      console.error("[useTimelineDatabase] Failed to delete item from AppFlowy database:", e);
      setSyncStatus("offline");
      throw e;
    }
  }, [adapter]);

  // Bulk Import Items
  const importItems = useCallback(async (newItems: TimelineItem[]) => {
    setSyncStatus("syncing");
    try {
      await adapter.importItems(newItems);
      setSyncStatus("connected");
    } catch (e) {
      console.error("[useTimelineDatabase] Failed to import items:", e);
      setSyncStatus("offline");
      throw e;
    }
  }, [adapter]);

  // Update Groups
  const setGroups = useCallback((newGroups: GroupConfig[]) => {
    adapter.setGroups(newGroups);
  }, [adapter]);

  // Open Document in "Svici" section
  const openRowInSvici = useCallback((rowId: string) => {
    adapter.openRowInWorkspace(rowId);
    if (onNavigateToSvici) {
      onNavigateToSvici();
    }
  }, [adapter, onNavigateToSvici]);

  return {
    items,
    setItems,
    groups,
    setGroups,
    isLoaded,
    syncStatus,
    saveItem,
    deleteItem,
    importItems,
    openRowInSvici,
    adapter
  };
}
