import React, { useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Flag, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  Check,
  Clock
} from "lucide-react";
import { LangType } from "../translations";

interface SvetoPismoViewProps {
  theme?: "dark" | "light";
  lang: LangType;
  onSwitchToHronika?: () => void;
}

export function SvetoPismoView({ theme = "dark", lang, onSwitchToHronika }: SvetoPismoViewProps) {
  const isLightTheme = theme === "light";
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-auto custom-scrollbar transition-colors duration-200 ${
      isLightTheme ? "bg-[#FAF8F5] text-[#18181b]" : "bg-[#0f0f11] text-[#f4f4f5]"
    }`}>
      {/* Editorial Cover Header from Google Stitch */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden shrink-0 group select-none">
        <div 
          className="w-full h-full bg-cover bg-center filter brightness-90 contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlSl3p0JeQXZ8k8KQYunGst8V5iw2QfhUV-KPTKPUc2M-OVsTg-hvN1KbMbU-3-mLBlfDQiXo-4ZUn6_I794P2ShicaCj6Kt2bvqaaWLpLJXsPEGhJGfh3hldfxfNIKUgkmo6DLc7BBpboJpGP2KBE4qxS684apvRoRtFdKa2lBRKvQHF4o92y4SVWXqHfKyJnHvCV_VEGNKiRkesVww24oxk_K577yO5ycERtArey4h8Z4mG1KqkW7w')`
          }}
        />
        {/* Soft gradient blend into canvas */}
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
            66 Knjiga • 1.189 Poglavlja
          </span>
        </div>
      </div>

      {/* Notion-style Master Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pb-24 -mt-12 sm:-mt-16 relative z-10 flex flex-col gap-6">
        
        {/* Title & Icon Block */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border cursor-default select-none ${
              isLightTheme 
                ? "bg-white border-slate-200 shadow-slate-300/40" 
                : "bg-[#191919] border-white/10 shadow-black/80"
            }`}>
              📖
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase border ${
                isLightTheme 
                  ? "bg-[#3e927c]/10 text-[#2f6d5c] border-[#3e927c]/20" 
                  : "bg-[#3e927c]/15 text-[#83d6bd] border-[#3e927c]/30"
              }`}>
                KANON V2.4
              </span>
              <span className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                isLightTheme 
                  ? "bg-slate-100 text-slate-600 border-slate-200" 
                  : "bg-[#191919] text-[#a1a1aa] border-white/10"
              }`}>
                1.189 POGLAVLJA
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === "sr" ? "Sveto pismo — Planer i raspored čitanja" : "Scriptures — Reading Planner & Schedule"}
            </h1>
            <p className={`text-sm mt-1.5 leading-relaxed max-w-3xl ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
              {lang === "sr"
                ? "Praćenje ličnog napretka kroz 66 biblijskih knjiga. Sistematski hronološki pregled sa modularnim uvidom u hebrejsko-aramejski i grčki kanon."
                : "Tracking personal reading progress across all 66 biblical books. Systematic chronological overview with modular insight into Hebrew-Aramaic and Greek canon."}
            </p>
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
              {lang === "sr" ? "Sekcija Sveto pismo — Pripremljena struktura" : "Scriptures Section — Structure Initialized"}
            </h3>
            <p className={`text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
              {lang === "sr" 
                ? "Ovaj radni prostor je uspešno izdvojen pod samostalnu sekciju sa kompletnom metrikom i dizajnom iz Google Stitch projekta. Celokupna logika i podaci vremenske linije ostaju nepromenjeni u sekciji „Hronika”." 
                : "This workspace has been cleanly moved under its dedicated section with metrics and design from Google Stitch. All legacy timeline logic remains untouched in the 'Hronika' section."}
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

        {/* Top KPI Cards Grid from Google Stitch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Total Progress */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
            isLightTheme 
              ? "bg-white border-slate-200/80 shadow-xs" 
              : "bg-[#191919] border-white/[0.08]"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Ukupan napredak" : "Overall Progress"}
              </span>
              <TrendingUp className="w-4 h-4 text-[#3e927c]" />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold font-mono">68%</span>
                <span className="text-[11px] font-medium text-[#3e927c] ml-1.5 block">
                  +2.4% {lang === "sr" ? "ove sedmice" : "this week"}
                </span>
              </div>

              {/* Spark Circular Ring Indicator in Mint Teal */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isLightTheme ? "text-slate-200" : "text-[#2a2a2c]"}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    style={{ stroke: "#3e927c" }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray="68, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-bold">68</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className={`w-full rounded-full h-1.5 overflow-hidden ${isLightTheme ? "bg-slate-100" : "bg-[#252528]"}`}>
                <div className="bg-[#3e927c] h-1.5 rounded-full transition-all duration-500" style={{ width: "68%" }} />
              </div>
              <span className={`text-[10px] block ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
                798 / 1.189 {lang === "sr" ? "poglavlja pročitano" : "chapters read"}
              </span>
            </div>
          </div>

          {/* Card 2: Today Goal */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
            isLightTheme 
              ? "bg-white border-slate-200/80 shadow-xs" 
              : "bg-[#191919] border-white/[0.08]"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Dnevni cilj za danas" : "Today's Target"}
              </span>
              <Calendar className="w-4 h-4 text-[#ffab2e]" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-tight">Jevrejima 11–13</div>
              <p className={`text-[11px] mt-0.5 ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                3 {lang === "sr" ? "poglavlja" : "chapters"} • ~16 {lang === "sr" ? "minuta" : "mins"}
              </p>
            </div>

            <div className={`pt-2 -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex items-center justify-between border-t ${
              isLightTheme ? "bg-slate-50/80 border-slate-100" : "bg-[#202020]/60 border-white/5"
            }`}>
              <button
                type="button"
                onClick={() => setIsTodayCompleted(!isTodayCompleted)}
                className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-left"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                  isTodayCompleted ? "bg-[#3e927c] text-white" : "border border-slate-400 dark:border-white/30"
                }`}>
                  {isTodayCompleted && <Check className="w-3 h-3" />}
                </div>
                <span>{isTodayCompleted ? (lang === "sr" ? "Dovršeno" : "Completed") : (lang === "sr" ? "Označi dovršeno" : "Mark complete")}</span>
              </button>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isLightTheme ? "bg-[#ffab2e]/15 text-[#b36d00]" : "bg-[#ffab2e]/20 text-[#ffb95d]"
              }`}>
                Dan 251
              </span>
            </div>
          </div>

          {/* Card 3: Streak Counter */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
            isLightTheme 
              ? "bg-white border-slate-200/80 shadow-xs" 
              : "bg-[#191919] border-white/[0.08]"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Trenutni niz (Streak)" : "Current Streak"}
              </span>
              <Flame className="w-4 h-4 text-[#ffab2e]" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#ffab2e]">42</span>
              <span className="text-xs font-medium">
                {lang === "sr" ? "dana uzastopno" : "days consecutive"}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className="flex-1 h-1.5 rounded-full bg-[#ffab2e]" />
                ))}
                <span className="flex-1 h-1.5 rounded-full bg-[#ffab2e]/40 animate-pulse" />
              </div>
              <span className={`text-[10px] block ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Lični rekord: 58 dana (2025)" : "Personal best: 58 days (2025)"}
              </span>
            </div>
          </div>

          {/* Card 4: Remaining Plan */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
            isLightTheme 
              ? "bg-white border-slate-200/80 shadow-xs" 
              : "bg-[#191919] border-white/[0.08]"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Preostalo u planu" : "Remaining"}
              </span>
              <Flag className="w-4 h-4 text-[#e07a63]" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">114</span>
              <span className={`text-xs ${isLightTheme ? "text-slate-500" : "text-[#a1a1aa]"}`}>
                {lang === "sr" ? "dana" : "days"}
              </span>
            </div>

            <div className="space-y-1">
              <div className={`flex items-center gap-1.5 text-[11px] ${isLightTheme ? "text-slate-600" : "text-[#a1a1aa]"}`}>
                <Clock className="w-3.5 h-3.5 text-[#e07a63]" />
                <span>31. decembar 2026.</span>
              </div>
              <span className={`text-[10px] block ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
                {lang === "sr" ? "Tempo: 3 poglavlja dnevno" : "Pace: 3 chapters daily"}
              </span>
            </div>
          </div>

        </div>

        {/* Biblical Canon Overview Previews from Stitch */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-500" : "text-[#71717a]"}`}>
              {lang === "sr" ? "Struktura biblijskog kanona" : "Structure of Biblical Canon"}
            </span>
            <span className={`text-xs font-mono ${isLightTheme ? "text-slate-400" : "text-[#71717a]"}`}>
              66 {lang === "sr" ? "knjiga" : "books"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Section 1: Hebrew-Aramaic */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#191919] border-white/[0.08]"
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#3e927c] flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{lang === "sr" ? "Hebrejsko-aramejski spisi (Stari zavet)" : "Hebrew-Aramaic Scriptures (OT)"}</span>
                </h4>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isLightTheme ? "bg-slate-100 text-slate-600" : "bg-[#202020] text-[#a1a1aa]"
                }`}>
                  39 knjiga • 929 pogl.
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Postanak", "Izlazak", "Levitska", "Brojevi", "Ponovljeni zakoni", "Isus Navin", "Psalmi", "Isaija", "Danilo"].map((bk) => (
                  <span key={bk} className={`text-[11px] px-2 py-0.5 rounded border ${
                    isLightTheme 
                      ? "bg-slate-50 border-slate-200 text-slate-700" 
                      : "bg-[#202020] border-white/5 text-[#a1a1aa]"
                  }`}>
                    {bk}
                  </span>
                ))}
                <span className={`text-[11px] px-2 py-0.5 rounded ${
                  isLightTheme ? "text-slate-400" : "text-[#71717a]"
                }`}>
                  +30 {lang === "sr" ? "ostalih" : "more"}
                </span>
              </div>
            </div>

            {/* Section 2: Christian Greek */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#191919] border-white/[0.08]"
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#ffab2e] flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{lang === "sr" ? "Hrišćanski grčki spisi (Novi zavet)" : "Christian Greek Scriptures (NT)"}</span>
                </h4>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isLightTheme ? "bg-slate-100 text-slate-600" : "bg-[#202020] text-[#a1a1aa]"
                }`}>
                  27 knjiga • 260 pogl.
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Matej", "Marko", "Luka", "Jovan", "Dela apostolska", "Rimljanima", "Korinćanima", "Jevrejima", "Otkrivenje"].map((bk) => (
                  <span key={bk} className={`text-[11px] px-2 py-0.5 rounded border ${
                    isLightTheme 
                      ? "bg-slate-50 border-slate-200 text-slate-700" 
                      : "bg-[#202020] border-white/5 text-[#a1a1aa]"
                  }`}>
                    {bk}
                  </span>
                ))}
                <span className={`text-[11px] px-2 py-0.5 rounded ${
                  isLightTheme ? "text-slate-400" : "text-[#71717a]"
                }`}>
                  +18 {lang === "sr" ? "ostalih" : "more"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
