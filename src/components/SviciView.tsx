import React from "react";
import { 
  ScrollText, 
  Calendar, 
  Tag, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Bookmark,
  Layers,
  FileText
} from "lucide-react";
import { LangType } from "../translations";

interface SviciViewProps {
  theme?: "dark" | "light";
  lang: LangType;
  onSwitchToHronika?: () => void;
}

export function SviciView({ theme = "dark", lang, onSwitchToHronika }: SviciViewProps) {
  const isLightTheme = theme === "light";

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-auto custom-scrollbar transition-colors duration-200 ${
      isLightTheme ? "bg-[#FAF8F5] text-[#18181b]" : "bg-[#0f0f11] text-[#f4f4f5]"
    }`}>
      {/* Archival Parchment Cover Banner from Google Stitch */}
      <div className="relative w-full h-48 sm:h-60 overflow-hidden shrink-0 group select-none">
        <div 
          className="w-full h-full bg-cover bg-center filter brightness-90 contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uof5WCyUWLaR4uSuZCM4WInrV4dnNrKMM9E55XnKuxyMnhJJno3_DqQ8TMMoeU6jq0pzFPKVRUyy48xhwxfjIIAoJKJML2-tNUhuG4mXI4GIajoJoi09YYbA1KRoFYJlLiItlnmKy2U6XzerOd9nbcNmMFpgG6eZzTY3ahI9LlHDd3GqWH2rU7bJGgjw4NM04cnJk2hcSulQXBkDumHgAcXOwfOooL82E4wWGYHoM-TD2Ya-rkboQ')`
          }}
        />
        {/* Soft tonal gradient blending into canvas */}
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

        <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 opacity-80">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono backdrop-blur-md border ${
            isLightTheme 
              ? "bg-white/80 text-slate-700 border-slate-200/80 shadow-xs" 
              : "bg-black/60 text-[#a1a1aa] border-white/10"
          }`}>
            Kumran • 1947–1956
          </span>
        </div>
      </div>

      {/* Notion-style Document Spine Container */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-24 -mt-10 sm:-mt-12 relative z-10 flex flex-col gap-6">
        
        {/* Document Icon & Title Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border cursor-default select-none ${
              isLightTheme 
                ? "bg-white border-slate-200 shadow-slate-300/40" 
                : "bg-[#191919] border-white/10 shadow-black/80"
            }`}>
              📜
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
                isLightTheme
                  ? "bg-[#3e927c]/10 text-[#2f6d5c] border-[#3e927c]/20"
                  : "bg-[#3e927c]/15 text-[#83d6bd] border-[#3e927c]/30"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3e927c] animate-pulse" />
                <span>{lang === "sr" ? "U pripremi za BlockNote" : "Ready for BlockNote"}</span>
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "sr" ? "Svici — BlockNote Dokumenti & Rukopisi" : "Scrolls — BlockNote Documents & Manuscripts"}
            </h1>
            <p className={`text-sm mt-1.5 leading-relaxed ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
              {lang === "sr" 
                ? "Tekstualni radni prostor za proučavanje drevnih rukopisa, kumranskih svitaka i beleški o biblijskoj istoriji." 
                : "Text workspace for studying ancient manuscripts, Dead Sea scrolls, and commentary on biblical history."}
            </p>
          </div>
        </div>

        {/* Notion Database Property Fields Card */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
          isLightTheme 
            ? "bg-white border-slate-200/80 shadow-xs" 
            : "bg-[#191919] border-white/[0.08]"
        }`}>
          {/* Row: Date */}
          <div className="flex items-center text-xs">
            <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Datum" : "Date"}</span>
            </div>
            <div className="font-medium flex items-center gap-2">
              <span>{lang === "sr" ? "12. oktobar 2026." : "October 12, 2026"}</span>
              <span className={`text-[11px] font-mono ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>(01:00 CET)</span>
            </div>
          </div>

          {/* Row: Status */}
          <div className="flex items-center text-xs">
            <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Status" : "Status"}</span>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                isLightTheme 
                  ? "bg-[#3e927c]/10 text-[#2f6d5c]" 
                  : "bg-[#3e927c]/20 text-[#83d6bd]"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3e927c]" />
                {lang === "sr" ? "Struktura usklađena" : "Structure Ready"}
              </span>
            </div>
          </div>

          {/* Row: Tags (Mint, Amber, Terracotta) */}
          <div className="flex items-center text-xs">
            <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              <Tag className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Tagovi" : "Tags"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isLightTheme 
                  ? "bg-[#3e927c]/10 text-[#2f6d5c] border-[#3e927c]/25" 
                  : "bg-[#3e927c]/15 text-[#83d6bd] border-[#3e927c]/30"
              }`}>
                JBP
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isLightTheme 
                  ? "bg-[#ffab2e]/10 text-[#b36d00] border-[#ffab2e]/30" 
                  : "bg-[#ffab2e]/15 text-[#ffb95d] border-[#ffab2e]/30"
              }`}>
                {lang === "sr" ? "Rukopisi" : "Manuscripts"}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isLightTheme 
                  ? "bg-[#783c2d]/10 text-[#783c2d] border-[#783c2d]/25" 
                  : "bg-[#783c2d]/20 text-[#e07a63] border-[#783c2d]/35"
              }`}>
                {lang === "sr" ? "Arheologija" : "Archaeology"}
              </span>
            </div>
          </div>

          {/* Row: Canonical Scope */}
          <div className="flex items-center text-xs">
            <div className={`w-28 flex items-center gap-2 ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === "sr" ? "Kanon" : "Canon"}</span>
            </div>
            <div className={`font-mono text-[11px] ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
              Tanah (Isaija, Psalmi, Ponovljeni zakoni)
            </div>
          </div>
        </div>

        {/* Informative Notion Callout Banner for Step 1 & 2 */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
          isLightTheme 
            ? "bg-white border-[#3e927c]/30 shadow-xs" 
            : "bg-[#191919] border-[#3e927c]/40"
        }`} style={{ borderLeftWidth: "4px", borderLeftColor: "#3e927c" }}>
          <div className="p-2 rounded-lg bg-[#3e927c]/15 text-[#3e927c] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#3e927c]" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-[#3e927c]">
              {lang === "sr" ? "Sekcija Svici — Pripremljena struktura" : "Scrolls Section — Structure Initialized"}
            </h3>
            <p className={`text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
              {lang === "sr" 
                ? "Ovaj radni prostor je uspešno izdvojen pod samostalnu sekciju. U skladu sa zadatkom, BlockNote editor nije instaliran u ovom koraku i biće integrisan u sledećoj fazi. Vremenska linija je u potpunosti sačuvana u sekciji „Hronika”." 
                : "This workspace has been cleanly moved under its dedicated section. In accordance with constraints, BlockNote rich-text editor will be configured in the next phase without disrupting legacy timeline state."}
            </p>
            {onSwitchToHronika && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSwitchToHronika}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3e927c] hover:underline cursor-pointer"
                >
                  <span>{lang === "sr" ? "Nazad na Hroniku (Vremensku liniju)" : "Back to Hronika (Timeline)"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Document Outline & Archival Card Previews from Stitch */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              {lang === "sr" ? "Dostupni rukopisi i zapisi" : "Available Manuscripts & Records"}
            </span>
            <span className={`text-xs font-mono ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
              3 {lang === "sr" ? "dokumenta" : "documents"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1 */}
            <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-[#3e927c]/50 ${
              isLightTheme 
                ? "bg-white border-slate-200" 
                : "bg-[#191919] border-white/[0.08]"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3e927c]">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>1947 Kumran</span>
                </div>
                <h4 className="text-xs font-bold leading-snug">
                  {lang === "sr" ? "Rukopisi s Mrtvog mora" : "Dead Sea Scrolls"}
                </h4>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                  {lang === "sr" ? "Veliki svitak proroka Isaije i pećina 1." : "Great Isaiah scroll and Cave 1."}
                </p>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-fit ${
                isLightTheme ? "bg-slate-100 text-slate-600" : "bg-[#202020] text-[#a1a1aa]"
              }`}>
                54 kolone • pergament
              </span>
            </div>

            {/* Card 2 */}
            <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-[#ffab2e]/50 ${
              isLightTheme 
                ? "bg-white border-slate-200" 
                : "bg-[#191919] border-white/[0.08]"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ffab2e]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paleografija</span>
                </div>
                <h4 className="text-xs font-bold leading-snug">
                  {lang === "sr" ? "Prva vekovna pisma" : "Early Century Epistles"}
                </h4>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                  {lang === "sr" ? "Rani papirusi Novog zaveta i fragmenti P52." : "Early NT papyri and P52 fragments."}
                </p>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-fit ${
                isLightTheme ? "bg-slate-100 text-slate-600" : "bg-[#202020] text-[#a1a1aa]"
              }`}>
                II vek n. e. • papirus
              </span>
            </div>

            {/* Card 3 */}
            <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-[#783c2d]/50 ${
              isLightTheme 
                ? "bg-white border-slate-200" 
                : "bg-[#191919] border-white/[0.08]"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e07a63]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Proročanstva</span>
                </div>
                <h4 className="text-xs font-bold leading-snug">
                  {lang === "sr" ? "Beleške o proročanstvima" : "Notes on Prophecy"}
                </h4>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                  {lang === "sr" ? "Hronološka sinteza Danila i Otkrivenja." : "Chronological synthesis of Daniel & Revelation."}
                </p>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-fit ${
                isLightTheme ? "bg-slate-100 text-slate-600" : "bg-[#202020] text-[#a1a1aa]"
              }`}>
                7 epoha • mapirano
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
