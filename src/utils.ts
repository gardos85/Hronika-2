/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineItem, GroupConfig } from "./types";
import { LangType, getAppTranslations, loadSavedCustomTranslation } from "./translations";

export const LEGACY_TO_EARTH_COLOR_MAP: Record<string, string> = {
  "#3b82f6": "#4A7A96", // Svetske sile -> River Slate Blue
  "#1b4e1f": "#3E7B5C", // Vladari -> Forest Pine Green
  "#ec4899": "#2D6A5D", // Sveto pismo -> Deep Pine Teal
  "#10b981": "#6E7F5E", // Ličnosti -> Sage Olive
  "#f59e0b": "#C88A3B", // Biblijski događaji -> Golden Ochre
  "#ef4444": "#A34836", // Svetski događaji -> Brick Rust
  "#1d4ed8": "#3D647E",
  "#db2777": "#8C3B2B",
  "#059669": "#28594D",
  "#d97706": "#B07D38",
  "#8b5cf6": "#5E506B",
  "#06b6d4": "#4A7A96",
  "#6366f1": "#4A6D7C",
  "#84cc16": "#556B2F",
  "#f43f5e": "#A34836",
  "#a855f7": "#6E5B7B",
};

export const sanitizeGroupToEarthPalette = (group: GroupConfig): GroupConfig => {
  if (!group || !group.color) return group;
  const lower = group.color.toLowerCase();
  const earthColor = LEGACY_TO_EARTH_COLOR_MAP[lower] || group.color;
  return { ...group, color: earthColor };
};

const MONTH_NAMES_SR = [
  "jan", "feb", "mar", "apr", "maj", "jun", 
  "jul", "avg", "sep", "okt", "nov", "dec"
];

const MONTH_NAMES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function formatRange(
  startYear: number,
  startMonth?: number,
  endYear?: number,
  endMonth?: number,
  isApproximate?: boolean,
  endApproximate?: boolean,
  short?: boolean,
  lang: LangType = "sr"
): string {
  const isEn = lang === "en";

  const eraText = (y: number) => {
    if (y < 0) {
      return isEn ? "BCE" : "pre n. e.";
    } else {
      return isEn ? "CE" : (short ? "n.e." : "n. e.");
    }
  };

  const approxPrefix = (approx?: boolean) => {
    if (!approx) return "";
    if (isEn) {
      return short ? "ca. " : "approx. ";
    }
    return short ? "o. " : "oko ";
  };

  const getMonthOrSeasonName = (m?: number) => {
    if (!m) return "";
    if (m === 13) return isEn ? "Spring" : "proleće";
    if (m === 14) return isEn ? "Summer" : "leto";
    if (m === 15) return isEn ? "Autumn" : "jesen";
    if (m === 16) return isEn ? "Winter" : "zima";
    if (m >= 1 && m <= 12) {
      return isEn ? MONTH_NAMES_EN[m - 1] : MONTH_NAMES_SR[m - 1];
    }
    return "";
  };

  const formatSingle = (y: number, m?: number, approx?: boolean) => {
    const era = eraText(y);
    const absY = Math.abs(y);
    const mName = getMonthOrSeasonName(m);
    const mStr = mName ? `${mName} ` : "";
    const prefix = approxPrefix(approx);
    const yearDot = isEn ? "" : ".";
    return `${prefix}${mStr}${absY}${yearDot} ${era}`;
  };

  if (endYear === undefined) {
    return formatSingle(startYear, startMonth, isApproximate);
  }

  const startEra = eraText(startYear);
  const endEra = eraText(endYear);

  const startMName = getMonthOrSeasonName(startMonth);
  const endMName = getMonthOrSeasonName(endMonth);

  const startMStr = startMName ? `${startMName} ` : "";
  const endMStr = endMName ? `${endMName} ` : "";

  const startApproxPrefix = approxPrefix(isApproximate);
  const endApproxPrefix = approxPrefix(endApproximate);

  const yearDot = isEn ? "" : ".";

  if (startEra === endEra) {
    return `${startApproxPrefix}${startMStr}${Math.abs(startYear)}${yearDot} – ${endApproxPrefix}${endMStr}${Math.abs(endYear)}${yearDot} ${startEra}`;
  }

  return `${formatSingle(startYear, startMonth, isApproximate)} – ${formatSingle(endYear, endMonth, endApproximate)}`;
}

/**
 * Standard robust CSV parsing. Supports double quotes and commas within.
 */
