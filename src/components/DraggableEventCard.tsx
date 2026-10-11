/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  GripHorizontal, 
  Pin,
  Plus,
  Trash2,
  Crown, 
  Landmark, 
  ExternalLink, 
  Edit3, 
  Check, 
  Link2, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  MapPin,
  Flame,
  Sparkles,
  BookOpen,
  User,
  Globe,
  Globe2,
  PenTool,
  Clock,
  Image as ImageIcon,
  Tag as TagIcon,
  Upload,
  Pencil,
  Maximize2
} from "lucide-react";
import { TimelineItem, TagConfig, NotionColor } from "../types";
import { formatRange } from "../utils";
import { SKINS_CONFIG, getSkinCardBorderColor } from "./SettingsModal";
import { LangType } from "../translations";
import { motion } from "motion/react";
import { NotionTagPill } from "./TagManagerPicker";

export type EventCategoryType = 
  | "SVETSKA_SILA" 
  | "VLADAR" 
  | "SVETO_PISMO" 
  | "LICNOST" 
  | "BIBLIJSKI_DOGADJAJ"
  | "SVETSKI_DOGADJAJ";

export function formatWorldPowerDating(item: TimelineItem, lang: LangType): string {
  const isEn = lang === "en";
  const rangeStr = formatRange(
    item.startYear,
    item.startMonth,
    item.endYear,
    item.endMonth,
    item.isApproximate,
    item.endApproximate,
    false,
    lang
  );

  const absStart = Math.abs(item.startYear);
  const century = Math.ceil(absStart / 100);
  const romanCenturies = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
  const roman = romanCenturies[century - 1] || `${century}.`;
  const centuryStr = item.startYear < 0
    ? (isEn ? `(${roman} c. BCE)` : `(${roman} vek p.n.e.)`)
    : (isEn ? `(${roman} c. CE)` : `(${roman} vek n.e.)`);

  return `${rangeStr} ${centuryStr}`;
}

export function detectEventCategory(item: TimelineItem): EventCategoryType {
  const grp = (item.group || "").toLowerCase().trim();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const id = (item.id || "").toLowerCase();
  const title = (item.title || "").toLowerCase().trim();

  const knownEmpires = [
    "egipat", "asirija", "vavilon", "medo-persija", "grčka", "grcka", "rim", "anglo-amerika",
    "egypt", "assyria", "babylon", "medo-persia", "greece", "rome", "anglo-america"
  ];

  // 1. SVETSKA SILA
  if (
    id.startsWith("empire_") ||
    grp.includes("svetske sil") ||
    grp.includes("svetska sil") ||
    grp.includes("world power") ||
    tags.includes("empire") ||
    tags.includes("svetska-sila") ||
    tags.includes("svetske-sile") ||
    tags.includes("world-power") ||
    tags.includes("world-powers") ||
    knownEmpires.includes(title)
  ) {
    return "SVETSKA_SILA";
  }

  // 2. VLADAR
  if (
    grp.includes("vladar") ||
    grp.includes("ruler") ||
    tags.includes("vladar") ||
    tags.includes("ruler") ||
    tags.includes("king") ||
    tags.includes("kralj")
  ) {
    return "VLADAR";
  }

  // 3. SVETO PISMO
  if (
    grp.includes("sveto pismo") ||
    grp.includes("biblijske knjige") ||
    grp.includes("pismo") ||
    grp.includes("scripture") ||
    grp.includes("bible-book") ||
    tags.includes("knjiga") ||
    tags.includes("sveto pismo") ||
    tags.includes("bible-book")
  ) {
    return "SVETO_PISMO";
  }

  // 4. LIČNOST
  if (
    grp.includes("ličnost") ||
    grp.includes("licnost") ||
    grp.includes("person") ||
    tags.includes("ličnost") ||
    tags.includes("licnost") ||
    tags.includes("person")
  ) {
    return "LICNOST";
  }

  // 5. SVETSKI DOGAĐAJ
  if (
    grp.includes("svetski") ||
    grp.includes("world event") ||
    tags.includes("svetski-dogadjaj") ||
    tags.includes("world-event")
  ) {
    return "SVETSKI_DOGADJAJ";
  }

  // 6. BIBLIJSKI DOGAĐAJ (Default)
  return "BIBLIJSKI_DOGADJAJ";
}

interface DraggableEventCardProps {
  item: TimelineItem;
  onClose: () => void;
  onUpdateItem: (updated: TimelineItem) => void;
  onEditFullModal?: (item: TimelineItem) => void;
  theme: "dark" | "light";
  skin: string;
  lang: LangType;
  initialPosition?: { x: number; y: number };
  openCardIn?: "side_peek" | "float";
  isEmpireCard?: boolean;
  showEmpireTerritory?: boolean;
  onToggleEmpireTerritory?: () => void;
  showCampaignRoute?: boolean;
  onToggleCampaignRoute?: () => void;
  hasCampaignRoute?: boolean;
  isBabylonFall607?: boolean;
  wolMapInfo?: {
    id: number;
    titleSr: string;
    titleEn: string;
    docUrlSr: string;
    docUrlEn: string;
    publicationSr: string;
    publicationEn: string;
  };
  onOpenWolMap?: (mapId?: number) => void;
  availableTags?: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
}

