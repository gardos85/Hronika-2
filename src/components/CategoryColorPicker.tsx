import React, { useState, useRef, useEffect, useCallback } from "react";
import { Pipette, Check, X, Palette, Sliders, ChevronDown } from "lucide-react";

// --- Color Conversion Utilities ---
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length !== 6) return { r: 16, g: 185, b: 129 }; // Fallback emerald
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 16, g: 185, b: 129 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v || 0)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function hsvToRgb(h: number, s: number, v: number) {
  h = (((h % 360) + 360) % 360) / 360;
  s /= 100;
  v /= 100;
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number) {
  h = (((h % 360) + 360) % 360) / 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export interface CategoryColorPickerProps {
  color: string;
  onChangeColor: (newHex: string) => void;
  onClose: () => void;
  presets: string[];
  isLightTheme?: boolean;
  lang?: "sr" | "en";
}

export function CategoryColorPicker({
  color,
  onChangeColor,
  onClose,
  presets,
  isLightTheme = false,
  lang = "sr",
}: CategoryColorPickerProps) {
  const [formatMode, setFormatMode] = useState<"HEX" | "RGB" | "HSL">("HEX");
  
  // Current RGB state derived from `color`
  const rgb = hexToRgb(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 2D Saturation / Value Box Drag Handler
  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);

  const handleSatValMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);

      const newRgb = hsvToRgb(hsv.h, s, v);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChangeColor(newHex);
    },
    [hsv.h, onChangeColor]
  );

  const handleSatValStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingSatVal.current = true;
    handleSatValMove(e.nativeEvent);
  };

  // 1D Hue Slider Drag Handler
  const hueRef = useRef<HTMLDivElement>(null);
  const isDraggingHue = useRef(false);

  const handleHueMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = Math.round((x / rect.width) * 360);

      const newRgb = hsvToRgb(h, hsv.s, hsv.v);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChangeColor(newHex);
    },
    [hsv.s, hsv.v, onChangeColor]
  );

  const handleHueStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingHue.current = true;
    handleHueMove(e.nativeEvent);
  };

  // Global Mouse / Touch Move & Up Listeners
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingSatVal.current) handleSatValMove(e);
      if (isDraggingHue.current) handleHueMove(e);
    };

    const handlePointerUp = () => {
      isDraggingSatVal.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handleSatValMove, handleHueMove]);

  // Eyedropper API
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  const handleEyedropper = async () => {
    if (hasEyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          onChangeColor(result.sRGBHex.toUpperCase());
        }
      } catch (_) {
        // User cancelled or error
      }
    }
  };

  return (
    <div
      className={`mt-1.5 p-3 rounded-2xl border flex flex-col gap-3 animate-in slide-in-from-top-1 duration-150 shadow-2xl ${
        isLightTheme
          ? "bg-white border-slate-200/90 shadow-slate-300/40 text-slate-800"
          : "bg-[#0b0f19] border-slate-800/90 shadow-black/80 text-slate-200"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* --- Popover Header --- */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-black/20 shadow-xs shrink-0 transition-colors"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            {lang === "sr" ? "Boja kategorije" : "Category Color"}
          </span>
        </div>
        <button
          type="button"
          className="p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          onClick={onClose}
          title={lang === "sr" ? "Zatvori" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* --- 1. OSNOVNE BOJE (Preset Swatches) --- */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {lang === "sr" ? "Osnovne boje:" : "Preset Colors:"}
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {presets.map((presetHex) => {
            const isSelected = color.toLowerCase() === presetHex.toLowerCase();
            return (
              <button
                key={presetHex}
                type="button"
                onClick={() => onChangeColor(presetHex)}
                className={`w-6.5 h-6.5 rounded-lg border border-black/15 hover:scale-110 active:scale-95 transition-all relative flex items-center justify-center cursor-pointer shadow-2xs ${
                  isSelected ? "ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-[#0b0f19]" : ""
                }`}
                style={{ backgroundColor: presetHex }}
                title={presetHex}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 2. ADVANCED COLOR PICKER AREA (2D Sat/Val Canvas Box + Hue Slider) --- */}
      <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {lang === "sr" ? "Birač boje:" : "Color Picker:"}
        </span>

        {/* 2D Saturation / Value Gradient Box */}
        <div
          ref={satValRef}
          onMouseDown={handleSatValStart}
          onTouchStart={handleSatValStart}
          className="relative w-full h-32 rounded-xl overflow-hidden cursor-crosshair select-none border border-black/20 shadow-inner"
          style={{
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            backgroundImage: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, transparent)
            `,
          }}
        >
          {/* Draggable Selector Handle */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform scale-100"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Hue Slider Strip + Eyedropper Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Eyedropper Button */}
          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleEyedropper}
              className={`p-2 rounded-xl border transition cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                isLightTheme
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300"
              }`}
              title={lang === "sr" ? "Pipeta (izaberi sa ekrana)" : "Eyedropper (pick from screen)"}
            >
              <Pipette className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Hue Rainbow Slider Strip */}
          <div
            ref={hueRef}
            onMouseDown={handleHueStart}
            onTouchStart={handleHueStart}
            className="relative flex-1 h-3.5 rounded-full cursor-pointer select-none border border-black/20 shadow-inner"
            style={{
              background: `linear-gradient(to right, 
                #ff0000 0%, #ffff00 17%, #00ff00 33%, 
                #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
            }}
          >
            {/* Hue Handle */}
            <div
              className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* --- 3. FORMAT TOGGLE & INPUTS (HEX / RGB / HSL) --- */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {lang === "sr" ? "Prilagođena boja:" : "Custom Color:"}
          </span>

          {/* Mode Switcher Pills (HEX | RGB | HSL) */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300/50 dark:border-slate-800">
            {(["HEX", "RGB", "HSL"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFormatMode(m)}
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition cursor-pointer ${
                  formatMode === m
                    ? "bg-emerald-500 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields depending on formatMode */}
        {formatMode === "HEX" && (
          <div className="flex items-center gap-2">
            {/* Swatch Button triggers native color picker */}
            <div
              className="relative w-8 h-8 rounded-xl border border-black/20 overflow-hidden cursor-pointer shrink-0 shadow-2xs hover:scale-105 transition-transform flex items-center justify-center group/swatch"
              style={{ backgroundColor: color }}
              title={lang === "sr" ? "Klikni za sistemski birač boja..." : "Click for system color picker..."}
            >
              <input
                type="color"
                value={color.startsWith("#") && color.length === 7 ? color : "#10B981"}
                onChange={(e) => onChangeColor(e.target.value.toUpperCase())}
                className="absolute inset-0 opacity-0 w-12 h-12 -left-2 -top-2 cursor-pointer"
              />
              <Palette className="w-3.5 h-3.5 text-white/80 opacity-0 group-hover/swatch:opacity-100 transition-opacity drop-shadow-xs" />
            </div>

            {/* HEX Input */}
            <div
              className={`flex-1 flex items-center rounded-xl border px-2.5 py-1.5 transition-colors ${
                isLightTheme
                  ? "bg-slate-50 border-slate-300 focus-within:border-emerald-500"
                  : "bg-slate-900 border-slate-800 focus-within:border-emerald-500"
              }`}
            >
              <span className="text-slate-400 text-xs font-mono select-none mr-1">#</span>
              <input
                type="text"
                value={color.startsWith("#") ? color.slice(1) : color}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                  onChangeColor(`#${raw}`);
                }}
                placeholder="10B981"
                maxLength={6}
                className="w-full bg-transparent text-xs font-mono font-bold focus:outline-none uppercase text-slate-800 dark:text-slate-200 tracking-wider"
              />
            </div>
          </div>
        )}

        {formatMode === "RGB" && (
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">R</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => {
                  const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                  onChangeColor(rgbToHex(val, rgb.g, rgb.b));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">G</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => {
                  const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                  onChangeColor(rgbToHex(rgb.r, val, rgb.b));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">B</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => {
                  const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                  onChangeColor(rgbToHex(rgb.r, rgb.g, val));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
          </div>
        )}

        {formatMode === "HSL" && (
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">H (°)</span>
              <input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => {
                  const val = Math.min(360, Math.max(0, parseInt(e.target.value) || 0));
                  const newRgb = hslToRgb(val, hsl.s, hsl.l);
                  onChangeColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">S (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  const newRgb = hslToRgb(hsl.h, val, hsl.l);
                  onChangeColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase px-1">L (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  const newRgb = hslToRgb(hsl.h, hsl.s, val);
                  onChangeColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                }}
                className={`w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:border-emerald-500 text-center ${
                  isLightTheme ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