export function parseCSV(csvText: string): Partial<TimelineItem>[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Find headers
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const parsedItems: Partial<TimelineItem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple robust regex parsing for CSV with optional quotes
    const matches = line.match(/(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g);
    if (!matches) continue;

    const row = matches.map(val => {
      let clean = val.replace(/^,/, "");
      if (clean.startsWith('"') && clean.endsWith('"')) {
        clean = clean.slice(1, -1).replace(/""/g, '"');
      }
      return clean.trim();
    });

    // Make map
    const record: any = {};
    headers.forEach((header, idx) => {
      record[header] = row[idx] || "";
    });

    // Convert keys to match schema
    if (record.title) {
      const startYear = parseInt(record.startYear, 10);
      const endYear = record.endYear && record.endYear.trim() !== "" ? parseInt(record.endYear, 10) : undefined;
      const startMonth = record.startMonth && record.startMonth.trim() !== "" ? parseInt(record.startMonth, 10) : undefined;
      const endMonth = record.endMonth && record.endMonth.trim() !== "" ? parseInt(record.endMonth, 10) : undefined;
      const tags = record.tags ? record.tags.split(";").map((t: string) => t.trim()).filter((t: string) => t !== "") : [];
      const approx = record.isApproximate === "true" || record.approximate === "true" || record.isApproximate === "1";
      const endApprox = record.endApproximate === "true" || record.endApproximate === "1";

      let location = undefined;
      const latVal = parseFloat(record.latitude || record.lat);
      const lngVal = parseFloat(record.longitude || record.lng);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        location = {
          name: record.locationName || record.location || undefined,
          lat: latVal,
          lng: lngVal
        };
      }

      parsedItems.push({
        title: record.title,
        group: record.group || "Važni događaji",
        startYear: isNaN(startYear) ? 0 : startYear,
        endYear: endYear !== undefined && !isNaN(endYear) ? endYear : undefined,
        description: record.description || "",
        tags: tags.length > 0 ? tags : ["Uvezeno"],
        startMonth: startMonth && !isNaN(startMonth) ? startMonth : undefined,
        endMonth: endMonth && !isNaN(endMonth) ? endMonth : undefined,
        color: record.color || undefined,
        isApproximate: approx ? true : undefined,
        endApproximate: endApprox ? true : undefined,
        image: record.image || undefined,
        sourceUrl: record.sourceUrl || undefined,
        location
      });
    }
  }

  return parsedItems;
}

/**
 * Standard robust CSV generation
 */