export function DraggableEventCard({
  item,
  onClose,
  onUpdateItem,
  onEditFullModal,
  theme,
  skin,
  lang,
  initialPosition = { x: 24, y: 100 },
  openCardIn,
  isEmpireCard = false,
  showEmpireTerritory = true,
  onToggleEmpireTerritory,
  showCampaignRoute = true,
  onToggleCampaignRoute,
  hasCampaignRoute = false,
  isBabylonFall607 = false,
  wolMapInfo,
  onOpenWolMap,
  availableTags = [],
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
}: DraggableEventCardProps) {
  const isEn = lang === "en";
  const isLightTheme = theme === "light";
  const skinInfo = (SKINS_CONFIG as any)[skin] || SKINS_CONFIG.hronika;
  const skinCardBorderColor = getSkinCardBorderColor(skin, theme as "light" | "dark");
  const category = detectEventCategory(item);
  const cancelBtnClass = isLightTheme 
    ? "bg-[#FAF8F5] border-[#E5E0D8] text-[#44403C] hover:bg-[#EFECE5]" 
    : "bg-[#262827] border-[#383A39] text-[#F0EFED] hover:bg-[#383A39]";

  // Draggable position & Pin state
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (openCardIn === "side_peek") return true;
    if (openCardIn === "float") return false;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("event_card_pinned");
      if (stored !== null) return stored === "true";
    }
    return true; // Default to pinned (side peek on right)
  });

  // Sync positions & pinning based on openCardIn and item
  useEffect(() => {
    if (openCardIn === "side_peek") {
      setIsPinned(true);
    } else if (openCardIn === "float") {
      setIsPinned(false);
      if (typeof window !== "undefined") {
        const targetX = window.innerWidth - 420 - 40;
        const targetY = 80;
        setPosition({
          x: targetX > 20 ? targetX : 20,
          y: targetY,
        });
      }
    }
  }, [item.id, openCardIn]);

  useEffect(() => {
    if (!isPinned) {
      if (typeof window !== "undefined") {
        const targetX = window.innerWidth - 420 - 40;
        const targetY = 80;
        setPosition({
          x: targetX > 20 ? targetX : 20,
          y: targetY,
        });
      }
    }
  }, [isPinned]);

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("event_card_pinned", String(next));
      }
      return next;
    });
  };

  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: initialPosition.x,
    initY: initialPosition.y,
  });

  // Field 1: Title (Naslov)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(item.title || "");

  // Field 2: Year / Period (Godina / Period)
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [startYearNum, setStartYearNum] = useState<string>(Math.abs(item.startYear).toString());
  const [startYearEra, setStartYearEra] = useState<"BCE" | "CE">(item.startYear < 0 ? "BCE" : "CE");
  const [isPeriod, setIsPeriod] = useState<boolean>(typeof item.endYear === "number");
  const [endYearNum, setEndYearNum] = useState<string>(item.endYear !== undefined ? Math.abs(item.endYear).toString() : "");
  const [endYearEra, setEndYearEra] = useState<"BCE" | "CE">(item.endYear !== undefined && item.endYear < 0 ? "BCE" : "CE");
  const [isApproxInput, setIsApproxInput] = useState<boolean>(Boolean(item.isApproximate));

  // Category specific fields
  // Ruler (Vladar)
  const [isEditingRuler, setIsEditingRuler] = useState(false);
  const [rulerInput, setRulerInput] = useState(item.ruler || "");

  // Capital (Prestonica)
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState(item.capital || "");

  // World Power (Svetska sila)
  const [isEditingEmpire, setIsEditingEmpire] = useState(false);
  const [empireInput, setEmpireInput] = useState(item.empire || "");

  // Writer (Pisac)
  const [isEditingWriter, setIsEditingWriter] = useState(false);
  const [writerInput, setWriterInput] = useState(item.writer || "");

  // Writing place (Mesto pisanja)
  const [isEditingWritingPlace, setIsEditingWritingPlace] = useState(false);
  const [writingPlaceInput, setWritingPlaceInput] = useState(item.writingPlace || "");

  // Writing completed (Pisanje završeno) - za Sveto pismo
  const [isEditingWritingCompleted, setIsEditingWritingCompleted] = useState(false);
  const [writingCompletedInput, setWritingCompletedInput] = useState(item.writingCompleted || "");

  // Time covered (Obuhvata period)
  const [isEditingTimeCovered, setIsEditingTimeCovered] = useState(false);
  const [timeCoveredInput, setTimeCoveredInput] = useState(item.timeCovered || "");

  // Place / Location (Mesto)
  const [isEditingPlace, setIsEditingPlace] = useState(false);
  const [placeInput, setPlaceInput] = useState(item.place || item.location?.name || "");

  // Image (Slika)
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageInput, setImageInput] = useState(item.image || "");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Tags (Tagovi)
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  // Additional fields & Plus dropdown menu state
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const [additionalRulers, setAdditionalRulers] = useState<string[]>(item.additionalRulers || []);
  const [editingRulerIndex, setEditingRulerIndex] = useState<number | null>(null);
  const [editingRulerValue, setEditingRulerValue] = useState<string>("");

  // Description / Link
  const [isEditingDescAndLink, setIsEditingDescAndLink] = useState(false);
  const [descInput, setDescInput] = useState(item.description || "");
  const [linkInput, setLinkInput] = useState(item.sourceUrl || "");

  // Text extraction from link state
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Link preview cache and state
  const [linkData, setLinkData] = useState<{
    title?: string;
    description?: string;
    contentSnippet?: string;
    image?: string;
    loading?: boolean;
  } | null>(null);
  const [showIframeReader, setShowIframeReader] = useState(false);

  // Close plus dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    if (isPlusMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPlusMenuOpen]);

  // Sync inputs when item prop changes
  useEffect(() => {
    setTitleInput(item.title || "");
    setStartYearNum(Math.abs(item.startYear).toString());
    setStartYearEra(item.startYear < 0 ? "BCE" : "CE");
    setIsPeriod(typeof item.endYear === "number");
    setEndYearNum(item.endYear !== undefined ? Math.abs(item.endYear).toString() : "");
    setEndYearEra(item.endYear !== undefined && item.endYear < 0 ? "BCE" : "CE");
    setIsApproxInput(Boolean(item.isApproximate));

    setRulerInput(item.ruler || "");
    setAdditionalRulers(item.additionalRulers || []);
    setEditingRulerIndex(null);
    setIsPlusMenuOpen(false);
    setCapitalInput(item.capital || "");
    setEmpireInput(item.empire || "");
    setWriterInput(item.writer || "");
    setWritingPlaceInput(item.writingPlace || "");
    setWritingCompletedInput(item.writingCompleted || "");
    setTimeCoveredInput(item.timeCovered || "");
    setPlaceInput(item.place || item.location?.name || "");
    setImageInput(item.image || "");
    setTagsInput("");
    setDescInput(item.description || "");
    setLinkInput(item.sourceUrl || "");

    setIsEditingTitle(false);
    setIsEditingYear(false);
    setIsEditingRuler(false);
    setIsEditingCapital(false);
    setIsEditingEmpire(false);
    setIsEditingWriter(false);
    setIsEditingWritingPlace(false);
    setIsEditingWritingCompleted(false);
    setIsEditingTimeCovered(false);
    setIsEditingPlace(false);
    setIsEditingImage(false);
    setIsEditingTags(false);
    setIsEditingDescAndLink(false);
    setExtractError("");
  }, [item]);

  // Handler to generate/extract description using the text from the link
  const handleExtractTextFromLink = async () => {
    const urlToFetch = linkInput.trim() || item.sourceUrl?.trim();
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
        setExtractError(isEn ? "No article text found on this page." : "Nije pronađen tekst na ovoj stranici.");
      }
    } catch (err) {
      setExtractError(isEn ? "Failed to extract text from link." : "Greška pri učitavanju teksta sa linka.");
    } finally {
      setIsExtractingText(false);
    }
  };

  // Fetch link preview if sourceUrl is present
  useEffect(() => {
    if (!item.sourceUrl) {
      setLinkData(null);
      return;
    }

    let active = true;
    setLinkData({ loading: true });

    fetch(`/api/link_preview?url=${encodeURIComponent(item.sourceUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setLinkData({ ...data, loading: false });
      })
      .catch(() => {
        if (!active) return;
        setLinkData({ loading: false });
      });

    return () => {
      active = false;
    };
  }, [item.sourceUrl]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinned) return;
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select")
    ) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.initX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.initY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch drag support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPinned) return;
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.tagName === "BUTTON" ||
      target.closest("button")
    ) {
      return;
    }

    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initX: position.x,
      initY: position.y,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchMove = moveEvent.touches[0];
      const deltaX = touchMove.clientX - dragStartRef.current.startX;
      const deltaY = touchMove.clientY - dragStartRef.current.startY;

      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.initX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.initY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Save Title (Field 1)
  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (!trimmed) return;
    onUpdateItem({
      ...item,
      title: trimmed,
    });
    setIsEditingTitle(false);
  };

  // Save Year / Period (Field 2)
  const handleSaveYear = () => {
    const sParsed = parseInt(startYearNum, 10);
    if (isNaN(sParsed)) return;
    const finalStart = startYearEra === "BCE" ? -Math.abs(sParsed) : Math.abs(sParsed);

    let finalEnd: number | undefined = undefined;
    if (isPeriod) {
      const eParsed = parseInt(endYearNum, 10);
      if (!isNaN(eParsed)) {
        finalEnd = endYearEra === "BCE" ? -Math.abs(eParsed) : Math.abs(eParsed);
      }
    }

    onUpdateItem({
      ...item,
      startYear: finalStart,
      endYear: finalEnd,
      isApproximate: isApproxInput ? true : undefined,
    });
    setIsEditingYear(false);
  };

  // Save Ruler (Vladar)
  const handleSaveRuler = () => {
    const trimmed = rulerInput.trim();
    onUpdateItem({
      ...item,
      ruler: trimmed || undefined,
    });
    setIsEditingRuler(false);
  };

  // Save Capital (Prestonica)
  const handleSaveCapital = () => {
    const trimmed = capitalInput.trim();
    onUpdateItem({
      ...item,
      capital: trimmed || undefined,
    });
    setIsEditingCapital(false);
  };

  // Save World Power (Svetska sila)
  const handleSaveEmpire = () => {
    const trimmed = empireInput.trim();
    onUpdateItem({
      ...item,
      empire: trimmed || undefined,
    });
    setIsEditingEmpire(false);
  };

  // Save Writer (Pisac)
  const handleSaveWriter = () => {
    const trimmed = writerInput.trim();
    onUpdateItem({
      ...item,
      writer: trimmed || undefined,
    });
    setIsEditingWriter(false);
  };

  // Save Writing Place (Mesto pisanja)
  const handleSaveWritingPlace = () => {
    const trimmed = writingPlaceInput.trim();
    onUpdateItem({
      ...item,
      writingPlace: trimmed || undefined,
    });
    setIsEditingWritingPlace(false);
  };

  // Save Time Covered (Obuhvata period)
  const handleSaveTimeCovered = () => {
    const trimmed = timeCoveredInput.trim();
    onUpdateItem({
      ...item,
      timeCovered: trimmed || undefined,
    });
    setIsEditingTimeCovered(false);
  };

  // Save Place (Mesto)
  const handleSavePlace = () => {
    const trimmed = placeInput.trim();
    onUpdateItem({
      ...item,
      place: trimmed || undefined,
      location: item.location ? { ...item.location, name: trimmed || undefined } : (trimmed ? { name: trimmed, lat: 31.7683, lng: 35.2137 } : undefined)
    });
    setIsEditingPlace(false);
  };

  // Additional Rulers handlers (for World Powers)
  const handleAddAdditionalRuler = () => {
    const current = item.additionalRulers || [];
    const next = [...current, ""];
    setAdditionalRulers(next);
    setEditingRulerIndex(next.length - 1);
    setEditingRulerValue("");
    onUpdateItem({
      ...item,
      additionalRulers: next,
    });
  };

  const handleStartEditAdditionalRuler = (index: number, val: string) => {
    setEditingRulerIndex(index);
    setEditingRulerValue(val);
  };

  const handleSaveAdditionalRuler = (index: number) => {
    const trimmed = editingRulerValue.trim();
    const next = [...(item.additionalRulers || additionalRulers)];
    next[index] = trimmed;
    setAdditionalRulers(next);
    setEditingRulerIndex(null);
    onUpdateItem({
      ...item,
      additionalRulers: next,
    });
  };

  const handleRemoveAdditionalRuler = (index: number) => {
    const current = item.additionalRulers || additionalRulers;
    const next = current.filter((_, i) => i !== index);
    setAdditionalRulers(next);
    if (editingRulerIndex === index) {
      setEditingRulerIndex(null);
    }
    onUpdateItem({
      ...item,
      additionalRulers: next,
    });
  };

  // Save Writing Completed (Pisanje završeno)
  const handleSaveWritingCompleted = () => {
    const trimmed = writingCompletedInput.trim();
    onUpdateItem({
      ...item,
      writingCompleted: trimmed || undefined,
    });
    setIsEditingWritingCompleted(false);
  };

  // Save Description and Link
  const handleSaveDescAndLink = () => {
    const trimmedDesc = descInput.trim();
    const trimmedLink = linkInput.trim();

    onUpdateItem({
      ...item,
      description: trimmedDesc,
      sourceUrl: trimmedLink || undefined,
    });
    setIsEditingDescAndLink(false);
  };

  // Save Image handlers
  const handleSaveImage = () => {
    const trimmed = imageInput.trim();
    onUpdateItem({
      ...item,
      image: trimmed || undefined,
    });
    setIsEditingImage(false);
  };

  const handleRemoveImage = () => {
    setImageInput("");
    onUpdateItem({
      ...item,
      image: undefined,
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert(isEn ? "Image file is too large (max 3MB)." : "Slika je prevelika (maksimalno 3MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setImageInput(res);
      onUpdateItem({
        ...item,
        image: res,
      });
      setIsEditingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Tag handlers
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    const current = item.tags || [];
    if (!current.includes(clean)) {
      const next = [...current, clean];
      onUpdateItem({ ...item, tags: next });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const current = item.tags || [];
    const next = current.filter((t) => t !== tagToRemove);
    onUpdateItem({ ...item, tags: next });
  };

  const handleSaveTagsBatch = () => {
    if (!tagsInput.trim()) {
      setIsEditingTags(false);
      return;
    }
    const parts = tagsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const current = item.tags || [];
    const merged = Array.from(new Set([...current, ...parts]));
    onUpdateItem({ ...item, tags: merged });
    setTagsInput("");
    setIsEditingTags(false);
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

  const getCategoryBadge = () => {
    const badgeColor = isLightTheme ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-[#18181f] text-[#cbd5e1] border-slate-750";
    switch (category) {
      case "SVETSKA_SILA":
        return { label: isEn ? "world power" : "svetska sila", icon: Globe2, color: badgeColor };
      case "VLADAR":
        return { label: isEn ? "ruler" : "vladar", icon: Crown, color: badgeColor };
      case "SVETO_PISMO":
        return { label: isEn ? "holy scriptures" : "sveto pismo", icon: BookOpen, color: badgeColor };
      case "LICNOST":
        return { label: isEn ? "person" : "ličnost", icon: User, color: badgeColor };
      case "SVETSKI_DOGADJAJ":
        return { label: isEn ? "world event" : "svetski događaj", icon: Globe2, color: badgeColor };
      case "BIBLIJSKI_DOGADJAJ":
      default:
        return { label: isEn ? "biblical event" : "biblijski događaj", icon: Flame, color: badgeColor };
    }
  };

  const catBadge = getCategoryBadge();
  const CatIcon = catBadge.icon;

  // Helper to render Image Section (Slika)
  const renderImageSection = (fieldNum: number) => {
    return (
      <div className={`p-2.5 rounded-xl border transition ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">{fieldNum}</span>
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isEn ? "IMAGE:" : "SLIKA:"}</span>
          </div>
          {!isEditingImage && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditingImage(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEn ? "Edit" : "Uredi"}</span>
              </button>
              {item.image && (
                <button
                  onClick={handleRemoveImage}
                  className="text-[10px] font-semibold text-slate-400 hover:text-red-400 transition flex items-center gap-0.5 ml-1 cursor-pointer"
                  title={isEn ? "Remove image" : "Ukloni sliku"}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {isEditingImage ? (
          <div className="space-y-2 mt-1.5">
            <input
              type="file"
              ref={imageFileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder={isEn ? "Paste image URL (https://...)" : "Unesite URL adresu slike..."}
                className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                  isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                className="px-2 py-1 rounded-lg bg-[#D96B27]/15 hover:bg-[#D96B27] text-[#D96B27] hover:text-white border border-[#D96B27]/30 font-semibold text-[10.5px] transition flex items-center gap-1 shrink-0 cursor-pointer"
                title={isEn ? "Upload file from device" : "Dodaj sliku sa uređaja"}
              >
                <Upload className="w-3 h-3" />
                <span>{isEn ? "Upload" : "Otpremi"}</span>
              </button>
            </div>

            {imageInput.trim() && (
              <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-36 bg-black/40 flex items-center justify-center">
                <img
                  src={imageInput}
                  alt="Preview"
                  className="max-h-36 object-contain w-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-1.5 pt-0.5">
              <button
                onClick={() => {
                  setImageInput(item.image || "");
                  setIsEditingImage(false);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${cancelBtnClass}`}
              >
                {isEn ? "Cancel" : "Otkaži"}
              </button>
              <button
                onClick={handleSaveImage}
                className="px-3 py-1 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEn ? "Save" : "Sačuvaj"}</span>
              </button>
            </div>
          </div>
        ) : item.image ? (
          <div 
            onClick={() => setIsEditingImage(true)}
            className="group relative rounded-lg overflow-hidden border border-slate-700/60 max-h-44 bg-slate-950/40 cursor-pointer transition hover:border-amber-500/50 mt-1"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full max-h-44 object-cover group-hover:scale-102 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEn ? "Change image" : "Izmeni sliku"}</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingImage(true)}
            className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] text-slate-500 italic py-0.5 transition"
          >
            {isEn ? "Add image or image URL" : "Dodaj sliku ili adresu slike"}
          </div>
        )}
      </div>
    );
  };

  // Helper to render Tags Section (Tagovi)
  const renderTagsSection = (fieldNum: number) => {
    const currentTags = item.tags || [];

    return (
      <div className={`p-2.5 rounded-xl border transition ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">{fieldNum}</span>
            <TagIcon className="w-3.5 h-3.5" />
            <span>{isEn ? "TAGS:" : "TAGOVI:"}</span>
          </div>
          {!isEditingTags && (
            <button
              onClick={() => setIsEditingTags(true)}
              className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEn ? "Edit" : "Uredi"}</span>
            </button>
          )}
        </div>

        {isEditingTags ? (
          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTagsBatch();
                  if (e.key === "Escape") setIsEditingTags(false);
                }}
                placeholder={isEn ? "e.g. Medo-Persia, Rome (comma separated)" : "npr. Medo-Persija, Rim"}
                autoFocus
                className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                  isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
              <button
                onClick={handleSaveTagsBatch}
                className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTags(false)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick select existing tags if available */}
            {availableTags && availableTags.length > 0 && (
              <div className="pt-1">
                <span className="text-[9.5px] font-bold text-slate-400 block mb-1">
                  {isEn ? "Choose from existing tags:" : "Izaberite iz postojećih tagova:"}
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {availableTags.map((t) => {
                    const isAlreadySelected = currentTags.includes(t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          if (isAlreadySelected) {
                            handleRemoveTag(t.name);
                          } else {
                            handleAddTag(t.name);
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                          isAlreadySelected
                            ? "bg-[#1E443A] text-white font-bold"
                            : isLightTheme
                            ? "bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#1C1D1C] border border-[#E5E0D8]"
                            : "bg-[#262827] hover:bg-[#383A39] text-slate-200"
                        }`}
                      >
                        <span>{t.name}</span>
                        {isAlreadySelected && <Check className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : currentTags.length > 0 ? (
          <div 
            onClick={() => setIsEditingTags(true)}
            className="flex flex-wrap gap-1.5 cursor-pointer pt-0.5"
          >
            {currentTags.map((tagName) => {
              const tagCfg = availableTags?.find((at) => at.name === tagName);
              return (
                <NotionTagPill
                  key={tagName}
                  name={tagName}
                  color={tagCfg?.color || "default"}
                  isLight={isLightTheme}
                  onRemove={() => handleRemoveTag(tagName)}
                />
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => setIsEditingTags(true)}
            className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] text-slate-500 italic py-0.5 transition"
          >
            {isEn ? "e.g. Medo-Persia, Rome..." : "npr. Medo-Persija, Rim"}
          </div>
        )}
      </div>
    );
  };

  // Helper to render Description / Link Section (Opis / link)
  const renderDescAndLinkSection = (descFieldNum: number) => {
    return (
      <div className={`p-2.5 rounded-xl border transition space-y-2 ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">{descFieldNum}</span>
            <FileText className="w-3.5 h-3.5" />
            <span>{isEn ? "DESCRIPTION / LINK:" : "OPIS / LINK:"}</span>
          </div>
          {!isEditingDescAndLink && (
            <button
              onClick={() => setIsEditingDescAndLink(true)}
              className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEn ? "Edit" : "Uredi"}</span>
            </button>
          )}
        </div>

        {isEditingDescAndLink ? (
          <div className="space-y-2 mt-1">
            <div>
              <label className="text-[9.5px] font-bold text-slate-400 block mb-1">
                {isEn ? "Description (your personal text):" : "Opis:"}
              </label>
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                rows={3}
                placeholder={isEn ? "Write text or add link..." : "Upiši tekst ili dodaj link"}
                className={`w-full p-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] leading-relaxed ${
                  isLightTheme 
                    ? "bg-white border-slate-300 text-slate-900" 
                    : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
            </div>

            <div>
              <label className="text-[9.5px] font-bold text-slate-400 block mb-1">
                {isEn ? "Website Link (e.g. wol.jw.org / jw.org):" : "Link sa sajta (npr. sa wol.jw.org / jw.org):"}
              </label>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://wol.jw.org/sr-Latn/..."
                className={`w-full px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                  isLightTheme 
                    ? "bg-white border-slate-300 text-slate-900" 
                    : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />

              {/* Button to extract description from link */}
              {linkInput.trim() && (
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={handleExtractTextFromLink}
                    disabled={isExtractingText}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-[#D96B27]/15 hover:bg-[#D96B27] text-[#D96B27] hover:text-white font-bold text-[10.5px] transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#D96B27]/30"
                  >
                    {isExtractingText ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? "Extracting article text from link..." : "Preuzimanje teksta sa linka..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isEn ? "Fetch description from link text" : "Povuci tekst sa linka u opis"}</span>
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
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${cancelBtnClass}`}
              >
                {isEn ? "Cancel" : "Otkaži"}
              </button>
              <button
                onClick={handleSaveDescAndLink}
                className="px-3 py-1 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEn ? "Save" : "Sačuvaj"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* User written text */}
            {item.description ? (
              <p 
                onClick={() => setIsEditingDescAndLink(true)}
                className="text-xs leading-relaxed opacity-90 cursor-pointer hover:opacity-100 transition whitespace-pre-line"
              >
                {item.description}
              </p>
            ) : !item.sourceUrl ? (
              <p 
                onClick={() => setIsEditingDescAndLink(true)}
                className="text-slate-500 italic text-xs cursor-pointer hover:text-[#D96B27] transition"
              >
                {isEn ? "Write text or add link" : "Upiši tekst ili dodaj link"}
              </p>
            ) : null}

            {/* Loaded Content from Link */}
            {item.sourceUrl && (
              <div className={`p-2 rounded-lg border text-xs space-y-1.5 mt-1.5 ${
                isLightTheme ? "bg-white border-slate-300" : "bg-slate-900 border-slate-800"
              }`}>
                <div className="flex items-center justify-between gap-2 border-b pb-1 border-slate-700/30">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#D96B27] truncate min-w-0">
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.sourceUrl}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setIsEditingDescAndLink(true);
                        handleExtractTextFromLink();
                      }}
                      className="px-2 py-0.5 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] hover:bg-[#D96B27] hover:text-white font-semibold text-[9.5px] transition flex items-center gap-1 cursor-pointer"
                      title={isEn ? "Fetch description from link" : "Povuci tekst u opis"}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEn ? "Fetch" : "Povuci"}</span>
                    </button>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] hover:bg-[#D96B27] hover:text-white font-semibold text-[9.5px] transition flex items-center gap-1"
                    >
                      <span>{isEn ? "Open" : "Otvori"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {linkData?.loading ? (
                  <div className="flex items-center gap-2 py-1.5 text-slate-400 text-[10.5px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D96B27]" />
                    <span>{isEn ? "Loading content from link..." : "Učitavanje sadržaja sa linka..."}</span>
                  </div>
                ) : linkData ? (
                  <div className="space-y-1 pt-0.5">
                    {linkData.title && (
                      <h4 className="font-bold text-xs" style={{ color: skinInfo.primary }}>
                        {linkData.title}
                      </h4>
                    )}
                    {linkData.description && (
                      <p className="text-[10.5px] leading-relaxed opacity-85">
                        {linkData.description}
                      </p>
                    )}
                    {linkData.contentSnippet && (
                      <div className="p-2 rounded bg-slate-950/40 border border-slate-800 text-[10px] leading-relaxed opacity-90 whitespace-pre-line font-serif">
                        {linkData.contentSnippet}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Toggle Embedded Reader */}
                <div className="pt-0.5">
                  <button
                    onClick={() => setShowIframeReader(!showIframeReader)}
                    className="text-[9.5px] text-slate-400 hover:text-[#D96B27] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {showIframeReader ? (
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

                  {showIframeReader && (
                    <div className="mt-1.5 h-56 rounded-lg overflow-hidden border border-slate-700 bg-white">
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
    );
  };

  return (
    <motion.div
      initial={isPinned ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
      animate={isPinned ? { x: 0 } : { opacity: 1, scale: 1 }}
      exit={isPinned ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      style={
        isPinned
          ? {
              right: 0,
              top: "48px",
              bottom: 0,
              height: "calc(100vh - 48px)",
              width: "min(440px, 94vw)",
              maxWidth: "440px",
              borderLeftColor: skinCardBorderColor,
              borderLeftWidth: "1px",
              borderLeftStyle: "solid",
              zIndex: 45
            }
          : {
              right: "16px",
              top: "56px",
              maxWidth: "430px",
              width: "calc(100vw - 32px)",
              maxHeight: "calc(100vh - 72px)",
              borderColor: skinCardBorderColor,
              borderWidth: "1px",
              borderStyle: "solid",
              zIndex: 45
            }
      }
      className={`draggable-event-card fixed z-50 flex flex-col transition-all duration-200 select-text ${
        isPinned
          ? `rounded-none border-l border-y-0 border-r-0 shadow-2xl ${
              isLightTheme
                ? "bg-white text-slate-900"
                : "bg-[#121316] text-slate-100"
            }`
          : `rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden ${
              isDragging ? "shadow-amber-500/25 ring-2 ring-amber-500 cursor-grabbing" : ""
            } ${
              isLightTheme
                ? "bg-white/95 text-slate-900 shadow-slate-400/30"
                : "bg-[#121316]/95 text-slate-100 shadow-black/60"
            }`
      }`}
    >
      {/* HEADER BAR */}
      {category === "SVETSKA_SILA" ? (
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-2 select-none ${
            isLightTheme ? "bg-slate-100/95 border-slate-200 text-slate-800" : "bg-[#121316] border-[#2d3139] text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
            <span className={isLightTheme ? "text-slate-700" : "text-slate-300"}>{isEn ? "World Power" : "Svetska sila"}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEditFullModal && (
              <button
                type="button"
                onClick={() => onEditFullModal(item)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLightTheme ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" : "hover:bg-white/5 text-slate-400 hover:text-white"
                }`}
                title={isEn ? "Edit full item" : "Uredi kompletan unos"}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLightTheme ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" : "hover:bg-white/5 text-slate-400 hover:text-white"
              }`}
              title={isPinned ? (isEn ? "Float window" : "Odvoji prozor") : (isEn ? "Dock to side" : "Zakači sa strane")}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLightTheme ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" : "hover:bg-white/5 text-slate-400 hover:text-white"
              }`}
              title={isEn ? "Close" : "Zatvori"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 select-none ${
            isPinned ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          } ${
            isLightTheme ? "bg-slate-100/95 border-slate-200" : "bg-slate-950/90 border-slate-800"
          }`}
          title={
            isPinned
              ? (isEn ? "Pinned to right edge (Click pin to detach)" : "Zakačeno skroz desno (Kliknite na pin da odvojite)")
              : (isEn ? "Drag to move card freely across screen" : "Uhvatite mišem ili prstom i slobodno pomerajte karticu")
          }
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <GripHorizontal className={`w-4 h-4 shrink-0 ${isPinned ? "text-slate-500 opacity-40" : "text-[#D96B27]"}`} />
            
            {/* PIN BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePin();
              }}
              className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center shrink-0 ${
                isPinned
                  ? "bg-[#1E443A] text-white font-bold shadow-sm ring-1 ring-[#1E443A]"
                  : "text-slate-400 hover:text-[#D96B27] hover:bg-slate-700/20"
              }`}
              title={
                isPinned
                  ? (isEn ? "Unpin (detach and float)" : "Otkači karticu (odvoji da lebdi)")
                  : (isEn ? "Pin to right side" : "Zakači skroz desno")
              }
            >
              <Pin className={`w-3.5 h-3.5 transition-transform duration-200 ${isPinned ? "rotate-45 fill-current" : ""}`} />
            </button>

            {/* PLUS BUTTON & DROPDOWN (Directly right of Pin button) */}
            <div className="relative shrink-0" ref={plusMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlusMenuOpen(!isPlusMenuOpen);
                }}
                className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  isPlusMenuOpen
                    ? "bg-[#1E443A] text-white shadow-sm"
                    : "text-slate-400 hover:text-[#D96B27] hover:bg-slate-700/20"
                }`}
                title={isEn ? "Add field..." : "Dodaj polje..."}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {isPlusMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute left-0 top-full mt-1.5 w-60 rounded-xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isLightTheme
                      ? "bg-white border-slate-200 text-slate-800 shadow-slate-300/50"
                      : "bg-slate-950 border-slate-800 text-slate-200 shadow-black/80"
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/30 mb-1">
                    {isEn ? "Add Field" : "Dodaj polje"}
                  </div>

                  <div className="px-2.5 py-1.5 text-[10px] text-slate-500 italic flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{isEn ? "New custom fields coming soon..." : "Mogućnost zadavanja novih polja..."}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color || skinInfo.primary }}
              />
              <div className={`px-2 py-0.5 rounded-md border text-xs font-normal flex items-center gap-1 ${catBadge.color}`}>
                <CatIcon className="w-3 h-3" />
                <span>{catBadge.label}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEditFullModal && (
              <button
                onClick={() => onEditFullModal(item)}
                className="p-1.5 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-[#D96B27] transition cursor-pointer"
                title={isEn ? "Open full modal" : "Otvori detaljan prozor"}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title={isEn ? "Close card" : "Zatvori karticu"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CARD CONTENT (Scrollable if tall) */}
      <div className={`p-3.5 space-y-3 overflow-y-auto text-xs ${isPinned ? "flex-1" : "max-h-[78vh]"}`}>
        
        {/* ========================================================
            1. POLJE: NAZIV (Ili "Naziv knjige" za Sveto pismo)
           ======================================================== */}
        <div className={`p-2.5 rounded-xl border transition ${
          isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
              <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">1</span>
              <span>{category === "SVETO_PISMO" ? (isEn ? "BOOK NAME:" : "NAZIV KNJIGE:") : (isEn ? "NAME:" : "NAZIV:")}</span>
            </div>
            {!isEditingTitle && (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                title={isEn ? "Edit name" : "Uredi naziv"}
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEn ? "Edit" : "Uredi"}</span>
              </button>
            )}
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                autoFocus
                placeholder={
                  category === "SVETO_PISMO"
                    ? (isEn ? "e.g. Genesis, Matthew" : "npr. Postanak, Matej")
                    : category === "SVETSKA_SILA"
                    ? (isEn ? "e.g. Medo-Persia, Rome" : "npr. Medo-Persija, Rim")
                    : category === "VLADAR"
                    ? (isEn ? "e.g. Cyrus the Great" : "npr. Kir Veliki")
                    : category === "LICNOST"
                    ? (isEn ? "e.g. Abraham, David, Paul" : "npr. Avraham, David, Pavle")
                    : (isEn ? "e.g. Fall of Jerusalem" : "npr. Pad Jerusalima")
                }
                className={`flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                  isLightTheme 
                    ? "bg-white border-slate-300 text-slate-900" 
                    : "bg-slate-900 border-slate-700 text-slate-100"
                }`}
              />
              <button
                onClick={handleSaveTitle}
                className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer"
                title="Sačuvaj"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}
                title="Otkaži"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="font-extrabold text-sm cursor-pointer hover:text-[#D96B27] transition leading-snug"
              title={isEn ? "Click to edit name" : "Kliknite da izmenite naziv"}
            >
              {item.title}
            </div>
          )}
        </div>

        {/* ========================================================
            2. POLJE: VREME (Za sve kategorije OSIM Sveto pismo gde je Vreme u sklopu polja 5)
           ======================================================== */}
        {category !== "SVETO_PISMO" && (
          <div className={`p-2.5 rounded-xl border transition ${
            isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">2</span>
                <Calendar className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>{isEn ? "TIME:" : "VREME:"}</span>
              </div>
              {!isEditingYear && (
                <button
                  onClick={() => setIsEditingYear(true)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  title={isEn ? "Edit time" : "Uredi vreme"}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEn ? "Edit" : "Uredi"}</span>
                </button>
              )}
            </div>

            {isEditingYear ? (
              <div className="space-y-2 mt-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                      {isEn ? "Start Year:" : "Početna godina:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={startYearNum}
                        onChange={(e) => setStartYearNum(e.target.value)}
                        placeholder="607"
                        className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      />
                      <select
                        value={startYearEra}
                        onChange={(e) => setStartYearEra(e.target.value as "BCE" | "CE")}
                        className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      >
                        <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                        <option value="CE">{isEn ? "CE" : "n. e."}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Checkbox for Period (End Year) */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px] select-none font-semibold">
                    <input
                      type="checkbox"
                      checked={isPeriod}
                      onChange={(e) => setIsPeriod(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-0"
                    />
                    <span>{isEn ? "This is a period (has an end year)" : "Ovo je vremenski period (ima završnu godinu)"}</span>
                  </label>
                </div>

                {isPeriod && (
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                      {isEn ? "End Year:" : "Završna godina:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={endYearNum}
                        onChange={(e) => setEndYearNum(e.target.value)}
                        placeholder="539"
                        className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      />
                      <select
                        value={endYearEra}
                        onChange={(e) => setEndYearEra(e.target.value as "BCE" | "CE")}
                        className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      >
                        <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                        <option value="CE">{isEn ? "CE" : "n. e."}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Checkbox for Approximate (oko) */}
                <div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px] select-none text-slate-400">
                    <input
                      type="checkbox"
                      checked={isApproxInput}
                      onChange={(e) => setIsApproxInput(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-0"
                    />
                    <span>{isEn ? "Approximate date (c. / oko)" : "Približan datum (oznaka „oko“)"}</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => setIsEditingYear(false)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${cancelBtnClass}`}
                  >
                    {isEn ? "Cancel" : "Otkaži"}
                  </button>
                  <button
                    onClick={handleSaveYear}
                    className="px-3 py-1 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEn ? "Save" : "Sačuvaj"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingYear(true)}
                className="font-mono font-bold text-xs cursor-pointer hover:text-[#D96B27] transition"
                style={{ color: skinInfo.primary }}
                title={isEn ? "Click to edit time" : "Kliknite da izmenite vreme"}
              >
                {rangeString}
              </div>
            )}
          </div>
        )}

        {category === "SVETSKA_SILA" && (
          <div className={`p-3.5 rounded-2xl border transition ${
            isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/90 border-slate-800"
          }`}>
            {/* Top Icon and Title */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isEn ? "World Power" : "Svetska sila"}
                  </span>
                  {!isEditingTitle && (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEn ? "Edit" : "Uredi"}</span>
                    </button>
                  )}
                </div>

                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      autoFocus
                      className={`flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                        isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                      }`}
                    />
                    <button onClick={handleSaveTitle} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-base font-extrabold cursor-pointer hover:text-[#D96B27] transition leading-snug mt-0.5"
                  >
                    {item.title}
                  </h1>
                )}
              </div>
            </div>

            {/* Thin Divider */}
            <hr className={`my-3 border-t ${isLightTheme ? "border-slate-200" : "border-slate-800"}`} />

            {/* 1. VREME */}
            <div className="py-2.5 border-b border-slate-800/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-[#D96B27] shrink-0" />
                <span className="font-semibold text-slate-400 text-xs">{isEn ? "Time" : "Vreme"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setIsEditingYear(true)}
                  className="font-mono font-bold text-xs cursor-pointer hover:text-[#D96B27] transition text-right"
                  style={{ color: skinInfo.primary }}
                >
                  {rangeString}
                </div>
                {!isEditingYear && (
                  <button
                    onClick={() => setIsEditingYear(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingYear && (
              <div className={`p-3 rounded-xl border my-2 space-y-2 ${isLightTheme ? "bg-white border-slate-300" : "bg-slate-900 border-slate-700"}`}>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                      {isEn ? "Start Year:" : "Početna godina:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={startYearNum}
                        onChange={(e) => setStartYearNum(e.target.value)}
                        placeholder="607"
                        className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      />
                      <select
                        value={startYearEra}
                        onChange={(e) => setStartYearEra(e.target.value as "BCE" | "CE")}
                        className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      >
                        <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                        <option value="CE">{isEn ? "CE" : "n. e."}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px] select-none font-semibold">
                    <input
                      type="checkbox"
                      checked={isPeriod}
                      onChange={(e) => setIsPeriod(e.target.checked)}
                      className="rounded text-[#D96B27] focus:ring-0"
                    />
                    <span>{isEn ? "This is a period (has an end year)" : "Ovo je vremenski period (ima završnu godinu)"}</span>
                  </label>
                </div>

                {isPeriod && (
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                      {isEn ? "End Year:" : "Završna godina:"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={endYearNum}
                        onChange={(e) => setEndYearNum(e.target.value)}
                        placeholder="539"
                        className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      />
                      <select
                        value={endYearEra}
                        onChange={(e) => setEndYearEra(e.target.value as "BCE" | "CE")}
                        className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                          isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                        }`}
                      >
                        <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                        <option value="CE">{isEn ? "CE" : "n. e."}</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button 
                    onClick={() => setIsEditingYear(false)} 
                    className={`px-2 py-1 rounded text-xs border transition cursor-pointer ${cancelBtnClass}`}
                  >
                    {isEn ? "Cancel" : "Otkaži"}
                  </button>
                  <button 
                    onClick={handleSaveYear} 
                    className="px-3 py-1 rounded bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEn ? "Save" : "Sačuvaj"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. VLADAR */}
            <div className="py-2.5 border-b border-slate-800/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Crown className="w-4 h-4 text-[#D96B27] shrink-0" />
                <span className="font-semibold text-slate-400 text-xs">{isEn ? "Ruler" : "Vladar"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setIsEditingRuler(true)}
                  className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition text-right truncate max-w-[180px]"
                >
                  {item.ruler ? item.ruler : <span className="text-slate-500 italic">{isEn ? "e.g. Nebuchadnezzar" : "npr. Navuhodonosor"}</span>}
                </div>
                {!isEditingRuler && (
                  <button
                    onClick={() => setIsEditingRuler(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingRuler && (
              <div className="flex items-center gap-1.5 my-2">
                <input
                  type="text"
                  value={rulerInput}
                  onChange={(e) => setRulerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRuler();
                    if (e.key === "Escape") setIsEditingRuler(false);
                  }}
                  placeholder={isEn ? "e.g. Nebuchadnezzar" : "npr. Navuhodonosor"}
                  autoFocus
                  className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                    isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                  }`}
                />
                <button onClick={handleSaveRuler} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsEditingRuler(false)} 
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 3. PRESTONICA */}
            <div className="py-2.5 border-b border-slate-800/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Landmark className="w-4 h-4 text-[#D96B27] shrink-0" />
                <span className="font-semibold text-slate-400 text-xs">{isEn ? "Capital" : "Prestonica"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setIsEditingCapital(true)}
                  className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition text-right truncate max-w-[180px]"
                >
                  {item.capital ? item.capital : <span className="text-slate-500 italic">{isEn ? "e.g. Babylon" : "npr. Vavilon"}</span>}
                </div>
                {!isEditingCapital && (
                  <button
                    onClick={() => setIsEditingCapital(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingCapital && (
              <div className="flex items-center gap-1.5 my-2">
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
                  className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                    isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                  }`}
                />
                <button onClick={handleSaveCapital} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsEditingCapital(false)} 
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4. SLIKA */}
            <div className="py-2.5 border-b border-slate-800/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-[#D96B27] shrink-0" />
                <span className="font-semibold text-slate-400 text-xs">{isEn ? "Image" : "Slika"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setIsEditingImage(true)}
                  className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition text-right truncate max-w-[160px]"
                >
                  {item.image ? (
                    <span className="truncate">{item.image}</span>
                  ) : (
                    <span className="text-slate-500 italic">{isEn ? "No image" : "Nema slike"}</span>
                  )}
                </div>
                {!isEditingImage && (
                  <button
                    onClick={() => setIsEditingImage(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5. OPIS */}
            <div className="py-2.5 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 pt-0.5">
                <FileText className="w-4 h-4 text-[#D96B27] shrink-0" />
                <span className="font-semibold text-slate-400 text-xs">{isEn ? "Description" : "Opis"}</span>
              </div>
              <div className="flex flex-col items-end gap-1 flex-1 min-w-0 pl-2">
                <div className="flex items-center justify-between w-full">
                  <div />
                  {!isEditingDescAndLink && (
                    <button
                      onClick={() => setIsEditingDescAndLink(true)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEn ? "Edit" : "Uredi"}</span>
                    </button>
                  )}
                </div>
                <div 
                  onClick={() => setIsEditingDescAndLink(true)}
                  className="text-xs text-slate-300 cursor-pointer hover:text-[#D96B27] transition line-clamp-3 text-right w-full leading-relaxed"
                >
                  {item.description ? item.description : <span className="text-slate-500 italic">{isEn ? "Click to add description..." : "Kliknite da unesete opis..."}</span>}
                </div>
              </div>
            </div>

            {/* Extra Map controls if any */}
            {isEmpireCard && (onToggleEmpireTerritory || (hasCampaignRoute && onToggleCampaignRoute)) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {onToggleEmpireTerritory && (
                  <button
                    onClick={onToggleEmpireTerritory}
                    className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      showEmpireTerritory
                        ? "bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] border-amber-500/50"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span>🗺️</span>
                    <span>{showEmpireTerritory ? (isEn ? "Territory: Visible" : "Teritorija: Prikazana") : (isEn ? "Territory: Hidden" : "Teritorija: Sakrivena")}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {(category === "VLADAR" || category === "LICNOST") && (
          <>
            {/* 3. SVETSKA SILA */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">3</span>
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "WORLD POWER:" : "SVETSKA SILA:"}</span>
                </div>
                {!isEditingEmpire && (
                  <button
                    onClick={() => setIsEditingEmpire(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>

              {isEditingEmpire ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={empireInput}
                    onChange={(e) => setEmpireInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEmpire();
                      if (e.key === "Escape") setIsEditingEmpire(false);
                    }}
                    placeholder={isEn ? "e.g. Medo-Persia" : "npr. Medo-Persija"}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveEmpire} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingEmpire(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingEmpire(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.empire ? <span>{item.empire}</span> : <span className="text-slate-500 italic">{isEn ? "e.g. Medo-Persia" : "npr. Medo-Persija"}</span>}
                </div>
              )}
            </div>

            {/* 4. PRESTONICA */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">4</span>
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{isEn ? "CAPITAL:" : "PRESTONICA:"}</span>
                </div>
                {!isEditingCapital && (
                  <button
                    onClick={() => setIsEditingCapital(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
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
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveCapital} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingCapital(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingCapital(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.capital ? <span>{item.capital}</span> : <span className="text-slate-500 italic">{isEn ? "e.g. Babylon" : "npr. Vavilon"}</span>}
                </div>
              )}
            </div>

            {/* 5. SLIKA */}
            {renderImageSection(5)}

            {/* 6. OPIS / LINK */}
            {renderDescAndLinkSection(6)}

            {/* 7. TAGOVI */}
            {renderTagsSection(7)}
          </>
        )}

        {/* ========================================================
            KATEGORIJA 3: SVETO PISMO
            Polja: 1. Naziv knjige, 2. Pisac, 3. Mesto pisanja, 4. Pisanje završeno, 5. Obuhvata vreme, 6. Slika, 7. Opis / link, 8. Tagovi
           ======================================================== */}
        {category === "SVETO_PISMO" && (
          <>
            {/* 2. PISAC */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">2</span>
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isEn ? "WRITER:" : "PISAC:"}</span>
                </div>
                {!isEditingWriter && (
                  <button
                    onClick={() => setIsEditingWriter(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>

              {isEditingWriter ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={writerInput}
                    onChange={(e) => setWriterInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveWriter();
                      if (e.key === "Escape") setIsEditingWriter(false);
                    }}
                    placeholder={isEn ? "e.g. Moses, Jeremiah, Paul" : "npr. Mojsije, Jeremija, Pavle"}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveWriter} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingWriter(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingWriter(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.writer ? <span>{item.writer}</span> : <span className="text-slate-500 italic">{isEn ? "Click to enter writer..." : "npr. Mojsije"}</span>}
                </div>
              )}
            </div>

            {/* 3. MESTO PISANJA */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">3</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isEn ? "WRITING PLACE:" : "MESTO PISANJA:"}</span>
                </div>
                {!isEditingWritingPlace && (
                  <button
                    onClick={() => setIsEditingWritingPlace(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>

              {isEditingWritingPlace ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={writingPlaceInput}
                    onChange={(e) => setWritingPlaceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveWritingPlace();
                      if (e.key === "Escape") setIsEditingWritingPlace(false);
                    }}
                    placeholder={isEn ? "e.g. Wilderness, Babylon, Rome" : "npr. Pustinja, Vavilon, Rim"}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveWritingPlace} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingWritingPlace(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingWritingPlace(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.writingPlace ? <span>{item.writingPlace}</span> : <span className="text-slate-500 italic">{isEn ? "Click to enter writing place..." : "npr. Pustinja"}</span>}
                </div>
              )}
            </div>

            {/* 4. PISANJE ZAVRŠENO */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">4</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isEn ? "WRITING COMPLETED:" : "PISANJE ZAVRŠENO:"}</span>
                </div>
                {!isEditingWritingCompleted && (
                  <button
                    onClick={() => setIsEditingWritingCompleted(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>

              {isEditingWritingCompleted ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={writingCompletedInput}
                    onChange={(e) => setWritingCompletedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveWritingCompleted();
                      if (e.key === "Escape") setIsEditingWritingCompleted(false);
                    }}
                    placeholder={isEn ? "e.g. c. 1513 BCE" : "npr. oko 1513. pre n. e."}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveWritingCompleted} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingWritingCompleted(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingWritingCompleted(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.writingCompleted ? <span>{item.writingCompleted}</span> : <span className="text-slate-500 italic">{isEn ? "Click to enter completion date..." : "npr. oko 1513. pre n. e."}</span>}
                </div>
              )}
            </div>

            {/* 5. OBUHVATA VREME */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">5</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isEn ? "TIME COVERED:" : "OBUHVATA VREME:"}</span>
                </div>
                {!isEditingTimeCovered && !isEditingYear && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsEditingTimeCovered(true)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                      title={isEn ? "Edit description text" : "Uredi opis"}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEn ? "Edit text" : "Uredi opis"}</span>
                    </button>
                    <button
                      onClick={() => setIsEditingYear(true)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                      title={isEn ? "Edit timeline years" : "Uredi godine na lenti"}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{isEn ? "Years" : "Godine"}</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditingTimeCovered ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={timeCoveredInput}
                    onChange={(e) => setTimeCoveredInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTimeCovered();
                      if (e.key === "Escape") setIsEditingTimeCovered(false);
                    }}
                    placeholder={isEn ? "e.g. „In the beginning“ to 1657 BCE" : "npr. „U početku“ do 1657. pre n. e."}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSaveTimeCovered} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingTimeCovered(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingTimeCovered(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.timeCovered ? <span>{item.timeCovered}</span> : <span className="text-slate-500 italic">{isEn ? "e.g. „In the beginning“ to 1657 BCE" : "npr. „U početku“ do 1657. pre n. e."}</span>}
                </div>
              )}

              {/* Year editor or Timeline span */}
              <div className="mt-2 pt-2 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold text-slate-400">
                    {isEn ? "Timeline span:" : "Godine na lenti:"}
                  </span>
                  {!isEditingYear && (
                    <button
                      onClick={() => setIsEditingYear(true)}
                      className="text-[10px] font-mono font-bold hover:text-[#D96B27] transition"
                      style={{ color: skinInfo.primary }}
                    >
                      {rangeString}
                    </button>
                  )}
                </div>

                {isEditingYear && (
                  <div className="space-y-2 mt-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                          {isEn ? "Start Year:" : "Početna godina:"}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={startYearNum}
                            onChange={(e) => setStartYearNum(e.target.value)}
                            placeholder="1513"
                            className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                              isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                            }`}
                          />
                          <select
                            value={startYearEra}
                            onChange={(e) => setStartYearEra(e.target.value as "BCE" | "CE")}
                            className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                              isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                            }`}
                          >
                            <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                            <option value="CE">{isEn ? "CE" : "n. e."}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10.5px] select-none font-semibold">
                        <input
                          type="checkbox"
                          checked={isPeriod}
                          onChange={(e) => setIsPeriod(e.target.checked)}
                          className="rounded text-[#D96B27] focus:ring-0"
                        />
                        <span>{isEn ? "This is a period (has an end year)" : "Ovo je vremenski period (ima završnu godinu)"}</span>
                      </label>
                    </div>

                    {isPeriod && (
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">
                          {isEn ? "End Year:" : "Završna godina:"}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={endYearNum}
                            onChange={(e) => setEndYearNum(e.target.value)}
                            placeholder="539"
                            className={`flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] font-mono ${
                              isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                            }`}
                          />
                          <select
                            value={endYearEra}
                            onChange={(e) => setEndYearEra(e.target.value as "BCE" | "CE")}
                            className={`px-1.5 py-1 text-xs rounded-lg border text-[11px] font-bold ${
                              isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                            }`}
                          >
                            <option value="BCE">{isEn ? "BCE" : "pre n. e."}</option>
                            <option value="CE">{isEn ? "CE" : "n. e."}</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setIsEditingYear(false)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${cancelBtnClass}`}
                      >
                        {isEn ? "Cancel" : "Otkaži"}
                      </button>
                      <button
                        onClick={handleSaveYear}
                        className="px-3 py-1 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEn ? "Save" : "Sačuvaj"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 6. SLIKA */}
            {renderImageSection(6)}

            {/* 7. OPIS / LINK */}
            {renderDescAndLinkSection(7)}

            {/* 8. TAGOVI */}
            {renderTagsSection(8)}
          </>
        )}

        {/* ========================================================
            KATEGORIJA 5 & 6: BIBLIJSKI DOGAĐAJ & SVETSKI DOGAĐAJ
            Polja: 3. Mesto, 4. Slika, 5. Opis / link, 6. Tagovi
           ======================================================== */}
        {(category === "BIBLIJSKI_DOGADJAJ" || category === "SVETSKI_DOGADJAJ") && (
          <>
            {/* 3. MESTO */}
            <div className={`p-2.5 rounded-xl border transition ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-[#D96B27] text-[10px] uppercase tracking-wider">
                  <span className="w-4 h-4 rounded bg-[#D96B27]/15 text-[#D96B27] dark:text-[#E8702A] flex items-center justify-center text-[10px] font-mono font-bold">3</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isEn ? "LOCATION / PLACE:" : "MESTO:"}</span>
                </div>
                {!isEditingPlace && (
                  <button
                    onClick={() => setIsEditingPlace(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#D96B27] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEn ? "Edit" : "Uredi"}</span>
                  </button>
                )}
              </div>

              {isEditingPlace ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={placeInput}
                    onChange={(e) => setPlaceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePlace();
                      if (e.key === "Escape") setIsEditingPlace(false);
                    }}
                    placeholder={isEn ? "e.g. Jerusalem, Sinai, Ur" : "npr. Jerusalim, Sinaj, Ur"}
                    autoFocus
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#D96B27]/40 focus:border-[#D96B27] ${
                      isLightTheme ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  />
                  <button onClick={handleSavePlace} className="p-1.5 rounded-lg bg-[#1E443A] hover:bg-[#28594D] text-white font-bold transition cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsEditingPlace(false)} className={`p-1.5 rounded-lg border transition cursor-pointer ${cancelBtnClass}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div onClick={() => setIsEditingPlace(true)} className="font-semibold text-xs cursor-pointer hover:text-[#D96B27] transition">
                  {item.place || item.location?.name ? (
                    <span>{item.place || item.location?.name}</span>
                  ) : (
                    <span className="text-slate-500 italic">{isEn ? "e.g. Jerusalem, Sinai, Ur" : "npr. Jerusalim, Sinaj, Ur"}</span>
                  )}
                </div>
              )}
            </div>

            {/* 4. SLIKA */}
            {renderImageSection(4)}

            {/* 5. OPIS / LINK */}
            {renderDescAndLinkSection(5)}

            {/* 6. TAGOVI */}
            {renderTagsSection(6)}
          </>
        )}

      </div>
    </motion.div>
  );
}
