/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Timeline } from "./components/Timeline";
import { DraggableEventCard } from "./components/DraggableEventCard";
import { TimelineItemModal } from "./components/TimelineItemModal";
import { HelpInfo } from "./components/HelpInfo";
import { SettingsModal } from "./components/SettingsModal";
import { ProjectModal } from "./components/ProjectModal";
import { SupportModal } from "./components/SupportModal";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { MapAnalyticsView } from "./components/MapAnalyticsView";
import { ChronologicalView } from "./components/ChronologicalView";
import { SviciView } from "./components/SviciView";
import { SvetoPismoView } from "./components/SvetoPismoView";
import { TimelineItem, GroupConfig, TimelineFilter, AppPreferences, ViewMode, TagConfig, NotionColor, MainSection } from "./types";
import { INITIAL_ITEMS, DEFAULT_GROUPS } from "./data";
import { getTranslatedGroup, translateItem, sanitizeGroupToEarthPalette } from "./utils";
import { LangType, getAppTranslations } from "./translations";
import { getSavedGoogleDocId, startGoogleDocLiveSync } from "./services/googleDocsService";
import { Plus, SlidersHorizontal, Info, Calendar, X, CheckCircle } from "lucide-react";

const STORAGE_KEY_TAGS = "hronika_timeline_user_tags_v2";

const RANDOM_COLORS = [
  "#D96B27", "#C88A3B", "#3E7B5C", "#2D6A5D", "#6E7F5E", 
  "#4A7A96", "#A34836", "#8C4A32", "#6E503E", "#5C4E4B", 
  "#525953", "#7D6B58"
];

const getRandomColor = () => {
  return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
};

