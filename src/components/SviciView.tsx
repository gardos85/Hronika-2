import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  Tag, 
  BookOpen, 
  Clock, 
  ArrowRight,
  ScrollText,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  FolderKanban,
  Database,
  Layers,
  Sparkles,
  FileText
} from "lucide-react";
import { LangType } from "../translations";

interface SviciViewProps {
  theme?: "dark" | "light";
  lang: LangType;
  onSwitchToHronika?: () => void;
  defaultSubTab?: "workspace" | "archival";
}

interface ScrollDocument {
  id: string;
  titleSr: string;
  titleEn: string;
  tagSr: string;
  tagEn: string;
  tagColor: "mint" | "amber" | "terracotta";
  periodSr: string;
  periodEn: string;
  descriptionSr: string;
  descriptionEn: string;
}

const SAMPLE_DOCUMENTS: ScrollDocument[] = [
  {
    id: "1qisa-a",
    titleSr: "Veliki svitak proroka Isaije (1QIsaᵃ)",
    titleEn: "Great Isaiah Scroll (1QIsaᵃ)",
    tagSr: "Kumranski rukopisi",
    tagEn: "Dead Sea Scrolls",
    tagColor: "mint",
    periodSr: "oko 125. pre n. e. • Pećina 1",
    periodEn: "ca. 125 BCE • Cave 1",
    descriptionSr: "Kompletan tekst knjige proroka Isaije, sačuvan na 54 kolone pergamenta. Potvrđuje neverovatnu tačnost biblijskog teksta kroz milenijume.",
    descriptionEn: "Complete text of the Book of Isaiah preserved across 54 columns of parchment, demonstrating textual fidelity across millennia."
  },
  {
    id: "papyrus-p52",
    titleSr: "Fragment P52 — Jevanđelje po Jovanu",
    titleEn: "Rylands Papyrus P52 — Gospel of John",
    tagSr: "Rani papirusi",
    tagEn: "Early Papyri",
    tagColor: "amber",
    periodSr: "oko 125. n. e. • Egipat",
    periodEn: "ca. 125 CE • Egypt",
    descriptionSr: "Najstariji poznati sačuvani fragment Novog zaveta (Jovan 18:31-33, 37-38), datovan samo nekoliko decenija nakon apostolskog pisanja.",
    descriptionEn: "The earliest known preserved fragment of the New Testament (John 18:31-33, 37-38), copied only decades after the original gospel."
  },
  {
    id: "daniel-revelation",
    titleSr: "Hronološka sinteza — Danilo i Otkrivenje",
    titleEn: "Chronological Synthesis — Daniel & Revelation",
    tagSr: "Proročka hronologija",
    tagEn: "Prophecy Studies",
    tagColor: "terracotta",
    periodSr: "VI vek pre n. e. – I vek n. e.",
    periodEn: "6th Century BCE – 1st Century CE",
    descriptionSr: "Uporedna vremenska sinteza četiri proročke svetske sile (Vavilon, Medo-Persija, Grčka, Rim) u korelaciji sa istorijskom hronologijom.",
    descriptionEn: "Comparative timeline synthesis of world empires (Babylon, Medo-Persia, Greece, Rome) correlated with chronological history."
  }
];

