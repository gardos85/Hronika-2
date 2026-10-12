import React, { useRef, useState, useEffect } from "react";
import { 
  Plus,
  Settings, 
  Calendar, 
  Map, 
  ListOrdered, 
  Edit2, 
  Check, 
  Share2, 
  Trash2, 
  Mail, 
  ChevronDown, 
  Sun, 
  Moon, 
  Globe, 
  X,
  PanelLeft,
  ScrollText,
  BookOpen,
  Clock,
  Sparkles,
  FolderKanban
} from "lucide-react";
import { TimelineItem, ViewMode, SkinType, MainSection } from "../types";
import { SKINS_CONFIG } from "./SettingsModal";
import { LangType, getAppTranslations } from "../translations";

// High-DPI SVG flags
export function FlagRS({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[2px] shrink-0 overflow-hidden inline-block shadow-xs`} viewBox="0 0 640 480">
      <g fillRule="evenodd">
        <path fill="#c6363c" d="M0 0h640v160H0z"/>
        <path fill="#0c4076" d="M0 160h640v160H0z"/>
        <path fill="#ffffff" d="M0 320h640v160H0z"/>
        <g transform="translate(230, 105) scale(0.7)">
          <path fill="#c6363c" stroke="#ffffff" strokeWidth="6" d="M120 0v160c0 66.27-53.73 120-120 120s-120-53.73-120-120V0h240z"/>
          <path fill="#ffffff" d="M-12 25h24v175h-24zM-75 100h150v24h-150z"/>
          <circle cx="-35" cy="60" r="10" fill="#ffffff" />
          <circle cx="35" cy="60" r="10" fill="#ffffff" />
          <circle cx="-35" cy="160" r="10" fill="#ffffff" />
          <circle cx="35" cy="160" r="10" fill="#ffffff" />
          <path fill="#d97706" d="M-20 -15h40l-8 20h-24z"/>
        </g>
      </g>
    </svg>
  );
}

export function FlagUS({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[2px] shrink-0 overflow-hidden inline-block shadow-xs`} viewBox="0 0 640 480">
      <g fillRule="evenodd">
        <path fill="#bd3d44" d="M0 0h640v480H0z"/>
        <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203.1h640M0 277h640M0 350.8h640M0 424.6h640"/>
        <path fill="#192f5d" d="M0 0h260v258.5H0z"/>
        <g fill="#fff">
          <circle cx="26" cy="24" r="7"/>
          <circle cx="78" cy="24" r="7"/>
          <circle cx="130" cy="24" r="7"/>
          <circle cx="182" cy="24" r="7"/>
          <circle cx="234" cy="24" r="7"/>
          <circle cx="52" cy="52" r="7"/>
          <circle cx="104" cy="52" r="7"/>
          <circle cx="156" cy="52" r="7"/>
          <circle cx="208" cy="52" r="7"/>
          <circle cx="26" cy="80" r="7"/>
          <circle cx="78" cy="80" r="7"/>
          <circle cx="130" cy="80" r="7"/>
          <circle cx="182" cy="80" r="7"/>
          <circle cx="234" cy="80" r="7"/>
          <circle cx="52" cy="108" r="7"/>
          <circle cx="104" cy="108" r="7"/>
          <circle cx="156" cy="108" r="7"/>
          <circle cx="208" cy="108" r="7"/>
          <circle cx="26" cy="136" r="7"/>
          <circle cx="78" cy="136" r="7"/>
          <circle cx="130" cy="136" r="7"/>
          <circle cx="182" cy="136" r="7"/>
          <circle cx="234" cy="136" r="7"/>
        </g>
      </g>
    </svg>
  );
}