export default function App() {
  // Language state persistent (defined first so it's available to handlers)
  const [lang, setLang] = useState<LangType>(() => {
    const saved = localStorage.getItem("hronika_lang_v1");
    if (saved === "sr" || saved === "en") {
      return saved as LangType;
    }
    return "sr";
  });

  const [translationVersion, setTranslationVersion] = useState(0);

  // Global Section State: "hronika" | "svici" | "sveto-pismo"
  const [activeSection, setActiveSection] = useState<MainSection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hronika_active_section_v1");
      if (saved === "svici" || saved === "sveto-pismo" || saved === "hronika") {
        return saved as MainSection;
      }
    }
    return "hronika";
  });

  const handleSelectSection = (section: MainSection) => {
    setActiveSection(section);
    if (typeof window !== "undefined") {
      localStorage.setItem("hronika_active_section_v1", section);
    }
  };

  const handleSetLang = (newLang: LangType) => {
    setLang(newLang);
    localStorage.setItem("hronika_lang_v1", newLang);
    setTranslationVersion(v => v + 1);
  };

  const handleToggleLanguage = () => {
    setLang(prev => {
      const next: LangType = prev === "sr" ? "en" : "sr";
      localStorage.setItem("hronika_lang_v1", next);
      setTranslationVersion(v => v + 1);
      return next;
    });
  };

  // Real-time live sync for the active Google Doc translation
  useEffect(() => {
    const docId = getSavedGoogleDocId(lang);
    if (!docId) return;

    const unsubscribe = startGoogleDocLiveSync(
      docId,
      lang,
      () => {
        setTranslationVersion((v) => v + 1);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [lang]);

  // Active Project ID from URL (?id=... or ?timeline=... or path /p/:id)
  const [timelineId, setTimelineId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // 1. Check path first (e.g. /p/hronika-zjmd0i)
      const pathParts = window.location.pathname.split("/");
      if (pathParts.length >= 3 && pathParts[1] === "p") {
        return pathParts[2] || "default";
      }
      // 2. Fallback to query params
      const params = new URLSearchParams(window.location.search);
      return params.get("id") || params.get("timeline") || "default";
    }
    return "default";
  });

  const LOCAL_STORAGE_PROJECTS_KEY = "hronika_projects_list_v1";

  const getDefaultProjectName = (l: LangType) => {
    return l === "sr" ? "Prazan projekat" : "Empty Project";
  };

  // 1. Core States
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [groups, setGroups] = useState<GroupConfig[]>(DEFAULT_GROUPS);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"create" | "rename">("create");

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      let currentId = "default";
      const pathParts = window.location.pathname.split("/");
      if (pathParts.length >= 3 && pathParts[1] === "p") {
        currentId = pathParts[2] || "default";
      } else {
        const params = new URLSearchParams(window.location.search);
        currentId = params.get("id") || params.get("timeline") || "default";
      }
      setTimelineId(currentId);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Projects list state
  // Helper to ensure project name is never polluted by userName or corrupt data
  const sanitizeProjectName = (rawName?: string): string => {
    const defaultName = getDefaultProjectName(lang);
    if (!rawName || !rawName.trim()) return defaultName;
    const trimmed = rawName.trim();
    if (trimmed === "Istorija") return defaultName;
    const savedUser = typeof window !== "undefined" ? (localStorage.getItem("hronika_user_name") || "").trim().toLowerCase() : "";
    if (savedUser && trimmed.toLowerCase() === savedUser) {
      return defaultName;
    }
    return trimmed;
  };

  // Projects list state
  const [projects, setProjects] = useState<{ id: string; name: string }[]>(() => {
    const defaultName = getDefaultProjectName(lang);
    const savedUser = typeof window !== "undefined" ? (localStorage.getItem("hronika_user_name") || "").trim().toLowerCase() : "";
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            id: p.id,
            name: (!p.name || p.name === "Istorija" || (savedUser && p.name.trim().toLowerCase() === savedUser)) 
              ? defaultName 
              : p.name.trim()
          }));
        }
      }
    } catch (e) {}
    return [{ id: "default", name: defaultName }];
  });

  const [projectName, setProjectName] = useState<string>(() => {
    const defaultName = getDefaultProjectName(lang);
    const savedUser = typeof window !== "undefined" ? (localStorage.getItem("hronika_user_name") || "").trim().toLowerCase() : "";
    const found = projects.find(p => p.id === timelineId);
    if (found) {
      if (!found.name || found.name === "Istorija" || (savedUser && found.name.trim().toLowerCase() === savedUser)) {
        return defaultName;
      }
      return found.name;
    }
    return defaultName;
  });

  // Fetch projects list from server or fallback to local storage
  const fetchProjects = () => {
    const defaultName = getDefaultProjectName(lang);
    const savedUser = typeof window !== "undefined" ? (localStorage.getItem("hronika_user_name") || "").trim().toLowerCase() : "";
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map((p: any) => ({
            id: p.id,
            name: (!p.name || p.name === "Istorija" || (savedUser && p.name.trim().toLowerCase() === savedUser)) 
              ? defaultName 
              : p.name.trim()
          }));
          setProjects(list);
          localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(list));
          const current = list.find((p: any) => p.id === timelineId);
          if (current) setProjectName(current.name);
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const list = parsed.map((p: any) => ({
                id: p.id,
                name: (!p.name || p.name === "Istorija" || (savedUser && p.name.trim().toLowerCase() === savedUser))
                  ? defaultName
                  : p.name.trim()
              }));
              setProjects(list);
              const current = list.find((p: any) => p.id === timelineId);
              if (current) setProjectName(current.name);
              return;
            }
          }
        } catch (e) {}
        setProjects([{ id: "default", name: defaultName }]);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, [timelineId]);

  // Ensure projectName is sanitized if user name changes or corrupt value loaded
  useEffect(() => {
    const savedUser = (localStorage.getItem("hronika_user_name") || "").trim().toLowerCase();
    if (savedUser && projectName && projectName.trim().toLowerCase() === savedUser) {
      const fixedName = getDefaultProjectName(lang);
      setProjectName(fixedName);
      setProjects(prev => {
        const updated = prev.map(p => p.id === timelineId ? { ...p, name: fixedName } : p);
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updated));
        return updated;
      });
      try {
        const localKey = `hronika_project_data_${timelineId}`;
        const localData = localStorage.getItem(localKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          parsed.name = fixedName;
          localStorage.setItem(localKey, JSON.stringify(parsed));
        }
      } catch (e) {}
    }
  }, [projectName, timelineId, lang]);

  // Keep browser tab title synchronized with project name
  useEffect(() => {
    if (projectName && projectName.trim()) {
      document.title = `Hronika | ${projectName.trim()}`;
    } else {
      document.title = "Hronika";
    }
  }, [projectName]);

  // Load project items & groups for active timelineId
  useEffect(() => {
    isInitialLoad.current = true;
    let active = true;
    setHasLoadedFromServer(false);
    const defaultName = getDefaultProjectName(lang);

    // Check localStorage first for fast offline loading
    const localKey = `hronika_project_data_${timelineId}`;
    let loadedFromLocal = false;
    try {
      const localData = localStorage.getItem(localKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (active) {
          setItems(Array.isArray(parsed.items) ? parsed.items : []);
          const rawGroups = Array.isArray(parsed.groups) ? parsed.groups : DEFAULT_GROUPS;
          setGroups(rawGroups.map(sanitizeGroupToEarthPalette));
          if (parsed.name) {
            const cleanName = sanitizeProjectName(parsed.name);
            setProjectName(cleanName);
            if (cleanName !== parsed.name) {
              parsed.name = cleanName;
              localStorage.setItem(localKey, JSON.stringify(parsed));
            }
          }
          setHasLoadedFromServer(true);
          loadedFromLocal = true;
        }
      } else if (timelineId === "default") {
        setItems([]);
      }
    } catch (e) {}

    // Also try server fetch
    fetch(`/api/timeline?id=${timelineId}`)
      .then(res => res.json())
      .then(data => {
        if (active && data) {
          if (Array.isArray(data.items)) setItems(data.items);
          if (Array.isArray(data.groups)) setGroups(data.groups.map(sanitizeGroupToEarthPalette));
          if (data.name) {
            const cleanName = sanitizeProjectName(data.name);
            setProjectName(cleanName);
          }
          setHasLoadedFromServer(true);
        }
      })
      .catch(() => {
        if (active && !loadedFromLocal) {
          setHasLoadedFromServer(true);
        }
      });

    return () => {
      active = false;
    };
  }, [timelineId]);

  // Auto-save active project items and groups to localStorage
  useEffect(() => {
    if (timelineId) {
      try {
        localStorage.setItem(
          `hronika_project_data_${timelineId}`,
          JSON.stringify({ items, groups, name: projectName })
        );
      } catch (e) {}
    }
  }, [items, groups, projectName, timelineId]);

  // Open modals
  const handleOpenCreateProjectModal = () => {
    setProjectModalMode("create");
    setIsProjectModalOpen(true);
  };

  const handleOpenRenameProjectModal = () => {
    setProjectModalMode("rename");
    setIsProjectModalOpen(true);
  };

  // Submit handler for ProjectModal
  const handleProjectModalSubmit = (name: string, createOption?: "blank" | "copy") => {
    if (projectModalMode === "rename") {
      handleRenameProject(name);
      return;
    }

    const newId = `proj_${Date.now().toString(36)}`;
    const newItems = createOption === "copy" ? [...items] : [];
    const newGroups = [...DEFAULT_GROUPS];

    const newProj = { id: newId, name };
    const updatedProjects = [...projects, newProj];
    setProjects(updatedProjects);
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjects));

    localStorage.setItem(
      `hronika_project_data_${newId}`,
      JSON.stringify({ items: newItems, groups: newGroups, name })
    );

    fetch("/api/timeline/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name, items: newItems, groups: newGroups })
    }).catch(() => {});

    const newUrl = `${window.location.protocol}//${window.location.host}/p/${newId}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    setTimelineId(newId);
    setProjectName(name);
    setItems(newItems);
    setGroups(newGroups);
  };

  const handleRenameProject = async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setProjectName(trimmed);
    const updatedProjects = projects.map(p => p.id === timelineId ? { ...p, name: trimmed } : p);
    setProjects(updatedProjects);
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjects));

    try {
      const localKey = `hronika_project_data_${timelineId}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        parsed.name = trimmed;
        localStorage.setItem(localKey, JSON.stringify(parsed));
      }
    } catch (e) {}

    fetch("/api/timeline/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: timelineId, name: trimmed })
    }).catch(() => {});
  };

  const handleSelectProject = (id: string) => {
    const newUrl = id === "default" 
      ? `${window.location.protocol}//${window.location.host}/` 
      : `${window.location.protocol}//${window.location.host}/p/${id}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    setTimelineId(id);
  };

  const handleDeleteProject = async (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    try {
      localStorage.removeItem(`hronika_project_data_${id}`);
    } catch (e) {}

    fetch(`/api/timeline?id=${id}`, { method: "DELETE" }).catch(() => {});

    const defaultName = getDefaultProjectName(lang);

    if (updatedProjects.length === 0) {
      const freshDefault = [{ id: "default", name: defaultName }];
      setProjects(freshDefault);
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(freshDefault));
      localStorage.setItem(
        `hronika_project_data_default`,
        JSON.stringify({ items: [], groups: DEFAULT_GROUPS, name: defaultName })
      );

      const cleanUrl = `${window.location.protocol}//${window.location.host}/`;
      window.history.pushState({ path: cleanUrl }, "", cleanUrl);
      setTimelineId("default");
      setProjectName(defaultName);
      setItems([]);
      setGroups(DEFAULT_GROUPS);
      return;
    }

    setProjects(updatedProjects);
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updatedProjects));

    if (id === timelineId) {
      const nextProject = updatedProjects[0];
      const newUrl = nextProject.id === "default" 
        ? `${window.location.protocol}//${window.location.host}/` 
        : `${window.location.protocol}//${window.location.host}/p/${nextProject.id}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
      setTimelineId(nextProject.id);
      setProjectName(nextProject.name);
    }
  };

  const handleCopyProjectLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        const t = getAppTranslations(lang);
        alert(t.copiedLinkToast || "Link uspešno kopiran!");
      })
      .catch(err => {
        console.error("Greška pri kopiranju linka:", err);
      });
  };

  const handleOpenMainProject = () => {
    const cleanUrl = `${window.location.protocol}//${window.location.host}/`;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);
    setTimelineId("default");
  };

  // Persistent Tags list with Notion colors - strictly empty by default
  const [availableTags, setAvailableTags] = useState<TagConfig[]>(() => {
    try {
      localStorage.removeItem("hronika_timeline_tags_v1");
      localStorage.removeItem("hronika_notion_tags_v1");
      localStorage.removeItem("hronika_tags_v1");
    } catch (_) {}

    const saved = localStorage.getItem(STORAGE_KEY_TAGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (_) {}
    }
    return [];
  });

  // Save changes to localStorage whenever tags change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(availableTags));
  }, [availableTags]);

  // Tag CRUD Handlers
  const handleAddCustomTag = (name: string, color: NotionColor = "default") => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAvailableTags(prev => {
      const exists = prev.some(t => t.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: trimmed,
          color
        }
      ];
    });
  };

  const handleUpdateTag = (oldName: string, newConfig: Partial<TagConfig>) => {
    const trimmedOld = oldName.trim().toLowerCase();
    setAvailableTags(prev =>
      prev.map(t => (t.name.toLowerCase() === trimmedOld ? { ...t, ...newConfig } : t))
    );

    // If tag name changed, update across items
    if (newConfig.name && newConfig.name.trim() !== oldName.trim()) {
      const newName = newConfig.name.trim();
      setItems(prevItems =>
        prevItems.map(item => {
          if (!Array.isArray(item.tags)) return item;
          const updatedTags = item.tags.map(tag =>
            tag.toLowerCase() === trimmedOld ? newName : tag
          );
          return { ...item, tags: updatedTags };
        })
      );
    }
  };

  const handleDeleteTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    setAvailableTags(prev => prev.filter(t => t.name.toLowerCase() !== trimmed));

    // Remove tag from items
    setItems(prevItems =>
      prevItems.map(item => {
        if (!Array.isArray(item.tags)) return item;
        return {
          ...item,
          tags: item.tags.filter(t => t.toLowerCase() !== trimmed)
        };
      })
    );

    // If filter has this tag selected, clear it
    if (filters.selectedTag.toLowerCase() === trimmed) {
      setFilters(prev => ({ ...prev, selectedTag: "" }));
    }
  };

  // 2. Modals and UI Toggles
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(() => {
    const hasDefaultApplied = localStorage.getItem("hronika_sidebar_unpinned_v3_applied");
    if (!hasDefaultApplied) {
      localStorage.setItem("hronika_sidebar_unpinned_v3_applied", "true");
      localStorage.setItem("hronika_sidebar_pinned_v1", "false");
      return false;
    }
    const saved = localStorage.getItem("hronika_sidebar_pinned_v1");
    return saved === "true";
  });

  const handleToggleSidebarPin = () => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem("hronika_sidebar_pinned_v1", String(next));
      return next;
    });
  };

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInitialTopic, setSupportInitialTopic] = useState<string | undefined>(undefined);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [defaultCreateGroup, setDefaultCreateGroup] = useState<string | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);



  // Clear cache handler
  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn("Error clearing cache:", e);
    }

    setToastNotification(
      lang === "sr" 
        ? "Keš memorija stranice je uspešno obrisana!" 
        : "Page cache cleared successfully!"
    );
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Keyboard shortcut handler (⌘\ or Ctrl+\ for sidebar, ⌘K or Ctrl+K for search, ? or F1 for shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Cmd+\ or Ctrl+\
      if ((e.metaKey || e.ctrlKey) && (e.key === "\\" || e.code === "Backslash")) {
        e.preventDefault();
        handleToggleSidebarPin();
      }
      // Shortcuts modal: Shift+? or F1
      else if ((e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) || e.key === "F1") {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // View Mode: 'timeline' | 'map'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("hronika_view_mode_v1");
    return (saved === "timeline" || saved === "map") ? (saved as ViewMode) : "timeline";
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("hronika_view_mode_v1", mode);
  };

  const handleGoHome = () => {
    setFilters({
      searchQuery: "",
      selectedGroups: [],
      selectedTag: "",
      fromYear: -5000,
      toYear: 2100
    });
    setViewMode("timeline");
  };

  // Preference configuration states - strictly Hronika skin only
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get("theme");
      const urlSkin = urlParams.get("skin");
      if ((urlTheme === "light" || urlTheme === "dark") && (urlSkin === "hronika" || urlSkin === "pro_studio")) {
        return { theme: urlTheme, skin: urlSkin, font: "inter" };
      }
    }

    // One-time migration → Pro Studio Dark (Stitch Redesign Theme)
    const hasProStudioApplied = localStorage.getItem("hronika_pro_studio_v1_applied");
    if (!hasProStudioApplied) {
      localStorage.setItem("hronika_pro_studio_v1_applied", "true");
      const proStudioPrefs: AppPreferences = { theme: "dark", skin: "pro_studio", font: "inter" };
      localStorage.setItem("hronika_preferences_v1", JSON.stringify(proStudioPrefs));
      return proStudioPrefs;
    }

    const saved = localStorage.getItem("hronika_preferences_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.theme === "dark" || parsed.theme === "light")) {
          if (parsed.skin !== "pro_studio") {
            parsed.skin = "hronika";
          }
          if (parsed.font === "jetbrains_mono") {
            parsed.font = "mono";
          } else if (["lora", "cinzel", "merriweather"].includes(parsed.font)) {
            parsed.font = "serif";
          } else if (!["inter", "serif", "mono"].includes(parsed.font)) {
            parsed.font = "inter";
          }
          return parsed;
        }
      } catch (_) {}
    }
    return { theme: "dark", skin: "pro_studio", font: "inter" };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get("theme");
      const urlSkin = urlParams.get("skin");
      if (urlTheme === "light" || urlTheme === "dark") {
        setPreferences(prev => ({
          ...prev,
          theme: urlTheme,
          skin: urlSkin || prev.skin,
        }));
      }
    }
  }, []);


  // Save preferences on shift & dynamically update browser favicon based on theme
  useEffect(() => {
    localStorage.setItem("hronika_preferences_v1", JSON.stringify(preferences));

    const isLight = preferences.theme === "light";
    const faviconHref = preferences.adaptiveLogo
      ? (isLight ? "/favicon.svg" : "/favicon-dark.svg")
      : "/favicon.svg";

    const linkIcon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (linkIcon) linkIcon.href = faviconHref;

    const linkShortcut = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement | null;
    if (linkShortcut) linkShortcut.href = faviconHref;

    const linkApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (linkApple) linkApple.href = faviconHref;
  }, [preferences]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const font = preferences.font || "inter";
      const fontClass = `font-pref-${font}`;
      const skinClass = `skin-${preferences.skin}`;
      const isDark = preferences.theme === "dark";
      const themeClass = isDark ? "theme-dark dark" : "theme-light";

      document.body.className = `${fontClass} ${skinClass} ${themeClass}`;
      document.documentElement.className = `${fontClass} ${skinClass} ${themeClass}`;

      const fontFamilies: Record<string, string> = {
        inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        serif: "'Lora', 'Merriweather', Georgia, Cambria, 'Times New Roman', Times, serif",
        mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      };
      const activeFamily = fontFamilies[font] || fontFamilies.inter;
      document.documentElement.style.setProperty("--app-current-font", activeFamily);
      document.body.style.fontFamily = activeFamily;
    }
  }, [preferences.font, preferences.skin, preferences.theme]);

  // Reference for timeline viewport container (to handle programmatic scroll centering)
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  // Quick tip auto-hide behavior: appears on first open, auto-hides after 1 minute (60s)
  const [showTip, setShowTip] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hasDismissed = localStorage.getItem("hronika_tip_dismissed_v1");
      return !hasDismissed;
    }
    return false;
  });

  useEffect(() => {
    if (!showTip) return;
    const timer = setTimeout(() => {
      setShowTip(false);
      localStorage.setItem("hronika_tip_dismissed_v1", "true");
    }, 60000); // 1 minute
    return () => clearTimeout(timer);
  }, [showTip]);

  const handleDismissTip = () => {
    setShowTip(false);
    localStorage.setItem("hronika_tip_dismissed_v1", "true");
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const [selectedDetailItem, setSelectedDetailItem] = useState<TimelineItem | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".draggable-event-card")) return;
      if (target.closest(".details-sidebar-panel")) return;
      if (target.closest("[group='card']")) return;
      if (target.closest(".modal-overlay") || target.closest("[role='dialog']")) return;
      
      setSelectedDetailItem(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 3. Filter criteria state values
  const [filters, setFilters] = useState<TimelineFilter>({
    searchQuery: "",
    selectedGroups: [],
    selectedTag: "",
    fromYear: -5000,
    toYear: 2100
  });

  const isInitialLoad = useRef(true);

  // Save changes on state update to server-side project storage with debounce
  useEffect(() => {
    if (!hasLoadedFromServer) {
      return;
    }

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: timelineId, items, groups }),
        signal: controller.signal
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Greška pri automatskom čuvanju na serveru:", err);
        }
      });
    }, 1200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [items, groups, timelineId, hasLoadedFromServer]);

  const translatedGroups = React.useMemo(() => {
    return groups.map(g => ({
      ...g,
      name: getTranslatedGroup(g.name, lang)
    }));
  }, [groups, lang]);

  const translatedItems = React.useMemo(() => {
    return items.map(item => translateItem(item, lang));
  }, [items, lang]);

  // Extract all unique tags dynamically
  const allUniqueTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    translatedItems.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [translatedItems]);

  // Extract unique existing group names in the active UI language.
  const existingGroupNames = React.useMemo(() => {
    return translatedGroups.map(g => g.name);
  }, [translatedGroups]);

  // Handle sidebar visibility checklists
  const handleToggleGroupVisibility = (name: string) => {
    const originalName = getTranslatedGroup(name, "sr");
    setGroups(prev =>
      prev.map(g => (g.name === originalName ? { ...g, visible: !g.visible } : g))
    );
  };

  const handleUpdateGroupColor = (name: string, color: string) => {
    const originalName = getTranslatedGroup(name, "sr");
    setGroups(prev =>
      prev.map(g => (g.name === originalName ? { ...g, color } : g))
    );
  };

  const handleAddGroup = (name: string, color: string) => {
    const originalName = getTranslatedGroup(name, "sr");
    const newGroup: GroupConfig = {
      name: originalName,
      color,
      visible: true
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleDeleteGroup = (name: string) => {
    const originalName = getTranslatedGroup(name, "sr");
    setGroups(prev => prev.filter(g => g.name !== originalName));
    setItems(prev => prev.filter(item => item.group !== originalName));
  };

  // 4. CRUD Operations
  const handleSaveItem = (savedItem: TimelineItem) => {
    const itemToSave = translateItem(savedItem, "sr");
    const groupNameSerbian = getTranslatedGroup(savedItem.group, "sr");

    // If the group specified doesn't exist yet, insert it dynamically
    const groupExists = groups.some(g => g.name === groupNameSerbian);
    if (!groupExists) {
      const newGroup: GroupConfig = {
        name: groupNameSerbian,
        color: savedItem.color || getRandomColor(),
        visible: true
      };
      setGroups(prev => [...prev, newGroup]);
    }

    // Upsert items
    setItems(prev => {
      const index = prev.findIndex(item => item.id === itemToSave.id);
      if (index > -1) {
        // Edit existing
        const copy = [...prev];
        copy[index] = itemToSave;
        return copy;
      } else {
        // Add new
        return [...prev, itemToSave];
      }
    });

    // Always select the item so its detail card opens immediately on the right side
    setSelectedDetailItem(itemToSave);

    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(null);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Helper to open edit modality
  const handleTriggerEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setDefaultCreateGroup(undefined);
    setIsFormOpen(true);
  };

  const handleTriggerCreate = (groupName?: unknown) => {
    setEditingItem(null);
    const validGroup = typeof groupName === "string" ? groupName : undefined;
    setDefaultCreateGroup(validGroup);
    setIsFormOpen(true);
  };

  // Imports JSON/CSV merging
  const handleImportItems = (imported: TimelineItem[]) => {
    const importedInSerbian = imported.map(item => translateItem(item, "sr"));

    // 1. Create or find Groups for imported items
    const newGroupsToAppend: GroupConfig[] = [];
    importedInSerbian.forEach((itm) => {
      const gName = itm.group;
      const alreadyHas = groups.some(g => g.name === gName) || newGroupsToAppend.some(x => x.name === gName);
      if (!alreadyHas) {
        newGroupsToAppend.push({
          name: gName,
          color: itm.color || getRandomColor(),
          visible: true
        });
      }
    });

    if (newGroupsToAppend.length > 0) {
      setGroups(prev => [...prev, ...newGroupsToAppend]);
    }

    // 2. Concat and filter unique IDs
    setItems(prev => {
      const cache = [...prev];
      importedInSerbian.forEach(imp => {
        // Find if already exists
        const existsIdx = cache.findIndex(x => x.id === imp.id || (x.title === imp.title && x.startYear === imp.startYear));
        if (existsIdx > -1) {
          cache[existsIdx] = imp; // overwrite
        } else {
          cache.push(imp);
        }
      });
      return cache;
    });
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden select-none transition-all duration-300 skin-${preferences.skin} theme-${preferences.theme} ${preferences.theme === "dark" ? "dark" : ""} font-pref-${preferences.font || "inter"} ${
      preferences.theme === "light" 
        ? "bg-[#FAF8F5] text-[#18181b]"
        : "bg-[#0f0f11] text-[#f4f4f5]"
    }`}>
      
      {/* Notion-style minimal top navigation bar */}
      {!isFullscreen && (
        <Header
          onAddNewItem={handleTriggerCreate}
          onImportItems={handleImportItems}
          items={translatedItems}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onClearCache={handleClearCache}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={preferences.theme}
          skin={preferences.skin}
          adaptiveLogo={preferences.adaptiveLogo}
          lang={lang}
          onToggleLanguage={handleToggleLanguage}
          onSelectLanguage={handleSetLang}
          onToggleTheme={() => setPreferences(prev => ({ ...prev, theme: prev.theme === "light" ? "dark" : "light" }))}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onLogoClick={handleGoHome}
          timelineId={timelineId}
          onCreateNewProject={handleOpenCreateProjectModal}
          onCopyProjectLink={handleCopyProjectLink}
          onOpenMainProject={handleOpenMainProject}
          projectName={projectName}
          onRenameProject={handleOpenRenameProjectModal}
          projects={projects}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          userAvatar={preferences.userAvatar}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onToggleSidebar={handleToggleSidebarPin}
          isSidebarOpen={isSidebarPinned}
        />
      )}

      {/* Main split dashboard pane */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side Sidebar Panel for complex search configurations */}
        <Sidebar
          groups={translatedGroups}
          onToggleGroup={handleToggleGroupVisibility}
          onUpdateGroupColor={handleUpdateGroupColor}
          onAddGroup={handleAddGroup}
          onDeleteGroup={handleDeleteGroup}
          filters={filters}
          onFilterChange={setFilters}
          allItemsTags={allUniqueTags}
          availableTags={availableTags}
          onAddCustomTag={handleAddCustomTag}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
          isOpen={true}
          onToggleSidebar={handleToggleSidebarPin}
          isPinnedProp={isSidebarPinned}
          onTogglePinProp={handleToggleSidebarPin}
          theme={preferences.theme}
          skin={preferences.skin}
          lang={lang}
          isFullscreen={isFullscreen}
          adaptiveLogo={preferences.adaptiveLogo}
          projects={projects}
          timelineId={timelineId}
          projectName={projectName}
          onSelectProject={handleSelectProject}
          onCreateProject={handleOpenCreateProjectModal}
          onRenameProject={handleOpenRenameProjectModal}
          onDeleteProject={handleDeleteProject}
          onAddNewItem={handleTriggerCreate}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onClearCache={handleClearCache}
          onOpenSettings={() => setIsSettingsOpen(true)}
          userAvatar={preferences.userAvatar}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />

        {/* Dynamic view display zone taking remaining split space */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0" id="main_viewport">
          
          {/* 1. Hronika (Timeline) Section */}
          {activeSection === "hronika" && (
            <>
              {viewMode === "timeline" && (
                <Timeline
                  items={translatedItems}
                  groups={translatedGroups}
                  filters={filters}
                  onFilterChange={setFilters}
                  availableTags={availableTags}
                  onAddCustomTag={handleAddCustomTag}
                  onUpdateTag={handleUpdateTag}
                  onDeleteTag={handleDeleteTag}
                  onToggleGroup={handleToggleGroupVisibility}
                  onEditItem={handleTriggerEdit}
                  onDeleteItem={handleDeleteItem}
                  containerRef={timelineContainerRef}
                  theme={preferences.theme}
                  skin={preferences.skin}
                  lang={lang}
                  selectedDetailItem={selectedDetailItem}
                  onSelectDetailItem={setSelectedDetailItem}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  preferences={preferences}
                  onUpdatePreferences={(newPrefs) => setPreferences(prev => ({ ...prev, ...newPrefs }))}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                  onAddNewItem={handleTriggerCreate}
                  onOpenHelp={() => setIsHelpOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onToggleLanguage={handleToggleLanguage}
                />
              )}

              {viewMode === "chronological" && (
                <ChronologicalView
                  items={translatedItems}
                  groups={translatedGroups}
                  filters={filters}
                  onFilterChange={setFilters}
                  availableTags={availableTags}
                  onAddCustomTag={handleAddCustomTag}
                  onUpdateTag={handleUpdateTag}
                  onDeleteTag={handleDeleteTag}
                  onSelectDetailItem={setSelectedDetailItem}
                  onEditItem={handleTriggerEdit}
                  onDeleteItem={handleDeleteItem}
                  onToggleGroup={handleToggleGroupVisibility}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  onUpdatePreferences={(newPrefs) => setPreferences(prev => ({ ...prev, ...newPrefs }))}
                  theme={preferences.theme}
                  skin={preferences.skin}
                  preferences={preferences}
                  lang={lang}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                  onAddNewItem={handleTriggerCreate}
                  onOpenHelp={() => setIsHelpOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onToggleLanguage={handleToggleLanguage}
                />
              )}

              {viewMode === "map" && (
                <MapAnalyticsView
                  items={translatedItems}
                  groups={translatedGroups}
                  filters={filters}
                  onSelectDetailItem={setSelectedDetailItem}
                  onEditItem={handleTriggerEdit}
                  onUpdateItem={handleSaveItem}
                  selectedDetailItem={selectedDetailItem}
                  theme={preferences.theme}
                  skin={preferences.skin}
                  lang={lang}
                  onFilterChange={setFilters}
                  availableTags={availableTags}
                  onAddCustomTag={handleAddCustomTag}
                  onUpdateTag={handleUpdateTag}
                  onDeleteTag={handleDeleteTag}
                  onToggleGroup={handleToggleGroupVisibility}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  preferences={preferences}
                  onUpdatePreferences={(newPrefs) => setPreferences(prev => ({ ...prev, ...newPrefs }))}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                  onAddNewItem={handleTriggerCreate}
                  onOpenHelp={() => setIsHelpOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onToggleLanguage={handleToggleLanguage}
                />
              )}

              {/* Quick tips label - shown on first launch, auto-dismissed after 1 minute */}
              {viewMode === "timeline" && showTip && (
                <div className={`absolute top-18 right-4 z-10 font-bold px-3 py-1.5 rounded-lg text-[10px] hidden sm:flex items-center gap-2 border shadow-lg transition-all duration-300 animate-in fade-in ${
                  preferences.theme === "light" 
                    ? "bg-white/95 text-slate-800 border-slate-200 shadow-sm"
                    : "bg-slate-900/95 text-white border-slate-800"
                }`}>
                  <span className="w-1.5 h-1.5 bg-[#D96B27] rounded-full animate-ping shrink-0" />
                  <span>{lang === "sr" ? "Savet: Prevucite vremenski prostor levo/desno za slobodnu navigaciju" : "Tip: Click and drag empty space left/right to navigate the timeline"}</span>
                  <button
                    type="button"
                    onClick={handleDismissTip}
                    className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition"
                    title={lang === "sr" ? "Zatvori savet" : "Close tip"}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* 2. Svici (Scrolls) Section */}
          {activeSection === "svici" && (
            <SviciView
              theme={preferences.theme}
              lang={lang}
              onSwitchToHronika={() => handleSelectSection("hronika")}
            />
          )}

          {/* 3. Sveto pismo (Scriptures) Section */}
          {activeSection === "sveto-pismo" && (
            <SvetoPismoView
              theme={preferences.theme}
              lang={lang}
              onSwitchToHronika={() => handleSelectSection("hronika")}
            />
          )}

        </main>

        {activeSection === "hronika" && viewMode !== "map" && selectedDetailItem && (
          <DraggableEventCard
            item={translateItem(selectedDetailItem, lang)}
            onClose={() => setSelectedDetailItem(null)}
            onUpdateItem={handleSaveItem}
            onEditFullModal={(item) => handleTriggerEdit(item)}
            theme={preferences.theme}
            skin={preferences.skin}
            lang={lang}
            openCardIn={preferences.openCardIn}
            availableTags={availableTags}
            onAddCustomTag={handleAddCustomTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
            initialPosition={{ 
              x: typeof window !== "undefined" && window.innerWidth > 900 ? window.innerWidth - 440 : 20, 
              y: 90 
            }}
          />
        )}
      </div>

      {/* Form modal for creating or editing timeline items */}
      <TimelineItemModal
        item={editingItem}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setDefaultCreateGroup(undefined);
        }}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        existingGroups={existingGroupNames}
        defaultGroup={defaultCreateGroup}
        availableTags={availableTags}
        onAddCustomTag={handleAddCustomTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
        theme={preferences.theme}
        skin={preferences.skin}
        lang={lang}
      />

      {/* Manual instructional guidelines popup */}
      <HelpInfo
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        theme={preferences.theme}
        skin={preferences.skin}
      />

      {/* Appearance configuration setting modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          preferences={preferences}
          onSave={setPreferences}
          lang={lang}
          onSetLang={handleSetLang}
          items={translatedItems}
          onImportItems={handleImportItems}
          onOpenSupport={(topic) => {
            setSupportInitialTopic(topic);
            setIsSupportOpen(true);
          }}
          projectName={projectName}
          onRenameProject={handleRenameProject}
        />
      )}

      {/* Project Creation / Rename Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        mode={projectModalMode}
        initialName={projectName}
        theme={preferences.theme}
        skin={preferences.skin}
        lang={lang}
        onSubmit={handleProjectModalSubmit}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={preferences.theme}
        skin={preferences.skin}
        lang={lang}
      />

      {/* Support Contact Form Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => {
          setIsSupportOpen(false);
          setSupportInitialTopic(undefined);
        }}
        theme={preferences.theme}
        skin={preferences.skin}
        lang={lang}
        initialTopic={supportInitialTopic}
      />

      {/* Toast Notification (e.g. Cache cleared confirmation) */}
      {toastNotification && (
        <div 
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            preferences.theme === "light"
              ? "bg-slate-900 text-white border-slate-700 shadow-slate-900/30"
              : "bg-white text-slate-900 border-slate-200 shadow-black/60"
          }`}
          id="toast_page_notification"
        >
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

    </div>
  );
}
