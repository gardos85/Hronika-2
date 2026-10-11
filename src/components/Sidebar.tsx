import React, { useState, useRef, useEffect } from "react";
import { 
  CheckSquare, 
  Square, 
  Eye, 
  EyeOff, 
  CalendarRange, 
  SlidersHorizontal, 
  Palette, 
  Plus, 
  Trash2,
  Edit2,
  Check,
  X,
  Globe,
  Crown,
  BookOpen,
  User,
  ScrollText,
  Compass,
  Pin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
  Rocket,
  PanelLeftClose,
  ChevronDown,
  HelpCircle,
  Settings,
  MoreHorizontal,
  Search,
  Filter,
  Inbox,
  ChevronsLeft,
  ChevronsRight,
  PanelLeft,
  Clock
} from "lucide-react";
import { TimelineFilter, TagConfig, NotionColor, MainSection } from "../types";
import { translations, LangType, getAppTranslations } from "../translations";
import { getTranslatedGroup, getSearchShortcutKeyLabel, isSearchShortcutEvent } from "../utils";
import { SKINS_CONFIG } from "./SettingsModal";
import { NotionTagPill, NOTION_COLORS_LIST } from "./TagManagerPicker";
import { HelpMenuPopover } from "./HelpMenuPopover";
import { CategoryColorPicker } from "./CategoryColorPicker";

export const SOLID_COLOR_PALETTE = [
  "#D96B27", // Terakota narandžasta (Terracotta)
  "#C88A3B", // Zlatni oker (Golden Ochre)
  "#3E7B5C", // Šumski bor (Forest Pine)
  "#2D6A5D", // Duboka borova (Deep Pine Teal)
  "#6E7F5E", // Žalfija / Maslinasta (Sage Olive)
  "#4A7A96", // Rečni škriljac (River Slate Blue)
  "#A34836", // Cigla / Rđa (Brick Rust)
  "#8C4A32", // Pečena glina (Burnt Clay)
  "#6E503E", // Topli kesten (Warm Chestnut)
  "#5C4E4B", // Zemljana braon (Earth Brown)
  "#525953", // Škriljac siva (Slate Stone)
  "#383A39"  // Topli bazalt (Warm Basalt)
];

/**
 * Maps specific historical/biblical groups to their requested icons:
 * - "Svetske sile" -> Mapa sveta (Globe)
 * - "Vladari" -> Kraljevska kruna (Crown)
 * - "Sveto pismo" -> Otvorena Biblija (BookOpen)
 * - "Ličnosti" -> Ikonica osobe (User)
 * - "Biblijski događaji" -> Istorijski biblijski svitak (ScrollText)
 */
export function getGroupIcon(groupName: string) {
  const norm = groupName.toLowerCase().trim();
  // 1. Svetske sile / World Powers -> Mapa sveta
  if (norm.includes("svet") && (norm.includes("sil") || norm.includes("vlas")) || norm.includes("world power") || norm.includes("imperij")) {
    return Globe;
  }
  // 2. Vladari / Rulers -> Kraljevska kruna
  if (norm.includes("vladar") || norm.includes("kralj") || norm.includes("car") || norm.includes("ruler") || norm.includes("king") || norm.includes("monarh")) {
    return Crown;
  }
  // 3. Sveto pismo / Scriptures -> Otvorena Biblija
  if (norm.includes("sveto pismo") || norm.includes("biblija") || norm.includes("spis") || norm.includes("scripture") || norm.includes("bible")) {
    return BookOpen;
  }
  // 4. Ličnosti / Historical Figures -> Ikonica osobe
  if (norm.includes("ličnost") || norm.includes("licnost") || norm.includes("osob") || norm.includes("figura") || norm.includes("person") || norm.includes("figure") || norm.includes("people")) {
    return User;
  }
  // 5. Biblijski događaji -> Ikonica istorijskog biblijskog zapisa / svitka
  if (norm.includes("biblijsk") && (norm.includes("događaj") || norm.includes("dogadjaj") || norm.includes("event"))) {
    return ScrollText;
  }
  // 6. Svetski događaji -> Kompas / globalni događaji
  if (norm.includes("svetski") || norm.includes("world event")) {
    return Compass;
  }
  // 7. Opšti događaji
  if (norm.includes("događaj") || norm.includes("dogadjaj") || norm.includes("event") || norm.includes("epizod") || norm.includes("hronik")) {
    return ScrollText;
  }
  return Layers;
}

interface SidebarProps {
  groups: { name: string; color: string; visible: boolean }[];
  onToggleGroup: (name: string) => void;
  onUpdateGroupColor: (name: string, color: string) => void;
  onAddGroup?: (name: string, color: string) => void;
  onDeleteGroup?: (name: string) => void;
  filters: TimelineFilter;
  onFilterChange: (filters: TimelineFilter) => void;
  allItemsTags?: string[];
  availableTags?: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  theme?: "dark" | "light";
  skin?: string;
  lang: LangType;
  isFullscreen?: boolean;
  adaptiveLogo?: boolean;
  projects?: { id: string; name: string }[];
  timelineId?: string;
  projectName?: string;
  onSelectProject?: (id: string) => void;
  onCreateProject?: () => void;
  onRenameProject?: (newName: string) => void;
  onDeleteProject?: (id: string) => void;
  onAddNewItem?: (groupName?: string) => void;
  onOpenHelp?: () => void;
  onOpenShortcuts?: () => void;
  onOpenSupport?: () => void;
  onClearCache?: () => void;
  onOpenSettings?: () => void;
  isPinnedProp?: boolean;
  onTogglePinProp?: () => void;
  userAvatar?: string;
  activeSection?: MainSection;
  onSelectSection?: (section: MainSection) => void;
}

