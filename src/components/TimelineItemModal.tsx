import React, { useState, useEffect } from "react";
import { TimelineItem, TagConfig, NotionColor } from "../types";
import { 
  X, 
  Save, 
  Trash2, 
  MapPin, 
  Crown, 
  Landmark, 
  Globe2, 
  PenTool, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Link2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Loader2 
} from "lucide-react";
import { LangType, getAppTranslations } from "../translations";
import { getTranslatedGroup } from "../utils";
import { HISTORICAL_GEO_PRESETS } from "../geoData";
import { TagManagerPicker } from "./TagManagerPicker";

interface TimelineItemModalProps {
  item: TimelineItem | null; // Null means "Create New"
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TimelineItem) => void;
  onDelete?: (id: string) => void;
  existingGroups: string[];
  defaultGroup?: string;
  availableTags?: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  theme?: "dark" | "light";
  skin?: string;
  lang: LangType;
}

export type EventCategoryType = 
  | "SVETSKA_SILA" 
  | "VLADAR" 
  | "SVETO_PISMO" 
  | "LICNOST" 
  | "BIBLIJSKI_DOGADJAJ"
  | "SVETSKI_DOGADJAJ"
  | "OTHER";

export function detectCategoryFromGroupName(groupName: string): EventCategoryType {
  const grp = (groupName || "").toLowerCase().trim();
  if (grp.includes("svetske sil") || grp.includes("svetska sila") || grp.includes("world power")) {
    return "SVETSKA_SILA";
  }
  if (grp.includes("vladar") || grp.includes("ruler") || grp.includes("kralj") || grp.includes("king")) {
    return "VLADAR";
  }
  if (
    grp.includes("sveto pismo") || 
    grp.includes("biblijsk") || 
    grp.includes("pismo") || 
    grp.includes("scripture") || 
    grp.includes("knjig")
  ) {
    return "SVETO_PISMO";
  }
  if (grp.includes("ličnost") || grp.includes("licnost") || grp.includes("person")) {
    return "LICNOST";
  }
  if (grp.includes("svetski") || grp.includes("world event")) {
    return "SVETSKI_DOGADJAJ";
  }
  if (grp.includes("biblijski") || grp.includes("bible event")) {
    return "BIBLIJSKI_DOGADJAJ";
  }
  return "OTHER";
}

const COLOR_PRESETS = [
  { value: "#D96B27", name: "terakota" },
  { value: "#1E443A", name: "šumski bor" },
  { value: "#3E7B5C", name: "mahovina" },
  { value: "#2D6A5D", name: "žalfija" },
  { value: "#C88A3B", name: "zlatna glina" },
  { value: "#A34836", name: "rđa / cigla" },
  { value: "#4A7A96", name: "rečni škriljac" },
  { value: "#6E4A35", name: "zemljana braon" },
  { value: "#5C6B37", name: "maslina" },
  { value: "#7B4B32", name: "kesten" },
  { value: "#262827", name: "topli ugalj" },
  { value: "#ECEBE6", name: "krečnjak" },
];

