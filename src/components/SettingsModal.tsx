import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Settings, 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  Languages, 
  ChevronDown, 
  Type, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  RotateCcw, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  Loader2, 
  Folder, 
  HardDrive, 
  Mail,
  Search,
  Menu as MenuIcon,
  Bell,
  Link2,
  Smile,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { User } from "firebase/auth";
import { AppPreferences, FontFamilyType, TimelineItem } from "../types";
import { parseCSV, toCSV } from "../utils";
import { 
  LangType, 
  getAppTranslations,
  translations,
  saveCustomTranslation,
  loadSavedCustomTranslation,
  clearCustomTranslation
} from "../translations";
import {
  initGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  createGoogleDocTranslation,
  fetchTranslationsFromGoogleDoc,
  getSavedGoogleDocId,
  saveGoogleDocId,
  getCurrentUser,
  getSavedGoogleDocFolder,
  saveGoogleDocFolder,
  SUPPORTED_TRANSLATION_LANGUAGES,
  SupportedTranslationLanguage,
  startGoogleDocLiveSync
} from "../services/googleDocsService";
import { GoogleDriveFolderModal } from "./GoogleDriveFolderModal";

export const FONTS_CONFIG: Record<FontFamilyType, { nameKey: string; preview: string; fontClass: string; category: string; sampleFont: string }> = {
  inter: {
    nameKey: "fontHronika",
    preview: "Ab",
    fontClass: "font-sample-inter",
    category: "Hronika",
    sampleFont: "'Inter', sans-serif"
  },
  serif: {
    nameKey: "fontSerif",
    preview: "Ab",
    fontClass: "font-sample-serif",
    category: "Serif",
    sampleFont: "'Lora', 'Merriweather', Georgia, serif"
  },
  mono: {
    nameKey: "fontMono",
    preview: "Ab",
    fontClass: "font-sample-mono",
    category: "Mono",
    sampleFont: "'JetBrains Mono', monospace"
  }
};

export const SKINS_CONFIG = {
  pro_studio: {
    name: "Pro Studio",
    nameEn: "Pro Studio",
    primary: "#3e927c",
    primaryHex: "#3e927c",
    borderClass: "border-[#3e927c]",
    bgClass: "bg-[#3e927c]",
    hoverBgClass: "hover:bg-[#337c69]",
    textClass: "text-[#3e927c]",
    shadowClass: "shadow-[#3e927c]/25",
    gradientText: "from-[#83d6bd] via-[#3e927c] to-[#00382c]",
    accentColor: "mint",
    tagBg: "bg-[#3e927c]/15 text-[#83d6bd] border border-[#3e927c]/30 font-mono"
  },
  hronika: {
    name: "Hronika",
    nameEn: "Chronicle",
    primary: "#3e927c",
    primaryHex: "#3e927c",
    borderClass: "border-[rgba(255,255,255,0.08)]",
    bgClass: "bg-[#3e927c]",
    hoverBgClass: "hover:bg-[#337c69]",
    textClass: "text-[#3e927c]",
    shadowClass: "shadow-black/50",
    gradientText: "from-white via-[#83d6bd] to-[#3e927c]",
    accentColor: "mint",
    tagBg: "bg-[#202020] text-white/90 border border-white/10"
  }
};

export function getSkinCardBorderColor(skinName?: string, themeMode?: "light" | "dark"): string {
  const isLight = themeMode === "light";
  return isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";
}

export function getSkinName(skinKey: string, lang: LangType = "sr"): string {
  if (skinKey === "pro_studio") {
    return "Pro Studio";
  }
  return lang === "sr" ? "Hronika" : "Chronicle";
}

export type SettingsTabType = 
  | "opste"
  | "interfejs"
  | "meni"
  | "podsetnici"
  | "konekcije"
  | "upravljanje_podacima"
  | "prevodjenje";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AppPreferences;
  onSave: (updated: AppPreferences) => void;
  lang: LangType;
  onSetLang: (lang: LangType) => void;
  items?: TimelineItem[];
  onImportItems?: (items: TimelineItem[]) => void;
  onOpenSupport?: (initialTopic?: string) => void;
  projectName?: string;
  onRenameProject?: (newName: string) => void;
}

const PRESET_ICONS = ["⏳", "📜", "🏛️", "🗺️", "📖", "🖋️", "🪐", "🌿", "🏰", "🛡️", "👑", "🧭", "⚔️", "🕯️", "🎨", "💡", "🌍", "🚀"];

