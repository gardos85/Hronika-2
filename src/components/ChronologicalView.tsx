import React, { useState, useMemo } from "react";
import { TimelineItem, GroupConfig, TimelineFilter, TagConfig, NotionColor, UserPreferences, ViewMode } from "../types";
import { formatRange, getTranslatedGroup, translateItem } from "../utils";
import { LangType, getAppTranslations } from "../translations";
import { NotionTagPill } from "./TagManagerPicker";
import { TagFilterPopover } from "./TagFilterPopover";
import { NotionToolbar } from "./NotionToolbar";
import { getSkinCardBorderColor } from "./SettingsModal";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Columns, 
  Check, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Search,
  Eye,
  EyeOff
} from "lucide-react";

interface ChronologicalViewProps {
  items: TimelineItem[];
  groups: GroupConfig[];
  filters: TimelineFilter;
  onFilterChange: (filters: TimelineFilter) => void;
  availableTags: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  onSelectDetailItem: (item: TimelineItem | null) => void;
  onEditItem: (item: TimelineItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleGroup?: (groupName: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onUpdatePreferences?: (prefs: Partial<UserPreferences>) => void;
  theme?: "dark" | "light";
  skin?: string;
  preferences?: UserPreferences;
  lang: LangType;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onAddNewItem?: (groupName?: string) => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onToggleLanguage?: () => void;
}

// Fixed canonical category order from left to right as requested:
// "Svetske sile", "Vladari", "Sveto pismo", "Ličnosti", "Biblijski događaji", "Svetski događaji"
export const CANONICAL_CATEGORY_ORDER = [
  "Svetske sile",
  "Vladari",
  "Sveto pismo",
  "Ličnosti",
  "Biblijski događaji",
  "Svetski događaji"
];

export function ChronologicalView({
  items,
  groups,
  filters,
  onFilterChange,
  availableTags,
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  onSelectDetailItem,
  onEditItem,
  onDeleteItem,
  onToggleGroup,
  viewMode,
  onViewModeChange,
  onUpdatePreferences,
  theme = "dark",
  skin = "hronika",
  preferences = { theme: "dark", skin: "hronika", showCardIcon: true },
  lang,
  isFullscreen = false,
  onToggleFullscreen,
  onAddNewItem,
  onOpenHelp,
  onOpenSettings,
  onToggleLanguage
}: ChronologicalViewProps) {
  const isLight = theme === "light";
  const t = getAppTranslations(lang);
  const skinCardBorderColor = getSkinCardBorderColor(skin, theme);

  // Sorting state: 'asc' (oldest first: -4026 -> 2026) or 'desc' (newest first)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Columns visibility state: which categories are visible
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CANONICAL_CATEGORY_ORDER.forEach(cat => {
      initial[cat] = true;
    });
    return initial;
  });

  // Sync groups prop visibility changes to visibleColumns state
  React.useEffect(() => {
    if (groups && groups.length > 0) {
      const updated: Record<string, boolean> = {};
      CANONICAL_CATEGORY_ORDER.forEach(cat => {
        const match = groups.find(g => 
          g.name === cat || 
          getTranslatedGroup(g.name, "sr") === cat || 
          getTranslatedGroup(g.name, "en") === cat
        );
        if (match) {
          updated[cat] = match.visible;
        }
      });
      setVisibleColumns(prev => ({ ...prev, ...updated }));
    }
  }, [groups]);

