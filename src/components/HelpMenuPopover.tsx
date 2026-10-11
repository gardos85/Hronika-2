import React, { useRef, useEffect } from "react";
import { Keyboard, LifeBuoy, RotateCcw, Check, ArrowRight } from "lucide-react";
import { SkinType } from "../types";
import { SKINS_CONFIG } from "./SettingsModal";
import { LangType } from "../translations";

interface HelpMenuPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
  onOpenSupport: () => void;
  onClearCache: () => void;
  theme?: "dark" | "light";
  skin?: SkinType;
  lang: LangType;
  align?: "bottom-left" | "bottom-right" | "top-right";
}

export function HelpMenuPopover({
  isOpen,
  onClose,
  onOpenShortcuts,
  onOpenSupport,
  onClearCache,
  theme = "dark",
  skin = "hronika",
  lang,
  align = "bottom-left"
}: HelpMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLightTheme = theme === "light";
  const skinInfo = SKINS_CONFIG[skin] || SKINS_CONFIG.hronika;

  const positionClasses = 
    align === "bottom-left"
      ? "bottom-full left-0 mb-2"
      : align === "bottom-right"
        ? "bottom-full right-0 mb-2"
        : "top-full right-0 mt-2";

  return (
    <div
      ref={popoverRef}
      className={`absolute ${positionClasses} w-64 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 select-none ${
        isLightTheme
          ? "bg-white border-[#1E443A] text-slate-800 shadow-slate-300"
          : "bg-[#141418] border-[#1E443A] text-slate-100 shadow-black"
      }`}
      id="popover_help_menu"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Menu title header */}
      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {lang === "sr" ? "Pomoć i opcije" : "Help & Options"}
      </div>

      <div className="space-y-1 my-0.5">
        {/* 1. Prečice na tastaturi / Keyboard shortcuts */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenShortcuts();
          }}
          className="w-full px-2.5 py-2 text-left text-xs font-medium rounded-xl transition flex items-center justify-between cursor-pointer group bg-[#1E443A] hover:bg-[#255246] text-white"
          id="btn_help_item_shortcuts"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Keyboard className="w-4 h-4 text-white shrink-0" />
            <span className="truncate text-white">
              {lang === "sr" ? "Prečice na tastaturi" : "Keyboard shortcuts"}
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded border bg-black/40 text-white border-white/20">
            ⌘\
          </kbd>
        </button>

        {/* 2. Podrška / Support */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSupport();
          }}
          className="w-full px-2.5 py-2 text-left text-xs font-medium rounded-xl transition flex items-center justify-between cursor-pointer group bg-[#1E443A] hover:bg-[#255246] text-white"
          id="btn_help_item_support"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <LifeBuoy className="w-4 h-4 text-white shrink-0" />
            <span className="truncate text-white">
              {lang === "sr" ? "Podrška" : "Support"}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 3. Obriši keš memoriju / Clear page cache */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onClearCache();
          }}
          className="w-full px-2.5 py-2 text-left text-xs font-medium rounded-xl transition flex items-center justify-between cursor-pointer group bg-[#1E443A] hover:bg-[#255246] text-white"
          id="btn_help_item_clear_cache"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <RotateCcw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-300 shrink-0" />
            <span className="truncate text-white">
              {lang === "sr" ? "Obriši keš memoriju" : "Clear page cache"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
