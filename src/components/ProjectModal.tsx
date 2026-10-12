import React, { useState, useEffect } from "react";
import { X, Rocket, Edit2, Copy, FilePlus } from "lucide-react";
import { SKINS_CONFIG } from "./SettingsModal";
import { SkinType } from "../types";
import { LangType } from "../translations";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "rename";
  initialName?: string;
  theme?: "dark" | "light";
  skin?: SkinType;
  lang?: LangType;
  onSubmit: (name: string, createOption?: "blank" | "copy") => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  mode,
  initialName = "",
  theme = "dark",
  skin = "hronika",
  lang = "sr",
  onSubmit
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [createOption, setCreateOption] = useState<"blank" | "copy">("blank");

  useEffect(() => {
    if (isOpen) {
      if (mode === "rename") {
        setName(initialName);
      } else {
        setName("");
        setCreateOption("blank");
      }
    }
  }, [isOpen, mode, initialName]);

  if (!isOpen) return null;

  const isLightTheme = theme === "light";
  const skinInfo = SKINS_CONFIG[skin] || SKINS_CONFIG.hronika;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    
    // Default name if left blank during creation
    const finalName = trimmed || (mode === "create" ? (lang === "sr" ? "Prazan projekat" : "Empty Project") : initialName);
    onSubmit(finalName, createOption);
    onClose();
  };

  const isSr = lang === "sr";

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-text cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className={`border rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 cursor-default ${
          isLightTheme 
            ? "bg-white border-[#1E443A] text-slate-800" 
            : "bg-[#0f0f12] border-[#1E443A] text-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLightTheme ? "bg-slate-50 border-[#1E443A]/30" : "bg-[#0d0d10] border-[#1E443A]/40"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1E443A]/30 text-[#3E927B]">
              {mode === "create" ? <Rocket className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`font-bold text-base leading-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                {mode === "create" 
                  ? (name.trim() ? name : (isSr ? "Novi projekat" : "New Project")) 
                  : (name.trim() ? name : (isSr ? "Preimenuj projekat" : "Rename Project"))}
              </h3>
              <p className="text-xs text-[#ada9a3]">
                {mode === "create" 
                  ? (isSr ? "Unesite naziv i izaberite opciju kreiranja" : "Enter a name and select creation mode") 
                  : (isSr ? "Unesite novi naziv za trenutni projekat" : "Enter a new name for the current project")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLightTheme 
                ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" 
                : "hover:bg-[#161619] text-[#ada9a3] hover:text-white"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#ada9a3] mb-1.5">
              {isSr ? "Naziv projekta" : "Project Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "create" ? (isSr ? "Npr. Prazan projekat, Rimsko carstvo..." : "e.g. Empty Project...") : initialName}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none transition ${
                isLightTheme 
                  ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#3E927B] focus:bg-white" 
                  : "bg-[#161619] border-[#373735] text-[#eaeaea] focus:border-[#3E927B] focus:bg-[#0f0f12]"
              }`}
              autoFocus
            />
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#ada9a3]">
                {isSr ? "Početno stanje" : "Starting State"}
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateOption("blank")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    createOption === "blank"
                      ? "bg-[#1E443A] text-white border-[#3E927B]"
                      : "bg-[#161619] border-[#373735] text-[#ada9a3] hover:bg-[#1E443A]/30 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <FilePlus className={`w-4 h-4 ${createOption === "blank" ? "text-white" : "text-[#3E927B]"}`} />
                    <span className={`w-2.5 h-2.5 rounded-full border ${
                      createOption === "blank" ? "bg-white border-white" : "border-[#ada9a3]"
                    }`} />
                  </div>
                  <div className="font-semibold text-xs leading-tight">
                    {isSr ? "Prazan projekat" : "Empty Project"}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {isSr ? "Započni bez događaja" : "Start from scratch"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateOption("copy")}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    createOption === "copy"
                      ? "bg-[#1E443A] text-white border-[#3E927B]"
                      : "bg-[#161619] border-[#373735] text-[#ada9a3] hover:bg-[#1E443A]/30 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Copy className={`w-4 h-4 ${createOption === "copy" ? "text-white" : "text-[#3E927B]"}`} />
                    <span className={`w-2.5 h-2.5 rounded-full border ${
                      createOption === "copy" ? "bg-white border-white" : "border-[#ada9a3]"
                    }`} />
                  </div>
                  <div className="font-semibold text-xs leading-tight">
                    {isSr ? "Kopiraj trenutni" : "Copy current"}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {isSr ? "Dupliraj događaje" : "Duplicate events"}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                isLightTheme
                  ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "bg-[#161619] border-[#373735] text-[#ada9a3] hover:bg-[#25252b]"
              }`}
            >
              {isSr ? "Otkaži" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1E443A] hover:bg-[#255246] text-white border border-[#3E927B]/40 transition cursor-pointer shadow-md active:scale-95"
            >
              {mode === "create" 
                ? (isSr ? "Kreiraj projekat" : "Create Project") 
                : (isSr ? "Sačuvaj izmene" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
