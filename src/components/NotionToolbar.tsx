import React, { useState, useRef, useEffect } from "react";
import { 
  Filter, 
  ArrowUpDown, 
  Layers, 
  Rows, 
  Pin, 
  Search, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronRight, 
  Plus, 
  Minus,
  Table,
  Kanban,
  Calendar,
  MapPin,
  Split,
  FolderTree,
  Menu,
  RotateCcw,
  MoreHorizontal,
  Trash2,
  Edit2,
  PlusCircle,
  Settings,
  Languages,
  HelpCircle,
  Map,
  ListOrdered
} from "lucide-react";
import { 
  FilterOptions, 
  TagConfig, 
  GroupConfig, 
  ViewMode, 
  UserPreferences, 
  NotionColor,
  TimelineItem
} from "../types";
import { NotionTagPill, NOTION_COLORS_LIST } from "./TagManagerPicker";
import { getTranslatedGroup } from "../utils";
import { getAppTranslations, LangType } from "../translations";
import { SKINS_CONFIG } from "./SettingsModal";

interface NotionToolbarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: TagConfig[];
  onAddCustomTag?: (name: string, color: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  groups: GroupConfig[];
  onToggleGroup: (groupName: string) => void;
  laneSpacingMultiplier?: number;
  onChangeLaneSpacing?: (val: number) => void;
  showSingleYearCards?: boolean;
  onToggleSingleYearCards?: () => void;
  showEventLines?: boolean;
  onToggleEventLines?: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  preferences: UserPreferences;
  skin?: string;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  sortOrder?: "asc" | "desc";
  onToggleSortOrder?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
  fitAll?: () => void;
  jumpToYearZero?: () => void;
  theme?: "dark" | "light";
  lang: LangType;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onAddNewItem?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onToggleLanguage?: () => void;
  items?: TimelineItem[];
  jumpToYear?: (year: number) => void;
}