export function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onSave,
  lang,
  onSetLang,
  items = [],
  onImportItems,
  onOpenSupport,
  projectName = "Istorija",
  onRenameProject
}: SettingsModalProps) {
  // Navigation tab state (default to "interfejs" or "opste")
  const [activeTab, setActiveTab] = useState<SettingsTabType>("opste");
  const [searchFilter, setSearchFilter] = useState("");

  // Dropdown states
  const [isSkinDropdownOpen, setIsSkinDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // General & Profile settings state
  const [nameInputValue, setNameInputValue] = useState(projectName);
  const [userName, setUserName] = useState<string>(() => {
    const saved = preferences.userName || localStorage.getItem("hronika_user_name") || "";
    return saved === "Grga" ? "" : saved;
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return preferences.userEmail || localStorage.getItem("hronika_user_email") || "";
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return preferences.userAvatar || localStorage.getItem("hronika_user_avatar") || "";
  });
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const fileInputAvatarRef = useRef<HTMLInputElement>(null);

  const [currentIcon, setCurrentIcon] = useState<string>(() => {
    return preferences.projectIcon || localStorage.getItem("hronika_project_icon") || "⏳";
  });

  useEffect(() => {
    setNameInputValue(projectName);
  }, [projectName]);

  // File import refs
  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);
  const skinDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Status messages
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [dataStatusMessage, setDataStatusMessage] = useState<{ message: string; isError: boolean } | null>(null);

  // Google Docs & Drive Integration state
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<SupportedTranslationLanguage>(() => {
    return SUPPORTED_TRANSLATION_LANGUAGES.find(l => l.code === "sr") || SUPPORTED_TRANSLATION_LANGUAGES[0];
  });
  const [googleUser, setGoogleUser] = useState<User | null>(() => getCurrentUser());
  const [googleDocId, setGoogleDocId] = useState<string | null>(() => getSavedGoogleDocId("sr"));
  const [targetFolder, setTargetFolder] = useState<{ id: string; name: string }>(() => getSavedGoogleDocFolder("sr"));
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleActionMessage, setGoogleActionMessage] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState<boolean>(true);

  // Outside click handlers for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (skinDropdownRef.current && !skinDropdownRef.current.contains(e.target as Node)) {
        setIsSkinDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const docId = getSavedGoogleDocId(selectedTranslationLang.code);
    setGoogleDocId(docId);
    setTargetFolder(getSavedGoogleDocFolder(selectedTranslationLang.code));
  }, [selectedTranslationLang.code]);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Real-time live sync for the selected Google Doc translation
  useEffect(() => {
    if (!googleDocId || !googleUser || !isLiveSyncActive) return;

    const unsubscribe = startGoogleDocLiveSync(
      googleDocId,
      selectedTranslationLang.code,
      (data, count, timestamp) => {
        setLastSyncedTime(timestamp);
        setSyncedCount(count);
        if (lang === selectedTranslationLang.code) {
          onSetLang(lang);
        }
      },
      (err) => {
        console.warn("Live sync check error:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [googleDocId, googleUser, isLiveSyncActive, selectedTranslationLang.code, lang, onSetLang]);

  if (!isOpen) return null;

  const isLight = preferences.theme === "light";
  const currentSkinInfo = SKINS_CONFIG[preferences.skin] || SKINS_CONFIG.hronika;
  const currentFontKey: FontFamilyType = preferences.font || "inter";
  const t = getAppTranslations(lang);

  const handleUpdatePreference = (updated: Partial<AppPreferences>) => {
    onSave({
      ...preferences,
      ...updated
    });
  };

  const handleSaveProjectName = () => {
    const trimmed = nameInputValue.trim();
    if (trimmed && trimmed !== projectName) {
      onRenameProject?.(trimmed);
    }
  };

  const handleSaveUserName = () => {
    const trimmed = userName.trim();
    if (trimmed) {
      localStorage.setItem("hronika_user_name", trimmed);
      handleUpdatePreference({ userName: trimmed });
    }
  };

  const handleSaveUserEmail = () => {
    const trimmed = userEmail.trim();
    localStorage.setItem("hronika_user_email", trimmed);
    handleUpdatePreference({ userEmail: trimmed });
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setUserAvatar(base64);
          localStorage.setItem("hronika_user_avatar", base64);
          handleUpdatePreference({ userAvatar: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAvatarUrl = () => {
    const trimmed = avatarUrlInput.trim();
    if (trimmed) {
      setUserAvatar(trimmed);
      localStorage.setItem("hronika_user_avatar", trimmed);
      handleUpdatePreference({ userAvatar: trimmed });
      setAvatarUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleRemoveAvatar = () => {
    setUserAvatar("");
    localStorage.removeItem("hronika_user_avatar");
    handleUpdatePreference({ userAvatar: "" });
  };

  const handleSelectIcon = (icon: string) => {
    setCurrentIcon(icon);
    localStorage.setItem("hronika_project_icon", icon);
    handleUpdatePreference({ projectIcon: icon });
    setIsIconPickerOpen(false);
  };

  // JSON Export / Import
  const exportJSON = () => {
    if (!items || items.length === 0) {
      alert(lang === "en" ? "No items to export." : "Nema stavki za izvoz.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hronika_podaci_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(i => i.title && typeof i.startYear === "number");
          if (validated.length > 0) {
            onImportItems?.(validated as TimelineItem[]);
            setDataStatusMessage({
              message: (t.successImportJson || "Uspešno uvezeno {count} događaja iz JSON-a.").replace("{count}", String(validated.length)),
              isError: false
            });
          } else {
            setDataStatusMessage({
              message: t.errorImportJsonNoValid || "Nije pronađen nijedan validan događaj u JSON datoteci.",
              isError: true
            });
          }
        } else {
          setDataStatusMessage({
            message: t.errorImportJsonArray || "Neispravan JSON format. Očekivan je niz događaja.",
            isError: true
          });
        }
      } catch (err) {
        setDataStatusMessage({
          message: t.errorImportJsonFail || "Greška pri čitanju JSON datoteke.",
          isError: true
        });
      }
    };
    fileReader.readAsText(file);
    e.target.value = "";
  };

  // CSV Export / Import
  const exportCSV = () => {
    if (!items || items.length === 0) {
      alert(lang === "en" ? "No items to export." : "Nema stavki za izvoz.");
      return;
    }
    const csvContent = toCSV(items);
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hronika_podaci_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedPartial = parseCSV(csvText);

        if (parsedPartial.length > 0) {
          const completeItems: TimelineItem[] = parsedPartial.map((item) => ({
            id: item.id || crypto.randomUUID(),
            title: item.title || "Neimenovani događaj",
            description: item.description || "",
            group: item.group || "Važni događaji",
            startYear: item.startYear ?? 0,
            startMonth: item.startMonth,
            endYear: item.endYear,
            endMonth: item.endMonth,
            color: item.color,
            tags: item.tags || []
          }));

          onImportItems?.(completeItems);
          setDataStatusMessage({
            message: (t.successImportCsv || "Uspešno uvezeno {count} događaja iz CSV-a.").replace("{count}", String(completeItems.length)),
            isError: false
          });
        } else {
          setDataStatusMessage({
            message: t.errorImportCsvNoValid || "Nije pronađen nijedan validan red u CSV datoteci.",
            isError: true
          });
        }
      } catch (err) {
        setDataStatusMessage({
          message: t.errorImportCsvFail || "Greška pri obradi CSV datoteke.",
          isError: true
        });
      }
    };
    fileReader.readAsText(file);
    e.target.value = "";
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setGoogleActionMessage(lang === "en" ? "Signing in with Google..." : "Prijavljivanje na Google nalog...");
      const result = await signInWithGoogle();
      setGoogleUser(result.user);
      setImportStatus({
        message: lang === "en" ? `Signed in as ${result.user.email}` : `Prijavljeni ste kao ${result.user.email}`,
        isError: false
      });
      setIsFolderModalOpen(true);
    } catch (err: any) {
      setImportStatus({
        message: err.message || "Greška pri prijavi.",
        isError: true
      });
    } finally {
      setIsGoogleLoading(false);
      setGoogleActionMessage(null);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
    } catch (_) {}
  };

  const handleCreateGoogleDoc = async () => {
    let user = googleUser;
    if (!user) {
      try {
        setIsGoogleLoading(true);
        setGoogleActionMessage(lang === "en" ? "Connecting Google Account..." : "Povezivanje sa Google nalogom...");
        const result = await signInWithGoogle();
        user = result.user;
        setGoogleUser(user);
      } catch (err: any) {
        setIsGoogleLoading(false);
        setGoogleActionMessage(null);
        setImportStatus({
          message: err.message || (lang === "en" ? "Sign-in failed." : "Neuspešna prijava na Google nalog."),
          isError: true
        });
        return;
      }
    }

    try {
      setIsGoogleLoading(true);
      const displayLabel = lang === "en" ? selectedTranslationLang.nameEn : selectedTranslationLang.nameSr;
      setGoogleActionMessage(
        lang === "en"
          ? `Creating translation document for ${displayLabel}...`
          : `Kreiranje dokumenta za prevod na ${displayLabel}...`
      );

      const { documentId, url } = await createGoogleDocTranslation(
        translations.en,
        translations.sr,
        selectedTranslationLang.code,
        targetFolder.id,
        (step) => setGoogleActionMessage(step),
        selectedTranslationLang.nativeName
      );

      setGoogleDocId(documentId);
      saveGoogleDocId(documentId, selectedTranslationLang.code);
      setIsLiveSyncActive(true);
      window.open(url, "_blank", "noopener,noreferrer");

      setImportStatus({
        message: (lang === "en"
          ? `Document created! Real-time translation import is active for ${selectedTranslationLang.nameEn}.`
          : `Dokument je kreiran! Uvoz prevoda u realnom vremenu je aktivan za ${selectedTranslationLang.nameSr}.`
        ),
        isError: false
      });
    } catch (err: any) {
      setImportStatus({
        message: err.message || "Greška pri kreiranju Google Docs dokumenta.",
        isError: true
      });
    } finally {
      setIsGoogleLoading(false);
      setGoogleActionMessage(null);
    }
  };

  const handleOpenExistingGoogleDoc = () => {
    if (!googleDocId) return;
    const url = `https://docs.google.com/document/d/${googleDocId}/edit`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSyncFromGoogleDoc = async () => {
    if (!googleDocId) return;
    let user = googleUser;
    if (!user) {
      await handleGoogleSignIn();
      return;
    }

    try {
      setIsGoogleLoading(true);
      setGoogleActionMessage(lang === "en" ? "Loading translations from Google Docs..." : "Učitavanje izmena iz Google Docs-a...");
      const { count, data } = await fetchTranslationsFromGoogleDoc(googleDocId);
      saveCustomTranslation(data, selectedTranslationLang.code);
      setLastSyncedTime(new Date());
      setSyncedCount(count);
      if (lang === selectedTranslationLang.code) {
        onSetLang(lang);
      }
      setImportStatus({
        message: (t.googleDocsSyncSuccess || "Uspešno učitane izmene iz Google Docs-a!") + ` (${count} ${t.customLangCount || "termina"})`,
        isError: false
      });
    } catch (err: any) {
      setImportStatus({
        message: err.message || "Greška pri čitanju dokumenta iz Google Docs-a.",
        isError: true
      });
    } finally {
      setIsGoogleLoading(false);
      setGoogleActionMessage(null);
    }
  };

  // Left sidebar menu items in the exact required order:
  const menuItems: { id: SettingsTabType; label: string; icon: React.ReactNode }[] = [
    { id: "opste", label: "Opšte", icon: <Settings className="w-3.5 h-3.5" /> },
    { id: "interfejs", label: "Interfejs", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "meni", label: "Meni", icon: <MenuIcon className="w-3.5 h-3.5" /> },
    { id: "podsetnici", label: "Podsetnici", icon: <Bell className="w-3.5 h-3.5" /> },
    { id: "konekcije", label: "Konekcije", icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: "upravljanje_podacima", label: "Upravljanje podacima", icon: <HardDrive className="w-3.5 h-3.5" /> },
    { id: "prevodjenje", label: "Prevođenje", icon: <Languages className="w-3.5 h-3.5" /> },
  ];

  const filteredMenuItems = searchFilter.trim()
    ? menuItems.filter(m => m.label.toLowerCase().includes(searchFilter.toLowerCase().trim()))
    : menuItems;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-150 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl h-[560px] max-h-[90vh] rounded-2xl border shadow-2xl transition duration-150 transform flex overflow-hidden cursor-default ${
          isLight
            ? "bg-[#ffffff] border-[#e9e9e7] text-[#37352f]" 
            : "bg-[#191919] border-[#2e2e2e] text-[#d4d4d4]"
        }`}
        id="modal_settings_container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            LEFT NOTION-STYLE SIDEBAR
            ========================================================= */}
        <aside 
          className={`w-48 sm:w-56 shrink-0 border-r flex flex-col p-2.5 sm:p-3 overflow-y-auto select-none ${
            isLight 
              ? "bg-[#f7f7f5] border-[#eae9e6]" 
              : "bg-[#141414] border-[#252525]"
          }`}
        >
          {/* Search settings input */}
          <div className="relative mb-3">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isLight ? "text-neutral-400" : "text-neutral-500"
            }`} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Pretraži podešavanja"
              className={`w-full pl-8 pr-2.5 py-1 text-[11px] rounded-md border transition focus:outline-none focus:ring-1 ${
                isLight
                  ? "bg-white border-[#dfdedb] text-[#37352f] placeholder-neutral-400 focus:border-neutral-400 focus:ring-neutral-200"
                  : "bg-[#1d1d1d] border-[#303030] text-[#e0e0e0] placeholder-neutral-500 focus:border-[#404040] focus:ring-neutral-700"
              }`}
            />
          </div>

          {/* User / Workspace info snippet (Notion style header) */}
          <div className="px-2 py-1 mb-1.5 flex items-center gap-2">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-5 h-5 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#c8644b] flex items-center justify-center shrink-0 text-[10px] font-bold text-white select-none shadow-2xs">
                {userName.trim() ? userName.trim().charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate leading-tight">
                {projectName || "Istorija"}
              </div>
              <div className={`text-[10px] leading-tight truncate ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
                {userName.trim() || "Radni prostor"}
              </div>
            </div>
          </div>

          <div className={`my-1.5 border-b ${isLight ? "border-[#eae9e6]" : "border-[#252525]"}`} />

          {/* Navigation Items */}
          <nav className="flex-1 space-y-0.5">
            {filteredMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-normal transition text-left cursor-pointer ${
                    isActive
                      ? isLight
                        ? "bg-[#ebebea] font-semibold text-[#37352f]"
                        : "bg-[#292929] font-semibold text-white"
                      : isLight
                        ? "text-[#5f5e5b] hover:bg-[#efefed] hover:text-[#37352f]"
                        : "text-[#9b9b9b] hover:bg-[#1f1f1f] hover:text-[#d4d4d4]"
                  }`}
                  id={`btn_settings_tab_${item.id}`}
                >
                  <span className={`shrink-0 ${isActive ? (isLight ? "text-[#37352f]" : "text-white") : (isLight ? "text-neutral-400" : "text-neutral-500")}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* =========================================================
        {/* =========================================================
            RIGHT MAIN CONTENT AREA
            ========================================================= */}
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative ${
          isLight ? "bg-white text-[#37352f]" : "bg-[#191919] text-[#e0e0e0]"
        }`}>
          {/* Top Header Bar with Close Button */}
          <header className={`px-6 sm:px-8 pt-5 pb-3 flex items-start justify-between gap-4 shrink-0 border-b ${
            isLight ? "border-[#f0efe9] bg-white" : "border-[#252525] bg-[#191919]"
          }`}>
            <div>
              <h2 className={`text-[17px] font-semibold tracking-tight ${
                isLight ? "text-[#2e2d29]" : "text-white"
              }`}>
                {activeTab === "opste" && "Opšte"}
                {activeTab === "interfejs" && "Interfejs"}
                {activeTab === "meni" && "Meni"}
                {activeTab === "podsetnici" && "Podsetnici"}
                {activeTab === "konekcije" && "Konekcije"}
                {activeTab === "upravljanje_podacima" && "Upravljanje podacima"}
                {activeTab === "prevodjenje" && "Prevođenje"}
              </h2>
              <p className={`text-[11px] mt-0.5 ${
                isLight ? "text-[#787774]" : "text-[#9b9b9b]"
              }`}>
                {activeTab === "opste" && "Podešavanja profila i korisničkih podataka"}
                {activeTab === "interfejs" && "Prilagodite izgled, teme i tipografiju aplikacije"}
                {activeTab === "meni" && "Podešavanja stavki menija i navigacije"}
                {activeTab === "podsetnici" && "Upravljanje notifikacijama i podsetnicima"}
                {activeTab === "konekcije" && "Povezane aplikacije i integracije"}
                {activeTab === "upravljanje_podacima" && "Izvoz, uvoz i bezbednost podataka"}
                {activeTab === "prevodjenje" && "Lokalizacija i prevod aplikacije"}
              </p>
            </div>

            {/* Notion-style subtle X close button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-md transition cursor-pointer shrink-0 ${
                isLight 
                  ? "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800" 
                  : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
              id="btn_close_settings_modal"
              title="Zatvori (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-4">

            {/* =========================================================
                1. OPŠTE (General / Profile)
                - Profil: naslov + divider
                - Avatar krug sa Notion Face / custom slikom + Preferred name + Dodavanje slike
                - Divider
                - Imejl adresa + Eksperimentalno (u drugoj boji) + polje za unos
                ========================================================= */}
            {activeTab === "opste" && (
              <div className="space-y-4">
                {/* 1.1 PROFIL */}
                <div>
                  <h3 className={`text-[13px] font-semibold ${
                    isLight ? "text-[#2e2d29]" : "text-neutral-100"
                  }`}>
                    Profile
                  </h3>
                  
                  <div className={`border-b ${isLight ? "border-[#eae9e6]" : "border-neutral-800"} my-2.5`} />

                  <div className="flex items-start gap-3.5 pt-1">
                    {/* Notion Avatar circle with face & name */}
                    <div className="relative group shrink-0">
                      <div 
                        onClick={() => fileInputAvatarRef.current?.click()}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex flex-col items-center justify-center cursor-pointer border shadow-xs relative select-none transition ${
                          userAvatar 
                            ? "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" 
                            : "bg-[#c8644b] border-[#b0553e]"
                        }`}
                        title="Kliknite da promenite sliku profila"
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt="Profilna slika" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full relative">
                            {/* Notion face avatar SVG matching user's screenshot */}
                            <svg viewBox="0 0 100 100" className={`w-11 h-11 sm:w-12 sm:h-12 ${userName.trim() ? "-mt-1" : "mt-0"}`} fill="none">
                              <circle cx="50" cy="50" r="30" fill="#ffffff" stroke="#18181b" strokeWidth="2.5" />
                              <path d="M24 45 C24 25 36 17 50 17 C64 17 76 25 76 45 C70 41 64 40 50 41 C36 40 30 41 24 45 Z" fill="#18181b" />
                              <circle cx="42" cy="48" r="2.8" fill="#18181b" />
                              <circle cx="58" cy="48" r="2.8" fill="#18181b" />
                              <path d="M38 42 Q42 40 46 42" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
                              <path d="M54 42 Q58 40 62 42" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
                              <path d="M50 47 Q48 52 52 53" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
                              <path d="M44 60 Q50 65 56 60" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M33 55 Q35 72 50 74 Q65 72 67 55" stroke="#18181b" strokeWidth="2" strokeDasharray="1.5 2.5" strokeLinecap="round" fill="none" />
                            </svg>
                            {userName.trim() ? (
                              <span className="text-[9.5px] font-bold text-[#18181b] tracking-tight leading-none -mt-0.5 truncate max-w-[50px] select-none">
                                {userName.trim()}
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Hover camera overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-full text-white">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputAvatarRef}
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                        id="input_file_avatar"
                      />
                    </div>

                    {/* Preferred name & Add image field */}
                    <div className="flex-1 min-w-0">
                      <label className={`text-[11px] font-medium block mb-1 ${
                        isLight ? "text-[#5f5e5b]" : "text-neutral-400"
                      }`}>
                        Preferred name
                      </label>
                      <div className="flex items-center gap-2 max-w-sm">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          onBlur={handleSaveUserName}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveUserName()}
                          placeholder="Ko si ti?"
                          className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border transition focus:outline-none focus:ring-1 ${
                            isLight
                              ? "bg-white border-neutral-300 text-neutral-900 focus:border-neutral-400 focus:ring-neutral-200"
                              : "bg-[#202020] border-[#333333] text-neutral-100 focus:border-[#4a4a4a] focus:ring-neutral-700"
                          }`}
                          id="inp_settings_preferred_name"
                        />
                        <button
                          type="button"
                          onClick={handleSaveUserName}
                          className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition cursor-pointer shrink-0 ${
                            isLight
                              ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800"
                              : "bg-[#2a2a2a] hover:bg-[#333333] border-[#383838] text-neutral-200"
                          }`}
                        >
                          Sačuvaj
                        </button>
                      </div>

                      {/* Polje za dodavanje slike (ispod) */}
                      <div className="pt-2 flex items-center flex-wrap text-[11px] leading-tight">
                        <button
                          type="button"
                          onClick={() => fileInputAvatarRef.current?.click()}
                          className="font-medium text-[#2383e2] hover:text-[#1d6fc2] hover:underline flex items-center gap-1 transition cursor-pointer"
                          id="btn_add_profile_image"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Dodajte sliku profila</span>
                        </button>
                        <span className="text-neutral-400 select-none">&nbsp;</span>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(prev => !prev)}
                          className={`transition cursor-pointer hover:underline ${
                            isLight ? "text-neutral-500 hover:text-neutral-700" : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          ili unesi URL slike
                        </button>

                        {userAvatar && (
                          <>
                            <span className="text-neutral-400 select-none mx-2">•</span>
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="text-red-500 hover:text-red-600 transition cursor-pointer hover:underline"
                            >
                              Ukloni sliku
                            </button>
                          </>
                        )}
                      </div>

                      {/* Optional URL input box */}
                      {showUrlInput && (
                        <div className="mt-2 flex items-center gap-2 max-w-sm">
                          <input
                            type="url"
                            value={avatarUrlInput}
                            onChange={(e) => setAvatarUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyAvatarUrl()}
                            placeholder="https://primer.com/slika.jpg"
                            className={`w-full px-2.5 py-1 text-[11px] rounded-lg border focus:outline-none ${
                              isLight
                                ? "bg-white border-neutral-300 text-neutral-900"
                                : "bg-[#202020] border-[#333333] text-neutral-100"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleApplyAvatarUrl}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition cursor-pointer shrink-0 ${
                              isLight
                                ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800"
                                : "bg-[#2a2a2a] hover:bg-[#333333] border-[#383838] text-neutral-200"
                            }`}
                          >
                            Primeni
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className={`border-b ${isLight ? "border-[#eae9e6]" : "border-neutral-800"} my-4`} />

                {/* 1.2 IMEJL ADRESA (Eksperimentalno) */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-[12px] font-semibold ${
                      isLight ? "text-[#2e2d29]" : "text-neutral-100"
                    }`}>
                      Imejl adresa
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isLight 
                        ? "bg-violet-100 text-violet-700 border border-violet-200" 
                        : "bg-violet-950/60 text-violet-300 border border-violet-800/80"
                    }`}>
                      Eksperimentalno
                    </span>
                  </div>
                  <p className={`text-[11px] leading-tight ${
                    isLight ? "text-[#787774]" : "text-neutral-400"
                  }`}>
                    Imejl adresa za sinhronizaciju i buduću saradnju na projektima
                  </p>

                  <div className="flex items-center gap-2 pt-2.5">
                    <div className="relative w-full max-w-sm">
                      <Mail className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isLight ? "text-neutral-400" : "text-neutral-500"
                      }`} />
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        onBlur={handleSaveUserEmail}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveUserEmail()}
                        placeholder="unesite.imejl@primer.com"
                        className={`w-full pl-8 pr-2.5 py-1.5 text-[12px] rounded-lg border transition focus:outline-none focus:ring-1 ${
                          isLight
                            ? "bg-white border-neutral-300 text-neutral-900 focus:border-neutral-400 focus:ring-neutral-200"
                            : "bg-[#202020] border-[#333333] text-neutral-100 focus:border-[#4a4a4a] focus:ring-neutral-700"
                        }`}
                        id="inp_settings_user_email"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveUserEmail}
                      className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition cursor-pointer shrink-0 ${
                        isLight
                          ? "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800"
                          : "bg-[#2a2a2a] hover:bg-[#333333] border-[#383838] text-neutral-200"
                      }`}
                      id="btn_save_user_email"
                    >
                      Sačuvaj
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                2. INTERFEJS (Interface)
                - Tema: tasteri svetla i tamna
                - Izgled: postojeći padajući meni sa temama
                - Font: tri ikonice identične onima sa 2. slike
                ========================================================= */}
            {activeTab === "interfejs" && (
              <div className="space-y-4">
                
                {/* 2.1 TEMA */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-[12px] font-semibold ${
                        isLight ? "text-[#2e2d29]" : "text-neutral-100"
                      }`}>
                        Tema
                      </h3>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? "text-[#787774]" : "text-neutral-400"
                      }`}>
                        Izaberite svetlu ili tamnu temu za prikaz interfejsa
                      </p>
                    </div>

                    {/* Dva tastera za izbor: svetla i tamna tema */}
                    <div className={`p-0.5 rounded-lg border flex items-center gap-1 ${
                      isLight 
                        ? "bg-neutral-100 border-neutral-200" 
                        : "bg-[#1f1f1f] border-[#2e2e2e]"
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleUpdatePreference({ theme: "light" })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          preferences.theme === "light"
                            ? isLight
                              ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                              : "bg-[#2d2d2d] text-white font-semibold shadow-2xs"
                            : isLight
                              ? "text-neutral-600 hover:text-neutral-900"
                              : "text-neutral-400 hover:text-neutral-200"
                        }`}
                        id="btn_set_theme_light"
                      >
                        <Sun className={`w-3.5 h-3.5 ${preferences.theme === "light" ? "text-amber-500" : ""}`} />
                        <span>Svetla</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdatePreference({ theme: "dark" })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          preferences.theme === "dark"
                            ? isLight
                              ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                              : "bg-[#2d2d2d] text-white font-semibold shadow-2xs"
                            : isLight
                              ? "text-neutral-600 hover:text-neutral-900"
                              : "text-neutral-400 hover:text-neutral-200"
                        }`}
                        id="btn_set_theme_dark"
                      >
                        <Moon className={`w-3.5 h-3.5 ${preferences.theme === "dark" ? "text-indigo-400" : ""}`} />
                        <span>Tamna</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border-b ${isLight ? "border-[#eae9e6]" : "border-neutral-800"}`} />

                {/* 2.2 IZGLED (Postojeći padajući meni sa temama) */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-[12px] font-semibold ${
                        isLight ? "text-[#2e2d29]" : "text-neutral-100"
                      }`}>
                        Izgled
                      </h3>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? "text-[#787774]" : "text-neutral-400"
                      }`}>
                        Izaberite vizuelnu temu i stilsku paletu aplikacije
                      </p>
                    </div>

                    {/* Padajući meni sa postojećim temama */}
                    <div className="relative" ref={skinDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsSkinDropdownOpen(prev => !prev)}
                        className={`w-48 sm:w-56 flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-left transition cursor-pointer ${
                          isLight
                            ? "bg-white border-neutral-300 hover:border-neutral-400 text-neutral-900 shadow-2xs"
                            : "bg-[#202020] border-[#333333] hover:border-[#444444] text-neutral-100 shadow-2xs"
                        }`}
                        id="btn_skin_dropdown_trigger"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span 
                            className="w-3 h-3 rounded-full border border-black/20 flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: currentSkinInfo.primary }}
                          />
                          <span className="text-[11px] font-medium truncate">
                            {getSkinName(preferences.skin, lang)}
                          </span>
                        </div>

                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1 transition-transform duration-150 ${isSkinDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isSkinDropdownOpen && (
                        <div className={`absolute right-0 top-full mt-1.5 w-60 rounded-xl border shadow-xl overflow-hidden z-40 transition animate-in fade-in-50 duration-150 ${
                          isLight
                            ? "bg-white border-neutral-200 divide-neutral-100"
                            : "bg-[#1c1c1c] border-[#333333] divide-[#242424]"
                        }`}>
                          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                            {Object.entries(SKINS_CONFIG).map(([skinKey, skinData]) => {
                              const isActive = preferences.skin === skinKey;
                              return (
                                <button
                                  key={skinKey}
                                  type="button"
                                  onClick={() => {
                                    handleUpdatePreference({ skin: skinKey as any });
                                    setIsSkinDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${
                                    isActive
                                      ? isLight
                                        ? "bg-neutral-100 font-semibold text-neutral-900"
                                        : "bg-[#292929] font-semibold text-white"
                                      : isLight
                                        ? "hover:bg-neutral-50 text-neutral-700"
                                        : "hover:bg-[#232323] text-neutral-300"
                                  }`}
                                  id={`opt_skin_${skinKey}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span 
                                      className="w-3 h-3 rounded-full border border-black/15 flex items-center justify-center shrink-0 shadow-2xs"
                                      style={{ backgroundColor: skinData.primary }}
                                    >
                                      {isActive && <Check className="w-2 h-2 text-white" />}
                                    </span>
                                    <span className="text-[11px] truncate">{getSkinName(skinKey, lang)}</span>
                                  </div>
                                  
                                  {isActive && <Check className="w-3 h-3 text-[#3E927B] shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`border-b ${isLight ? "border-neutral-200" : "border-neutral-800"}`} />

                {/* 2.3 FONT (Tri ikonice identične onima sa 2. slike) */}
                <div>
                  <div className="mb-2.5">
                    <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                      isLight ? "text-neutral-500" : "text-neutral-400"
                    }`}>
                      FONT
                    </h3>
                  </div>

                  {/* 3 cards side by side in a row as in image 2 */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* 1. Hronika / Sans font card */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePreference({ font: "inter" })}
                      className={`h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                        currentFontKey === "inter"
                          ? "bg-[#1c3830] text-white border-2 border-[#3E927B] shadow-xs"
                          : isLight
                            ? "bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-neutral-700"
                            : "bg-[#202022] hover:bg-[#28282b] border border-[#2e2e30] text-neutral-400 hover:text-neutral-200"
                      }`}
                      id="btn_font_hronika"
                    >
                      <span className="text-xl sm:text-2xl font-bold font-sample-inter leading-none">
                        Ab
                      </span>
                      <span className={`text-[11px] ${currentFontKey === "inter" ? "font-bold text-white" : "font-medium"}`}>
                        Hronika
                      </span>
                    </button>

                    {/* 2. Serif font card */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePreference({ font: "serif" })}
                      className={`h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                        currentFontKey === "serif"
                          ? "bg-[#1c3830] text-white border-2 border-[#3E927B] shadow-xs"
                          : isLight
                            ? "bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-neutral-700"
                            : "bg-[#202022] hover:bg-[#28282b] border border-[#2e2e30] text-neutral-400 hover:text-neutral-200"
                      }`}
                      id="btn_font_serif"
                    >
                      <span className="text-xl sm:text-2xl font-serif font-sample-serif leading-none">
                        Ab
                      </span>
                      <span className={`text-[11px] ${currentFontKey === "serif" ? "font-bold text-white" : "font-medium"}`}>
                        Serif
                      </span>
                    </button>

                    {/* 3. Mono font card */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePreference({ font: "mono" })}
                      className={`h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                        currentFontKey === "mono"
                          ? "bg-[#1c3830] text-white border-2 border-[#3E927B] shadow-xs"
                          : isLight
                            ? "bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 text-neutral-700"
                            : "bg-[#202022] hover:bg-[#28282b] border border-[#2e2e30] text-neutral-400 hover:text-neutral-200"
                      }`}
                      id="btn_font_mono"
                    >
                      <span className="text-xl sm:text-2xl font-mono font-sample-mono leading-none">
                        Ab
                      </span>
                      <span className={`text-[11px] ${currentFontKey === "mono" ? "font-bold text-white" : "font-medium"}`}>
                        Mono
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================
                3. MENI (Placeholder)
                ========================================================= */}
            {activeTab === "meni" && (
              <div className="space-y-4">
                <div className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2 ${
                  isLight ? "bg-neutral-50 border-neutral-200" : "bg-[#1c1c1c] border-[#292929]"
                }`}>
                  <MenuIcon className="w-6 h-6 text-neutral-400" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isLight 
                      ? "bg-violet-100 text-violet-700 border border-violet-200" 
                      : "bg-violet-950/60 text-violet-300 border border-violet-800/80"
                  }`}>
                    Uskoro
                  </span>
                  <div className={`text-[12px] font-semibold ${
                    isLight ? "text-[#2e2d29]" : "text-neutral-200"
                  }`}>
                    Podešavanja menija
                  </div>
                  <p className="text-[11px] text-neutral-400 max-w-sm">
                    Podešavanja stavki menija će uskoro biti dostupna.
                  </p>
                </div>
              </div>
            )}

            {/* =========================================================
                4. PODSETNICI (Placeholder)
                ========================================================= */}
            {activeTab === "podsetnici" && (
              <div className="space-y-4">
                <div className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2 ${
                  isLight ? "bg-neutral-50 border-neutral-200" : "bg-[#1c1c1c] border-[#292929]"
                }`}>
                  <Bell className="w-6 h-6 text-neutral-400" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isLight 
                      ? "bg-violet-100 text-violet-700 border border-violet-200" 
                      : "bg-violet-950/60 text-violet-300 border border-violet-800/80"
                  }`}>
                    Uskoro
                  </span>
                  <div className={`text-[12px] font-semibold ${
                    isLight ? "text-[#2e2d29]" : "text-neutral-200"
                  }`}>
                    Podsetnici i notifikacije
                  </div>
                  <p className="text-[11px] text-neutral-400 max-w-sm">
                    Podešavanja podsetnika će uskoro biti dostupna.
                  </p>
                </div>
              </div>
            )}

            {/* =========================================================
                5. KONEKCIJE (Placeholder)
                ========================================================= */}
            {activeTab === "konekcije" && (
              <div className="space-y-4">
                <div className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2 ${
                  isLight ? "bg-neutral-50 border-neutral-200" : "bg-[#1c1c1c] border-[#292929]"
                }`}>
                  <Link2 className="w-6 h-6 text-neutral-400" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isLight 
                      ? "bg-violet-100 text-violet-700 border border-violet-200" 
                      : "bg-violet-950/60 text-violet-300 border border-violet-800/80"
                  }`}>
                    Uskoro
                  </span>
                  <div className={`text-[12px] font-semibold ${
                    isLight ? "text-[#2e2d29]" : "text-neutral-200"
                  }`}>
                    Spoljne konekcije
                  </div>
                  <p className="text-[11px] text-neutral-400 max-w-sm">
                    Podešavanja konekcija će uskoro biti dostupna.
                  </p>
                </div>
              </div>
            )}

            {/* =========================================================
                6. UPRAVLJANJE PODACIMA
                - Rezervna kopija: taster "Uvezi" i "Izvezi" sa uobičajenim ikonicama
                - JSON format: taster "Uvezi" i "Izvezi" sa postojećim ikonicama
                - CSV format: taster "Uvezi" i "Izvezi" sa postojećim ikonicama
                ========================================================= */}
            {activeTab === "upravljanje_podacima" && (
              <div className="space-y-4">

                {/* Status toast message */}
                {dataStatusMessage && (
                  <div className={`p-2.5 rounded-lg text-[11px] flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
                    dataStatusMessage.isError 
                      ? "bg-[#A34836]/10 text-[#A34836] dark:text-[#E08D79] border border-[#A34836]/30" 
                      : "bg-[#1E443A]/40 text-[#B8D8C0] border border-[#3E927B]/30"
                  }`}>
                    <span>{dataStatusMessage.message}</span>
                    <button
                      type="button"
                      onClick={() => setDataStatusMessage(null)}
                      className="p-0.5 hover:opacity-75 cursor-pointer text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 6.1 Rezervna kopija */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className={`text-[12px] font-semibold ${
                        isLight ? "text-[#2e2d29]" : "text-neutral-100"
                      }`}>
                        Rezervna kopija
                      </h3>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? "text-[#787774]" : "text-neutral-400"
                      }`}>
                        Kompletna rezervna kopija celog projekta i svih hronoloških podataka
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputJsonRef.current?.click()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_backup_import"
                        title="Uvezi rezervnu kopiju"
                      >
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Uvezi</span>
                      </button>

                      <button
                        type="button"
                        onClick={exportJSON}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_backup_export"
                        title="Izvezi rezervnu kopiju"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Izvezi</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border-b ${isLight ? "border-[#eae9e6]" : "border-neutral-800"}`} />

                {/* 6.2 JSON format */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className={`text-[12px] font-semibold ${
                        isLight ? "text-[#2e2d29]" : "text-neutral-100"
                      }`}>
                        JSON format
                      </h3>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? "text-[#787774]" : "text-neutral-400"
                      }`}>
                        Uvoz i izvoz događaja u strukturiranom JSON formatu
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputJsonRef.current?.click()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_json_import"
                        title="Uvezi JSON format"
                      >
                        <Download className="w-3.5 h-3.5 text-[#74BAA0] shrink-0 -rotate-90" />
                        <span>Uvezi</span>
                      </button>

                      <button
                        type="button"
                        onClick={exportJSON}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_json_export"
                        title="Izvezi JSON format"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#74BAA0] shrink-0 rotate-90" />
                        <span>Izvezi</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border-b ${isLight ? "border-[#eae9e6]" : "border-neutral-800"}`} />

                {/* 6.3 CSV format */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className={`text-[12px] font-semibold ${
                        isLight ? "text-[#2e2d29]" : "text-neutral-100"
                      }`}>
                        CSV format
                      </h3>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? "text-[#787774]" : "text-neutral-400"
                      }`}>
                        Tabelarni format za rad sa Excel i Google Sheets programima
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputCsvRef.current?.click()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_csv_import"
                        title="Uvezi CSV format"
                      >
                        <Download className="w-3.5 h-3.5 text-[#74BAA0] shrink-0 -rotate-90" />
                        <span>Uvezi</span>
                      </button>

                      <button
                        type="button"
                        onClick={exportCSV}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-800 shadow-2xs"
                            : "bg-[#252525] hover:bg-[#2e2e2e] border-[#383838] text-neutral-200 shadow-2xs"
                        }`}
                        id="btn_csv_export"
                        title="Izvezi CSV format"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#74BAA0] shrink-0 rotate-90" />
                        <span>Izvezi</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden file inputs */}
                <input
                  type="file"
                  ref={fileInputJsonRef}
                  onChange={handleJSONImport}
                  accept=".json"
                  className="hidden"
                  id="inp_settings_hidden_json"
                />
                <input
                  type="file"
                  ref={fileInputCsvRef}
                  onChange={handleCSVImport}
                  accept=".csv"
                  className="hidden"
                  id="inp_settings_hidden_csv"
                />
              </div>
            )}

            {/* =========================================================
                7. PREVOĐENJE
                - Tekst "Izaberi jezik" pa desno padajući meni u kom je "engleski"
                - Ispod toga opcija sa 3. slike (Google Docs kartica)
                ========================================================= */}
            {activeTab === "prevodjenje" && (
              <div className="space-y-4">
                
                {/* 7.1 Izaberi jezik sa padajućim menijem (samo "engleski") */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className={`text-[12px] font-semibold ${
                      isLight ? "text-[#2e2d29]" : "text-neutral-100"
                    }`}>
                      Izaberi jezik
                    </label>

                    <div className="relative" ref={langDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsLanguageDropdownOpen(prev => !prev)}
                        className={`w-40 flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-left transition cursor-pointer ${
                          isLight
                            ? "bg-white border-neutral-300 hover:border-neutral-400 text-neutral-900 shadow-2xs"
                            : "bg-[#202020] border-[#333333] hover:border-[#444444] text-neutral-100 shadow-2xs"
                        }`}
                        id="btn_translation_lang_dropdown"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">🇬🇧</span>
                          <span className="text-[11px] font-medium truncate">engleski</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1 transition-transform duration-150 ${isLanguageDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isLanguageDropdownOpen && (
                        <div className={`absolute right-0 top-full mt-1.5 w-40 rounded-xl border shadow-xl overflow-hidden z-40 animate-in fade-in-50 duration-150 ${
                          isLight
                            ? "bg-white border-neutral-200"
                            : "bg-[#1c1c1c] border-[#333333]"
                        }`}>
                          <div className="p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsLanguageDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-[11px] transition cursor-pointer ${
                                isLight
                                  ? "bg-neutral-100 font-semibold text-neutral-900"
                                  : "bg-[#292929] font-semibold text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">🇬🇧</span>
                                <span>engleski</span>
                              </div>
                              <Check className="w-3.5 h-3.5 text-[#3E927B]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`border-b ${isLight ? "border-neutral-200" : "border-neutral-800"}`} />

                {/* 7.2 Google Docs Integration Card (Identical to 3. Image) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isLight
                    ? "bg-neutral-50 border-neutral-250 text-neutral-900 shadow-2xs"
                    : "bg-[#151515] border-[#2c2c2c] text-[#eaeaea] shadow-2xs"
                }`}>
                  {/* Top row with Docs branding and Google sign-in */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Google Docs earth slate icon box */}
                      <div className="w-8 h-8 rounded-lg bg-[#4A7A96]/20 text-[#4A7A96] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold">Google Docs</span>
                          <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-neutral-800 border border-neutral-700 text-neutral-200 rounded flex items-center gap-1">
                            <span>🇷🇸</span>
                            <span>SR</span>
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                          Integracija sa Google Docs
                        </p>
                      </div>
                    </div>

                    {/* Google Sign In / Account Status */}
                    {googleUser ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-400 hidden sm:inline truncate max-w-[140px]">
                          {googleUser.email}
                        </span>
                        <button
                          type="button"
                          onClick={handleGoogleSignOut}
                          className="text-[10px] text-neutral-400 hover:text-[#A34836] transition flex items-center gap-1 cursor-pointer"
                          title="Odjavi se"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Odjava</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-semibold rounded-full border border-neutral-200 shadow-2xs transition cursor-pointer shrink-0"
                        id="btn_google_signin"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Prijavi se putem Google-a</span>
                      </button>
                    )}
                  </div>

                  {/* Description text */}
                  <p className={`text-[11px] my-3 leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
                    Kreira dokument na vašem Google Drive-u za prevod na Srpski (Српски / Srpski) koji u realnom vremenu uvozi prevod u Hroniku.
                  </p>

                  {/* Progress / Loading indicator */}
                  {isGoogleLoading && (
                    <div className="mb-2.5 p-2 rounded-lg bg-[#1E443A]/15 border border-[#1E443A]/40 text-[#1E443A] dark:text-[#74BAA0] text-[11px] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>{googleActionMessage || "Obrada..."}</span>
                    </div>
                  )}

                  {/* Primary Action Button (Blue Prominent Button from Image 3) */}
                  <div className="flex flex-col gap-2">
                    {!googleDocId ? (
                      <button
                        type="button"
                        onClick={handleCreateGoogleDoc}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-[12px] font-semibold shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-60"
                        id="btn_create_google_doc"
                      >
                        <FileText className="w-4 h-4 text-white" />
                        <span>Poveži Google nalog i kreiraj dokument (Srpski)</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenExistingGoogleDoc}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-[12px] font-semibold shadow-xs transition cursor-pointer"
                          id="btn_open_google_doc"
                        >
                          <FileText className="w-4 h-4 text-white" />
                          <span>Otvori u Google Docs</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        <button
                          type="button"
                          onClick={handleSyncFromGoogleDoc}
                          disabled={isGoogleLoading}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1E443A] hover:bg-[#28594D] text-white rounded-xl text-[12px] font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
                          id="btn_sync_google_doc"
                          title="Učitaj iz Google Docs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? "animate-spin" : ""}`} />
                          <span>Sinhronizuj sada</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import Status Feedback */}
                {importStatus && (
                  <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center justify-between gap-2 ${
                    importStatus.isError
                      ? "bg-[#A34836]/10 border border-[#A34836]/30 text-[#A34836] dark:text-[#E08D79]"
                      : "bg-[#1E443A]/40 border border-[#3E927B]/40 text-[#B8D8C0]"
                  }`}>
                    <span>{importStatus.message}</span>
                    <button
                      type="button"
                      onClick={() => setImportStatus(null)}
                      className="text-[10px] opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Google Drive Folder Selector Modal */}
      <GoogleDriveFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        lang={lang}
        theme={preferences.theme}
        skinPrimaryColor={currentSkinInfo.primaryHex}
        initialFolderId={targetFolder.id}
        initialFolderName={targetFolder.name}
        onSelectFolder={(folderId, folderName) => {
          setTargetFolder({ id: folderId, name: folderName });
          saveGoogleDocFolder(folderId, folderName, selectedTranslationLang.code);
        }}
      />
    </div>
  );
}