export function SviciView({ 
  theme = "dark", 
  lang, 
  onSwitchToHronika,
  defaultSubTab = "workspace" 
}: SviciViewProps) {
  const isLightTheme = theme === "light";
  const [activeSubTab, setActiveSubTab] = useState<"workspace" | "archival">(defaultSubTab);
  const [activeDocId, setActiveDocId] = useState<string>("1qisa-a");
  
  // Workspace iframe states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

  const appflowyUrl = "http://localhost:3001/app";

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        await fetch("http://localhost:3001/", { method: "HEAD", mode: "no-cors" });
        if (isMounted) setServerStatus("online");
      } catch (_) {
        if (isMounted) setServerStatus("offline");
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleReload = () => {
    setIsIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(appflowyUrl, "_blank", "noopener,noreferrer");
  };

  const activeDoc = useMemo(() => {
    return SAMPLE_DOCUMENTS.find(d => d.id === activeDocId) || SAMPLE_DOCUMENTS[0];
  }, [activeDocId]);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors duration-200 ${
      isLightTheme ? "bg-[#FAF8F5] text-[#18181b]" : "bg-[#0f0f11] text-[#f4f4f5]"
    }`}>
      {/* Top Navigation & Controls Header */}
      <div className={`h-11 px-3 sm:px-5 shrink-0 flex items-center justify-between border-b text-xs transition-colors z-20 ${
        isLightTheme 
          ? "bg-white/95 border-slate-200/80 text-slate-700" 
          : "bg-[#141416]/95 border-white/[0.08] text-[#e4e4e7]"
      }`}>
        {/* Left: View Mode Selector & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#3e927c]/20 text-[#3e927c] flex items-center justify-center">
              <ScrollText className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs tracking-tight">
              {lang === "sr" ? "Svici" : "Scrolls"}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />

          {/* Sub-tab Pill Switcher */}
          <div className={`flex items-center p-0.5 rounded-lg border text-[11px] font-medium ${
            isLightTheme ? "bg-slate-100 border-slate-200/80" : "bg-white/5 border-white/10"
          }`}>
            <button
              type="button"
              onClick={() => setActiveSubTab("workspace")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "workspace"
                  ? (isLightTheme
                      ? "bg-white text-[#2f6d5c] shadow-xs font-semibold"
                      : "bg-[#191919] text-[#83d6bd] shadow-xs font-semibold")
                  : (isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-[#a1a1aa] hover:text-white")
              }`}
            >
              <Database className="w-3 h-3 text-[#3e927c]" />
              <span>{lang === "sr" ? "Radni prostor & Baza" : "Workspace & DB"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("archival")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "archival"
                  ? (isLightTheme
                      ? "bg-white text-[#b36d00] shadow-xs font-semibold"
                      : "bg-[#191919] text-[#ffb95d] shadow-xs font-semibold")
                  : (isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-[#a1a1aa] hover:text-white")
              }`}
            >
              <ScrollText className="w-3 h-3 text-[#ffab2e]" />
              <span>{lang === "sr" ? "Arhivski rukopisi" : "Manuscripts"}</span>
            </button>
          </div>

          {/* Real-time Status Badge */}
          {activeSubTab === "workspace" && (
            <div className="hidden lg:flex items-center gap-1.5 font-medium text-[11px] ml-1">
              <span className={`w-2 h-2 rounded-full ${
                serverStatus === "online" 
                  ? "bg-[#3e927c] animate-pulse" 
                  : serverStatus === "checking" 
                  ? "bg-[#ffab2e]" 
                  : "bg-red-400"
              }`} />
              <span className={isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}>
                {serverStatus === "online"
                  ? (lang === "sr" ? "Baza aktivna" : "Database online")
                  : serverStatus === "checking"
                  ? (lang === "sr" ? "Povezivanje..." : "Connecting...")
                  : (lang === "sr" ? "Lokalni režim (port 3001)" : "Port 3001")}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {activeSubTab === "workspace" && (
            <>
              {/* Reload Button */}
              <button
                type="button"
                onClick={handleReload}
                className={`p-1.5 rounded-md border text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
                  isLightTheme
                    ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-[#191919] hover:bg-white/10 border-white/10 text-[#d4d4d8]"
                }`}
                title={lang === "sr" ? "Ponovo učitaj radni prostor" : "Reload workspace frame"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{lang === "sr" ? "Osveži" : "Reload"}</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-1.5 rounded-md border text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
                  isLightTheme
                    ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-[#191919] hover:bg-white/10 border-white/10 text-[#d4d4d8]"
                }`}
                title={isFullscreen ? (lang === "sr" ? "Izađi iz celog ekrana" : "Exit fullscreen") : (lang === "sr" ? "Ceo ekran" : "Fullscreen")}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Open in external tab */}
              <button
                type="button"
                onClick={handleOpenExternal}
                className={`px-2 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isLightTheme
                    ? "bg-[#3e927c]/10 hover:bg-[#3e927c]/20 text-[#2f6d5c] border border-[#3e927c]/30"
                    : "bg-[#3e927c]/20 hover:bg-[#3e927c]/30 text-[#83d6bd] border border-[#3e927c]/40"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "sr" ? "Otvori u tabu" : "Open in tab"}</span>
              </button>
            </>
          )}

          {/* Switch to Hronika Button */}
          {onSwitchToHronika && (
            <button
              type="button"
              onClick={onSwitchToHronika}
              className={`p-1.5 rounded-md border text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
                isLightTheme
                  ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
                  : "bg-[#191919] hover:bg-white/10 border-white/10 text-[#a1a1aa]"
              }`}
              title={lang === "sr" ? "Povratak na Hroniku" : "Back to Timeline"}
            >
              <Clock className="w-3.5 h-3.5 text-[#3e927c]" />
              <span className="hidden lg:inline">{lang === "sr" ? "Hronika" : "Timeline"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area 1: Full AppFlowy Workspace Interface */}
      {activeSubTab === "workspace" && (
        <div className={`flex-1 relative w-full h-full min-h-0 ${
          isFullscreen ? "fixed inset-0 z-50 bg-[#0f0f11]" : ""
        }`}>
          {/* Fullscreen Close Floating Button */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-3 right-4 z-50 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 shadow-xl hover:bg-black cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Zatvori ceo ekran" : "Exit fullscreen"}</span>
            </button>
          )}

          {/* Loading Overlay */}
          {!isIframeLoaded && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 transition-opacity ${
              isLightTheme ? "bg-[#FAF8F5]" : "bg-[#0f0f11]"
            }`}>
              <div className="w-10 h-10 rounded-xl bg-[#3e927c]/20 text-[#3e927c] flex items-center justify-center animate-bounce">
                <ScrollText className="w-5 h-5" />
              </div>
              <p className={`text-xs font-medium ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
                {lang === "sr" ? "Učitavanje radnog prostora i baze..." : "Loading workspace and database..."}
              </p>
            </div>
          )}

          {/* Embedded Workspace Frame */}
          <iframe
            key={iframeKey}
            src={appflowyUrl}
            title="Svici — Radni prostor"
            className="w-full h-full border-none select-auto"
            onLoad={() => setIsIframeLoaded(true)}
            allow="clipboard-read; clipboard-write; fullscreen"
          />
        </div>
      )}

      {/* Content Area 2: Archival Manuscripts & Chronological Notes */}
      {activeSubTab === "archival" && (
        <div className="flex-1 flex flex-col h-full overflow-y-auto select-auto custom-scrollbar">
          {/* Parchment Cover Banner */}
          <div className="relative w-full h-40 sm:h-48 overflow-hidden shrink-0 group select-none">
            <div 
              className="w-full h-full bg-cover bg-center filter brightness-90 contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uof5WCyUWLaR4uSuZCM4WInrV4dnNrKMM9E55XnKuxyMnhJJno3_DqQ8TMMoeU6jq0pzFPKVRUyy48xhwxfjIIAoJKJML2-tNUhuG4mXI4GIajoJoi09YYbA1KRoFYJlLiItlnmKy2U6XzerOd9nbcNmMFpgG6eZzTY3ahI9LlHDd3GqWH2rU7bJGgjw4NM04cnJk2hcSulQXBkDumHgAcXOwfOooL82E4wWGYHoM-TD2Ya-rkboQ')`
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isLightTheme 
                ? "from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent" 
                : "from-[#0f0f11] via-[#0f0f11]/50 to-transparent"
            }`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isLightTheme 
                ? "from-[#FAF8F5]/60 via-transparent to-[#FAF8F5]/60" 
                : "from-[#0f0f11]/60 via-transparent to-[#0f0f11]/60"
            }`} />

            <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 opacity-85">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono backdrop-blur-md border ${
                isLightTheme 
                  ? "bg-white/80 text-slate-700 border-slate-200/80 shadow-xs" 
                  : "bg-black/60 text-[#a1a1aa] border-white/10"
              }`}>
                Kumran • 1947–1956
              </span>
            </div>
          </div>

          {/* Document Content Spine */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-20 -mt-8 sm:-mt-10 relative z-10 flex flex-col gap-6">
            
            {/* Title Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border cursor-default select-none ${
                  isLightTheme 
                    ? "bg-white border-slate-200 shadow-slate-300/40" 
                    : "bg-[#191919] border-white/10 shadow-black/80"
                }`}>
                  📜
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("workspace")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    isLightTheme
                      ? "bg-[#3e927c]/10 text-[#2f6d5c] border-[#3e927c]/30 hover:bg-[#3e927c]/20"
                      : "bg-[#3e927c]/15 text-[#83d6bd] border-[#3e927c]/30 hover:bg-[#3e927c]/25"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{lang === "sr" ? "Otvori u bazi podataka" : "Open in database view"}</span>
                </button>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {lang === "sr" ? activeDoc.titleSr : activeDoc.titleEn}
                </h1>
                <p className={`text-sm mt-1.5 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
                  {lang === "sr" ? activeDoc.descriptionSr : activeDoc.descriptionEn}
                </p>
              </div>
            </div>

            {/* Document Selector Pills */}
            <div className="flex flex-col gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Izaberite rukopis" : "Select manuscript"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_DOCUMENTS.map((doc) => {
                  const isSelected = doc.id === activeDocId;
                  const accentColor = 
                    doc.tagColor === "mint" ? "#3e927c" :
                    doc.tagColor === "amber" ? "#ffab2e" : "#783c2d";

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setActiveDocId(doc.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? (isLightTheme
                              ? "bg-white border-[#3e927c] shadow-md ring-1 ring-[#3e927c]/30"
                              : "bg-[#191919] border-[#3e927c] shadow-lg ring-1 ring-[#3e927c]/40")
                          : (isLightTheme
                              ? "bg-white/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                              : "bg-[#141416] border-white/[0.06] hover:border-white/20 hover:bg-[#191919]")
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${accentColor}18`, 
                            color: accentColor 
                          }}
                        >
                          {lang === "sr" ? doc.tagSr : doc.tagEn}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-snug truncate">
                          {lang === "sr" ? doc.titleSr : doc.titleEn}
                        </h4>
                        <p className={`text-[10px] mt-0.5 font-mono ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                          {lang === "sr" ? doc.periodSr : doc.periodEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Properties Card */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLightTheme 
                ? "bg-white border-slate-200/80 shadow-xs" 
                : "bg-[#191919] border-white/[0.08]"
            }`}>
              {/* Row: Period */}
              <div className="flex items-center text-xs">
                <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lang === "sr" ? "Period" : "Period"}</span>
                </div>
                <div className="font-medium">
                  {lang === "sr" ? activeDoc.periodSr : activeDoc.periodEn}
                </div>
              </div>

              {/* Row: Tags */}
              <div className="flex items-center text-xs">
                <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                  <Tag className="w-3.5 h-3.5" />
                  <span>{lang === "sr" ? "Kategorija" : "Category"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    isLightTheme 
                      ? "bg-[#3e927c]/10 text-[#2f6d5c] border-[#3e927c]/25" 
                      : "bg-[#3e927c]/15 text-[#83d6bd] border-[#3e927c]/30"
                  }`}>
                    {lang === "sr" ? activeDoc.tagSr : activeDoc.tagEn}
                  </span>
                </div>
              </div>

              {/* Row: Status */}
              <div className="flex items-center text-xs">
                <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === "sr" ? "Kanon" : "Canon"}</span>
                </div>
                <div className={`font-mono text-[11px] ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
                  {activeDoc.id === "1qisa-a" ? "Knjiga proroka Isaije (Is 1–66)" : activeDoc.id === "papyrus-p52" ? "Jevanđelje po Jovanu (Jn 18)" : "Proročka sinteza"}
                </div>
              </div>
            </div>

            {/* Back to timeline trigger */}
            {onSwitchToHronika && (
              <div className="pt-4 flex items-center justify-between border-t border-dashed border-white/10">
                <span className={`text-xs ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                  {lang === "sr" ? "Želite da se vratite na hronologiju događaja?" : "Return to timeline events?"}
                </span>
                <button
                  type="button"
                  onClick={onSwitchToHronika}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    isLightTheme 
                      ? "border-[#3e927c]/40 text-[#2f6d5c] hover:bg-[#3e927c]/10" 
                      : "border-[#3e927c]/40 text-[#83d6bd] hover:bg-[#3e927c]/15"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#3e927c]" />
                  <span>{lang === "sr" ? "Nazad na Hroniku" : "Back to Timeline"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