export function TimelineItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingGroups,
  defaultGroup,
  availableTags = [],
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  theme = "dark",
  skin = "hronika",
  lang
}: TimelineItemModalProps) {
  const t = getAppTranslations(lang);
  const isEn = lang === "en";
  const isLightTheme = theme === "light";

  const monthSeasonOptions = [
    { value: "", name: t.samoGodina },
    { value: "13", name: t.seasonSpring },
    { value: "14", name: t.seasonSummer },
    { value: "15", name: t.seasonAutumn },
    { value: "16", name: t.seasonWinter },
    { value: "__divider__", name: "────────────────", disabled: true },
    { value: "1", name: t.jan },
    { value: "2", name: t.feb },
    { value: "3", name: t.mar },
    { value: "4", name: t.apr },
    { value: "5", name: t.maj },
    { value: "6", name: t.jun },
    { value: "7", name: t.jul },
    { value: "8", name: t.avg },
    { value: "9", name: t.sep },
    { value: "10", name: t.okt },
    { value: "11", name: t.nov },
    { value: "12", name: t.dec },
  ];

  // Primary Fields
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);

  // Time & Type
  const [type, setType] = useState<"event" | "period">("event");
  const [eraStart, setEraStart] = useState<"BCE" | "CE">("BCE");
  const [rawStartYear, setRawStartYear] = useState<string>("500");
  const [isApproximate, setIsApproximate] = useState(false);
  const [startMonth, setStartMonth] = useState<number | "">("");

  const [eraEnd, setEraEnd] = useState<"BCE" | "CE">("BCE");
  const [rawEndYear, setRawEndYear] = useState<string>("400");
  const [endApproximate, setEndApproximate] = useState(false);
  const [endMonth, setEndMonth] = useState<number | "">("");

  // Category specific fields
  const [ruler, setRuler] = useState("");
  const [capital, setCapital] = useState("");
  const [empire, setEmpire] = useState("");
  const [writer, setWriter] = useState("");
  const [writingPlace, setWritingPlace] = useState("");
  const [writingCompleted, setWritingCompleted] = useState("");
  const [timeCovered, setTimeCovered] = useState("");
  const [place, setPlace] = useState("");

  // Media, Description & Tags
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Advanced section (Geo & Color)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [color, setColor] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isExtractingLink, setIsExtractingLink] = useState(false);

  // Detect current active category based on selected category (group)
  const activeGroupName = isAddingNewGroup ? newGroupName : group;
  const activeCategory = detectCategoryFromGroupName(activeGroupName);

  // Reset or fill form when modal opens or item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setGroup(item.group || "");
      setIsAddingNewGroup(false);

      setRuler(item.ruler || "");
      setCapital(item.capital || "");
      setEmpire(item.empire || "");
      setWriter(item.writer || "");
      setWritingPlace(item.writingPlace || "");
      setWritingCompleted(item.writingCompleted || "");
      setTimeCovered(item.timeCovered || "");
      setPlace(item.place || item.location?.name || "");

      if (item.location) {
        setLocationName(item.location.name || "");
        setLocationLat(item.location.lat !== undefined ? String(item.location.lat) : "");
        setLocationLng(item.location.lng !== undefined ? String(item.location.lng) : "");
      } else {
        setLocationName("");
        setLocationLat("");
        setLocationLng("");
      }

      // Start Year
      const sY = item.startYear;
      if (sY < 0) {
        setEraStart("BCE");
        setRawStartYear(String(Math.abs(sY)));
      } else {
        setEraStart("CE");
        setRawStartYear(String(sY));
      }
      setStartMonth(item.startMonth !== undefined ? item.startMonth : "");
      setIsApproximate(Boolean(item.isApproximate));

      // End Year (Period)
      if (typeof item.endYear === "number") {
        setType("period");
        const eY = item.endYear;
        if (eY < 0) {
          setEraEnd("BCE");
          setRawEndYear(String(Math.abs(eY)));
        } else {
          setEraEnd("CE");
          setRawEndYear(String(eY));
        }
        setEndMonth(item.endMonth !== undefined ? item.endMonth : "");
        setEndApproximate(Boolean(item.endApproximate));
      } else {
        setType("event");
        setRawEndYear("");
        setEndMonth("");
        setEndApproximate(false);
      }

      setColor(item.color || "");
      setSelectedTags(Array.isArray(item.tags) ? item.tags : []);
      setImage(item.image || "");
      setSourceUrl(item.sourceUrl || "");
      setErrorMsg("");
    } else {
      // Create New Item Defaults
      setTitle("");
      setDescription("");
      
      const safeGroup = typeof defaultGroup === "string" ? defaultGroup : undefined;
      if (safeGroup) {
        const lowerSafe = safeGroup.toLowerCase();
        const found = existingGroups.find(
          g => (typeof g === "string" && g.toLowerCase() === lowerSafe) || 
               (typeof getTranslatedGroup(g, lang) === "string" && getTranslatedGroup(g, lang).toLowerCase() === lowerSafe) ||
               (typeof getTranslatedGroup(g, "sr") === "string" && getTranslatedGroup(g, "sr").toLowerCase() === lowerSafe)
        );
        setGroup(found || safeGroup);
      } else if (existingGroups && existingGroups.length > 0) {
        setGroup(existingGroups[0]);
      } else {
        setGroup("Biblijski događaji");
      }
      setIsAddingNewGroup(false);
      setNewGroupName("");

      setType("event");
      setEraStart("BCE");
      setRawStartYear("500");
      setStartMonth("");
      setIsApproximate(false);

      setEraEnd("BCE");
      setRawEndYear("400");
      setEndMonth("");
      setEndApproximate(false);

      setRuler("");
      setCapital("");
      setEmpire("");
      setWriter("");
      setWritingPlace("");
      setWritingCompleted("");
      setTimeCovered("");
      setPlace("");
      
      setImage("");
      setSourceUrl("");
      setSelectedTags([]);
      
      setLocationName("");
      setLocationLat("");
      setLocationLng("");
      setColor("");
      setErrorMsg("");
    }
  }, [item, isOpen, defaultGroup]);

  if (!isOpen) return null;

  const handleGroupSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__new__") {
      setIsAddingNewGroup(true);
      setNewGroupName("");
    } else {
      setIsAddingNewGroup(false);
      setGroup(val);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(isEn ? "Image is too large. Maximum size is 2MB." : "Slika je prevelika. Maksimalna veličina je 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractTextFromLink = async () => {
    if (!sourceUrl.trim()) return;
    setIsExtractingLink(true);
    try {
      const resp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(sourceUrl.trim())}`);
      const data = await resp.json();
      if (data && data.contents) {
        const doc = new DOMParser().parseFromString(data.contents, "text/html");
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
        const paragraphs = Array.from(doc.querySelectorAll("article p, main p, #content p, .article p, p"))
          .map((p) => p.textContent?.trim() || "")
          .filter((t) => t.length > 50);

        let extracted = metaDesc || ogDesc || "";
        if (paragraphs.length > 0) {
          extracted = paragraphs.slice(0, 3).join("\n\n");
        }

        if (extracted) {
          setDescription((prev) => (prev.trim() ? `${prev}\n\n${extracted}` : extracted));
        }
      }
    } catch {
      // ignore
    } finally {
      setIsExtractingLink(false);
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg(isEn ? "Title is required." : (activeCategory === "SVETO_PISMO" ? "Naziv knjige je obavezan." : "Naziv je obavezan."));
      return;
    }

    const finalGroup = isAddingNewGroup ? newGroupName.trim() : group;
    if (!finalGroup) {
      setErrorMsg(isEn ? "Please select or create a category." : "Morate odabrati ili uneti kategoriju.");
      return;
    }

    const sYrParsed = parseInt(rawStartYear, 10);
    if (isNaN(sYrParsed) || sYrParsed < 0) {
      setErrorMsg(isEn ? "Start year must be a valid positive number." : "Godina mora biti pozitivan broj.");
      return;
    }
    const finalStartYear = eraStart === "BCE" ? -sYrParsed : sYrParsed;

    let finalEndYear: number | undefined = undefined;
    if (type === "period") {
      const eYrParsed = parseInt(rawEndYear, 10);
      if (isNaN(eYrParsed) || eYrParsed < 0) {
        setErrorMsg(isEn ? "End year is required for 'Period' type." : "Završna godina je obavezna za 'Period'.");
        return;
      }
      finalEndYear = eraEnd === "BCE" ? -eYrParsed : eYrParsed;

      const decStart = finalStartYear + (startMonth ? (Number(startMonth) - 1) / 12 : 0);
      const decEnd = finalEndYear + (endMonth ? (Number(endMonth) - 1) / 12 : 0);

      if (decEnd < decStart) {
        setErrorMsg(isEn ? "End date must be after start date." : "Završni datum mora biti posle početnog datuma.");
        return;
      }
    }

    const tags = selectedTags.map(t => t.trim()).filter(Boolean);

    let finalLocation = undefined;
    const parsedLat = parseFloat(locationLat);
    const parsedLng = parseFloat(locationLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      finalLocation = {
        name: locationName.trim() || place.trim() || capital.trim() || undefined,
        lat: parsedLat,
        lng: parsedLng
      };
    }

    const payload: TimelineItem = {
      id: item ? item.id : crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      group: finalGroup,
      startYear: finalStartYear,
      startMonth: startMonth !== "" ? Number(startMonth) : undefined,
      endYear: finalEndYear,
      endMonth: endMonth !== "" && type === "period" ? Number(endMonth) : undefined,
      color: color || undefined,
      tags,
      isApproximate: isApproximate ? true : undefined,
      endApproximate: (type === "period" && endApproximate) ? true : undefined,
      image: image.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      ruler: ruler.trim() || undefined,
      capital: capital.trim() || undefined,
      empire: empire.trim() || undefined,
      writer: writer.trim() || undefined,
      writingPlace: writingPlace.trim() || undefined,
      writingCompleted: writingCompleted.trim() || undefined,
      timeCovered: timeCovered.trim() || undefined,
      place: place.trim() || undefined,
      location: finalLocation
    };

    onSave(payload);
    onClose();
  };

  // Helper labels depending on category
  const titleLabel = activeCategory === "SVETO_PISMO" 
    ? (isEn ? "Book Title" : "Naziv knjige") 
    : (isEn ? "Title" : "Naziv");

  const titlePlaceholder = activeCategory === "SVETO_PISMO"
    ? (isEn ? "e.g. Genesis, Matthew, Revelation" : "npr. Postanak, Matej, Otkrivenje")
    : (isEn ? "e.g. Fall of Jerusalem, Medo-Persia, Times of the Gentiles" : "npr. pad Jerusalima, Medo-Persija, Vremena neznabožaca");

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-text cursor-pointer"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden cursor-default transition-colors duration-200 border ${
          isLightTheme 
            ? "bg-[#fafafa] border-[#1E443A] text-slate-900 shadow-slate-300/40"
            : "bg-[#0f0f12] border-[#1E443A] text-zinc-100 shadow-black/80"
        }`}
        id="modal_container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Header */}
        <div className={`px-5 py-3.5 flex items-center justify-between border-b transition-colors ${
          isLightTheme 
            ? "bg-white/80 border-[#1E443A]/30 text-slate-800" 
            : "bg-[#0d0d10] border-[#1E443A]/40 text-zinc-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
              isLightTheme
                ? "bg-[#1E443A]/15 text-[#1E443A]"
                : "bg-[#1E443A]/30 text-[#3E927B]"
            }`}>
              {item ? (isEn ? "Edit" : "Izmena") : (isEn ? "New" : "Novo")}
            </span>
            <h3 className={`font-bold text-sm tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {item ? (isEn ? `Edit "${item.title}"` : `Izmena: ${item.title}`) : (isEn ? "New Entry" : "Novi unos")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLightTheme 
                ? "hover:bg-slate-100 text-slate-400 hover:text-slate-800" 
                : "hover:bg-[#161619] text-[#ada9a3] hover:text-white"
            }`}
            id="modal_close_btn"
            title={isEn ? "Close" : "Zatvori"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={validateAndSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-[#A34836]/15 border border-[#A34836]/40 text-[#E08D79] font-semibold rounded-xl text-xs" id="form_error">
              {errorMsg}
            </div>
          )}

          {/* 1. POLJE: NAZIV (PRVO POLJE GORE) */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block">
              {titleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              autoFocus
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl focus:outline-none transition border ${
                isLightTheme
                  ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                  : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              }`}
              id="inp_title"
              required
            />
          </div>

          {/* 2. POLJE: KATEGORIJA (PREIMENOVANO SA "GRUPA" U "KATEGORIJA") */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block">
              {isEn ? "Category" : "Kategorija"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={isAddingNewGroup ? "__new__" : group}
                onChange={handleGroupSelectChange}
                className={`w-full px-3 py-2 text-xs font-medium rounded-xl focus:outline-none transition border ${
                  isLightTheme
                    ? "bg-white border-slate-200 text-slate-900 focus:border-amber-500"
                    : "bg-[#212228] border-zinc-800/70 text-zinc-100 focus:border-amber-500"
                }`}
                id="select_group"
              >
                {existingGroups.map((gName) => (
                  <option key={gName} value={gName}>
                    {getTranslatedGroup(gName, lang, t)}
                  </option>
                ))}
                <option value="__new__">{isEn ? "+ New category..." : "+ Nova kategorija..."}</option>
              </select>

              {isAddingNewGroup && (
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={isEn ? "Enter new category name..." : "Upišite naziv nove kategorije..."}
                  autoFocus
                  className={`w-full px-3 py-2 text-xs font-medium rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_new_group"
                />
              )}
            </div>
          </div>

          {/* 3. POLJE: VREME (PREBAČENO ISPOD KATEGORIJE) */}
          <div className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
            isLightTheme ? "bg-slate-100/70 border-slate-200/80" : "bg-[#1d1e24]/60 border-zinc-800/60"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block">
                {isEn ? "Time" : "Vreme"}
              </span>

              {/* Tasteri Vrsta unosa: "Događaj" i "Period" */}
              <div className={`p-0.5 rounded-lg flex items-center gap-0.5 border ${
                isLightTheme ? "bg-white border-slate-200" : "bg-[#131418] border-zinc-800/70"
              }`}>
                <button
                  type="button"
                  onClick={() => setType("event")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    type === "event"
                      ? "bg-[#1E443A] text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  id="btn_type_event"
                >
                  {isEn ? "Event" : "Događaj"}
                </button>
                <button
                  type="button"
                  onClick={() => setType("period")}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    type === "period"
                      ? "bg-[#1E443A] text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  id="btn_type_period"
                >
                  {isEn ? "Period" : "Period"}
                </button>
              </div>
            </div>

            {/* KARTICA: POČETAK (4 KOLONE: ERA, PRIBLIŽNO, GODINA, GOD. DOBA / MESEC) */}
            <div className={`p-3 rounded-xl border space-y-2.5 ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#18191f] border-zinc-800/70"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 border ${
                  isLightTheme
                    ? "bg-[#D96B27]/10 text-[#D96B27] border-[#D96B27]/20"
                    : "bg-[#D96B27]/15 text-[#E8702A] border-[#D96B27]/30"
                }`}>
                  <span>🌍</span>
                  <span>{isEn ? "Start" : "Početak"}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                {/* 1. Kolona: Era */}
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                    {isEn ? "Era" : "Era"}
                  </label>
                  <select
                    value={eraStart}
                    onChange={(e) => setEraStart(e.target.value as any)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                    }`}
                    id="select_era_start"
                  >
                    <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                    <option value="CE">{isEn ? "CE" : "n. e."}</option>
                  </select>
                </div>

                {/* 2. Kolona: Približno (o.) */}
                <div className="flex flex-col items-center justify-center h-full pb-1">
                  <label className="text-zinc-400 text-[10px] font-bold mb-1 block text-center">
                    {isEn ? "Approx." : "Približno"}
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer py-1 select-none">
                    <input
                      type="checkbox"
                      checked={isApproximate}
                      onChange={(e) => setIsApproximate(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 border-zinc-700"
                      id="chk_is_approximate"
                    />
                    <span className="font-extrabold text-xs text-zinc-200">o.</span>
                  </label>
                </div>

                {/* 3. Kolona: Godina */}
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                    {isEn ? "Year" : "Godina"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rawStartYear}
                    onChange={(e) => setRawStartYear(e.target.value)}
                    placeholder="500"
                    className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold focus:outline-none border ${
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                    }`}
                    id="inp_start_year"
                  />
                </div>

                {/* 4. Kolona: God. doba / mesec */}
                <div>
                  <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                    {isEn ? "Season / Month" : "God. doba / mesec"}
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value === "" ? "" : Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                    }`}
                    id="select_start_month"
                  >
                    {monthSeasonOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* KARTICA: KRAJ (AKO JE IZABRAN PERIOD) */}
            {type === "period" && (
              <div className={`p-3 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                isLightTheme ? "bg-white border-slate-200" : "bg-[#18191f] border-zinc-800/70"
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 border ${
                    isLightTheme
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    <span>🏁</span>
                    <span>{isEn ? "End" : "Kraj"}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                  {/* 1. Kolona: Era */}
                  <div>
                    <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                      {isEn ? "Era" : "Era"}
                    </label>
                    <select
                      value={eraEnd}
                      onChange={(e) => setEraEnd(e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                        isLightTheme
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                          : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                      }`}
                      id="select_era_end"
                    >
                      <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                      <option value="CE">{isEn ? "CE" : "n. e."}</option>
                    </select>
                  </div>

                  {/* 2. Kolona: Približno (o.) */}
                  <div className="flex flex-col items-center justify-center h-full pb-1">
                    <label className="text-zinc-400 text-[10px] font-bold mb-1 block text-center">
                      {isEn ? "Approx." : "Približno"}
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        checked={endApproximate}
                        onChange={(e) => setEndApproximate(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 border-zinc-700"
                        id="chk_end_approximate"
                      />
                      <span className="font-extrabold text-xs text-zinc-200">o.</span>
                    </label>
                  </div>

                  {/* 3. Kolona: Godina */}
                  <div>
                    <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                      {isEn ? "Year" : "Godina"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rawEndYear}
                      onChange={(e) => setRawEndYear(e.target.value)}
                      placeholder="400"
                      className={`w-full px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold focus:outline-none border ${
                        isLightTheme
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                          : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                      }`}
                      id="inp_end_year"
                    />
                  </div>

                  {/* 4. Kolona: God. doba / mesec */}
                  <div>
                    <label className="text-zinc-400 text-[10px] font-bold block mb-1">
                      {isEn ? "Season / Month" : "God. doba / mesec"}
                    </label>
                    <select
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value === "" ? "" : Number(e.target.value))}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                        isLightTheme
                          ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                          : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                      }`}
                      id="select_end_month"
                    >
                      {monthSeasonOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              4. KATEGORIJSKI SPECIFIČNA POLJA
             ======================================================== */}
          
          {/* KATEGORIJA: SVETSKA SILA */}
          {activeCategory === "SVETSKA_SILA" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "Ruler" : "Vladar"}</span>
                </label>
                <input
                  type="text"
                  value={ruler}
                  onChange={(e) => setRuler(e.target.value)}
                  placeholder={isEn ? "e.g. Nebuchadnezzar" : "npr. Navuhodonosor"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_ruler"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "Capital" : "Prestonica"}</span>
                </label>
                <input
                  type="text"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder={isEn ? "e.g. Babylon" : "npr. Vavilon"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_capital"
                />
              </div>
            </div>
          )}

          {/* KATEGORIJA: VLADARI */}
          {activeCategory === "VLADAR" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "World Power" : "Svetska sila"}</span>
                </label>
                <input
                  type="text"
                  value={empire}
                  onChange={(e) => setEmpire(e.target.value)}
                  placeholder={isEn ? "e.g. Assyria" : "npr. Asirija"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_empire"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "Capital" : "Prestonica"}</span>
                </label>
                <input
                  type="text"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder={isEn ? "e.g. Nineveh" : "npr. Niniva"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_capital"
                />
              </div>
            </div>
          )}

          {/* KATEGORIJA: LIČNOSTI */}
          {activeCategory === "LICNOST" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "World Power" : "Svetska sila"}</span>
                </label>
                <input
                  type="text"
                  value={empire}
                  onChange={(e) => setEmpire(e.target.value)}
                  placeholder={isEn ? "e.g. Assyria" : "npr. Asirija"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_empire"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "Capital" : "Prestonica"}</span>
                </label>
                <input
                  type="text"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder={isEn ? "e.g. Nineveh" : "npr. Niniva"}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_capital"
                />
              </div>
            </div>
          )}

          {/* KATEGORIJA: SVETO PISMO */}
          {activeCategory === "SVETO_PISMO" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? "Writer" : "Pisac"}</span>
                  </label>
                  <input
                    type="text"
                    value={writer}
                    onChange={(e) => setWriter(e.target.value)}
                    placeholder={isEn ? "e.g. Moses, Paul" : "npr. Mojsije, Pavle"}
                    className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                      isLightTheme
                        ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                        : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                    }`}
                    id="inp_writer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? "Writing Place" : "Mesto pisanja"}</span>
                  </label>
                  <input
                    type="text"
                    value={writingPlace}
                    onChange={(e) => setWritingPlace(e.target.value)}
                    placeholder={isEn ? "e.g. Wilderness, Rome" : "npr. Pustinja, Rim"}
                    className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                      isLightTheme
                        ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                        : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                    }`}
                    id="inp_writing_place"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? "Writing Completed" : "Pisanje završeno"}</span>
                  </label>
                  <input
                    type="text"
                    value={writingCompleted}
                    onChange={(e) => setWritingCompleted(e.target.value)}
                    placeholder={isEn ? "e.g. 1513 BCE" : "npr. 1513. pre n. e."}
                    className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                      isLightTheme
                        ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                        : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                    }`}
                    id="inp_writing_completed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? "Time Covered" : "Obuhvata vreme"}</span>
                  </label>
                  <input
                    type="text"
                    value={timeCovered}
                    onChange={(e) => setTimeCovered(e.target.value)}
                    placeholder={isEn ? "e.g. In the beginning to 1657 BCE" : "npr. „U početku“ do 1657. pre n. e."}
                    className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                      isLightTheme
                        ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                        : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                    }`}
                    id="inp_time_covered"
                  />
                </div>
              </div>
            </div>
          )}

          {/* KATEGORIJE: BIBLIJSKI DOGAĐAJI & SVETSKI DOGAĐAJI */}
          {(activeCategory === "BIBLIJSKI_DOGADJAJ" || activeCategory === "SVETSKI_DOGADJAJ" || activeCategory === "OTHER") && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? "Place / Location" : "Mesto"}</span>
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={
                  activeCategory === "SVETSKI_DOGADJAJ"
                    ? (isEn ? "e.g. Rome, Babylon, Athens" : "npr. Rim, Vavilon, Atina")
                    : (isEn ? "e.g. Jerusalem, Sinai, Ur" : "npr. Jerusalim, Sinaj, Ur")
                }
                className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none transition border ${
                  isLightTheme
                    ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                    : "bg-[#212228] border-zinc-800/70 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                }`}
                id="inp_place"
              />
            </div>
          )}

          {/* ========================================================
              5. POLJE: SLIKA (ZA SVE KATEGORIJE)
             ======================================================== */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? "Image" : "Slika"}</span>
            </label>
            <div className={`p-2.5 rounded-xl border transition-colors flex items-center gap-3 ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#1d1e24]/60 border-zinc-800/60"
            }`}>
              {image ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 shrink-0 bg-black/40">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute -top-1 -right-1 bg-[#A34836] hover:bg-[#8C3E2E] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                    title={isEn ? "Remove image" : "Ukloni sliku"}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-lg border border-dashed flex flex-col items-center justify-center shrink-0 ${
                  isLightTheme ? "border-slate-300 text-slate-400" : "border-zinc-800 text-zinc-600"
                }`}>
                  <ImageIcon className="w-4 h-4 opacity-60" />
                </div>
              )}

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={image.startsWith("data:") ? "" : image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder={isEn ? "Add image URL or upload image" : "Dodaj sliku ili adresu slike"}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#111216] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                />
                <label className={`px-2.5 py-1.5 text-[10.5px] font-bold rounded-lg border cursor-pointer transition shrink-0 ${
                  isLightTheme
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-[#141418] border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}>
                  <span>{isEn ? "Upload" : "Dodaj sliku"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================
              6. POLJE: OPIS / LINK (ZA SVE KATEGORIJE)
             ======================================================== */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? "Description / Link" : "Opis / link"}</span>
            </label>
            <div className={`p-3 rounded-xl border space-y-2.5 transition-colors ${
              isLightTheme ? "bg-white border-slate-200" : "bg-[#1d1e24]/60 border-zinc-800/60"
            }`}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isEn ? "Write text or add link..." : "Upiši tekst ili dodaj link"}
                rows={3}
                className={`w-full p-2.5 text-xs rounded-lg focus:outline-none transition border leading-relaxed ${
                  isLightTheme
                    ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                    : "bg-[#111216] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                }`}
                id="inp_description"
              />

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder={isEn ? "Website link (e.g. wol.jw.org)..." : "Link sa sajta (npr. https://wol.jw.org/...)"}
                  className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none transition border ${
                    isLightTheme
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                      : "bg-[#111216] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
                  }`}
                  id="inp_source_url"
                />
                {sourceUrl.trim() && (
                  <button
                    type="button"
                    onClick={handleExtractTextFromLink}
                    disabled={isExtractingLink}
                    className="px-2.5 py-1.5 rounded-lg bg-[#D96B27]/15 text-[#E8702A] hover:bg-[#D96B27] hover:text-white font-bold text-[10px] transition flex items-center gap-1 cursor-pointer shrink-0 border border-[#D96B27]/40"
                    title={isEn ? "Fetch text from link" : "Povuci tekst sa linka"}
                  >
                    {isExtractingLink ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{isEn ? "Fetch text" : "Povuci tekst"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              7. POLJE: TAGOVI (NOTION STYLE SA PLACEHOLDEROM)
             ======================================================== */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider block">
              {isEn ? "Tags" : "Tagovi"}
            </label>
            <TagManagerPicker
              selectedTagNames={selectedTags}
              onChange={setSelectedTags}
              availableTags={availableTags}
              onAddCustomTag={onAddCustomTag || (() => {})}
              onUpdateTag={onUpdateTag || (() => {})}
              onDeleteTag={onDeleteTag || (() => {})}
              theme={isLightTheme ? "light" : "dark"}
              lang={lang}
              placeholder={isEn ? "e.g. Medo-Persia, Rome" : "npr. Medo-Persija, Rim"}
            />
          </div>

          {/* ========================================================
              NAPREDNE OPCIJE (Lokacija na mapi & Boja)
             ======================================================== */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-semibold text-zinc-400 hover:text-amber-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isEn ? "Map coordinates & Custom color (optional)" : "Koordinate na mapi i boja (opciono)"}</span>
            </button>

            {showAdvanced && (
              <div className={`mt-2 p-3 rounded-xl border space-y-3 animate-in fade-in duration-150 ${
                isLightTheme ? "bg-white border-slate-200" : "bg-[#18191f] border-zinc-800/70"
              }`}>
                {/* Geografska lokacija */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>{t.geoSectionTitle}</span>
                    </label>
                    {(locationLat || locationLng || locationName) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationName("");
                          setLocationLat("");
                          setLocationLng("");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        {t.geoClearLocation}
                      </button>
                    )}
                  </div>

                  {/* Preset Selector */}
                  <div>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const p = HISTORICAL_GEO_PRESETS.find(pr => pr.nameSr === val || pr.nameEn === val);
                        if (p) {
                          setLocationName(lang === "en" ? p.nameEn : p.nameSr);
                          setLocationLat(String(p.lat));
                          setLocationLng(String(p.lng));
                        }
                      }}
                      defaultValue=""
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                        isLightTheme
                          ? "bg-white border-slate-200 text-slate-800 focus:border-amber-500"
                          : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                      }`}
                    >
                      <option value="">{t.geoPresetPlaceholder}</option>
                      {HISTORICAL_GEO_PRESETS.map((preset) => (
                        <option key={preset.nameSr} value={lang === "en" ? preset.nameEn : preset.nameSr}>
                          {lang === "en" ? preset.nameEn : preset.nameSr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder={isEn ? "Place name (e.g. Jerusalem)" : "Naziv mesta (npr. Jerusalim)"}
                        className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                          isLightTheme
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                            : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                        }`}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={locationLat}
                        onChange={(e) => setLocationLat(e.target.value)}
                        placeholder="Latitude (31.7683)"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                          isLightTheme
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                            : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                        }`}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={locationLng}
                        onChange={(e) => setLocationLng(e.target.value)}
                        placeholder="Longitude (35.2137)"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                          isLightTheme
                            ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                            : "bg-[#111216] border-zinc-800 text-zinc-100 focus:border-amber-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Boja */}
                <div className="pt-2 border-t border-zinc-800/60">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight block mb-1.5">
                    {isEn ? "Item Color" : "Boja stavke"}
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {COLOR_PRESETS.map((p) => {
                      const isSelected = color === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setColor(p.value)}
                          className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer"
                          style={{ backgroundColor: p.value }}
                          title={p.name}
                        >
                          {isSelected && (
                            <span className={`w-1.5 h-1.5 rounded-full ${p.value.toLowerCase() === "#ffffff" ? "bg-black" : "bg-white"}`} />
                          )}
                        </button>
                      );
                    })}
                    {color && (
                      <button
                        type="button"
                        onClick={() => setColor("")}
                        className="text-[10px] text-zinc-400 hover:text-zinc-200 underline ml-1 cursor-pointer"
                      >
                        {isEn ? "Reset" : "Poništi"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Minimalist Footer */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-between transition-colors ${
          isLightTheme 
            ? "bg-white border-[#1E443A]/30" 
            : "bg-[#0d0d10] border-[#1E443A]/40"
        }`}>
          <div>
            {item && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.confirmDeleteItem)) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className={`px-3 py-1.5 font-bold rounded-xl transition gap-1.5 flex items-center text-[11px] border cursor-pointer ${
                  isLightTheme
                    ? "bg-[#A34836]/10 hover:bg-[#A34836]/20 text-[#A34836] border-[#A34836]/30"
                    : "bg-[#A34836]/20 hover:bg-[#A34836]/35 text-[#E08D79] border-[#A34836]/40"
                }`}
                id="btn_delete_item"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? "Delete" : "Obriši"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className={`px-4 py-2 font-semibold rounded-xl transition text-xs cursor-pointer border ${
                isLightTheme
                  ? "bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#57534E] border-[#E5E0D8]"
                  : "bg-[#262827] hover:bg-[#383A39] text-[#F0EFED] border-[#383A39]"
              }`}
              id="btn_cancel_form"
            >
              {isEn ? "Cancel" : "Otkaži"}
            </button>
            <button
              onClick={validateAndSubmit}
              type="submit"
              className="px-5 py-2 font-bold rounded-xl transition flex items-center gap-1.5 text-xs bg-[#1E443A] hover:bg-[#255246] text-white border border-[#3E927B]/40 shadow-md cursor-pointer active:scale-95"
              id="btn_save_item"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEn ? "Save" : "Sačuvaj"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
