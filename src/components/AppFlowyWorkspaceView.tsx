import React, { useState, useEffect } from "react";
import { 
  FolderKanban, 
  ExternalLink, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Check, 
  Clock, 
  ArrowRight,
  Database,
  Calendar,
  Layers,
  FileText,
  Sparkles,
  ScrollText
} from "lucide-react";
import { LangType } from "../translations";

interface AppFlowyWorkspaceViewProps {
  theme?: "dark" | "light";
  lang: LangType;
  onSwitchToHronika?: () => void;
}

export function AppFlowyWorkspaceView({
  theme = "dark",
  lang,
  onSwitchToHronika
}: AppFlowyWorkspaceViewProps) {
  const isLightTheme = theme === "light";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

  const appflowyUrl = "http://localhost:3001/app";

  // Check if AppFlowy dev server is responding on port 3001
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch("http://localhost:3001/", { method: "HEAD", mode: "no-cors" });
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

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors duration-200 ${
      isLightTheme ? "bg-[#FAF8F5] text-[#18181b]" : "bg-[#0f0f11] text-[#f4f4f5]"
    }`}>
      {/* Top Workspace Bar */}
      <div className={`h-11 px-4 sm:px-6 shrink-0 flex items-center justify-between border-b text-xs transition-colors ${
        isLightTheme 
          ? "bg-white/90 border-slate-200/80 text-slate-700" 
          : "bg-[#141416]/95 border-white/[0.08] text-[#e4e4e7]"
      }`}>
        {/* Left: Workspace Title & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-6 h-6 rounded-md bg-[#3e927c]/20 text-[#3e927c] flex items-center justify-center">
              <ScrollText className="w-3.5 h-3.5" />
            </div>
            <span>{lang === "sr" ? "Svici • Radni prostor" : "Scrolls • Workspace"}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/10 hidden sm:block" />

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              serverStatus === "online" 
                ? "bg-[#3e927c] animate-pulse" 
                : serverStatus === "checking" 
                ? "bg-[#ffab2e]" 
                : "bg-red-400"
            }`} />
            <span className={isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}>
              {serverStatus === "online"
                ? (lang === "sr" ? "Baza i radni prostor povezani" : "Database & workspace connected")
                : serverStatus === "checking"
                ? (lang === "sr" ? "Povezivanje baze..." : "Connecting database...")
                : (lang === "sr" ? "Lokalni režim (port 3001)" : "Local mode (port 3001)")}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
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

          {/* Open in New Window */}
          <button
            type="button"
            onClick={handleOpenExternal}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isLightTheme
                ? "bg-[#3e927c]/10 hover:bg-[#3e927c]/20 text-[#2f6d5c] border border-[#3e927c]/30"
                : "bg-[#3e927c]/20 hover:bg-[#3e927c]/30 text-[#83d6bd] border border-[#3e927c]/40"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === "sr" ? "Otvori u prozoru" : "Open in tab"}</span>
          </button>

          {/* Switch to Hronika */}
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

      {/* Main Workspace Frame Container */}
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

        {/* Embedded Workspace */}
        <iframe
          key={iframeKey}
          src={appflowyUrl}
          title="Svici — Radni prostor"
          className="w-full h-full border-none select-auto"
          onLoad={() => setIsIframeLoaded(true)}
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>
    </div>
  );
}
