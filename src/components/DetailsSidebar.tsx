/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { 
  X, 
  Calendar, 
  ExternalLink, 
  Loader2, 
  Link2, 
  Crown, 
  Landmark, 
  Edit3, 
  Check, 
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { TimelineItem } from "../types";
import { formatRange } from "../utils";
import { SKINS_CONFIG } from "./SettingsModal";

interface DetailsSidebarProps {
  item: TimelineItem | null;
  onClose: () => void;
  onUpdateItem?: (updated: TimelineItem) => void;
  theme: "dark" | "light";
  skin: string;
  lang: "sr" | "en";
}

export function DetailsSidebar({
  item,
  onClose,
  onUpdateItem,
  theme,
  skin,
  lang,
}: DetailsSidebarProps) {
  const isLightTheme = theme === "light";
  const isEn = lang === "en";
  const skinInfo = (SKINS_CONFIG as any)[skin] || SKINS_CONFIG.hronika;
  const cancelBtnClass = isLightTheme 
    ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#44403C] hover:bg-[#EFECE5]" 
    : "bg-[#262827] border-[#383A39] text-[#F0EFED] hover:bg-[#383A39]";

  // Inline editing states
  const [isEditingRuler, setIsEditingRuler] = useState(false);
  const [rulerInput, setRulerInput] = useState(item?.ruler || "");

  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState(item?.capital || "");

  const [isEditingDescAndLink, setIsEditingDescAndLink] = useState(false);
  const [descInput, setDescInput] = useState(item?.description || "");
  const [linkInput, setLinkInput] = useState(item?.sourceUrl || "");

  // Text extraction from link state
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractError, setExtractError] = useState("");

  const [linkPreview, setLinkPreview] = useState<{
    title?: string;
    description?: string;
    contentSnippet?: string;
    image?: string;
    loading?: boolean;
  } | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (item) {
      setRulerInput(item.ruler || "");
      setCapitalInput(item.capital || "");
      setDescInput(item.description || "");
      setLinkInput(item.sourceUrl || "");
      setIsEditingRuler(false);
      setIsEditingCapital(false);
      setIsEditingDescAndLink(false);
      setExtractError("");
    }
  }, [item]);

  const handleExtractTextFromLink = async () => {
    const urlToFetch = linkInput.trim() || item?.sourceUrl?.trim();
    if (!urlToFetch) return;
    setIsExtractingText(true);
    setExtractError("");
    try {
      const res = await fetch(`/api/link_preview?url=${encodeURIComponent(urlToFetch)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      const generated = data.contentSnippet || data.description || data.title;
      if (generated) {
        setDescInput(generated);
      } else {
        setExtractError(isEn ? "No text found on this page." : "Nije pronađen tekst na ovoj stranici.");
      }
    } catch (err) {
      setExtractError(isEn ? "Failed to extract text from link." : "Greška pri preuzimanju teksta sa linka.");
    } finally {
      setIsExtractingText(false);
    }
  };

  useEffect(() => {
    if (!item || !item.sourceUrl) {
      setLinkPreview(null);
      return;
    }

    const url = item.sourceUrl;
    setLinkPreview({ loading: true });
    let active = true;

    fetch(`/api/link_preview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setLinkPreview({ ...data, loading: false });
      })
      .catch((err) => {
        if (!active) return;
        console.error("Greška pri učitavanju pregleda linka:", err);
        setLinkPreview({ loading: false });
      });

    return () => {
      active = false;
    };
  }, [item?.sourceUrl]);

  if (!item) return null;

  const handleSaveRuler = () => {
    if (!onUpdateItem) return;
    const trimmed = rulerInput.trim();
    onUpdateItem({
      ...item,
      ruler: trimmed || undefined,
    });
    setIsEditingRuler(false);
  };

  const handleSaveCapital = () => {
    if (!onUpdateItem) return;
    const trimmed = capitalInput.trim();
    onUpdateItem({
      ...item,
      capital: trimmed || undefined,
    });
    setIsEditingCapital(false);
  };

  const handleSaveDescAndLink = () => {
    if (!onUpdateItem) return;
    const trimmedDesc = descInput.trim();
    const trimmedLink = linkInput.trim();
    onUpdateItem({
      ...item,
      description: trimmedDesc,
      sourceUrl: trimmedLink || undefined,
    });
    setIsEditingDescAndLink(false);
  };

  const rangeString = formatRange(
    item.startYear,
    item.startMonth,
    item.endYear,
    item.endMonth,
    item.isApproximate,
    item.endApproximate,
    false,
    lang
  );

  return (
    <div
      className={`details-sidebar-panel border-l flex flex-col h-full transition-all duration-300 z-30 shadow-2xl shrink-0 w-80 relative ${
        isLightTheme 
          ? "bg-slate-50 border-slate-200 text-slate-800" 
          : "bg-[#0f0f12] border-slate-800 text-slate-200"
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${
        isLightTheme ? "bg-slate-100/80 border-slate-200" : "bg-[#0d0d10] border-slate-800"
      }`}>
        <div className="flex flex-col min-w-0 flex-1 mr-2">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
            {isEn ? "Event Details" : "Detalji Događaja"}
          </span>
          <h2 className="font-black text-sm truncate leading-tight mt-0.5" style={{ color: item.color || skinInfo.primary }}>
            {item.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg border transition cursor-pointer hover:scale-105 ${
            isLightTheme 
              ? "bg-slate-50 border-slate-200 hover:bg-slate-250 text-slate-700" 
              : "bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400"
          }`}
          id="btn_close_details_sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Years Section */}
        <div className={`p-3 rounded-lg border flex flex-col gap-1 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-850"
        }`}>
          <span className={`text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-1 ${
            isLightTheme ? "text-slate-500" : "text-slate-400"
          }`}>
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            {isEn ? "Time Period" : "Vremenski period"}
          </span>
          <span className="text-xs font-black font-mono">
            {rangeString}
          </span>
        </div>

        {/* VLADAR (Ruler) - EDITABLE */}
        <div className={`p-3 rounded-lg border space-y-1.5 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-850"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-1 text-amber-500`}>
              <Crown className="w-3.5 h-3.5" />
              {isEn ? "Ruler:" : "Vladar:"}
            </span>
            {onUpdateItem && !isEditingRuler && (
              <button
                onClick={() => setIsEditingRuler(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEn ? "Edit" : "Uredi"}</span>
              </button>
            )}
          </div>

          {isEditingRuler ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={rulerInput}
                onChange={(e) => setRulerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRuler();
                  if (e.key === "Escape") setIsEditingRuler(false);
                }}
                placeholder={isEn ? "e.g. Nebuchadnezzar II" : "npr. Nabuhodonosor II"}
                autoFocus
                className={`flex-1 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
              <button
                onClick={handleSaveRuler}
                className="p-1 rounded bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingRuler(false)}
                className={`p-1 rounded border transition cursor-pointer ${cancelBtnClass}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => onUpdateItem && setIsEditingRuler(true)}
              className="font-semibold text-xs cursor-pointer hover:text-amber-400 transition"
              title={isEn ? "Click to edit ruler" : "Kliknite da upišete vladara"}
            >
              {item.ruler ? (
                <span>{item.ruler}</span>
              ) : (
                <span className="text-slate-500 italic">
                  {isEn ? "Click to enter ruler..." : "Kliknite da upišete vladara..."}
                </span>
              )}
            </div>
          )}
        </div>

        {/* PRESTONICA (Capital) - EDITABLE */}
        <div className={`p-3 rounded-lg border space-y-1.5 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-850"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-1 text-[#D96B27]`}>
              <Landmark className="w-3.5 h-3.5" />
              {isEn ? "Capital:" : "Prestonica:"}
            </span>
            {onUpdateItem && !isEditingCapital && (
              <button
                onClick={() => setIsEditingCapital(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEn ? "Edit" : "Uredi"}</span>
              </button>
            )}
          </div>

          {isEditingCapital ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={capitalInput}
                onChange={(e) => setCapitalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCapital();
                  if (e.key === "Escape") setIsEditingCapital(false);
                }}
                placeholder={isEn ? "e.g. Babylon" : "npr. Vavilon"}
                autoFocus
                className={`flex-1 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
              <button
                onClick={handleSaveCapital}
                className="p-1 rounded bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingCapital(false)}
                className={`p-1 rounded border transition cursor-pointer ${cancelBtnClass}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => onUpdateItem && setIsEditingCapital(true)}
              className="font-semibold text-xs cursor-pointer hover:text-amber-400 transition"
              title={isEn ? "Click to edit capital" : "Kliknite da upišete prestonicu"}
            >
              {item.capital ? (
                <span>{item.capital}</span>
              ) : (
                <span className="text-slate-500 italic">
                  {isEn ? "Click to enter capital..." : "Kliknite da upišete prestonicu..."}
                </span>
              )}
            </div>
          )}
        </div>

        {/* OPIS / LINK - EDITABLE & LOADS FROM LINK */}
        <div className={`p-3 rounded-lg border space-y-2 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-850"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-1 text-amber-500`}>
              <FileText className="w-3.5 h-3.5" />
              {isEn ? "Description / Link:" : "Opis / Link:"}
            </span>
            {onUpdateItem && !isEditingDescAndLink && (
              <button
                onClick={() => setIsEditingDescAndLink(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEn ? "Edit" : "Uredi"}</span>
              </button>
            )}
          </div>

          {isEditingDescAndLink ? (
            <div className="space-y-2 mt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  {isEn ? "Description Text:" : "Tekst opisa:"}
                </label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  placeholder={isEn ? "Enter your description..." : "Upišite opis..."}
                  className={`w-full p-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  {isEn ? "Website Link:" : "Link sa sajta:"}
                </label>
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://wol.jw.org/..."
                  className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                  }`}
                />

                {/* Button to generate description using text from link */}
                {linkInput.trim() && (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleExtractTextFromLink}
                      disabled={isExtractingText}
                      className="w-full py-1.5 px-2 rounded bg-[#D96B27]/15 hover:bg-[#D96B27] text-[#D96B27] hover:text-white font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#D96B27]/30"
                    >
                      {isExtractingText ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{isEn ? "Extracting article text from link..." : "Preuzimanje teksta sa linka..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isEn ? "Generate description from link text" : "Generiši opis koristeći tekst sa linka"}</span>
                        </>
                      )}
                    </button>
                    {extractError && (
                      <p className="text-[10px] text-red-400 mt-1">{extractError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setIsEditingDescAndLink(false)}
                  className={`px-2 py-0.5 rounded text-xs border transition cursor-pointer ${cancelBtnClass}`}
                >
                  {isEn ? "Cancel" : "Otkaži"}
                </button>
                <button
                  onClick={handleSaveDescAndLink}
                  className="px-2.5 py-0.5 rounded bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEn ? "Save" : "Sačuvaj"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {item.description ? (
                <p
                  onClick={() => onUpdateItem && setIsEditingDescAndLink(true)}
                  className="text-xs leading-relaxed cursor-pointer hover:opacity-90 whitespace-pre-line"
                >
                  {item.description}
                </p>
              ) : !item.sourceUrl ? (
                <p
                  onClick={() => onUpdateItem && setIsEditingDescAndLink(true)}
                  className="text-slate-500 italic text-xs cursor-pointer hover:text-amber-400"
                >
                  {isEn ? "Click to write description or add link..." : "Kliknite da napišete opis ili dodate link..."}
                </p>
              ) : null}

              {item.sourceUrl && (
                <div className={`p-2.5 rounded-lg border text-xs space-y-2 mt-2 ${
                  isLightTheme ? "bg-slate-50 border-slate-300" : "bg-slate-950 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between gap-1 border-b pb-1.5 border-slate-700/30">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 truncate">
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.sourceUrl}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onUpdateItem && (
                        <button
                          onClick={() => {
                            setIsEditingDescAndLink(true);
                            handleExtractTextFromLink();
                          }}
                          className="px-1.5 py-0.5 rounded bg-[#D96B27]/15 text-[#D96B27] hover:bg-[#D96B27] hover:text-white font-semibold text-[10px] transition flex items-center gap-1 cursor-pointer border border-[#D96B27]/30"
                          title={isEn ? "Generate description from link text" : "Generiši opis koristeći tekst sa linka"}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isEn ? "Generate desc" : "Generiši opis"}</span>
                        </button>
                      )}

                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-[#D96B27]/15 text-[#D96B27] hover:bg-[#D96B27] hover:text-white font-semibold text-[10px] transition shrink-0 flex items-center gap-1 border border-[#D96B27]/30"
                      >
                        <span>{isEn ? "Open" : "Otvori link"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {linkPreview?.loading ? (
                    <div className="flex items-center gap-2 py-2 text-slate-400 text-[11px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>{isEn ? "Loading link content..." : "Učitavanje sadržaja sa linka..."}</span>
                    </div>
                  ) : linkPreview ? (
                    <div className="space-y-1">
                      {linkPreview.title && (
                        <h4 className="font-bold text-xs" style={{ color: skinInfo.primary }}>
                          {linkPreview.title}
                        </h4>
                      )}
                      {linkPreview.description && (
                        <p className="text-[11px] leading-relaxed opacity-85">
                          {linkPreview.description}
                        </p>
                      )}
                      {linkPreview.contentSnippet && (
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] leading-relaxed opacity-90 whitespace-pre-line font-serif">
                          {linkPreview.contentSnippet}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Toggle Embedded Reader */}
                  <div className="pt-1">
                    <button
                      onClick={() => setShowIframe(!showIframe)}
                      className="text-[10px] text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      {showIframe ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>{isEn ? "Hide page reader" : "Sakrij prikaz stranice"}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>{isEn ? "Show full page reader" : "Prikaži celu stranicu"}</span>
                        </>
                      )}
                    </button>

                    {showIframe && (
                      <div className="mt-2 h-64 rounded-lg overflow-hidden border border-slate-700 bg-white">
                        <iframe
                          src={item.sourceUrl}
                          title="Page Reader"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