export interface HeaderProps {
  onAddNewItem: () => void;
  onImportItems: (newItems: TimelineItem[]) => void;
  items: TimelineItem[];
  onOpenHelp: () => void;
  onOpenShortcuts?: () => void;
  onOpenSupport?: () => void;
  onClearCache?: () => void;
  onOpenSettings: () => void;
  theme?: "dark" | "light";
  skin?: SkinType;
  adaptiveLogo?: boolean;
  lang: LangType;
  onToggleLanguage: () => void;
  onSelectLanguage?: (lang: LangType) => void;
  onToggleTheme?: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onLogoClick?: () => void;
  timelineId?: string;
  onCreateNewProject?: () => void;
  onCopyProjectLink?: () => void;
  onOpenMainProject?: () => void;
  projectName?: string;
  onRenameProject?: (newName: string) => void;
  projects?: { id: string; name: string }[];
  onSelectProject?: (id: string) => void;
  onDeleteProject?: (id: string) => void;
  userAvatar?: string;
  activeSection?: MainSection;
  onSelectSection?: (section: MainSection) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({
  onAddNewItem,
  onOpenSettings,
  theme = "dark",
  adaptiveLogo = false,
  lang,
  onToggleLanguage,
  onSelectLanguage,
  onToggleTheme,
  viewMode,
  onViewModeChange,
  onLogoClick,
  timelineId = "default",
  onCreateNewProject,
  projectName = "Istorija",
  onRenameProject,
  projects = [],
  onSelectProject,
  onDeleteProject,
  userAvatar,
  activeSection = "hronika",
  onSelectSection,
  onToggleSidebar
}: HeaderProps) {
  const isLightTheme = theme === "light";
  const t = getAppTranslations(lang);
  const effectiveUserAvatar = userAvatar || (typeof window !== "undefined" ? localStorage.getItem("hronika_user_avatar") : null);

  // Dropdown states
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectNameEditValue, setProjectNameEditValue] = useState(projectName);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Refs for outside click
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(target)) {
        setIsSectionDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setIsProjectDropdownOpen(false);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(target)) {
        setIsShareOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChooseLanguage = (newLang: LangType) => {
    if (onSelectLanguage) {
      onSelectLanguage(newLang);
    } else if (onToggleLanguage && lang !== newLang) {
      onToggleLanguage();
    }
    setIsLangDropdownOpen(false);
  };

  const getSectionInfo = (section: MainSection) => {
    switch (section) {
      case "hronika":
        return {
          title: "Hronika",
          subtitle: lang === "sr" ? "Vremenska linija istorijskih događaja" : "Timeline of historical events",
          icon: Clock,
          color: "#3e927c",
          subContext: lang === "sr" ? "Vremenska linija" : "Timeline"
        };
      case "svici":
      case "workspace":
        return {
          title: "Svici",
          subtitle: lang === "sr" ? "Radni prostor • Baza, dokumenti & rukopisi" : "Workspace • Database, documents & scrolls",
          icon: ScrollText,
          color: "#3e927c",
          subContext: lang === "sr" ? "Radni prostor i svici" : "Workspace & Scrolls"
        };
      case "sveto-pismo":
        return {
          title: "Sveto pismo",
          subtitle: lang === "sr" ? "Planer čitanja & Kanon" : "Reading planner & Canon",
          icon: BookOpen,
          color: "#783c2d",
          subContext: lang === "sr" ? "Planer čitanja" : "Reading Planner"
        };
    }
  };

  const currentSectionInfo = getSectionInfo(activeSection);
  const CurrentSectionIcon = currentSectionInfo.icon;

  return (
    <header className={`h-12 w-full px-3 sm:px-4 flex items-center justify-between relative z-40 border-b select-none transition-colors duration-200 ${
      isLightTheme
        ? "bg-white/95 border-black/[0.08] text-[#18181b] backdrop-blur-md"
        : "bg-[#0f0f11]/95 border-white/[0.08] text-[#f4f4f5] backdrop-blur-md"
    }`}>
      {/* LEFT SECTION: Notion-style breadcrumbs & dropdown view switcher */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md transition-colors flex items-center justify-center cursor-pointer ${
              isLightTheme 
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]"
            }`}
            title={lang === "sr" ? "Otvori / zatvori meni (⌘\\)" : "Toggle sidebar (⌘\\)"}
            id="btn_topbar_toggle_sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Workspace Brand Icon */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded-md hover:bg-white/5 transition-colors group"
          title={lang === "sr" ? "Početna strana" : "Home"}
        >
          <div className="w-5 h-5 rounded-[4px] bg-[#3e927c] text-black font-bold flex items-center justify-center text-[11px] shadow-xs group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="font-semibold text-xs tracking-tight hidden md:inline">
            {t.appName}
          </span>
        </div>

        {/* Notion Slash Divider */}
        <span className={`text-xs select-none ${isLightTheme ? "text-slate-300" : "text-white/20"}`}>/</span>

        {/* Notion Dropdown View Switcher */}
        <div className="relative" ref={sectionDropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSectionDropdownOpen(prev => !prev);
            }}
            className={`h-7 px-2 rounded-md transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold focus:outline-none ${
              isSectionDropdownOpen
                ? (isLightTheme ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white")
                : (isLightTheme ? "hover:bg-slate-100 text-slate-800" : "hover:bg-white/[0.06] text-[#f4f4f5]")
            }`}
            id="btn_view_switcher_dropdown"
          >
            <CurrentSectionIcon 
              className="w-3.5 h-3.5 shrink-0" 
              style={{ color: currentSectionInfo.color }} 
            />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {currentSectionInfo.title}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              isSectionDropdownOpen ? "rotate-180" : ""
            } ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`} />
          </button>

          {/* View Switcher Dropdown Menu */}
          {isSectionDropdownOpen && (
            <div className={`absolute left-0 mt-1.5 w-64 rounded-xl border p-1 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-100 ${
              isLightTheme 
                ? "bg-white border-slate-200 text-slate-800 shadow-slate-400/20" 
                : "bg-[#202020] border-white/10 text-[#f4f4f5] shadow-black/80"
            }`}>
              <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isLightTheme ? "text-slate-400" : "text-[#71717a]"
              }`}>
                {lang === "sr" ? "Radni prostori" : "Workspaces"}
              </div>

              <div className="flex flex-col gap-0.5 mt-0.5">
                {/* 1. Hronika */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSection?.("hronika");
                    setIsSectionDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    activeSection === "hronika"
                      ? (isLightTheme ? "bg-[#3e927c]/15 text-[#2f6d5c] font-bold" : "bg-[#3e927c]/20 text-[#83d6bd] font-bold")
                      : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                  }`}
                  id="opt_section_hronika"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#3e927c]/15 text-[#3e927c] flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-none">Hronika</div>
                      <div className={`text-[10px] mt-1 font-normal ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                        {lang === "sr" ? "Vremenska linija" : "Timeline view"}
                      </div>
                    </div>
                  </div>
                  {activeSection === "hronika" && (
                    <Check className="w-3.5 h-3.5 text-[#3e927c] shrink-0" />
                  )}
                </button>

                {/* 2. Svici */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSection?.("svici");
                    setIsSectionDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    activeSection === "svici"
                      ? (isLightTheme ? "bg-[#ffab2e]/15 text-[#b36d00] font-bold" : "bg-[#ffab2e]/20 text-[#ffb95d] font-bold")
                      : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                  }`}
                  id="opt_section_svici"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#3e927c]/15 text-[#3e927c] flex items-center justify-center shrink-0">
                      <ScrollText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-none">Svici</div>
                      <div className={`text-[10px] mt-1 font-normal ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                        {lang === "sr" ? "Radni prostor • Baza & dokumenti" : "Workspace • Database & docs"}
                      </div>
                    </div>
                  </div>
                  {(activeSection === "svici" || activeSection === "workspace") && (
                    <Check className="w-3.5 h-3.5 text-[#3e927c] shrink-0" />
                  )}
                </button>

                {/* 3. Sveto pismo */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSection?.("sveto-pismo");
                    setIsSectionDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    activeSection === "sveto-pismo"
                      ? (isLightTheme ? "bg-[#783c2d]/15 text-[#783c2d] font-bold" : "bg-[#783c2d]/25 text-[#e07a63] font-bold")
                      : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                  }`}
                  id="opt_section_sveto_pismo"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#783c2d]/20 text-[#e07a63] flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-none">Sveto pismo</div>
                      <div className={`text-[10px] mt-1 font-normal ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                        {lang === "sr" ? "Planer čitanja & Kanon" : "Reading planner"}
                      </div>
                    </div>
                  </div>
                  {activeSection === "sveto-pismo" && (
                    <Check className="w-3.5 h-3.5 text-[#e07a63] shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sub-context breadcrumb */}
        <span className={`text-xs select-none hidden sm:inline ${isLightTheme ? "text-slate-300" : "text-white/20"}`}>/</span>
        <span className={`text-xs truncate max-w-[140px] hidden sm:inline ${
          isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"
        }`}>
          {activeSection === "hronika" ? projectName : currentSectionInfo.subContext}
        </span>
      </div>

      {/* CENTER & RIGHT CONTROLS */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* Timeline View Mode Switcher (Linija / Hrono lista / Mapa) - only shown when on Hronika */}
        {activeSection === "hronika" && (
          <div className={`h-7 hidden md:flex items-center p-0.5 rounded-lg border shadow-xs ${
            isLightTheme ? "bg-slate-100 border-slate-200" : "bg-[#191919] border-white/[0.08]"
          }`}>
            <button
              type="button"
              onClick={() => onViewModeChange("timeline")}
              className={`h-full flex items-center gap-1 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-[#3e927c] text-white shadow-xs font-bold"
                  : (isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-[#a1a1aa] hover:text-white")
              }`}
              title={t.viewTimeline}
              id="btn_view_timeline"
            >
              <Calendar className="w-3 h-3" />
              <span>{t.tabTimeline}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("chronological")}
              className={`h-full flex items-center gap-1 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "chronological"
                  ? "bg-[#3e927c] text-white shadow-xs font-bold"
                  : (isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-[#a1a1aa] hover:text-white")
              }`}
              title={t.viewChronological}
              id="btn_view_chronological"
            >
              <ListOrdered className="w-3 h-3" />
              <span>{t.tabChronological}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("map")}
              className={`h-full flex items-center gap-1 px-2 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#3e927c] text-white shadow-xs font-bold"
                  : (isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-[#a1a1aa] hover:text-white")
              }`}
              title={t.viewMap}
              id="btn_view_map"
            >
              <Map className="w-3 h-3" />
              <span>{t.tabMap}</span>
            </button>
          </div>
        )}

        {/* Project Dropdown Selector (when in Hronika) */}
        {activeSection === "hronika" && (
          <div className="relative hidden lg:block" ref={projectDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className={`h-7 px-2 rounded-md border text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                isProjectDropdownOpen
                  ? (isLightTheme ? "bg-slate-100 border-slate-300" : "bg-[#252528] border-white/20")
                  : (isLightTheme ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-[#191919] border-white/[0.08] hover:bg-[#202022]")
              }`}
              id="btn_header_project_dropdown"
            >
              <span className="truncate max-w-[100px]">{projectName}</span>
              <ChevronDown className="w-3 h-3 text-[#ffab2e]" />
            </button>

            {isProjectDropdownOpen && (
              <div className={`absolute right-0 mt-1.5 min-w-[240px] rounded-xl border p-1.5 shadow-2xl z-[9999] ${
                isLightTheme 
                  ? "bg-white border-slate-200 text-slate-800 shadow-slate-400/20" 
                  : "bg-[#202020] border-white/10 text-[#f4f4f5] shadow-black/80"
              }`}>
                <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5">
                  {(projects.length > 0 ? projects : [{ id: timelineId, name: projectName }]).map((proj) => {
                    const isActive = proj.id === timelineId;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => {
                          onSelectProject?.(proj.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg transition flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-[#3e927c] text-white font-bold"
                            : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                        }`}
                      >
                        <span className="truncate pr-2">{proj.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className={`h-[1px] my-1 ${isLightTheme ? "bg-slate-100" : "bg-white/10"}`} />

                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateNewProject?.();
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                      isLightTheme ? "bg-slate-50 hover:bg-slate-100 border-slate-200" : "bg-[#191919] hover:bg-[#252528] border-white/10"
                    }`}
                  >
                    <Plus className="w-3 h-3 text-[#ffab2e]" />
                    <span>{lang === "sr" ? "Dodaj" : "Add"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectNameEditValue(projectName);
                      setIsEditingProjectName(true);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                      isLightTheme ? "bg-slate-50 hover:bg-slate-100 border-slate-200" : "bg-[#191919] hover:bg-[#252528] border-white/10"
                    }`}
                  >
                    <Edit2 className="w-3 h-3 text-[#3e927c]" />
                    <span>{lang === "sr" ? "Preimenuj" : "Rename"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        lang === "sr" 
                          ? `Da li ste sigurni da želite da obrišete projekat ${projectName}?`
                          : `Are you sure you want to delete project ${projectName}?`
                      );
                      if (confirmed) {
                        onDeleteProject?.(timelineId);
                        setIsProjectDropdownOpen(false);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                      isLightTheme 
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                        : "bg-red-950/40 text-red-400 border-red-900/40 hover:bg-red-900/40"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{lang === "sr" ? "Obriši" : "Delete"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD NEW ITEM BUTTON - "+ Novo" with Mint Teal accent */}
        {activeSection === "hronika" && (
          <button
            type="button"
            onClick={() => onAddNewItem?.()}
            className="h-7 px-2.5 rounded-md font-semibold transition flex items-center gap-1 text-[11px] cursor-pointer bg-[#3e927c] hover:bg-[#4aa88f] text-white shadow-xs shrink-0"
            id="btn_add_item_open"
            title={lang === "sr" ? "Dodaj novi događaj" : "Add new event"}
          >
            <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            <span className="font-semibold">{t.btnNew}</span>
          </button>
        )}

        {/* Share Button & Popover */}
        <div className="relative" ref={shareDropdownRef}>
          <button
            type="button"
            onClick={() => setIsShareOpen(!isShareOpen)}
            className={`p-1.5 rounded-md transition-colors flex items-center justify-center cursor-pointer ${
              isShareOpen
                ? "bg-[#3e927c] text-white"
                : (isLightTheme ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]")
            }`}
            title={lang === "sr" ? "Podeli" : "Share"}
            id="btn_share_popover_toggle"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {isShareOpen && (() => {
            const shareUrl = typeof window !== "undefined"
              ? (timelineId === "default"
                ? `${window.location.protocol}//${window.location.host}/`
                : `${window.location.protocol}//${window.location.host}/p/${timelineId}`)
              : "";
            const shareMessageText = (lang === "sr" ? "Pogledajte projekat \"" : "Check out the project \"") + (projectName || "Istorija") + (lang === "sr" ? "\" na Hronici: " : "\" on Chronicle: ") + shareUrl;

            return (
              <div className={`absolute right-0 mt-1.5 w-72 rounded-xl border p-3 shadow-2xl z-[9999] ${
                isLightTheme ? "bg-white border-slate-200 text-slate-800" : "bg-[#202020] border-white/10 text-[#f4f4f5]"
              }`}>
                <div className="space-y-2.5">
                  <h3 className={`text-[10px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
                    {lang === "sr" ? "Podeli vezu" : "Share link"}
                  </h3>
                  
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className={`flex-1 text-[11px] font-mono px-2 py-1 border rounded-md focus:outline-none truncate ${
                        isLightTheme ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-[#191919] border-white/10 text-[#a1a1aa]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert(lang === "sr" ? "Link uspešno kopiran!" : "Link successfully copied!");
                      }}
                      className="px-2 py-1 bg-[#3e927c] hover:bg-[#4aa88f] text-white font-semibold rounded-md text-[11px] transition shrink-0 cursor-pointer"
                    >
                      {lang === "sr" ? "Kopiraj" : "Copy"}
                    </button>
                  </div>

                  <div className={`h-[1px] ${isLightTheme ? "bg-slate-100" : "bg-white/10"}`} />

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a
                      href={`whatsapp://send?text=${encodeURIComponent(shareMessageText)}`}
                      className="p-1.5 rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform cursor-pointer"
                      title="WhatsApp"
                    >
                      <span className="text-[10px] font-bold px-1">WA</span>
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(projectName || "Hronika")}&body=${encodeURIComponent(shareMessageText)}`}
                      className="p-1.5 rounded-full bg-[#EA4335] text-white hover:scale-110 transition-transform cursor-pointer"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sun / Moon Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-1.5 rounded-md transition-colors flex items-center justify-center cursor-pointer ${
              isLightTheme 
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]"
            }`}
            title={isLightTheme ? (lang === "sr" ? "Tamni režim" : "Dark mode") : (lang === "sr" ? "Svetli režim" : "Light mode")}
            id="btn_theme_toggle_header"
          >
            {isLightTheme ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#ffab2e]" />
            )}
          </button>
        )}

        {/* Language dropdown button */}
        <div className="relative" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className={`px-1.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-semibold ${
              isLangDropdownOpen
                ? (isLightTheme ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white")
                : (isLightTheme ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]")
            }`}
            title={lang === "sr" ? "Jezik" : "Language"}
            id="btn_language_switcher"
          >
            {lang === "sr" ? <FlagRS /> : <FlagUS />}
            <span className="uppercase text-[10px] font-bold">{lang}</span>
            <ChevronDown className="w-3 h-3 text-[#71717a]" />
          </button>

          {isLangDropdownOpen && (
            <div className={`absolute right-0 mt-1.5 w-36 rounded-xl border p-1 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-100 ${
              isLightTheme ? "bg-white border-slate-200 text-slate-800" : "bg-[#202020] border-white/10 text-[#f4f4f5]"
            }`}>
              <button
                type="button"
                onClick={() => handleChooseLanguage("sr")}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  lang === "sr"
                    ? "bg-[#3e927c]/20 text-[#3e927c] font-bold"
                    : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                }`}
                id="btn_lang_opt_sr"
              >
                <div className="flex items-center gap-2">
                  <FlagRS />
                  <span>Srpski</span>
                </div>
                {lang === "sr" && <Check className="w-3 h-3 text-[#3e927c]" />}
              </button>

              <button
                type="button"
                onClick={() => handleChooseLanguage("en")}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  lang === "en"
                    ? "bg-[#3e927c]/20 text-[#3e927c] font-bold"
                    : (isLightTheme ? "hover:bg-slate-50 text-slate-700" : "hover:bg-white/5 text-[#d4d4d8]")
                }`}
                id="btn_lang_opt_en"
              >
                <div className="flex items-center gap-2">
                  <FlagUS />
                  <span>English</span>
                </div>
                {lang === "en" && <Check className="w-3 h-3 text-[#3e927c]" />}
              </button>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`p-1.5 rounded-md transition-colors flex items-center justify-center cursor-pointer ${
            isLightTheme 
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
              : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.06]"
          }`}
          title={t.appearanceSettings}
          id="btn_settings_open"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Avatar */}
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0 ml-0.5">
          {effectiveUserAvatar ? (
            <img src={effectiveUserAvatar} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#3e927c] flex items-center justify-center text-white text-[10px] font-bold">
              D
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