export function NotionToolbar({
  filters,
  onFilterChange,
  availableTags,
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  groups,
  onToggleGroup,
  laneSpacingMultiplier = 1.0,
  onChangeLaneSpacing,
  showSingleYearCards = true,
  onToggleSingleYearCards,
  showEventLines = true,
  onToggleEventLines,
  viewMode,
  onViewModeChange,
  preferences,
  skin,
  onUpdatePreferences,
  sortOrder = "asc",
  onToggleSortOrder,
  zoomIn,
  zoomOut,
  fitAll,
  jumpToYearZero,
  theme = "dark",
  lang,
  isFullscreen: isFullscreenProp = false,
  onToggleFullscreen,
  onAddNewItem,
  onOpenHelp,
  onOpenSettings,
  onToggleLanguage,
  items = [],
  jumpToYear
}: NotionToolbarProps) {
  const isLight = theme === "light";
  const t = getAppTranslations(lang);

  const currentSkin = skin || (preferences as any)?.skin || "hronika";
  const skinInfo = (SKINS_CONFIG as any)[currentSkin] || SKINS_CONFIG.hronika;
  const isHronika = currentSkin === "hronika";
  const isProStudio = currentSkin === "pro_studio";
  const skinBtnTextClass = "text-white";

  // Helpers for consistent theme styling matching Notion design system
  const normalBtnClass = isLight 
    ? "bg-transparent border-transparent text-[#0F172A] hover:bg-black/5 hover:text-black" 
    : "bg-transparent border-transparent text-[#94A3B8] hover:bg-white/10 hover:text-white";

  const activeIconClass = isProStudio ? "bg-[#10b981] border-transparent text-white font-bold" : "bg-[#1E443A] border-transparent text-white font-bold";

  const accentTextClass = isProStudio ? "text-[#10b981] dark:text-[#34d399]" : "text-[#74BAA0]";
  const accentActiveBgClass = isProStudio ? "bg-[#10b981] text-white font-bold" : "bg-[#1E443A] text-white font-bold";
  const focusBorderClass = isProStudio ? "focus:border-[#10b981] dark:focus:border-[#34d399]" : "focus:border-[#1e433a]";
  const actionBtnClass = isProStudio ? "bg-[#10b981] hover:bg-[#059669] text-white shadow-xs" : "bg-[#1e433a] hover:bg-[#28594d] text-white";

  const popoverSurfaceClass = isLight 
    ? "bg-white border-[#E5E0D8] text-[#1C1D1C] shadow-stone-500/10" 
    : "bg-[#262827] border-[#383A39] text-[#F0EFED] shadow-black/60";

  // Active popovers
  const [activePopover, setActivePopover] = useState<
    "filter" | "sort" | "categories" | "spacing" | "search" | "view_settings" | null
  >(null);

  const [isFullscreenLocal, setIsFullscreenLocal] = useState(false);
  const isFullscreen = onToggleFullscreen ? isFullscreenProp : isFullscreenLocal;
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [editTagName, setEditTagName] = useState<string>("");
  const [tagSearch, setTagSearch] = useState<string>("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreenLocal(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreenLocal(false)).catch(() => {});
      }
    }
  };

  const visibleGroupsCount = groups.filter(g => g.visible).length;
  const activeTag = filters.selectedTag;

  // Find the earliest start year and latest start/end year from items
  const earliestYear = React.useMemo(() => {
    if (!items || items.length === 0) return null;
    return Math.min(...items.map(i => i.startYear));
  }, [items]);

  const latestYear = React.useMemo(() => {
    if (!items || items.length === 0) return null;
    return Math.max(...items.map(i => i.endYear ?? i.startYear));
  }, [items]);

  const formatYearLabel = (y: number | null) => {
    if (y === null) return "";
    const isEn = lang === "en";
    const absY = Math.abs(y);
    const era = y < 0 ? (isEn ? "BCE" : "pre n. e.") : (isEn ? "CE" : "n. e.");
    const yearDot = isEn ? "" : ".";
    return `${absY}${yearDot} ${era}`;
  };

  return (
    <div className={`px-3 py-2 flex flex-wrap items-center justify-between gap-3 border-b shadow-xs relative z-40 transition-colors ${
      isLight 
        ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C]" 
        : "bg-[#1F2120] border-[#383A39] text-[#F0EFED]"
    }`}>
      {/* LEFT SIDE: ONLY ZOOM & NAVIGATION CONTROLS */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {zoomOut && zoomIn && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#8E908B] dark:text-[#8E908B] text-[#686963] uppercase tracking-wider mr-1">Zoom:</span>
            <button
              type="button"
              onClick={zoomOut}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${normalBtnClass}`}
              title={lang === "sr" ? "Umanji prikaz (-)" : "Zoom out (-)"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${normalBtnClass}`}
              title={lang === "sr" ? "Uvećaj prikaz (+)" : "Zoom in (+)"}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Separator line after Zoom options */}
            <div className={`w-[1px] h-4 mx-1.5 shrink-0 ${isLight ? "bg-[#E5E0D8]" : "bg-[#383A39]"}`} />

            {/* Prikaži sve button */}
            {fitAll && (
              <button
                type="button"
                onClick={fitAll}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer shadow-xs bg-[#1e433a] hover:bg-[#28594d] text-white"
                title={lang === "sr" ? "Prilagodi sav raspon" : "Fit all"}
              >
                {lang === "sr" ? "Prikaži sve" : "Fit all"}
              </button>
            )}

            {/* Earliest Card Year Button (First event) */}
            {earliestYear !== null && jumpToYear && (
              <button
                type="button"
                onClick={() => jumpToYear(earliestYear)}
                className={`px-2 py-1 text-[11px] font-semibold border rounded-lg transition cursor-pointer ${
                  isLight 
                    ? "bg-white hover:bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C]" 
                    : "bg-[#262827] hover:bg-[#333534] border-[#383A39] text-[#F0EFED]"
                }`}
                title={lang === "sr" ? "Prvi događaj" : "First event"}
              >
                {formatYearLabel(earliestYear)}
              </button>
            )}

            {/* Year 0 button */}
            {jumpToYearZero && (
              <button
                type="button"
                onClick={jumpToYearZero}
                className={`px-2 py-1 text-[11px] font-semibold border rounded-lg transition cursor-pointer ${
                  isLight 
                    ? "bg-white hover:bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C]" 
                    : "bg-[#262827] hover:bg-[#333534] border-[#383A39] text-[#F0EFED]"
                }`}
                title={lang === "sr" ? "Skok na nultu godinu" : "Jump to Year 0"}
              >
                0.
              </button>
            )}

            {/* Latest Card Year Button (Latest event) */}
            {latestYear !== null && jumpToYear && (
              <button
                type="button"
                onClick={() => jumpToYear(latestYear)}
                className={`px-2 py-1 text-[11px] font-semibold border rounded-lg transition cursor-pointer ${
                  isLight 
                    ? "bg-white hover:bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C]" 
                    : "bg-[#262827] hover:bg-[#333534] border-[#383A39] text-[#F0EFED]"
                }`}
                title={lang === "sr" ? "Najnoviji događaj" : "Latest event"}
              >
                {formatYearLabel(latestYear)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* MIDDLE SIDE: FULLSCREEN CONTROLS (NOVO, LINIJA, HRONO, MAPA) */}
      <div className="flex-1 md:flex-initial flex items-center justify-center gap-2">
        {isFullscreen && (
          <>
            {/* NOVO BUTTON */}
            {onAddNewItem && (
              <button
                type="button"
                onClick={() => onAddNewItem?.()}
                className="px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm bg-[#1E443A] hover:bg-[#265649] text-white border-[#1E443A]"
                title={lang === "sr" ? "Novi događaj" : "New event"}
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-bold">{lang === "sr" ? "Novo" : "New"}</span>
              </button>
            )}

            {/* THREE VIEWS SWITCHER (ONLY ICONS) */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? "bg-slate-100 border-slate-250" : "bg-[#161619] border-[#373735]"
            }`}>
              <button
                type="button"
                onClick={() => onViewModeChange("timeline")}
                className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  viewMode === "timeline"
                    ? "bg-[#1E443A] text-white shadow-xs font-bold"
                    : isLight
                    ? "text-slate-500 hover:text-slate-850"
                    : "text-[#ada9a3] hover:text-white"
                }`}
                title={lang === "sr" ? "Linijski prikaz" : "Timeline View"}
              >
                <Calendar className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange("chronological")}
                className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  viewMode === "chronological"
                    ? "bg-[#1E443A] text-white shadow-xs font-bold"
                    : isLight
                    ? "text-slate-500 hover:text-slate-850"
                    : "text-[#ada9a3] hover:text-white"
                }`}
                title={lang === "sr" ? "Hronološki prikaz" : "Chronological View"}
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange("map")}
                className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  viewMode === "map"
                    ? "bg-[#1E443A] text-white shadow-xs font-bold"
                    : isLight
                    ? "text-slate-500 hover:text-slate-850"
                    : "text-[#ada9a3] hover:text-white"
                }`}
                title={lang === "sr" ? "Kartografski prikaz (Beta)" : "Map View (Beta)"}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SIDE: NOTION-STYLE ICON TOOLBAR */}
      <div className="flex items-center gap-1 relative" ref={popoverRef}>
        {/* 1. FILTER ICON */}
        <button
          type="button"
          onClick={() => setActivePopover(activePopover === "filter" ? null : "filter")}
          className={`p-1.5 rounded-lg transition relative flex items-center gap-1 text-xs cursor-pointer ${
            activeTag || activePopover === "filter"
              ? activeIconClass
              : normalBtnClass
          }`}
          title={lang === "sr" ? "Filteri" : "Filter"}
        >
          <Filter className="w-4 h-4" />
          {activeTag && <span className="text-[10px] font-bold max-w-[80px] truncate">{activeTag}</span>}
        </button>

        {/* 2. SORT ICON - ONLY visible in Chronological view */}
        {viewMode === "chronological" && (
          <button
            type="button"
            onClick={() => {
              if (onToggleSortOrder) {
                onToggleSortOrder();
              } else {
                setActivePopover(activePopover === "sort" ? null : "sort");
              }
            }}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
              activePopover === "sort"
                ? activeIconClass
                : normalBtnClass
            }`}
            title={`${lang === "sr" ? "Sortiranje" : "Sort"}: ${sortOrder === "asc" ? (lang === "sr" ? "Rastuće (starije prvo)" : "Ascending") : (lang === "sr" ? "Opadajuće (novije prvo)" : "Descending")}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        )}

        {/* 3. CATEGORIES / GROUPS ICON */}
        <button
          type="button"
          onClick={() => setActivePopover(activePopover === "categories" ? null : "categories")}
          className={`p-1.5 rounded-lg transition flex items-center justify-center cursor-pointer ${
            activePopover === "categories"
              ? activeIconClass
              : normalBtnClass
          }`}
          title={
            viewMode === "chronological"
              ? (lang === "sr" ? "Kolone" : "Columns")
              : (lang === "sr" ? "Kategorije" : "Categories")
          }
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* 4. GROUP HEIGHT / SPACING ICON */}
        {onChangeLaneSpacing && (
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === "spacing" ? null : "spacing")}
            className={`p-1.5 rounded-lg transition flex items-center justify-center cursor-pointer ${
              activePopover === "spacing"
                ? activeIconClass
                : normalBtnClass
            }`}
            title={lang === "sr" ? "Visina grupa" : "Group height"}
          >
            <Rows className="w-4 h-4" />
          </button>
        )}

        {/* 4.5. VERTICAL LINES ICON - ONLY in timeline ("Linija") view */}
        {viewMode === "timeline" && onToggleEventLines && (
          <button
            type="button"
            onClick={onToggleEventLines}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
              showEventLines
                ? activeIconClass
                : normalBtnClass
            }`}
            title={lang === "sr" ? "Vertikalne linije" : "Vertical lines"}
          >
            <Menu className="w-4 h-4 rotate-90" />
          </button>
        )}

        {/* 5. PIN CARDS ICON */}
        {onToggleSingleYearCards && (
          <button
            type="button"
            onClick={onToggleSingleYearCards}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
              showSingleYearCards
                ? activeIconClass
                : normalBtnClass
            }`}
            title={lang === "sr" ? "Prikači karticu" : "Pin cards"}
          >
            <Pin className={`w-4 h-4 ${showSingleYearCards ? "fill-current" : ""}`} />
          </button>
        )}

        {/* 6. SEARCH ICON */}
        <button
          type="button"
          onClick={() => setActivePopover(activePopover === "search" ? null : "search")}
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
            filters.searchQuery || activePopover === "search"
              ? activeIconClass
              : normalBtnClass
          }`}
          title={lang === "sr" ? "Pretraga" : "Search"}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 7. OPEN AS FULL PAGE / FULLSCREEN ICON */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
            isFullscreen
              ? activeIconClass
              : normalBtnClass
          }`}
          title={lang === "sr" ? "Ceo ekran" : "Open as full page"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* 8. VIEW SETTINGS / PODEŠAVANJA ICON */}
        <button
          type="button"
          onClick={() => setActivePopover(activePopover === "view_settings" ? null : "view_settings")}
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
            activePopover === "view_settings"
              ? activeIconClass
              : normalBtnClass
          }`}
          title={lang === "sr" ? "Podešavanja" : "Settings"}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>



        {/* Fullscreen extra controls skroz desno */}
        {isFullscreen && (
          <>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1.5 shrink-0" />

            {/* HELP ICON */}
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className={`p-1.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${normalBtnClass}`}
                title={lang === "sr" ? "Pomoć" : "Help"}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            {/* LANGUAGE ICON */}
            {onToggleLanguage && (
              <button
                type="button"
                onClick={onToggleLanguage}
                className={`p-1.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${normalBtnClass}`}
                title={lang === "sr" ? "Promeni jezik" : "Toggle language"}
              >
                <Languages className="w-4 h-4" />
              </button>
            )}

            {/* SETTINGS GEAR ICON */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className={`p-1.5 rounded-lg border transition flex items-center justify-center cursor-pointer ${normalBtnClass}`}
                title={lang === "sr" ? "Podešavanja izgleda" : "Appearance settings"}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* ================= POPOVERS ================= */}

        {/* 1. FILTER POPOVER WITH 3-DOTS EDITING */}
        {activePopover === "filter" && (
          <div className={`absolute top-11 right-0 w-80 p-3.5 rounded-2xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            {editingTag ? (
              /* TAG EDIT DRAWER */
              <div className="space-y-3">
                <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-[#EAE6DF]" : "border-[#383A39]"}`}>
                  <span className={`text-xs font-bold ${accentTextClass} flex items-center gap-1.5`}>
                    <Edit2 className="w-3.5 h-3.5" /> {lang === "sr" ? "Uredi filter / tag" : "Edit filter / tag"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingTag(null)}
                    className="p-1 rounded bg-[#1E443A] text-white hover:bg-[#28594D] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E908B] dark:text-[#8E908B] text-[#686963] uppercase">{lang === "sr" ? "Naziv filtera" : "Filter Name"}</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                        isLight ? `bg-white border-[#E5E0D8] text-[#1C1D1C] ${focusBorderClass}` : `bg-[#1F2120] border-[#383A39] text-[#F0EFED] ${focusBorderClass}`
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateTag && editTagName.trim() && editTagName.trim() !== editingTag.name) {
                          onUpdateTag(editingTag.name, { name: editTagName.trim() });
                          if (filters.selectedTag === editingTag.name) {
                            onFilterChange({ ...filters, selectedTag: editTagName.trim() });
                          }
                        }
                        setEditingTag(null);
                      }}
                      className="px-2.5 py-1.5 bg-[#1E443A] hover:bg-[#28594D] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E908B] dark:text-[#8E908B] text-[#686963] uppercase">{lang === "sr" ? "Boja" : "Color"}</label>
                  <div className="grid grid-cols-5 gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {NOTION_COLORS_LIST.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          if (onUpdateTag) {
                            onUpdateTag(editingTag.name, { color: col.id });
                            setEditingTag({ ...editingTag, color: col.id });
                          }
                        }}
                        className={`h-7 rounded-lg border transition-transform hover:scale-105 flex items-center justify-center relative cursor-pointer ${
                          editingTag.color === col.id ? "ring-2 ring-white font-bold" : ""
                        }`}
                        style={{ backgroundColor: col.previewBg }}
                        title={lang === "sr" ? col.labelSr : col.labelEn}
                      >
                        {editingTag.color === col.id && <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                {onDeleteTag && (
                  <div className={`pt-2 border-t ${isLight ? "border-[#EAE6DF]" : "border-[#383A39]"}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTag(editingTag.name);
                        if (filters.selectedTag === editingTag.name) {
                          onFilterChange({ ...filters, selectedTag: "" });
                        }
                        setEditingTag(null);
                      }}
                      className="w-full py-1.5 text-xs font-bold bg-[#1E443A] hover:bg-[#28594D] text-white rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === "sr" ? "Obriši filter" : "Delete filter"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* MAIN FILTER LIST WITH 3-DOTS BUTTON ON EVERY ITEM */
              <div>
                <div className={`flex items-center justify-between mb-2 pb-2 border-b ${isLight ? "border-[#EAE6DF]" : "border-[#383A39]"}`}>
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className={`w-3.5 h-3.5 ${accentTextClass}`} /> {lang === "sr" ? "Filteri" : "Filters"}
                  </span>
                  {activeTag && (
                    <button
                      onClick={() => onFilterChange({ ...filters, selectedTag: "" })}
                      className="text-[10px] px-2 py-0.5 bg-[#1E443A] hover:bg-[#28594D] text-white rounded font-bold cursor-pointer"
                    >
                      {lang === "sr" ? "Poništi" : "Clear"}
                    </button>
                  )}
                </div>

                {/* Filter search input */}
                <div className="mb-2">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder={lang === "sr" ? "Pretraži filtere..." : "Search filters..."}
                    className={`w-full px-2.5 py-1 text-xs rounded-lg border outline-none ${
                      isLight ? `bg-white border-[#E5E0D8] text-[#1C1D1C] ${focusBorderClass}` : `bg-[#1F2120] border-[#383A39] text-[#F0EFED] ${focusBorderClass}`
                    }`}
                  />
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      onFilterChange({ ...filters, selectedTag: "" });
                      setActivePopover(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                      !activeTag
                        ? "bg-[#1E443A] text-white font-bold"
                        : isLight 
                        ? "text-[#1C1D1C] hover:bg-black/5" 
                        : "text-[#F0EFED] hover:bg-white/5"
                    }`}
                  >
                    <span>{lang === "sr" ? "Svi tagovi / filteri" : "All tags"}</span>
                    {!activeTag && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {availableTags
                    .filter((tag) => !tagSearch || tag.name.toLowerCase().includes(tagSearch.toLowerCase()))
                    .map((tagObj) => {
                      const isSelected = activeTag.toLowerCase() === tagObj.name.toLowerCase();
                      return (
                        <div
                          key={tagObj.name}
                          className={`group/row w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#1E443A] text-white font-bold shadow-xs"
                              : isLight
                              ? "text-[#1C1D1C] hover:bg-black/5"
                              : "text-[#F0EFED] hover:bg-white/5"
                          }`}
                          onClick={() => {
                            onFilterChange({ ...filters, selectedTag: isSelected ? "" : tagObj.name });
                            setActivePopover(null);
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <NotionTagPill name={tagObj.name} color={tagObj.color} isLight={isLight} />
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTag(tagObj);
                                setEditTagName(tagObj.name);
                              }}
                              className={`p-1 rounded transition ${
                                isSelected
                                  ? "hover:bg-white/20 text-white"
                                  : isLight
                                  ? "hover:bg-black/10 text-[#686963] hover:text-[#1C1D1C]"
                                  : "hover:bg-white/10 text-[#8E908B] hover:text-[#F0EFED]"
                              }`}
                              title={lang === "sr" ? "Uredi filter (3 tačkice)" : "Edit filter"}
                            >
                              <MoreHorizontal className="w-3.5 h-3.5 text-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {tagSearch.trim() && onAddCustomTag && !availableTags.some(t => t.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddCustomTag(tagSearch.trim(), "blue");
                        onFilterChange({ ...filters, selectedTag: tagSearch.trim() });
                        setTagSearch("");
                        setActivePopover(null);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E443A] hover:bg-[#28594D] text-white transition text-left cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>{lang === "sr" ? "Dodaj novi filter" : "Add filter"} „{tagSearch.trim()}“</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SORT POPOVER */}
        {activePopover === "sort" && (
          <div className={`absolute top-11 right-0 w-60 p-3 rounded-2xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-2 text-[#8E908B] dark:text-[#8E908B] text-[#686963]">
              {lang === "sr" ? "Smer sortiranja" : "Sort Direction"}
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  if (onToggleSortOrder && sortOrder !== "asc") onToggleSortOrder();
                  setActivePopover(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  sortOrder === "asc"
                    ? "bg-[#1E443A] text-white font-bold shadow-xs"
                    : isLight
                    ? "text-[#1C1D1C] hover:bg-black/5"
                    : "text-[#F0EFED] hover:bg-white/5"
                }`}
              >
                <span>{lang === "sr" ? "Hronološki (Starije ka novijem)" : "Chronological (Oldest first)"}</span>
                {sortOrder === "asc" && <Check className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={() => {
                  if (onToggleSortOrder && sortOrder !== "desc") onToggleSortOrder();
                  setActivePopover(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  sortOrder === "desc"
                    ? "bg-[#1E443A] text-white font-bold shadow-xs"
                    : isLight
                    ? "text-[#1C1D1C] hover:bg-black/5"
                    : "text-[#F0EFED] hover:bg-white/5"
                }`}
              >
                <span>{lang === "sr" ? "Obrnuto (Novije ka starijem)" : "Reverse (Newest first)"}</span>
                {sortOrder === "desc" && <Check className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES POPOVER */}
        {activePopover === "categories" && (
          <div className={`absolute top-11 right-0 w-64 p-3.5 rounded-2xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            <div className={`flex items-center justify-between mb-2 pb-2 border-b ${isLight ? "border-[#EAE6DF]" : "border-[#383A39]"}`}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className={`w-3.5 h-3.5 ${accentTextClass}`} /> {lang === "sr" ? "Kategorije" : "Categories"}
              </span>
              <span className="text-[10px] text-[#8E908B] dark:text-[#8E908B] text-[#686963] font-mono font-bold">
                {visibleGroupsCount}/{groups.length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              {groups.map((group) => {
                return (
                  <button
                    key={group.name}
                    onClick={() => onToggleGroup(group.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs transition cursor-pointer ${
                      group.visible
                        ? "bg-[#1E443A] text-white border-[#2D6A5D] font-semibold shadow-xs"
                        : isLight
                        ? "bg-white text-[#57534E] border-[#E5E0D8] opacity-70 hover:opacity-100"
                        : "bg-[#1F2120] text-[#8E908B] border-[#383A39] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                      <span className={`truncate ${!group.visible ? "line-through opacity-60" : "font-semibold text-white"}`}>
                        {getTranslatedGroup(group.name, lang)}
                      </span>
                    </div>
                    {group.visible && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SPACING / LANE HEIGHT POPOVER */}
        {activePopover === "spacing" && onChangeLaneSpacing && (
          <div className={`absolute top-11 right-0 w-64 p-4 rounded-2xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            <span className="text-xs font-bold uppercase tracking-wider block mb-3 text-[#8E908B] dark:text-[#8E908B] text-[#686963]">
              {lang === "sr" ? "Visina grupa (Razmak)" : "Group Height"}
            </span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold">{Math.round(laneSpacingMultiplier * 100)}%</span>
                <button
                  onClick={() => onChangeLaneSpacing(1.0)}
                  className="text-[10px] px-2 py-0.5 bg-[#1E443A] hover:bg-[#28594D] text-white rounded font-bold cursor-pointer"
                >
                  {lang === "sr" ? "Resetuj (100%)" : "Reset (100%)"}
                </button>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={laneSpacingMultiplier}
                onChange={(e) => onChangeLaneSpacing(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-[#1E443A]"
              />
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[0.7, 1.0, 1.5].map(preset => {
                  const isSelected = Math.abs(laneSpacingMultiplier - preset) < 0.05;
                  return (
                    <button
                      key={preset}
                      onClick={() => onChangeLaneSpacing(preset)}
                      className={`py-1 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#1E443A] text-white border-[#2D6A5D] shadow-xs"
                          : isLight
                          ? "bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#1C1D1C] border-[#E5E0D8]"
                          : "bg-[#1F2120] hover:bg-[#262827] text-[#F0EFED] border-[#383A39]"
                      }`}
                    >
                      {Math.round(preset * 100)}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. SEARCH POPOVER */}
        {activePopover === "search" && (
          <div className={`absolute top-11 right-0 w-72 p-3 rounded-2xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#8E908B] dark:text-[#8E908B] text-[#686963] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                placeholder={t.searchPlaceholder}
                className={`w-full pl-9 pr-8 py-2 text-xs border rounded-xl focus:outline-none ${
                  isLight 
                    ? "bg-white border-[#E5E0D8] text-[#1C1D1C] placeholder-[#686963]" 
                    : "bg-[#1F2120] border-[#383A39] text-[#F0EFED] placeholder-[#8E908B]"
                }`}
                autoFocus
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
                  className="absolute right-2 text-white bg-[#1E443A] hover:bg-[#28594D] rounded p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 8. NOTION VIEW SETTINGS POPUP (Images 2 & 3) */}
        {activePopover === "view_settings" && (
          <div className={`absolute top-11 right-0 w-80 sm:w-88 p-4 rounded-3xl border shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150 ${popoverSurfaceClass}`}>
            {/* Header: View settings with close button (no divider) */}
            <div className="flex items-center justify-between pb-2 mb-3">
              <h3 className="text-sm font-bold tracking-tight">
                {lang === "sr" ? "Podešavanja prikaza" : "View settings"}
              </h3>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="p-1 rounded-full bg-[#1E443A] text-white hover:bg-[#28594D] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Font selection grid (Image 3 style) */}
            <div className="mb-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {lang === "sr" ? "Font" : "Font"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: "inter",
                    label: "Hronika",
                    sampleClass: "font-sample-inter",
                    sampleFont: "'Inter', sans-serif"
                  },
                  {
                    key: "serif",
                    label: "Serif",
                    sampleClass: "font-sample-serif",
                    sampleFont: "'Lora', 'Merriweather', Georgia, serif"
                  },
                  {
                    key: "mono",
                    label: "Mono",
                    sampleClass: "font-sample-mono",
                    sampleFont: "'JetBrains Mono', monospace"
                  },
                ].map((f) => {
                  const isSelected = (preferences.font || "inter") === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => onUpdatePreferences({ font: f.key as any })}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? "bg-[#1E443A] border-[#2D6A5D] font-bold text-white shadow-xs"
                          : isLight
                          ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#57534E] hover:bg-[#EFECE5] hover:text-[#1C1D1C]"
                          : "bg-[#1F2120] border-[#383A39] text-[#8E908B] hover:bg-[#262827] hover:text-[#F0EFED]"
                      }`}
                    >
                      <span
                        className={`text-lg tracking-tight font-bold ${f.sampleClass}`}
                        style={{ fontFamily: f.sampleFont }}
                      >
                        Ab
                      </span>
                      <span className="text-xs">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick action items (no divider) */}
            <div className="space-y-1.5 mb-4">
              <button
                onClick={() => setActivePopover("filter")}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer font-semibold border ${
                  isLight
                    ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C] hover:bg-[#EFECE5]"
                    : "bg-[#1F2120] border-[#383A39] text-[#F0EFED] hover:bg-[#262827]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#8E908B] dark:text-[#8E908B] text-[#686963]" />
                  <span>{lang === "sr" ? "Filteri" : "Filter"}</span>
                </div>
                <div className="flex items-center gap-1 text-[#8E908B] dark:text-[#8E908B] text-[#686963]">
                  <span className="text-[11px]">{activeTag || (lang === "sr" ? "Svi" : "All")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={() => setActivePopover("categories")}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer font-semibold border ${
                  isLight
                    ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C] hover:bg-[#EFECE5]"
                    : "bg-[#1F2120] border-[#383A39] text-[#F0EFED] hover:bg-[#262827]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8E908B] dark:text-[#8E908B] text-[#686963]" />
                  <span>{lang === "sr" ? "Kategorije" : "Categories"}</span>
                </div>
                <div className="flex items-center gap-1 text-[#8E908B] dark:text-[#8E908B] text-[#686963]">
                  <span className="text-[11px]">{visibleGroupsCount}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Data source / Display toggles (Image 3) (no divider) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {lang === "sr" ? "Postavke elemenata" : "Display settings"}
              </span>

              {/* Show data source titles */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {lang === "sr" ? "Show data source titles" : "Show data source titles"}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ showDataSourceTitles: !(preferences.showDataSourceTitles ?? true) })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    preferences.showDataSourceTitles ?? true
                      ? "bg-[#1E443A]"
                      : isLight ? "bg-[#E5E0D8]" : "bg-[#383A39]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isHronika ? "bg-slate-900" : "bg-white"
                  } ${
                    preferences.showDataSourceTitles ?? true ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Show vertical lines */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {lang === "sr" ? "Show vertical lines" : "Show vertical lines"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !(preferences.showVerticalLines ?? true);
                    onUpdatePreferences({ showVerticalLines: next });
                    if (onToggleEventLines) onToggleEventLines();
                  }}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    preferences.showVerticalLines ?? true
                      ? "bg-[#1E443A]"
                      : isLight ? "bg-[#E5E0D8]" : "bg-[#383A39]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isHronika ? "bg-slate-900" : "bg-white"
                  } ${
                    preferences.showVerticalLines ?? true ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Show card icon */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {lang === "sr" ? "Show card icon" : "Show card icon"}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ showCardIcon: !(preferences.showCardIcon ?? true) })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    preferences.showCardIcon ?? true
                      ? "bg-[#1E443A]"
                      : isLight ? "bg-[#E5E0D8]" : "bg-[#383A39]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isHronika ? "bg-slate-900" : "bg-white"
                  } ${
                    preferences.showCardIcon ?? true ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Open card in (no divider) */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium">
                  {lang === "sr" ? "Otvaraj kartice u" : "Open card in"}
                </span>
                <select
                  value={preferences.openCardIn || "side_peek"}
                  onChange={(e) => onUpdatePreferences({ openCardIn: e.target.value as any })}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#2D6A5D] bg-[#1E443A] text-white focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="side_peek" className="bg-[#262827] text-white">Side peek</option>
                  <option value="float" className="bg-[#262827] text-white">Float</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
