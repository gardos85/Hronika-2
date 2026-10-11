import React from "react";
import { X, MousePointer, HelpCircle, FileSpreadsheet, Keyboard } from "lucide-react";
import { SKINS_CONFIG } from "./SettingsModal";
import { SkinType } from "../types";

interface HelpInfoProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
  skin?: SkinType;
}

export function HelpInfo({ 
  isOpen, 
  onClose, 
  theme = "dark", 
  skin = "hronika" 
}: HelpInfoProps) {
  if (!isOpen) return null;

  const isLightTheme = theme === "light";
  const skinInfo = SKINS_CONFIG[skin] || SKINS_CONFIG.hronika;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-text cursor-pointer"
      onClick={onClose}
    >
      <div 
        className={`border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200 cursor-default ${
          isLightTheme 
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-[#0f0f12] border-slate-800 text-slate-200"
        }`}
        id="help_container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLightTheme ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#0d0d10] border-slate-800 text-slate-200"
        }`}>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" style={{ color: skinInfo.primary }} />
            <h3 className={`font-bold text-base leading-none font-display ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Pomoć za aplikaciju Hronika
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isLightTheme 
                ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" 
                : "hover:bg-slate-850 text-slate-400 hover:text-white"
            }`}
            id="help_close_btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-5 space-y-5 text-xs leading-relaxed ${
          isLightTheme ? "text-slate-650" : "text-slate-300"
        }`}>
          
          {/* Navigation Controls Guidance */}
          <div className="space-y-2">
            <h4 className={`font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide border-b pb-1 ${
              isLightTheme ? "border-slate-100 text-slate-800" : "border-slate-850 text-slate-200"
            }`}>
              <MousePointer className="w-4 h-4" style={{ color: skinInfo.primary }} /> Pomeranje i Zumiranje
            </h4>
            <ul className={`space-y-1.5 list-disc pl-4 text-xs ${isLightTheme ? "text-slate-650" : "text-slate-350"}`}>
              <li>
                <strong className={isLightTheme ? "text-slate-800 font-bold" : "text-white"}>Pomeranje (Panovanije):</strong> Kliknite bilo gde na slobodni prostor vremenske linije i prevucite mišem (levo ili desno) da biste se kretali kroz istoriju. Na telefonu to radite prostim prevlačenjem prsta.
              </li>
              <li>
                <strong className={isLightTheme ? "text-slate-800 font-bold" : "text-white"}>Zumiranje (Zoom):</strong> Koristite tastere <span className={`px-1 py-0.5 rounded font-mono font-bold border ${isLightTheme ? "bg-slate-100 border-slate-250 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-200"}`}>+</span> i <span className={`px-1 py-0.5 rounded font-mono font-bold border ${isLightTheme ? "bg-slate-100 border-slate-250 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-200"}`}>-</span> u kontrolnoj traci ili držite točkić miša / pinch-zoom prstima na mobilnim telefonima.
              </li>
              <li>
                <strong className={isLightTheme ? "text-slate-800 font-bold" : "text-white"}>Mobilna verzija:</strong> Stranica dozvoljava prirodno pomeranje u svim pravcima (levo-desno i gore-dole) za maksimalnu udobnost prstiju.
              </li>
            </ul>
          </div>

          {/* BCE Guidance */}
          <div className="space-y-2">
            <h4 className={`font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide border-b pb-1 ${
              isLightTheme ? "border-slate-100 text-slate-800" : "border-slate-850 text-slate-200"
            }`}>
              <Keyboard className="w-4 h-4" style={{ color: skinInfo.primary }} /> Unos Godina (Pr. n. e.)
            </h4>
            <div className={`p-3 rounded-lg border space-y-1 ${
              isLightTheme ? "bg-slate-50 border-slate-150 text-slate-650" : "bg-slate-950/70 border-slate-850 text-slate-350"
            }`}>
              <p>
                Za godine pre nove ere koristite negativne vrednosti u uvozu / eksportu.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><span className={`font-mono px-1 py-0.5 rounded border ${isLightTheme ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"}`}>-4026</span> = godine 4026. pre nove ere (BCE)</li>
                <li><span className={`font-mono px-1 py-0.5 rounded border ${isLightTheme ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"}`}>476</span> = godine 476. nove ere (CE)</li>
                <li>Prilikom ručnog dodavanja, jednostavno izaberite eru u padajućoj sekciji, dok vrednost godine upisujete kao pozitivan čist broj.</li>
              </ul>
            </div>
          </div>

          {/* CSV Template */}
          <div className="space-y-2">
            <h4 className={`font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide border-b pb-1 ${
              isLightTheme ? "border-slate-100 text-slate-800" : "border-slate-850 text-slate-200"
            }`}>
              <FileSpreadsheet className="w-4 h-4" style={{ color: skinInfo.primary }} /> Format za CSV uvoz
            </h4>
            <p className={isLightTheme ? "text-slate-600" : "text-slate-350"}>
              Prva linija mora da navede tačna zaglavlja:
            </p>
            <pre className={`border p-2.5 text-[10.5px] rounded-lg overflow-x-auto font-mono ${
              isLightTheme 
                ? "bg-slate-50 border-slate-200 text-slate-800" 
                : "bg-slate-950 border-slate-850 text-amber-400/90"
            }`}>
              title,group,startYear,endYear,description{"\n"}
              Aleksandar Veliki,Ličnosti,-356,-323,Život kralja{"\n"}
              Pad Jerusalima,Sveto pismo,-607,,Napad Vavilona{"\n"}
              Karlo Veliki,Ličnosti,742,814,Ujedinjena Evropa
            </pre>
            <p className="text-[10px] text-slate-400 italic">
              * endYear ostavite prazno za pojedinačni događaj. Za dodavanje tagova preko CSV, dodajte kolonu "tags" sa vrednostima razdvojenim tačka-zarezom (npr. "Rim;Antika").
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-right ${
          isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0d0d10] border-slate-800"
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-black font-bold rounded-lg transition text-[11px] uppercase tracking-wider cursor-pointer active:scale-95"
            style={{ backgroundColor: skinInfo.primary }}
            id="btn_close_help"
          >
            Zatvori pomoć
          </button>
        </div>
      </div>
    </div>
  );
}