  const toggleColumnVisibility = (cat: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Group items by category for the columns
  // First apply active filters: search, timespan, selectedTag, visible groups
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      // 2. Tag filter
      if (filters.selectedTag) {
        if (!item.tags || !item.tags.includes(filters.selectedTag)) {
          return false;
        }
      }

      // 3. Timespan filter
      if (item.startYear < filters.fromYear || item.startYear > filters.toYear) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Active categories: canonical categories + any custom groups
  const allOrderedCategories = useMemo(() => {
    const canonical = [...CANONICAL_CATEGORY_ORDER];
    if (groups && groups.length > 0) {
      groups.forEach(g => {
        const srName = getTranslatedGroup(g.name, "sr");
        if (srName && !canonical.includes(srName)) {
          canonical.push(srName);
        }
      });
    }
    filteredItems.forEach(item => {
      const srName = getTranslatedGroup(item.group, "sr");
      if (srName && !canonical.includes(srName)) {
        canonical.push(srName);
      }
    });
    return canonical;
  }, [groups, filteredItems]);

  // Determine active columns (those that are checked visible)
  const activeOrderedColumns = useMemo(() => {
    return allOrderedCategories.filter(cat => visibleColumns[cat] !== false);
  }, [allOrderedCategories, visibleColumns]);

  // For each column, prepare sorted items
  const columnData = useMemo(() => {
    const map: Record<string, TimelineItem[]> = {};

    allOrderedCategories.forEach(cat => {
      const canonicalCatSr = cat;
      const matching = filteredItems.filter(item => {
        const itemCatSr = getTranslatedGroup(item.group, "sr");
        return itemCatSr === canonicalCatSr;
      });

      // Sort items based on sortOrder
      matching.sort((a, b) => {
        const aMonth = typeof a.startMonth === "number" ? a.startMonth : 6;
        const bMonth = typeof b.startMonth === "number" ? b.startMonth : 6;
        const diff = (a.startYear + aMonth / 100) - (b.startYear + bMonth / 100);
        return sortOrder === "asc" ? diff : -diff;
      });

      map[cat] = matching;
    });

    return map;
  }, [allOrderedCategories, filteredItems, sortOrder]);

  // Only display columns that actually have content (hide empty columns)
  const displayedColumns = useMemo(() => {
    return activeOrderedColumns.filter(cat => {
      const catItems = columnData[cat];
      return Array.isArray(catItems) && catItems.length > 0;
    });
  }, [activeOrderedColumns, columnData]);

  return (
    <div className={`flex flex-col h-full overflow-hidden select-none ${
      isLight ? "bg-slate-50/50 text-slate-800" : "bg-[#0c0c0e] text-slate-100"
    }`}>
      {/* Top Command Toolbar */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md transition-colors relative z-40 ${
        isLight ? "bg-white/90 border-slate-200 shadow-xs" : "bg-[#121215]/90 border-[#373735]"
      }`}>
        {/* Left Island: View Title & Statistics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
              isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-[#696863] border-[#696863] text-white"
            }`}>
              {lang === "sr" ? "Hrono pregled" : "Chrono View"}
            </span>
            <span className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {filteredItems.length} {lang === "sr" ? "događaja" : "events"}
              {displayedColumns.length > 0 && ` • ${displayedColumns.length} ${
                lang === "sr"
                  ? (displayedColumns.length === 1 ? "kolona" : (displayedColumns.length < 5 ? "kolone" : "kolona"))
                  : (displayedColumns.length === 1 ? "column" : "columns")
              }`}
            </span>
          </div>
        </div>

        {/* Right Island: Notion Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          <NotionToolbar
            filters={filters}
            onFilterChange={onFilterChange}
            availableTags={availableTags}
            onAddCustomTag={onAddCustomTag}
            onUpdateTag={onUpdateTag}
            onDeleteTag={onDeleteTag}
            groups={groups}
            onToggleGroup={(groupName) => {
              if (onToggleGroup) {
                onToggleGroup(groupName);
              }
              toggleColumnVisibility(groupName);
            }}
            viewMode={viewMode || "chronological"}
            onViewModeChange={onViewModeChange || (() => {})}
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences || (() => {})}
            sortOrder={sortOrder}
            onToggleSortOrder={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
            theme={theme}
            lang={lang}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onAddNewItem={onAddNewItem}
            onOpenHelp={onOpenHelp}
            onOpenSettings={onOpenSettings}
            onToggleLanguage={onToggleLanguage}
          />
        </div>
      </div>

      {/* Main Multi-Column Vertical Chronological Layout */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        {activeOrderedColumns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Columns className="w-12 h-12 text-slate-400 mb-3 opacity-40" />
            <h3 className="text-base font-bold mb-1">
              {lang === "sr" ? "Nema aktivnih kolona" : "No active columns"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {lang === "sr" 
                ? "Sve kolone su trenutno isključene. Kliknite na meni „Kolone“ iznad kako biste izabrali koje kategorije želite da vidite." 
                : "All columns are currently disabled. Click 'Columns' above to choose categories to display."}
            </p>
            <button
              onClick={() => {
                const all: Record<string, boolean> = {};
                CANONICAL_CATEGORY_ORDER.forEach(c => { all[c] = true; });
                setVisibleColumns(all);
              }}
              className="px-4 py-2 bg-[#D96B27] hover:bg-[#C05A1C] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
            >
              {lang === "sr" ? "Uključi sve kolone" : "Enable all columns"}
            </button>
          </div>
        ) : displayedColumns.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
            <Columns className="w-12 h-12 text-slate-400 mb-3 opacity-40" />
            <h3 className="text-base font-bold mb-1">
              {lang === "sr" ? "Nema događaja u kolonama" : "No events in columns"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {lang === "sr" 
                ? "Trenutno nema događaja koji odgovaraju zadatim filterima. Prazne kolone su skrivene." 
                : "There are currently no events matching active filters. Empty columns are hidden."}
            </p>
            {onAddNewItem && (
              <button
                onClick={() => onAddNewItem?.()}
                className="px-4 py-2 bg-[#1E443A] hover:bg-[#255246] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <span>+</span>
                <span>{lang === "sr" ? "Dodaj novi događaj" : "Add new event"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="min-w-full w-max flex justify-center items-stretch h-full pb-2">
            <div className="flex gap-4 h-full transition-all duration-300 ease-out">
              {displayedColumns.map(cat => {
                const catItems = columnData[cat] || [];
                const groupObj = groups.find(g => getTranslatedGroup(g.name, "sr") === cat);
                const groupColor = groupObj?.color || "#eab308";
                const translatedTitle = getTranslatedGroup(cat, lang);

              return (
                <div
                  key={cat}
                  className={`w-80 sm:w-88 flex flex-col h-full rounded-2xl border shadow-sm overflow-hidden shrink-0 transition-colors ${
                    isLight 
                      ? "bg-white border-slate-200/90 shadow-slate-100" 
                      : "bg-[#131316] border-[#373735] shadow-black/40"
                  }`}
                >
                  {/* Column Header */}
                  <div 
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onAddNewItem?.(cat);
                    }}
                    title={lang === "sr" ? "Dvoklik za dodavanje novog događaja u ovu kategoriju" : "Double-click to add a new event to this category"}
                    className={`p-3.5 border-b flex items-center justify-between shrink-0 cursor-pointer select-none transition-colors hover:bg-[#D96B27]/5 ${
                      isLight ? "bg-slate-50/80 border-slate-200/80" : "bg-[#18181c]/80 border-[#373735]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-md shadow-xs shrink-0"
                        style={{ backgroundColor: groupColor }}
                      />
                      <h3 className="text-xs font-bold truncate">
                        {translatedTitle}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isLight ? "bg-slate-200/80 text-slate-700" : "bg-slate-800 text-slate-300"
                    }`}>
                      {catItems.length}
                    </span>
                  </div>

                  {/* Vertical Scrollable Events List */}
                  <div 
                    onDoubleClick={(e) => {
                      if ((e.target as HTMLElement).closest('[group="card"]') || (e.target as HTMLElement).closest('button')) return;
                      onAddNewItem?.(cat);
                    }}
                    title={lang === "sr" ? "Dvoklik na prazan prostor za dodavanje novog događaja u ovu kategoriju" : "Double-click empty space to add a new event to this category"}
                    className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
                  >
                    {catItems.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                        <Calendar className="w-8 h-8 text-slate-400 mb-2 opacity-30" />
                        <p className="text-xs text-slate-500">
                          {lang === "sr" ? "Nema događaja za prikaz" : "No events to display"}
                        </p>
                      </div>
                    ) : (
                      catItems.map((item) => {
                        const isPeriod = typeof item.endYear === "number";
                        const dateRangeString = formatRange(
                          item.startYear,
                          item.startMonth,
                          item.endYear,
                          item.endMonth,
                          item.isApproximate,
                          item.endApproximate,
                          false
                        );

                        return (
                          <div
                            key={item.id}
                            data-group="card"
                            {...({ group: "card" } as any)}
                            onClick={() => onSelectDetailItem(item)}
                            style={{
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: skinCardBorderColor
                            }}
                            className={`group/card rounded-xl p-3.5 transition-all duration-150 cursor-pointer relative hover:shadow-md ${
                              isLight 
                                ? "bg-slate-50/70 hover:bg-white text-slate-800" 
                                : "bg-[#19191e]/60 hover:bg-[#1f1f26] text-slate-200"
                            }`}
                          >
                            {/* Card Image if present */}
                            {item.image && (
                              <div className="w-full h-28 rounded-lg overflow-hidden mb-2.5 border border-black/5 dark:border-white/5 bg-slate-900">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Top Header: Date badge and Title in the same row */}
                            <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span 
                                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded tracking-tight inline-flex items-center gap-1 shrink-0"
                                  style={{
                                    backgroundColor: `${item.color || groupColor}18`,
                                    color: item.color || groupColor
                                  }}
                                >
                                  {preferences.showCardIcon !== false && <Calendar className="w-3 h-3 shrink-0" />}
                                  {dateRangeString}
                                </span>
                                <h4 className="text-xs font-extrabold tracking-tight leading-snug truncate text-slate-900 dark:text-white group-hover/card:text-[#D96B27] transition-colors">
                                  {item.title}
                                </h4>
                              </div>

                              {/* Hover Action buttons */}
                              <div className="opacity-0 group-hover/card:opacity-100 transition flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditItem(item);
                                  }}
                                  className={`p-1 rounded hover:text-[#D96B27] transition ${
                                    isLight ? "text-slate-400 hover:bg-slate-200" : "text-slate-500 hover:bg-slate-800"
                                  }`}
                                  title={lang === "sr" ? "Uredi" : "Edit"}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(t.confirmDelete.replace("{title}", item.title))) {
                                      onDeleteItem(item.id);
                                    }
                                  }}
                                  className={`p-1 rounded hover:text-red-500 transition ${
                                    isLight ? "text-slate-400 hover:bg-slate-200" : "text-slate-500 hover:bg-slate-800"
                                  }`}
                                  title={lang === "sr" ? "Obriši" : "Delete"}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Description snippet */}
                            {item.description && (
                              <p className={`text-[11px] leading-relaxed line-clamp-2 mb-2 ${
                                isLight ? "text-slate-600" : "text-slate-400"
                              }`}>
                                {item.description}
                              </p>
                            )}

                            {/* Extra Attributes (Ruler, Place, Capital, Writer, etc.) */}
                            <div className="space-y-1 mb-2">
                              {item.ruler && (
                                <div className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  <span className="font-semibold">{lang === "sr" ? "Vladar:" : "Ruler:"}</span>
                                  <span>{item.ruler}</span>
                                </div>
                              )}
                              {item.capital && (
                                <div className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  <span className="font-semibold">{lang === "sr" ? "Prestonica:" : "Capital:"}</span>
                                  <span>{item.capital}</span>
                                </div>
                              )}
                              {item.writer && (
                                <div className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  <span className="font-semibold">{lang === "sr" ? "Pisac:" : "Writer:"}</span>
                                  <span>{item.writer}</span>
                                </div>
                              )}
                              {item.writingPlace && (
                                <div className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  <span className="font-semibold">{lang === "sr" ? "Mesto pisanja:" : "Place written:"}</span>
                                  <span>{item.writingPlace}</span>
                                </div>
                              )}
                              {item.location?.name && (
                                <div className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  <MapPin className="w-2.5 h-2.5 text-[#D96B27]" />
                                  <span>{item.location.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Tags list (Notion Pills) */}
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                                {item.tags.map((tag) => {
                                  const tagCfg = availableTags.find(t => t.name === tag);
                                  return (
                                    <NotionTagPill
                                      key={tag}
                                      name={tag}
                                      color={tagCfg?.color || "default"}
                                      isLight={isLight}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