export function Sidebar({
  groups,
  onToggleGroup,
  onUpdateGroupColor,
  onAddGroup,
  onDeleteGroup,
  filters,
  onFilterChange,
  availableTags = [],
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  isOpen,
  onToggleSidebar,
  theme = "dark",
  skin = "hronika",
  lang,
  isFullscreen = false,
  adaptiveLogo = false,
  projects = [],
  timelineId = "default",
  projectName,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onAddNewItem,
  onOpenHelp,
  onOpenShortcuts,
  onOpenSupport,
  onClearCache,
  onOpenSettings,
  isPinnedProp,
  onTogglePinProp,
  userAvatar,
  activeSection = "hronika",
  onSelectSection
}: SidebarProps) {
  const effectiveUserAvatar = userAvatar || (typeof window !== "undefined" ? localStorage.getItem("hronika_user_avatar") : null);

  const [openPaletteGroup, setOpenPaletteGroup] = useState<string | null>(null);
  const [hoveredGroupTooltip, setHoveredGroupTooltip] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupToDeleteConfirm, setGroupToDeleteConfirm] = useState<string | null>(null);

  // Tag filter state
  const [tagFilterSearch, setTagFilterSearch] = useState("");
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [editTagName, setEditTagName] = useState("");

  // Bottom Project Popover Dropdown State
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isInlineRenaming, setIsInlineRenaming] = useState(false);
  const [inlineRenameVal, setInlineRenameVal] = useState("");

  // Bottom Help Dropdown Menu State
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isRailHelpMenuOpen, setIsRailHelpMenuOpen] = useState(false);

  const projectMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pin & Auto-Hide state management
  const [internalIsPinned, setInternalIsPinned] = useState<boolean>(() => {
    const hasDefaultApplied = localStorage.getItem("hronika_sidebar_unpinned_v3_applied");
    if (!hasDefaultApplied) {
      localStorage.setItem("hronika_sidebar_unpinned_v3_applied", "true");
      localStorage.setItem("hronika_sidebar_pinned_v1", "false");
      return false;
    }
    const saved = localStorage.getItem("hronika_sidebar_pinned_v1");
    return saved === "true";
  });

  const isPinned = isPinnedProp !== undefined ? isPinnedProp : internalIsPinned;

  // Temporary hover expansion when unpinned
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle outside click to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (projectMenuRef.current && !projectMenuRef.current.contains(target)) {
        setIsProjectMenuOpen(false);
        setIsInlineRenaming(false);
      }
      if (openPaletteGroup !== null || isAddingGroup) {
        if (!target.closest("#sidebar_pinned_full") && !target.closest("#sidebar_narrow_rail") && !target.closest("#sidebar_floating_overlay")) {
          setOpenPaletteGroup(null);
          setIsAddingGroup(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPaletteGroup, isAddingGroup]);

  // Global mousemove detection: When unpinned, auto-appear when mouse approaches left edge (<= 24px)
  useEffect(() => {
    if (isPinned) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 24) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setIsHoverExpanded(true);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPinned]);

  const t = getAppTranslations(lang);

  const togglePin = () => {
    if (onTogglePinProp) {
      onTogglePinProp();
    } else {
      setInternalIsPinned(prev => {
        const next = !prev;
        localStorage.setItem("hronika_sidebar_pinned_v1", String(next));
        return next;
      });
    }
    setIsHoverExpanded(false);
  };

  // Dynamic search shortcut label based on OS: "⌘K" on macOS/iOS, "Ctrl+K" on Windows/Android
  const [searchShortcutBadge, setSearchShortcutBadge] = useState(() => getSearchShortcutKeyLabel());

  useEffect(() => {
    setSearchShortcutBadge(getSearchShortcutKeyLabel());
  }, []);

  // Global keyboard shortcuts: Command+K (macOS/iOS) or Ctrl+K (Windows/Android) to open/close menu and search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchShortcutEvent(e)) {
        e.preventDefault();
        e.stopPropagation();

        const isMenuCurrentlyOpen = isPinned || isHoverExpanded;

        if (isMenuCurrentlyOpen) {
          // Close the menu
          if (isPinned) {
            togglePin();
          } else {
            setIsHoverExpanded(false);
          }
          searchInputRef.current?.blur();
        } else {
          // Open the menu and focus search
          setIsHoverExpanded(true);
          setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }, 60);
        }
      } else if (e.key === "Escape" && isHoverExpanded) {
        setIsHoverExpanded(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPinned, isHoverExpanded, onTogglePinProp]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isPinned) {
      setIsHoverExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoverExpanded(false);
      }, 250);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: "",
      selectedGroups: [],
      selectedTag: "",
      fromYear: -5000,
      toYear: 2100
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== "" || 
    filters.selectedTag !== "" || 
    filters.fromYear !== -5000 || 
    filters.toYear !== 2100 || 
    filters.selectedGroups.length > 0;

  const isLightTheme = theme === "light";
  const isProStudio = skin === "pro_studio";
  const skinInfo = (SKINS_CONFIG as any)[skin || "hronika"] || SKINS_CONFIG.hronika;

  // Helpers for Notion styling and Pro Studio / Hronika theme colors
  const accentTextClass = isProStudio ? "text-[#10b981] dark:text-[#34d399]" : "text-[#74BAA0]";
  const accentMutedTextClass = isLightTheme ? "text-slate-600" : "text-[#ada9a3]";
  const accentActiveBgClass = isProStudio ? "bg-[#10b981] text-white font-bold" : "bg-[#1E443A] text-white font-bold";
  const focusBorderClass = isProStudio ? "focus:border-[#10b981]" : "focus:border-[#1E443A]";
  const actionBtnClass = isProStudio
    ? "bg-[#10b981] hover:bg-[#059669] text-white font-medium shadow-xs shadow-emerald-500/20"
    : "bg-[#1E443A] hover:bg-[#28594D] text-white font-medium";

  const activeProjectDisplayName = projectName || (lang === "sr" ? "Prazan projekat" : "Empty Project");

  // Content for the full Notion-styled sidebar panel
  const renderFullContent = (isOverlay: boolean) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden select-none relative">
      
      {/* 1. TOP NOTION HEADER & SEARCH INPUT (Image 3 Notion layout) */}
      <div className={`p-3 border-b shrink-0 flex flex-col gap-2.5 ${
        isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-[#0f0f12] border-[#373735]"
      }`}>
        {/* Top Control Bar: Notion collapse/embed icon on left, Inbox & Collapse on right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Notion sidebar toggle icon on left */}
            <button
              type="button"
              onClick={togglePin}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                isLightTheme 
                  ? "hover:bg-slate-200 text-slate-600 hover:text-slate-900" 
                  : "hover:bg-slate-800 text-[#ada9a3] hover:text-white"
              }`}
              title={
                isOverlay 
                  ? (lang === "sr" ? "Ugradi meni u interfejs (⌘\\)" : "Embed sidebar into interface (⌘\\)") 
                  : (lang === "sr" ? "Sakrij meni (⌘\\)" : "Collapse sidebar (⌘\\)")
              }
              id="btn_sidebar_toggle_notion_left"
            >
              <PanelLeft className="w-4 h-4 text-[#ada9a3]" />
            </button>

            <span className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-700" : "text-[#ada9a3]"}`}>
              {lang === "sr" ? "MENI" : "MENU"}
            </span>
          </div>

          {/* Right: Notion Inbox / Updates icon with badge 6 (Image 3) */}
          <div className="flex items-center gap-1">
            <div 
              className={`p-1.5 rounded-lg transition relative flex items-center justify-center cursor-pointer ${
                isLightTheme ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" : "hover:bg-slate-800 text-[#ada9a3] hover:text-white"
              }`}
              title={lang === "sr" ? "Obaveštenja i ažuriranja" : "Inbox & updates"}
              id="btn_sidebar_inbox"
            >
              <Inbox className="w-4 h-4 text-[#ada9a3]" />
              <span className="absolute -top-0.5 -right-0.5 bg-[#A34836] text-white text-[9px] font-bold px-1 rounded-full leading-tight shadow-xs">
                6
              </span>
            </div>
          </div>
        </div>

        {/* Notion-style Search Box:
            - No section title
            - Placeholder: "Pretraži događaje, opise i tagove" in italic
            - Typed text in regular (not-italic)
            - Far right: ⌘K badge (Image 3)
        */}
        <div 
          onClick={() => searchInputRef.current?.focus()}
          className={`group flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all cursor-text ${
            isLightTheme 
              ? "bg-white border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:shadow-sm" 
              : "bg-[#161619] border-[#373735] hover:border-[#4a4a47] focus-within:border-[#3E927B] focus-within:shadow-sm"
          }`}
          id="search_box_notion_container"
        >
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder={lang === "sr" ? "Pretraži događaje, opise i tagove" : "Search events, descriptions, tags"}
            className={`w-full bg-transparent text-xs font-normal not-italic focus:outline-none placeholder:text-[#ada9a3] dark:placeholder:text-[#ada9a3] ${
              isLightTheme ? "text-slate-800" : "text-[#eaeaea]"
            }`}
            id="inp_search_events_notion"
          />

          {filters.searchQuery ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFilterChange({ ...filters, searchQuery: "" });
              }}
              className="p-0.5 rounded text-[#e2e8f1] hover:text-white cursor-pointer shrink-0 ml-1.5"
              title={lang === "sr" ? "Obriši tekst pretrage" : "Clear search"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            /* Badge with ⌘K or Ctrl+K matching OS */
            <kbd className={`shrink-0 ml-2 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border-none select-none transition-colors ${
              isLightTheme
                ? "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                : "bg-[#3b3b39] text-[#ada9a3]"
            }`}>
              {searchShortcutBadge}
            </kbd>
          )}
        </div>
      </div>

      {/* 2. SCROLLABLE MIDDLE CONTENT (Workspaces, Categories, Timespan, Reset Filters) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar flex flex-col bg-transparent">

        {/* RADNI PROSTORI (WORKSPACES) SECTION from Google Stitch */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 px-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${accentMutedTextClass}`}>
              {lang === "sr" ? "Radni prostori" : "Workspaces"}
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {/* 1. Hronika */}
            <button
              type="button"
              id="sidebar_btn_hronika"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection?.("hronika");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSection === "hronika"
                  ? (isLightTheme ? "bg-[#3e927c]/15 text-[#2f6d5c] font-bold shadow-xs" : "bg-[#3e927c]/20 text-[#83d6bd] font-bold shadow-xs")
                  : (isLightTheme ? "hover:bg-slate-200/60 text-slate-700" : "hover:bg-white/5 text-[#a1a1aa] hover:text-[#f4f4f5]")
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3e927c] shrink-0" />
                <span>Hronika</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isLightTheme ? "bg-slate-200/60 text-slate-600" : "bg-white/5 text-[#71717a]"
              }`}>
                {lang === "sr" ? "Pre n. e." : "BCE/CE"}
              </span>
            </button>

            {/* 2. Svici */}
            <button
              type="button"
              id="sidebar_btn_svici"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection?.("svici");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSection === "svici"
                  ? (isLightTheme ? "bg-[#ffab2e]/15 text-[#b36d00] font-bold shadow-xs" : "bg-[#ffab2e]/20 text-[#ffb95d] font-bold shadow-xs")
                  : (isLightTheme ? "hover:bg-slate-200/60 text-slate-700" : "hover:bg-white/5 text-[#a1a1aa] hover:text-[#f4f4f5]")
              }`}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-[#ffab2e] shrink-0" />
                <span>Svici</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isLightTheme ? "bg-slate-200/60 text-slate-600" : "bg-white/5 text-[#71717a]"
              }`}>
                {lang === "sr" ? "Rukopisi" : "Scrolls"}
              </span>
            </button>

            {/* 3. Sveto pismo */}
            <button
              type="button"
              id="sidebar_btn_sveto_pismo"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection?.("sveto-pismo");
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeSection === "sveto-pismo"
                  ? (isLightTheme ? "bg-[#783c2d]/15 text-[#783c2d] font-bold shadow-xs" : "bg-[#783c2d]/25 text-[#e07a63] font-bold shadow-xs")
                  : (isLightTheme ? "hover:bg-slate-200/60 text-slate-700" : "hover:bg-white/5 text-[#a1a1aa] hover:text-[#f4f4f5]")
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#e07a63] shrink-0" />
                <span>Sveto pismo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffab2e]" />
                <span className="text-[10px] font-mono text-[#ffab2e]">68%</span>
              </div>
            </button>
          </nav>
        </div>

        <div className={`h-[1px] my-1 ${isLightTheme ? "bg-slate-200/70" : "bg-white/[0.06]"}`} />

        {/* KATEGORIJE SECTION - Minimalist without rounded container box and without border */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${accentMutedTextClass} flex items-center gap-1.5`}>
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Kategorije" : "Categories"}</span>
            </span>
            <span className={`text-[10px] font-mono ${isLightTheme ? "text-slate-400" : "text-[#7d7a75]"}`}>
              {groups.filter(g => g.visible).length}/{groups.length}
            </span>
          </div>

          <div className="space-y-1">
            {groups.map((group) => {
              const GroupIcon = getGroupIcon(group.name);
              const isPaletteOpen = openPaletteGroup === group.name;

              return (
                <div key={group.name} className="flex flex-col">
                  {/* Category interactive row */}
                  <div
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur?.();
                      setHoveredGroupTooltip(null);
                      onToggleGroup(group.name);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onAddNewItem?.(group.name);
                    }}
                    onMouseEnter={() => setHoveredGroupTooltip(group.name)}
                    onMouseLeave={() => setHoveredGroupTooltip(null)}
                    title={
                      hoveredGroupTooltip === group.name
                        ? (lang === "sr" ? "Klik za prikaz/sakrivanje • Dupli klik za dodavanje događaja" : "Click to toggle • Double-click to add event")
                        : undefined
                    }
                    className={`cat-row flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors text-xs font-semibold select-none group/item border-0 outline-none ring-0 ${
                      isLightTheme 
                        ? "hover:bg-slate-100/70 text-slate-700" 
                        : "hover:bg-white/5 text-slate-300"
                    }`}
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    id={`lbl_grp_${group.name.replace(/\s+/g, '_')}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Checkbox button - strictly toggles category visibility */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.currentTarget as HTMLElement).blur?.();
                          onToggleGroup(group.name);
                        }}
                        className="p-1 -m-1 rounded hover:scale-110 active:scale-95 transition cursor-pointer shrink-0 border-0 outline-none ring-0"
                        style={{ border: 'none', outline: 'none' }}
                        title={lang === "sr" ? (group.visible ? "Sakrij kategoriju" : "Prikaži kategoriju") : (group.visible ? "Hide category" : "Show category")}
                        id={`btn_chk_grp_${group.name.replace(/\s+/g, '_')}`}
                      >
                        {group.visible ? (
                          <CheckSquare className="w-4 h-4 shrink-0" style={{ color: skinInfo.primaryHex || skinInfo.primary }} />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                      </button>

                      {/* Group custom icon with color */}
                      <GroupIcon
                        className="w-4 h-4 shrink-0 transition-transform group-hover/item:scale-110"
                        style={{ color: group.color }}
                      />

                      <span className={`truncate ${group.visible ? (isLightTheme ? "text-slate-800" : "text-slate-200") : "text-slate-500 line-through"}`}>
                        {getTranslatedGroup(group.name, lang, t)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Sole Trigger & Tinted Color Indicator: Artist Palette Icon */}
                      <button
                        type="button"
                        onClick={() => setOpenPaletteGroup(isPaletteOpen ? null : group.name)}
                        className={`p-1.5 rounded-lg transition hover:scale-110 active:scale-95 cursor-pointer relative flex items-center justify-center border-0 outline-none ring-0 ${
                          isPaletteOpen 
                            ? (isLightTheme ? "bg-slate-200/90 text-slate-800" : "bg-white/10 text-white") 
                            : (isLightTheme ? "bg-transparent hover:bg-slate-100 text-slate-600" : "bg-transparent hover:bg-white/5 text-slate-300")
                        }`}
                        style={{ border: 'none', outline: 'none' }}
                        title={lang === "sr" ? "Boja kategorije" : "Category color"}
                        id={`btn_palette_${group.name.replace(/\s+/g, '_')}`}
                      >
                        <Palette 
                          className="w-4 h-4 transition-transform group-hover/item:scale-105" 
                          style={{ color: group.color }} 
                        />
                      </button>

                      {/* Delete category action button on hover */}
                      {onDeleteGroup && (
                        <button
                          type="button"
                          onClick={() => setGroupToDeleteConfirm(group.name)}
                          className={`p-1.5 rounded-lg transition hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover/item:opacity-100 focus:opacity-100 border-0 outline-none ring-0 ${
                            isLightTheme 
                              ? "text-slate-400 hover:text-[#A34836] hover:bg-[#FDF0ED]" 
                              : "text-[#7d7a75] hover:text-[#E08D79] hover:bg-[#342421]/60"
                          }`}
                          style={{ border: 'none', outline: 'none' }}
                          title={lang === "sr" ? `Obriši kategoriju „${group.name}“` : `Delete category "${group.name}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Advanced Unified Category Color Picker Popover */}
                  {isPaletteOpen && (
                    <CategoryColorPicker
                      color={group.color}
                      onChangeColor={(newHex) => onUpdateGroupColor(group.name, newHex)}
                      onClose={() => setOpenPaletteGroup(null)}
                      presets={SOLID_COLOR_PALETTE}
                      isLightTheme={isLightTheme}
                      lang={(lang === "en" ? "en" : "sr")}
                    />
                  )}
                </div>
              );
            })}

            {/* Inline input for adding a group */}
            {isAddingGroup && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newGroupName.trim() && onAddGroup) {
                    const randomColor = SOLID_COLOR_PALETTE[Math.floor(Math.random() * SOLID_COLOR_PALETTE.length)];
                    onAddGroup(newGroupName.trim(), randomColor);
                  }
                  setNewGroupName("");
                  setIsAddingGroup(false);
                }}
                className="flex gap-1.5 mt-2 animate-in slide-in-from-top-1 duration-100"
              >
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={lang === "sr" ? "Naziv nove kategorije..." : "New category name..."}
                  className={`flex-1 px-2.5 py-1 text-xs border rounded-lg focus:outline-none ${
                    isLightTheme 
                      ? "bg-white border-slate-300 text-slate-800 focus:border-slate-500" 
                      : `bg-slate-950 border-slate-800 ${focusBorderClass} text-slate-200`
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`px-2.5 py-1 rounded-lg ${actionBtnClass} text-xs cursor-pointer transition`}
                >
                  {lang === "sr" ? "Dodaj" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGroup(false);
                    setNewGroupName("");
                  }}
                  className={`px-2 py-1 rounded-lg text-xs border cursor-pointer transition ${
                    isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  {lang === "sr" ? "Poništi" : "Cancel"}
                </button>
              </form>
            )}

            {/* Action buttons at the bottom right corner */}
            <div className="flex justify-end gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setIsAddingGroup(true)}
                className={`p-1.5 rounded-lg transition hover:scale-105 cursor-pointer ${
                  isLightTheme 
                    ? "hover:bg-slate-100 text-slate-700" 
                    : "hover:bg-[#2e2e2e] text-[#7d7a75] hover:text-white"
                }`}
                title={lang === "sr" ? "Dodaj novu kategoriju" : "Add new category"}
                id="btn_add_group_trigger"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Delete Confirmation popup modal */}
          {groupToDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className={`p-5 rounded-xl border max-w-sm w-full shadow-2xl space-y-4 ${
                isLightTheme ? "bg-white border-[#E5E0D8] text-[#1C1D1C]" : "bg-[#262827] border-[#383A39] text-[#F0EFED]"
              }`}>
                <h3 className="font-bold text-sm text-center">
                  {lang === "sr" ? "Da li želiš da obrišeš označenu kategoriju?" : "Do you want to delete the selected category?"}
                </h3>
                <p className={`text-xs text-center leading-normal ${isLightTheme ? "text-[#686963]" : "text-[#8E908B]"}`}>
                  {lang === "sr" 
                    ? `Ova akcija će trajno obrisati kategoriju „${groupToDeleteConfirm}“ i sve događaje koji joj pripadaju.`
                    : `This action will permanently delete category "${groupToDeleteConfirm}" and all associated events.`}
                </p>
                <div className="flex justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteGroup) {
                        onDeleteGroup(groupToDeleteConfirm);
                      }
                      setGroupToDeleteConfirm(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#A34836] hover:bg-[#8C3B2B] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    {lang === "sr" ? "Da, obriši" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupToDeleteConfirm(null)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-slate-900 hover:bg-slate-800 text-slate-350 border-slate-800"
                    }`}
                  >
                    {lang === "sr" ? "Poništi" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FILTERI / TAGOVI SECTION - Minimalist without rounded container box */}
        <div className="space-y-2 pt-2">
          {/* Header Title: Consistent minimalist style */}
          <div className="flex items-center justify-between pb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${accentMutedTextClass} flex items-center gap-1.5`}>
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Filteri" : "Filters"} {availableTags.length > 0 && `(${availableTags.length})`}</span>
            </span>
            {filters.selectedTag && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, selectedTag: "" })}
                className={`text-[10px] ${accentTextClass} hover:underline font-bold cursor-pointer`}
              >
                {lang === "sr" ? "Prikaži sve" : "Show all"}
              </button>
            )}
          </div>

          {/* Input field with italic placeholder */}
          <div>
            <input
              type="text"
              value={tagFilterSearch}
              onChange={(e) => setTagFilterSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = tagFilterSearch.trim();
                  if (trimmed && onAddCustomTag) {
                    const availableColors: NotionColor[] = ["blue", "green", "yellow", "orange", "purple", "pink", "red", "brown", "gray"];
                    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
                    onAddCustomTag(trimmed, randomColor);
                    setTagFilterSearch("");
                  }
                }
              }}
              placeholder={lang === "sr" ? 'npr. „proroci“' : 'e.g. "prophets"'}
              className={`w-full px-3 py-2 text-xs rounded-xl border not-italic font-normal placeholder:not-italic placeholder:text-[#7d7a75] outline-none transition ${
                isLightTheme
                  ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-[#7d7a75] focus:bg-white focus:border-slate-400"
                  : `bg-[#161619] border-[#373735] text-slate-200 placeholder:text-[#7d7a75] ${focusBorderClass}`
              }`}
              id="inp_sidebar_tag_filter"
            />
          </div>

          {/* List of Filter Items (Row-by-row matching image) */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-0.5">
            {availableTags
              .filter(t => !tagFilterSearch || t.name.toLowerCase().includes(tagFilterSearch.toLowerCase()))
              .map((tag) => {
                  const isSelected = filters.selectedTag === tag.name;
                  const isEditing = editingTag?.name === tag.name;

                  return (
                    <div key={tag.name} className="space-y-1">
                      <div
                        onClick={() => {
                          onFilterChange({
                            ...filters,
                            selectedTag: isSelected ? "" : tag.name
                          });
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border transition cursor-pointer select-none group ${
                          isSelected
                            ? isLightTheme
                              ? "bg-[#1E443A]/15 border-[#1E443A] text-[#1E443A] font-bold shadow-xs"
                              : "bg-[#1E443A]/30 border-[#1E443A] text-white font-bold shadow-xs"
                            : isLightTheme
                            ? "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            : "bg-[#161619] border-[#373735] hover:border-slate-600 hover:bg-[#1f1f24]"
                        }`}
                        id={`row_filter_${tag.name.replace(/\s+/g, '_')}`}
                      >
                        {/* Left: Tag Pill */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <NotionTagPill
                            name={tag.name}
                            color={tag.color || "default"}
                            isLight={isLightTheme}
                          />
                        </div>

                        {/* Right: Pencil (Edit) and Trash (Delete) buttons */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingTag(null);
                              } else {
                                setEditingTag(tag);
                                setEditTagName(tag.name);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition hover:scale-110 cursor-pointer ${
                              isEditing
                                ? "text-[#D96B27] bg-[#D96B27]/15 dark:text-[#E8702A] dark:bg-[#E8702A]/20"
                                : isLightTheme
                                ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                            }`}
                            title={lang === "sr" ? "Uredi filter" : "Edit filter"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onDeleteTag) {
                                onDeleteTag(tag.name);
                                if (filters.selectedTag === tag.name) {
                                  onFilterChange({ ...filters, selectedTag: "" });
                                }
                              }
                            }}
                            className={`p-1.5 rounded-lg transition hover:scale-110 cursor-pointer ${
                              isLightTheme
                                ? "text-[#8E908B] hover:text-[#A34836] hover:bg-[#FDF0ED]"
                                : "text-[#8E908B] hover:text-[#E08D79] hover:bg-[#342421]/60"
                            }`}
                            title={lang === "sr" ? "Obriši filter" : "Delete filter"}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-current" />
                          </button>
                        </div>
                      </div>

                      {/* Inline editing drawer if pencil was clicked */}
                      {isEditing && (
                        <div className={`p-2.5 rounded-xl border space-y-2 animate-in slide-in-from-top-1 duration-100 ${
                          isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b0b0e] border-slate-800"
                        }`}>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={editTagName}
                              onChange={(e) => setEditTagName(e.target.value)}
                              className={`flex-1 px-2.5 py-1 text-xs rounded-lg border outline-none ${
                                isLightTheme
                                  ? "bg-white border-slate-200 text-slate-800 focus:border-slate-400"
                                  : `bg-slate-900 border-slate-700 text-slate-200 ${focusBorderClass}`
                              }`}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateTag && editTagName.trim() && editTagName.trim() !== tag.name) {
                                  onUpdateTag(tag.name, { name: editTagName.trim() });
                                  if (filters.selectedTag === tag.name) {
                                    onFilterChange({ ...filters, selectedTag: editTagName.trim() });
                                  }
                                }
                                setEditingTag(null);
                              }}
                              className={`px-2.5 py-1 ${actionBtnClass} text-xs rounded-lg transition cursor-pointer flex items-center justify-center`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTag(null)}
                              className="px-2 py-1 rounded-lg border text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Color palette */}
                          <div className="grid grid-cols-5 gap-1 pt-1">
                            {NOTION_COLORS_LIST.map((col) => (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                  if (onUpdateTag) {
                                    onUpdateTag(tag.name, { color: col.id });
                                    setEditingTag({ ...tag, color: col.id });
                                  }
                                }}
                                className={`h-6 rounded-md border transition-transform hover:scale-105 flex items-center justify-center relative cursor-pointer ${
                                  tag.color === col.id 
                                    ? "ring-2 ring-[#1E443A] font-bold"
                                    : ""
                                }`}
                                style={{ backgroundColor: col.previewBg }}
                                title={lang === "sr" ? col.labelSr : col.labelEn}
                              >
                                {tag.color === col.id && <Check className="w-3 h-3 text-slate-900 drop-shadow" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>

        {/* VREMENSKI PERIOD SECTION - Minimalist without rounded container box */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between pb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${accentMutedTextClass} flex items-center gap-1.5`}>
              <CalendarRange className="w-3.5 h-3.5" />
              <span>{t.timespanSection}</span>
            </span>
          </div>
          
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={`text-[9px] font-bold block mb-1 ${isLightTheme ? "text-slate-500" : "text-[#7d7a75]"}`}>{lang === "sr" ? "Od godine" : "From year"}</span>
                <input
                  type="number"
                  value={filters.fromYear}
                  onChange={(e) => onFilterChange({ ...filters, fromYear: parseInt(e.target.value, 10) || -5000 })}
                  placeholder="-5000"
                  className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none font-mono ${
                    isLightTheme 
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-400" 
                      : `bg-[#161619] border-[#373735] ${focusBorderClass} text-slate-200`
                  }`}
                  id="inp_from_year"
                />
              </div>
              <div>
                <span className={`text-[9px] font-bold block mb-1 ${isLightTheme ? "text-slate-500" : "text-[#7d7a75]"}`}>{lang === "sr" ? "Do godine" : "To year"}</span>
                <input
                  type="number"
                  value={filters.toYear}
                  onChange={(e) => onFilterChange({ ...filters, toYear: parseInt(e.target.value, 10) || 2100 })}
                  placeholder="2100"
                  className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none font-mono ${
                    isLightTheme 
                      ? "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-400" 
                      : `bg-[#161619] border-[#373735] ${focusBorderClass} text-slate-200`
                  }`}
                  id="inp_to_year"
                />
              </div>
            </div>
            <div className={`text-[10px] text-center leading-relaxed ${isLightTheme ? "text-slate-400" : "text-[#7d7a75]"}`}>
              {lang === "sr" ? "Negativne vrednosti za pre n. e. (npr. -1000)" : "Negative values for BCE (e.g. -1000)"}
            </div>
          </div>
        </div>

        {/* PONIŠTI FILTRE TASTER (Ako je filter aktivan) */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`w-full py-2 border text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isLightTheme 
                ? "bg-[#FAF8F5] hover:bg-[#EFECE5] border-[#E5E0D8] text-slate-800 shadow-xs"
                : "bg-[#1E443A] hover:bg-[#28594D] border-transparent text-white shadow-xs"
            }`}
            id="btn_clear_filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === "sr" ? "Poništi pretragu i filtere" : "Reset filters"}</span>
          </button>
        )}

        {/* "CUSTOMIZE SIDEBAR" (UREDI SADRŽAJ MENIJA) - Scroller item */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            onClick={() => onOpenSettings?.()}
            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
              isLightTheme 
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70" 
                : "text-[#7d7a75] hover:text-slate-200 hover:bg-white/5"
            }`}
            id="btn_customize_sidebar_notion"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7d7a75] shrink-0" />
            <span className="truncate">{lang === "sr" ? "Uredi sadržaj menija" : "Customize sidebar"}</span>
          </button>
        </div>
      </div>

      {/* 4. FIXED STICKY NOTION BOTTOM ROW (Matching Image 4: Project name switcher with popover + Help link) */}
      <div 
        ref={projectMenuRef}
        className={`sticky bottom-0 shrink-0 border-t p-2.5 z-30 flex items-center justify-between gap-2 shadow-md ${
          isLightTheme 
            ? "bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md" 
            : "bg-[#0f0f12]/95 border-[#373735] text-slate-200 backdrop-blur-md"
        }`}
        id="sidebar_notion_bottom_bar"
      >
        {/* Left Side: Current Project trigger with Avatar & Upward Popover */}
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsProjectMenuOpen(prev => !prev)}
            className={`w-full flex items-center gap-2 p-1.5 rounded-xl transition text-left cursor-pointer border focus:outline-none focus:ring-0 ${
              isProjectMenuOpen
                ? isLightTheme 
                  ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#1C1D1C]" 
                  : "bg-[#262827] border-[#383A39] text-[#F0EFED]"
                : isLightTheme 
                  ? "border-transparent hover:bg-[#FAF8F5] text-[#1C1D1C]" 
                  : "border-transparent hover:bg-white/5 text-[#F0EFED] hover:text-white"
            }`}
            title={activeProjectDisplayName}
            id="btn_sidebar_project_switcher_bottom"
          >
            {/* Project Avatar with User Profile Picture and status dot */}
            <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-[#D96B27]/40 dark:border-[#E8702A]/40 flex items-center justify-center shrink-0">
              {effectiveUserAvatar ? (
                <img src={effectiveUserAvatar} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c8644b] flex items-center justify-center select-none">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 -mt-0.5" fill="none">
                    <circle cx="50" cy="50" r="32" fill="#ffffff" stroke="#18181b" strokeWidth="3" />
                    <path d="M24 45 C24 25 36 17 50 17 C64 17 76 25 76 45 C70 41 64 40 50 41 C36 40 30 41 24 45 Z" fill="#18181b" />
                    <circle cx="42" cy="48" r="3" fill="#18181b" />
                    <circle cx="58" cy="48" r="3" fill="#18181b" />
                    <path d="M44 60 Q50 65 56 60" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1E443A] ring-2 ring-white dark:ring-[#1F2120]" />
            </div>

            {/* Project Name */}
            <span className="text-xs font-sans font-semibold truncate flex-1 min-w-0">
              {activeProjectDisplayName}
            </span>

            {/* Notion-style Chevron indicator */}
            <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: isLightTheme ? "#D96B27" : "#E8702A" }} />
          </button>

          {/* UPWARD OPENING PROJECT DROPDOWN POPOVER */}
          {isProjectMenuOpen && (
            <div 
              className={`absolute left-0 bottom-full mb-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isLightTheme 
                  ? "bg-white border-[#E5E0D8] text-[#1C1D1C] shadow-stone-500/15" 
                  : "bg-[#222423] border-[#383A39] text-[#F0EFED] shadow-black/60"
              }`}
            >
              {/* Header */}
              <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {lang === "sr" ? "Projekti" : "Projects"}
              </div>

              {/* Projects List */}
              <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar my-1">
                {(projects.length > 0 ? projects : [{ id: timelineId, name: activeProjectDisplayName }]).map((proj) => {
                  const isActive = proj.id === timelineId;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        onSelectProject?.(proj.id);
                        setIsProjectMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer focus:outline-none ${
                        isActive
                          ? "bg-[#1E443A] text-white font-bold shadow-xs"
                          : isLightTheme
                          ? "text-[#1C1D1C] hover:bg-[#FAF8F5]"
                          : "text-[#F0EFED] hover:bg-[#2C2E2D]"
                      }`}
                    >
                      <span className="truncate pr-2">{proj.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className={`h-px my-1.5 ${isLightTheme ? "bg-slate-100" : "bg-slate-800"}`} />

              {/* Actions: Add New Project, Rename, Delete */}
              {isInlineRenaming ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inlineRenameVal.trim()) {
                      onRenameProject?.(inlineRenameVal.trim());
                      setIsInlineRenaming(false);
                      setIsProjectMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-1.5 p-1"
                >
                  <input
                    type="text"
                    value={inlineRenameVal}
                    onChange={(e) => setInlineRenameVal(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border rounded-lg focus:outline-none bg-slate-900 border-[#1E443A] text-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-[#1E443A] hover:bg-[#255246] text-white rounded-lg cursor-pointer transition shrink-0"
                    title={lang === "sr" ? "Sačuvaj" : "Save"}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInlineRenaming(false)}
                    className="p-1.5 text-white bg-[#1E443A] hover:bg-[#255246] rounded-lg cursor-pointer transition shrink-0"
                    title={lang === "sr" ? "Otkaži" : "Cancel"}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-1 px-0.5 py-0.5">
                  {/* 1. + Dodaj */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProjectMenuOpen(false);
                      onCreateProject?.();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer border focus:outline-none ${
                      isLightTheme
                        ? "bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#1C1D1C] border-[#E5E0D8]"
                        : "bg-[#1F2120] hover:bg-[#2A2C2B] text-[#F0EFED] border-[#383A39]"
                    }`}
                    title={lang === "sr" ? "Dodaj novi projekat" : "Add new project"}
                    id="btn_bottom_project_add"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0 text-[#D96B27] dark:text-[#E8702A]" />
                    <span className="whitespace-nowrap">{lang === "sr" ? "Dodaj" : "Add"}</span>
                  </button>

                  {/* 2. Preimenuj sa olovčicom s leve strane */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInlineRenameVal(activeProjectDisplayName);
                      setIsInlineRenaming(true);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer border focus:outline-none ${
                      isLightTheme
                        ? "bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#1C1D1C] border-[#E5E0D8]"
                        : "bg-[#1F2120] hover:bg-[#2A2C2B] text-[#F0EFED] border-[#383A39]"
                    }`}
                    title={lang === "sr" ? "Preimenuj projekat" : "Rename project"}
                    id="btn_bottom_project_rename"
                  >
                    <Edit2 className="w-3.5 h-3.5 shrink-0 text-[#D96B27] dark:text-[#E8702A]" />
                    <span className="whitespace-nowrap">{lang === "sr" ? "Preimenuj" : "Rename"}</span>
                  </button>

                  {/* 3. Obriši sa kanticom s leve strane */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        lang === "sr" 
                          ? `Da li ste sigurni da želite da obrišete projekat „${activeProjectDisplayName}“?`
                          : `Are you sure you want to delete project "${activeProjectDisplayName}"?`
                      );
                      if (confirmed) {
                        onDeleteProject?.(timelineId);
                        setIsProjectMenuOpen(false);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition cursor-pointer border focus:outline-none ${
                      isLightTheme
                        ? "bg-[#FAF8F5] hover:bg-[#FDF0ED] text-[#A34836] hover:text-[#8C3B2B] border-[#E5E0D8] hover:border-[#F2C2B8]"
                        : "bg-[#1F2120] hover:bg-[#342421]/60 text-[#E08D79] hover:text-[#F29F8D] border-[#383A39] hover:border-[#5A332B]"
                    }`}
                    title={lang === "sr" ? "Obriši projekat" : "Delete project"}
                    id="btn_bottom_project_delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0 text-current" />
                    <span className="whitespace-nowrap">{lang === "sr" ? "Obriši" : "Delete"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Help link/button & Settings button */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHelpMenuOpen(prev => !prev)}
              className={`p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
                isHelpMenuOpen
                  ? (isLightTheme ? "bg-slate-200 border border-slate-300 text-slate-900" : "bg-slate-800 border border-[#373735] text-white")
                  : (isLightTheme 
                    ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" 
                    : "hover:bg-[#2e2e2e] text-[#7d7a75] hover:text-white")
              }`}
              title={lang === "sr" ? "Pomoć, kontakt, ostalo" : "Help, contact, more"}
              id="btn_sidebar_help_bottom"
            >
              <HelpCircle className="w-4 h-4 text-[#7d7a75]" />
            </button>

            <HelpMenuPopover
              isOpen={isHelpMenuOpen}
              onClose={() => setIsHelpMenuOpen(false)}
              onOpenShortcuts={() => onOpenShortcuts?.()}
              onOpenSupport={() => onOpenSupport?.()}
              onClearCache={() => onClearCache?.()}
              theme={isLightTheme ? "light" : "dark"}
              skin={skin as any}
              lang={lang}
              align="bottom-right"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenSettings?.()}
            className={`p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
              isLightTheme 
                ? "hover:bg-slate-100 text-slate-600 hover:text-slate-900" 
                : "hover:bg-[#2e2e2e] text-[#7d7a75] hover:text-white"
            }`}
            title={lang === "sr" ? "Podešavanja izgleda" : "Appearance settings"}
            id="btn_sidebar_settings_bottom"
          >
            <Settings className="w-4 h-4 text-[#7d7a75]" />
          </button>
        </div>
      </div>
    </div>
  );

  // Content for the Narrow Rail (collapsed rail state)
  const renderNarrowRail = () => (
    <div className="flex flex-col items-center justify-between h-full min-h-0 w-full select-none py-2">
      {/* Top Header controls: Expand (Menu), Quick Search */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {/* Fullscreen Logo above Expand (Menu) button */}
        {isFullscreen && (
          <img 
            src={adaptiveLogo ? (isLightTheme ? "/logo.svg" : "/logo-dark.svg") : "/logo.svg"} 
            alt="Hronika" 
            className="h-9 w-9 shrink-0 object-contain mb-1 transition-transform hover:scale-105 duration-200"
          />
        )}

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setIsHoverExpanded(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition hover:scale-105 cursor-pointer ${
            isLightTheme 
              ? "hover:bg-slate-200 text-slate-700" 
              : "hover:bg-[#262827] text-[#D96B27]"
          }`}
          title={lang === "sr" ? "Otvori meni (⌘\\)" : "Expand sidebar (⌘\\)"}
          id="btn_rail_expand"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Quick Search Button */}
        <div className="relative group/search-tip">
          <button
            type="button"
            onClick={() => {
              setIsHoverExpanded(true);
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer relative border ${
              filters.searchQuery
                ? (isLightTheme ? "bg-[#D96B27]/15 border-[#D96B27]/40 text-[#D96B27]" : "bg-[#D96B27]/25 border-[#D96B27]/50 text-white")
                : (isLightTheme ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-600" : "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300")
            }`}
            title={lang === "sr" ? `Pretraga (${searchShortcutBadge})` : `Search (${searchShortcutBadge})`}
            id="btn_rail_search"
          >
            <Search className="w-4 h-4" />
            {filters.searchQuery && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D96B27] rounded-full" />
            )}
          </button>

          {/* Floating Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/search-tip:opacity-100 transition-opacity duration-150 z-50 shadow-xl border bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:border-slate-800">
            {lang === "sr" ? `Pretraga (${searchShortcutBadge})` : `Search (${searchShortcutBadge})`}
          </div>
        </div>

        <div className={`w-8 h-px my-1 ${isLightTheme ? "bg-slate-200" : "bg-slate-800"}`} />

        {/* Quick Workspace Switchers in Rail */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* Hronika */}
          <div className="relative group/rail-ws">
            <button
              type="button"
              onClick={() => onSelectSection?.("hronika")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                activeSection === "hronika"
                  ? "bg-[#3e927c]/20 border-[#3e927c]/50 text-[#3e927c] shadow-xs"
                  : (isLightTheme ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-[#a1a1aa] hover:text-white")
              }`}
              title="Hronika"
            >
              <Clock className="w-4 h-4 text-[#3e927c]" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/rail-ws:opacity-100 transition-opacity duration-150 z-50 shadow-xl border bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:border-slate-800">
              Hronika
            </div>
          </div>

          {/* Svici */}
          <div className="relative group/rail-ws">
            <button
              type="button"
              onClick={() => onSelectSection?.("svici")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                activeSection === "svici"
                  ? "bg-[#ffab2e]/20 border-[#ffab2e]/50 text-[#ffab2e] shadow-xs"
                  : (isLightTheme ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-[#a1a1aa] hover:text-white")
              }`}
              title="Svici"
            >
              <ScrollText className="w-4 h-4 text-[#ffab2e]" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/rail-ws:opacity-100 transition-opacity duration-150 z-50 shadow-xl border bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:border-slate-800">
              Svici
            </div>
          </div>

          {/* Sveto pismo */}
          <div className="relative group/rail-ws">
            <button
              type="button"
              onClick={() => onSelectSection?.("sveto-pismo")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                activeSection === "sveto-pismo"
                  ? "bg-[#783c2d]/20 border-[#783c2d]/50 text-[#e07a63] shadow-xs"
                  : (isLightTheme ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-[#a1a1aa] hover:text-white")
              }`}
              title="Sveto pismo"
            >
              <BookOpen className="w-4 h-4 text-[#e07a63]" />
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover/rail-ws:opacity-100 transition-opacity duration-150 z-50 shadow-xl border bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:border-slate-800">
              Sveto pismo
            </div>
          </div>
        </div>

        <div className={`w-8 h-px my-1 ${isLightTheme ? "bg-slate-200" : "bg-slate-800"}`} />
      </div>

      {/* Center: Vertical Group Icons with Custom Icons */}
      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto overflow-x-hidden py-1 w-full px-2 scrollbar-none">
        {groups.map((group) => {
          const IconComponent = getGroupIcon(group.name);
          const isVisible = group.visible;

          return (
            <div key={group.name} className="relative group/rail-item">
              <button
                type="button"
                onClick={() => onToggleGroup(group.name)}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border ${
                  isVisible
                    ? isLightTheme
                      ? "bg-white shadow-xs border-slate-200 hover:border-slate-300"
                      : "bg-slate-900/80 shadow-xs border-slate-800 hover:border-slate-700"
                    : isLightTheme
                      ? "bg-slate-100/60 opacity-35 hover:opacity-75 border-dashed border-slate-300"
                      : "bg-slate-950/60 opacity-30 hover:opacity-75 border-dashed border-slate-800"
                }`}
                style={{
                  borderColor: isVisible ? `${group.color}55` : undefined,
                  boxShadow: isVisible ? `0 2px 10px ${group.color}22` : undefined
                }}
                id={`btn_rail_${group.name.replace(/\s+/g, '_')}`}
                aria-label={group.name}
              >
                {/* Icon rendered with group color */}
                <IconComponent
                  className={`w-4.5 h-4.5 transition-transform ${isVisible ? "" : "grayscale"}`}
                  style={{ color: isVisible ? group.color : undefined }}
                />

                {/* Active color dot */}
                <span
                  className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full transition-all ${
                    isVisible ? "scale-100" : "scale-50 opacity-40"
                  }`}
                  style={{ backgroundColor: group.color }}
                />

                {/* Strikethrough if hidden */}
                {!isVisible && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-5 h-0.5 bg-slate-500/70 rotate-45 rounded-full" />
                  </span>
                )}
              </button>

              {/* Floating tooltip on hover */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/rail-item:opacity-100 transition-opacity duration-150 z-50 shadow-xl border bg-slate-900 text-white border-slate-700 dark:bg-slate-950 dark:border-slate-800 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                  <span>{getTranslatedGroup(group.name, lang, t)}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isVisible 
                    ? (lang === "sr" ? "Vidljivo • Klik za sakrivanje" : "Visible • Click to hide")
                    : (lang === "sr" ? "Sakriveno • Klik za prikaz" : "Hidden • Click to show")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom section: Help & Reset filters */}
      <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-slate-200 dark:border-slate-800/80">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition hover:scale-105 cursor-pointer border ${
              isLightTheme ? "bg-[#FAF8F5] border-[#E5E0D8] text-slate-700 hover:bg-[#EFECE5]" : "bg-[#1E443A] border-transparent text-white hover:bg-[#28594D]"
            }`}
            title={lang === "sr" ? "Poništi sve filtere" : "Clear all filters"}
            id="btn_rail_clear_filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Project switch icon in rail */}
        <button
          type="button"
          onClick={() => setIsHoverExpanded(true)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition hover:scale-105 cursor-pointer border ${
            isLightTheme ? "bg-white border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300"
          }`}
          title={activeProjectDisplayName}
          id="btn_rail_project"
        >
          {effectiveUserAvatar ? (
            <img src={effectiveUserAvatar} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#c8644b] flex items-center justify-center select-none">
              <svg viewBox="0 0 100 100" className="w-7 h-7 -mt-0.5" fill="none">
                <circle cx="50" cy="50" r="32" fill="#ffffff" stroke="#18181b" strokeWidth="3" />
                <path d="M24 45 C24 25 36 17 50 17 C64 17 76 25 76 45 C70 41 64 40 50 41 C36 40 30 41 24 45 Z" fill="#18181b" />
                <circle cx="42" cy="48" r="3" fill="#18181b" />
                <circle cx="58" cy="48" r="3" fill="#18181b" />
                <path d="M44 60 Q50 65 56 60" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </button>

        {/* Help icon in rail */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRailHelpMenuOpen(prev => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition hover:scale-105 cursor-pointer border ${
              isRailHelpMenuOpen
                ? (isLightTheme ? "bg-slate-200 border-slate-300 text-slate-900" : "bg-slate-800 border-slate-700 text-white")
                : (isLightTheme ? "bg-white border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300")
            }`}
            title={lang === "sr" ? "Pomoć, kontakt, ostalo" : "Help, contact, more"}
            id="btn_rail_help"
          >
            <HelpCircle className="w-4 h-4" style={{ color: skinInfo.primaryHex || skinInfo.primary }} />
          </button>

          <HelpMenuPopover
            isOpen={isRailHelpMenuOpen}
            onClose={() => setIsRailHelpMenuOpen(false)}
            onOpenShortcuts={() => onOpenShortcuts?.()}
            onOpenSupport={() => onOpenSupport?.()}
            onClearCache={() => onClearCache?.()}
            theme={isLightTheme ? "light" : "dark"}
            skin={skin as any}
            lang={lang}
            align="bottom-left"
          />
        </div>
      </div>
    </div>
  );

  // If sidebar is toggled off globally (e.g. from App.tsx isSidebarOpen = false)
  if (!isOpen) {
    return null;
  }

  // 1. PINNED MODE: Full width w-72 / w-80
  if (isPinned) {
    return (
      <aside 
        className={`sidebar-panel border-r flex flex-col min-h-0 transition-all duration-300 z-30 shrink-0 w-72 sm:w-80 h-full ${
          isLightTheme 
            ? "bg-slate-50/90 border-slate-200 text-slate-800" 
            : "bg-[#0f0f12] border-[#373735] text-slate-200"
        }`}
        id="sidebar_pinned_full"
      >
        {renderFullContent(false)}
      </aside>
    );
  }

  // 2. UNPINNED MODE: No layout displacement, auto-appears on hover near left edge or click
  return (
    <>
      {/* Invisible hover trigger zone at left screen edge */}
      <div 
        onMouseEnter={handleMouseEnter}
        className="fixed left-0 top-0 bottom-0 w-6 z-40 pointer-events-auto"
        id="sidebar_hover_edge_trigger"
      />

      {/* Floating Notion-style expand tab at top left */}
      <button
        type="button"
        onClick={togglePin}
        onMouseEnter={handleMouseEnter}
        className={`fixed top-3 left-3 z-40 p-1.5 rounded-lg border shadow-sm transition-all duration-150 flex items-center justify-center cursor-pointer ${
          isLightTheme 
            ? "bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-100 backdrop-blur-xs" 
            : "bg-[#0f0f12]/95 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-xs"
        }`}
        title={lang === "sr" ? "Otvori meni (⌘\\)" : "Open menu (⌘\\)"}
        id="btn_sidebar_notion_expand"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>

      {/* Floating Overlay Drawer (when hovered or triggered) */}
      {isHoverExpanded && (
        <>
          {/* Backdrop for click outside dismiss */}
          <div 
            className="fixed inset-0 z-[99998] bg-black/25 backdrop-blur-[0.5px]"
            onClick={() => setIsHoverExpanded(false)}
          />

          {/* Floating full panel overlay with smooth entering animation */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`fixed left-0 top-0 bottom-0 z-[99999] w-72 sm:w-80 border-r shadow-2xl flex flex-col min-h-0 transition-all duration-200 animate-in slide-in-from-left-2 ${
              isLightTheme 
                ? "bg-slate-50 border-slate-200 text-slate-800" 
                : "bg-[#0f0f12] border-[#373735] text-slate-200"
            }`}
            id="sidebar_floating_overlay"
          >
            {renderFullContent(true)}
          </div>
        </>
      )}
    </>
  );
}