export function toCSV(items: TimelineItem[]): string {
  const headers = ["title", "group", "startYear", "startMonth", "endYear", "endMonth", "description", "tags", "color", "isApproximate", "endApproximate", "image", "sourceUrl", "locationName", "latitude", "longitude"];
  
  const escapeCSVField = (val: any) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map(item => {
    const tagsStr = item.tags.join(";");
    return [
      escapeCSVField(item.title),
      escapeCSVField(item.group),
      item.startYear,
      item.startMonth || "",
      item.endYear !== undefined ? item.endYear : "",
      item.endMonth || "",
      escapeCSVField(item.description),
      escapeCSVField(tagsStr),
      item.color || "",
      item.isApproximate ? "true" : "",
      item.endApproximate ? "true" : "",
      escapeCSVField(item.image),
      escapeCSVField(item.sourceUrl),
      escapeCSVField(item.location?.name || ""),
      item.location?.lat !== undefined ? item.location.lat : "",
      item.location?.lng !== undefined ? item.location.lng : ""
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function getTranslatedGroup(name: string, lang: LangType, t?: any): string {
  const dict = t || getAppTranslations(lang);
  
  if (name === "Svetske sile" || name === "World Powers") {
    return dict.groupWorldPowers || (lang === "en" ? "World Powers" : "Svetske sile");
  }
  if (name === "Vladari" || name === "Rulers") {
    return dict.groupRulers || (lang === "en" ? "Rulers" : "Vladari");
  }
  if (name === "Sveto pismo" || name === "Holy Scriptures") {
    return dict.groupHolyScriptures || (lang === "en" ? "Holy Scriptures" : "Sveto pismo");
  }
  if (name === "Ličnosti" || name === "Historical Figures") {
    return dict.groupHistoricalFigures || (lang === "en" ? "Historical Figures" : "Ličnosti");
  }
  if (name === "Biblijski događaji" || name === "Biblical Events") {
    return dict.groupBiblicalEvents || (lang === "en" ? "Biblical Events" : "Biblijski događaji");
  }
  if (name === "Svetski događaji" || name === "World Events") {
    return dict.groupWorldEvents || (lang === "en" ? "World Events" : "Svetski događaji");
  }

  if (dict && typeof dict[name] === "string") {
    return dict[name];
  }

  return name;
}

export function translateItem(item: TimelineItem, lang: LangType): TimelineItem {
  const isEn = lang === "en";
  let title = item.title;
  let description = item.description;
  let group = item.group;
  let tags = item.tags;

  // Custom translation from Google Docs live sync or user imported translation
  const custom = loadSavedCustomTranslation(lang);
  if (custom) {
    if ((custom as any)[`event_${item.id}_title`]) {
      title = (custom as any)[`event_${item.id}_title`];
    } else if ((custom as any)[item.title]) {
      title = (custom as any)[item.title];
    }
    if ((custom as any)[`event_${item.id}_desc`]) {
      description = (custom as any)[`event_${item.id}_desc`];
    }
  }

  if (isEn) {
    if (item.title === "Pad Jerusalima") {
      title = "Fall of Jerusalem";
    }
    if (item.description === "Vojni pohod kralja Navuhodonosora II protiv Jerusalima, razorenje Solomonovog hrama i početak vavilonskog ropstva.") {
      description = "Military campaign of King Nebuchadnezzar II against Jerusalem, destruction of Solomon's Temple, and the beginning of the Babylonian captivity.";
    }
    group = getTranslatedGroup(group, "en");
    if (Array.isArray(tags)) {
      tags = tags.map(t => {
        if (t === "Biblija") return "Bible";
        if (t === "Hram") return "Temple";
        if (t === "Vavilon") return "Babylon";
        if (t === "Proroci") return "Prophets";
        return t;
      });
    }
  } else {
    if (item.title === "Fall of Jerusalem") {
      title = "Pad Jerusalima";
    }
    if (item.description === "Military campaign of King Nebuchadnezzar II against Jerusalem, destruction of Solomon's Temple, and the beginning of the Babylonian captivity.") {
      description = "Vojni pohod kralja Navuhodonosora II protiv Jerusalima, razorenje Solomonovog hrama i početak vavilonskog ropstva.";
    }
    group = getTranslatedGroup(group, "sr");
    if (Array.isArray(tags)) {
      tags = tags.map(t => {
        if (t === "Bible") return "Biblija";
        if (t === "Temple") return "Hram";
        if (t === "Babylon") return "Vavilon";
        if (t === "Prophets") return "Proroci";
        return t;
      });
    }
  }

  return {
    ...item,
    title,
    description,
    group,
    tags
  };
}

/**
 * Detects whether the current device is running Apple OS (macOS or iOS).
 */
export function isAppleDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as any;

  // Modern Chromium userAgentData check
  if (nav.userAgentData?.platform) {
    const p = String(nav.userAgentData.platform).toLowerCase();
    if (p === "macos" || p === "ios") {
      return true;
    }
  }

  const ua = nav.userAgent || "";
  const platform = nav.platform || "";

  // iOS detection (iPhone, iPad, iPod, iPadOS on Safari desktop mode)
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && nav.maxTouchPoints > 1);

  // macOS detection
  const isMac = /Macintosh|Mac OS X|MacIntel/i.test(ua) || /Mac/i.test(platform);

  return isIOS || isMac;
}

/**
 * Returns the keyboard shortcut badge text for search based on current OS:
 * "⌘K" on macOS or iOS
 * "Ctrl+K" on Windows or Android (or other non-Apple OS)
 */
export function getSearchShortcutKeyLabel(): string {
  return isAppleDevice() ? "⌘K" : "Ctrl+K";
}

/**
 * Checks if a keydown event matches the platform-specific search shortcut:
 * - macOS or iOS: Command + K (metaKey is true, ctrlKey is false)
 * - Windows or Android: Ctrl + K (ctrlKey is true, metaKey is false)
 */
export function isSearchShortcutEvent(e: KeyboardEvent): boolean {
  const isK = e.key === "k" || e.key === "K" || e.code === "KeyK";
  if (!isK) return false;

  const isApple = isAppleDevice();
  if (isApple) {
    // Command+K on macOS/iOS
    return Boolean(e.metaKey && !e.ctrlKey && !e.altKey);
  } else {
    // Ctrl+K on Windows/Android
    return Boolean(e.ctrlKey && !e.metaKey && !e.altKey);
  }
}
