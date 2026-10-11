/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink, 
  Maximize2, 
  BookOpen, 
  Map as MapIcon, 
  Download,
  Layers,
  ChevronRight,
  Pin
} from "lucide-react";
import { WOL_BIBLE_MAPS, WolMapInfo } from "../historicalEmpires";

interface WolMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  initialMapId?: number;
  onPinPipMap?: (map: WolMapInfo) => void;
  pinnedMapId?: number | null;
}

export const WolMapModal: React.FC<WolMapModalProps> = ({
  isOpen,
  onClose,
  lang = "sr",
  initialMapId,
  onPinPipMap,
  pinnedMapId
}) => {
  const isEn = lang === "en";

  // Find initial map or default to map 1 (Babylon/Assyria)
  const [selectedMap, setSelectedMap] = useState<WolMapInfo>(() => {
    if (initialMapId) {
      const found = WOL_BIBLE_MAPS.find((m) => m.id === initialMapId);
      if (found) return found;
    }
    return WOL_BIBLE_MAPS[0];
  });

  // Sync with initialMapId if it changes
  React.useEffect(() => {
    if (initialMapId) {
      const found = WOL_BIBLE_MAPS.find((m) => m.id === initialMapId);
      if (found) setSelectedMap(found);
    }
  }, [initialMapId]);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [imageLoading, setImageLoading] = useState(true);

  // Reset zoom on map switch
  const handleSelectMap = (map: WolMapInfo) => {
    setSelectedMap(map);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setImageLoading(true);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 0.7);
      if (next <= 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTranslate({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (!isOpen) return null;

  const imageUrl = `/api/wol_map?id=${selectedMap.id}`;
  const directWolUrl = isEn ? selectedMap.docUrlEn : selectedMap.docUrlSr;
  const isPinned = pinnedMapId === selectedMap.id;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl overflow-hidden border shadow-2xl bg-slate-900 border-slate-700 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1F2120] border-b border-[#383A39]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D96B27]/15 border border-[#D96B27]/40 flex items-center justify-center text-[#E8702A]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F0EFED] flex items-center gap-1.5">
                  <span>{isEn ? "Authentic Maps from wol.jw.org" : "Zvanične biblijske karte sa wol.jw.org"}</span>
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#D96B27]/15 text-[#E8702A] border border-[#D96B27]/30">
                  JW.ORG
                </span>
              </div>
              <p className="text-[11px] text-[#8E908B]">
                {isEn 
                  ? "From 'See the Good Land' (gl) and Appendix B9 — World Powers in Bible Prophecy" 
                  : "Iz publikacije „Pogledajmo dobru zemlju“ (gl) i Dodatka B9 — Svetske sile u Danilovom proročanstvu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPinPipMap && (
              <button
                onClick={() => onPinPipMap(selectedMap)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isPinned 
                    ? "bg-[#1E443A] text-white border-[#28594D] font-bold" 
                    : "bg-[#262827] hover:bg-[#333534] text-[#F0EFED] border-[#383A39]"
                }`}
                title={isEn ? "Float this map over interactive Leaflet view" : "Zakači ovu mapu kao plutajući prikaz preko Leaflet mape"}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
                <span className="hidden md:inline">{isPinned ? (isEn ? "Floating Pinned" : "Zakačeno na mapi") : (isEn ? "Float on Map (PiP)" : "Prikaži na mapi")}</span>
              </button>
            )}

            <a
              href={directWolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#1E443A] hover:bg-[#255246] text-white border border-[#3E927B]/40 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#74BAA0]" />
              <span className="hidden sm:inline">wol.jw.org</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Selector Strip */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#181918] border-b border-[#383A39] overflow-x-auto no-scrollbar">
          {WOL_BIBLE_MAPS.map((map) => {
            const isSelected = selectedMap.id === map.id;
            return (
              <button
                key={map.id}
                onClick={() => handleSelectMap(map)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#1E443A] text-white border-[#28594D] font-bold shadow-md shadow-[#1E443A]/20"
                    : "bg-[#262827] hover:bg-[#333534] text-[#F0EFED] border-[#383A39]"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{isEn ? map.titleEn : map.titleSr}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Image Canvas & Viewer */}
        <div 
          className="relative flex-1 bg-black/60 overflow-hidden flex items-center justify-center select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
        >
          {imageLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 z-10">
              <div className="w-8 h-8 border-3 border-[#D96B27] border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-2 text-xs text-slate-400 font-medium">
                {isEn ? "Loading map from wol.jw.org..." : "Učitavam originalnu mapu sa wol.jw.org..."}
              </span>
            </div>
          )}

          <div
            className="transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center p-2"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            }}
          >
            <img
              src={imageUrl}
              alt={isEn ? selectedMap.titleEn : selectedMap.titleSr}
              className="max-w-full max-h-[64vh] object-contain rounded-lg shadow-2xl border border-slate-800 pointer-events-none"
              onLoad={() => setImageLoading(false)}
            />
          </div>

          {/* Floating Zoom & Control Toolbar */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl z-20">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer"
              title={isEn ? "Zoom in" : "Uvećaj"}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer"
              title={isEn ? "Zoom out" : "Umanji"}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer"
              title={isEn ? "Reset view" : "Resetuj prikaz"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-0.5" />
            <a
              href={imageUrl}
              download={`wol-map-${selectedMap.code}.jpg`}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition cursor-pointer flex items-center"
              title={isEn ? "Download image" : "Preuzmi mapu"}
            >
              <Download className="w-4 h-4" />
            </a>
            <span className="px-1.5 text-[11px] font-mono text-slate-400">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        {/* Modal Footer / Detailed Explanation */}
        <div className="px-4 py-3 bg-[#1F2120] border-t border-[#383A39] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#E8702A] text-sm">
                {isEn ? selectedMap.titleEn : selectedMap.titleSr}
              </h4>
              <span className="text-[11px] text-[#8E908B] font-mono">
                ({isEn ? selectedMap.publicationEn : selectedMap.publicationSr})
              </span>
            </div>
            <p className="text-[#F0EFED] leading-relaxed max-w-4xl text-[11px] sm:text-xs">
              {isEn ? selectedMap.descriptionEn : selectedMap.descriptionSr}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <a
              href={directWolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D96B27] text-white hover:bg-[#C05A1C] shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEn ? "Study on wol.jw.org" : "Čitaj na wol.jw.org"}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
