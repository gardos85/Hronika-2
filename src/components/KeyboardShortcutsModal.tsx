import React from "react";
import { X, Keyboard, Command } from "lucide-react";
import { SkinType } from "../types";
import { SKINS_CONFIG } from "./SettingsModal";
import { LangType } from "../translations";
import { isAppleDevice } from "../utils";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
  skin?: SkinType;
  lang: LangType;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  theme = "dark",
  skin = "hronika",
  lang
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const isLightTheme = theme === "light";
  const skinInfo = SKINS_CONFIG[skin] || SKINS_CONFIG.hronika;

  const isApple = isAppleDevice();
  const modKey = isApple ? "⌘" : "Ctrl";

  const shortcuts = [
    {
      actionSr: "Otvori / Zatvori meni i pretragu",
      actionEn: "Toggle sidebar menu & search",
      keys: isApple ? ["⌘", "K"] : ["Ctrl", "+", "K"]
    },
    {
      actionSr: "Otvori / Sakrij bočni meni",
      actionEn: "Toggle sidebar menu",
      keys: [`${modKey}`, "\\"]
    },
    {
      actionSr: "Uvećaj prikaz (Zoom in)",
      actionEn: "Zoom in timeline",
      keys: ["+"]
    },
    {
      actionSr: "Umanji prikaz (Zoom out)",
      actionEn: "Zoom out timeline",
      keys: ["-"]
    },
    {
      actionSr: "Resetuj uveličanje i poziciju",
      actionEn: "Reset zoom & center",
      keys: ["0", "ili", "Home"]
    },
    {
      actionSr: "Dodaj novi događaj ili period",
      actionEn: "Create new event or period",
      keys: ["N"]
    },
    {
      actionSr: "Pomeranje vremenske linije levo / desno",
      actionEn: "Pan timeline left / right",
      keys: ["←", "→"]
    },
    {
      actionSr: "Zatvori otvoren prozor ili pretragu",
      actionEn: "Close active modal or search",
      keys: ["Esc"]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-text cursor-pointer"
      onClick={onClose}
      id="modal_shortcuts_backdrop"
    >
      <div 
        className={`border rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 cursor-default ${
          isLightTheme 
            ? "bg-white border-[#1E443A] text-slate-800" 
            : "bg-[#0f0f12] border-[#1E443A] text-slate-100"
        }`}
        id="modal_shortcuts_container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLightTheme ? "bg-slate-50 border-[#1E443A]/30 text-slate-800" : "bg-[#0d0d10] border-[#1E443A]/40 text-slate-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E443A]/30 flex items-center justify-center text-[#3E927B] shrink-0">
              <Keyboard className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`font-bold text-base leading-tight font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                {lang === "sr" ? "Prečice na tastaturi" : "Keyboard Shortcuts"}
              </h3>
              <p className="text-[11px] text-[#ada9a3]">
                {lang === "sr" ? "Brza navigacija i komande" : "Quick navigation & commands"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLightTheme 
                ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" 
                : "hover:bg-[#161619] text-[#ada9a3] hover:text-white"
            }`}
            id="btn_shortcuts_close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                isLightTheme
                  ? "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70"
                  : "bg-[#161619] border-[#373735] hover:bg-[#1f1f24]"
              }`}
            >
              <span className={`text-xs font-medium ${isLightTheme ? "text-slate-700" : "text-[#eaeaea]"}`}>
                {lang === "sr" ? sc.actionSr : sc.actionEn}
              </span>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {sc.keys.map((k, kIdx) => {
                  if (k === "ili") {
                    return (
                      <span key={kIdx} className="text-[10px] text-[#ada9a3] px-0.5">
                        {lang === "sr" ? "ili" : "or"}
                      </span>
                    );
                  }
                  return (
                    <kbd
                      key={kIdx}
                      className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg border shadow-xs ${
                        isLightTheme
                          ? "bg-white border-slate-300 text-slate-800 shadow-slate-200"
                          : "bg-[#0f0f12] border-[#373735] text-[#3E927B] shadow-black"
                      }`}
                    >
                      {k}
                    </kbd>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-right ${
          isLightTheme ? "bg-slate-50 border-[#1E443A]/30" : "bg-[#0d0d10] border-[#1E443A]/40"
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1E443A] hover:bg-[#255246] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 border border-[#3E927B]/40"
          >
            {lang === "sr" ? "U redu" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
