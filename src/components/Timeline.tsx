import React, { useRef, useState, useEffect } from "react";
import { TimelineItem, TagConfig, NotionColor, SkinType } from "../types";
import { formatRange, getTranslatedGroup } from "../utils";
import { LangType, getAppTranslations } from "../translations";
import { ZoomIn, ZoomOut, Maximize2, Flag, MapPin, Calendar, Edit2, Trash2, Plus, Minus, Globe, Link2, Loader2, Pin } from "lucide-react";
import { SKINS_CONFIG, getSkinCardBorderColor } from "./SettingsModal";
import { TagFilterPopover } from "./TagFilterPopover";

import { NotionToolbar } from "./NotionToolbar";
import { ViewMode, UserPreferences } from "../types";

interface TimelineProps {
  items: TimelineItem[];
  groups: { name: string; color: string; visible: boolean }[];
  filters: {
    searchQuery: string;
    selectedGroups: string[];
    selectedTag: string;
    fromYear: number;
    toYear: number;
  };
  onFilterChange?: (filters: any) => void;
  availableTags?: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  onToggleGroup?: (groupName: string) => void;
  onEditItem: (item: TimelineItem) => void;
  onDeleteItem: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  theme?: "dark" | "light";
  skin?: SkinType;
  lang?: LangType;
  selectedDetailItem?: TimelineItem | null;
  onSelectDetailItem?: (item: TimelineItem) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  preferences?: UserPreferences;
  onUpdatePreferences?: (prefs: Partial<UserPreferences>) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onAddNewItem?: (groupName?: string) => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onToggleLanguage?: () => void;
}

const MONTH_NAMES = [
  "jan", "feb", "mar", "apr", "maj", "jun", 
  "jul", "avg", "sep", "okt", "nov", "dec"
];

const AVAILABLE_STEPS = [
  1/12,   // 1 month
  1,      // 1 year
  5,      // 5 years
  10,     // 10 years (decades)
  50,     // 50 years
  100,    // 100 years (centuries)
  500,    // 500 years
  1000,   // 1000 years (millennia)
  2000,   // 2000 years
  5000,   // 5000 years
];

export function Timeline({
  items,
  groups,
  filters,
  onFilterChange,
  availableTags = [],
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  onToggleGroup = () => {},
  onEditItem,
  onDeleteItem,
  containerRef,
  theme = "dark",
  skin = "hronika",
  lang = "sr",
  selectedDetailItem,
  onSelectDetailItem,
  viewMode = "timeline",
  onViewModeChange = () => {},
  preferences = { theme: "dark", skin: "hronika", showDataSourceTitles: true, showVerticalLines: true, showCardIcon: true, openCardIn: "side_peek" },
  onUpdatePreferences = () => {},
  isFullscreen = false,
  onToggleFullscreen,
  onAddNewItem,
  onOpenHelp,
  onOpenSettings,
  onToggleLanguage
}: TimelineProps) {
  const t = getAppTranslations(lang);
  // State for pixel resolution (pixels per year)
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(0.6);
  const isZoomedOut = pixelsPerYear < 2.5;

  const [viewportWidth, setViewportWidth] = useState<number>(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  // State for checking whether event/period vertical guideline indicators are active
  const [showEventLines, setShowEventLines] = useState<boolean>(() => {
    const cached = localStorage.getItem("hronika_show_event_lines_v1");
    // Default to true (visible) so the new visual markers are seen immediately on startup
    return cached !== "false";
  });

  useEffect(() => {
    localStorage.setItem("hronika_show_event_lines_v1", showEventLines.toString());
  }, [showEventLines]);

  // State for whether single-year event cards are pinned/visible by default
  const [showSingleYearCards, setShowSingleYearCards] = useState<boolean>(() => {
    const cached = localStorage.getItem("hronika_show_single_year_cards_v1");
    return cached === "true"; // default false (only pins visible)
  });

  useEffect(() => {
    localStorage.setItem("hronika_show_single_year_cards_v1", showSingleYearCards.toString());
  }, [showSingleYearCards]);

  const formatYearLabel = (yr: number, isApprox?: boolean) => {
    const eraStr = yr < 0 ? (lang === "sr" ? "pre n. e." : "BCE") : yr > 0 ? (lang === "sr" ? "n. e." : "CE") : "";
    const dot = lang === "sr" ? "." : "";
    let label = yr === 0 ? (lang === "sr" ? "0." : "0") : `${Math.abs(Math.round(yr))}${dot} ${eraStr}`.trim();
    if (isApprox) {
      const approxStr = lang === "sr" ? "o. " : "ca. ";
      label = approxStr + label;
    }
    return label;
  };

  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    let cleanHex = hex.replace(/^\s*#|\s*$/g, '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const getYearColorWithAlpha = (val: number, baseHex: string, alpha = 1.0): string => {
    try {
      const { h, s, l } = hexToHsl(baseHex);
      if (val === 0) {
        return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
      } else if (val < 0) {
        // BCE - darker shade
        const darkL = Math.max(15, l - 20);
        return `hsla(${h}, ${s}%, ${darkL}%, ${alpha})`;
      } else {
        // CE - lighter shade
        const lightL = Math.min(90, l + 20);
        return `hsla(${h}, ${s}%, ${lightL}%, ${alpha})`;
      }
    } catch (e) {
      return baseHex;
    }
  };

  // State for vertical spacing / group lane heights adjustment
  const [laneSpacingMultiplier, setLaneSpacingMultiplier] = useState<number>(() => {
    const cached = localStorage.getItem("hronika_lane_spacing_v1");
    if (cached) {
      try {
        const val = parseFloat(cached);
        if (val >= 0.5 && val <= 2.5) return val;
      } catch (e) {}
    }
    return 1.0;
  });

  const [isEditingSpacing, setIsEditingSpacing] = useState(false);
  const [tempSpacingVal, setTempSpacingVal] = useState("");

  const startEditingSpacing = () => {
    setTempSpacingVal(Math.round(laneSpacingMultiplier * 100).toString());
    setIsEditingSpacing(true);
  };

  const saveSpacingVal = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(50, Math.min(250, val));
      setLaneSpacingMultiplier(clamped / 100);
    }
    setIsEditingSpacing(false);
  };

  useEffect(() => {
    localStorage.setItem("hronika_lane_spacing_v1", laneSpacingMultiplier.toString());
  }, [laneSpacingMultiplier]);

  // States for interactive rich hover preview card
  const [hoveredItem, setHoveredItem] = useState<TimelineItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [linkPreview, setLinkPreview] = useState<{ title?: string; description?: string; image?: string; loading?: boolean } | null>(null);
  const linkPreviewCache = useRef<Record<string, { title?: string; description?: string; image?: string }>>({});

  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [hoveredYearX, setHoveredYearX] = useState<number | null>(null);

  useEffect(() => {
    if (!hoveredItem || !hoveredItem.sourceUrl) {
      setLinkPreview(null);
      return;
    }

    const url = hoveredItem.sourceUrl;
    if (linkPreviewCache.current[url]) {
      setLinkPreview({ ...linkPreviewCache.current[url], loading: false });
      return;
    }

    setLinkPreview({ loading: true });
    let active = true;

    fetch(`/api/link_preview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        linkPreviewCache.current[url] = data;
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
  }, [hoveredItem]);

  // Calculate visual items boundaries
  const activeItems = items.filter(item => {
    // Check if group is visible
    const gr = groups.find(g => g.name === item.group);
    if (!gr || !gr.visible) return false;

    // Filter by selected sidebar groups
    if (filters.selectedGroups.length > 0 && !filters.selectedGroups.includes(item.group)) {
      return false;
    }

    // Filter by tag
    if (filters.selectedTag && !item.tags.includes(filters.selectedTag)) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // Filter by timespan range overlap
    const startNum = item.startYear;
    const endNum = item.endYear ?? item.startYear;

    // Check overlap of range [startNum, endNum] with filters [fromYear, toYear]
    if (endNum < filters.fromYear || startNum > filters.toYear) {
      return false;
    }

    return true;
  });

  // Calculate dynamic boundaries for global timeline mapping
  const minYearOfData = Math.min(...items.map(i => i.startYear), -4100);
  const maxYearOfData = Math.max(...items.map(i => i.endYear ?? i.startYear), 2050);

  // Extend boundaries by some comfort margins
  const minHistoricYear = minYearOfData - 150;
  const maxHistoricYear = maxYearOfData + 100;
  const totalYears = maxHistoricYear - minHistoricYear;

  // Real layout width of scrollable grid
  const timelineWidth = Math.max(viewportWidth, totalYears * pixelsPerYear);

  // Coordinate functions
  const toDecimalYear = (year: number, month?: number) => {
    if (!month) return year;
    return year + (month - 1) / 12;
  };

  const getX = (year: number, month?: number) => {
    const dec = toDecimalYear(year, month);
    return ((dec - minHistoricYear) / totalYears) * timelineWidth;
  };

  // Drag-to-pan implementation
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Skip if clicking buttons, edit markers, links etc.
    if ((e.target as HTMLElement).closest(".noclick") || (e.target as HTMLElement).tagName === "BUTTON") {
      return;
    }
    isDragging.current = true;
    if (containerRef.current) {
      startX.current = e.pageX - containerRef.current.offsetLeft;
      scrollLeft.current = containerRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const scrollOffset = (x - startX.current) * 1.5; // multiplier
    containerRef.current.scrollLeft = scrollLeft.current - scrollOffset;
  };

  const handleMouseMoveWithHover = (e: React.MouseEvent) => {
    handleMouseMove(e);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    
    // Clamp x coordinate to timeline boundaries
    const clampedX = Math.max(0, Math.min(timelineWidth, x));
    const decYear = minHistoricYear + (clampedX / timelineWidth) * totalYears;
    const year = Math.round(decYear);

    setHoveredYear(year);
    setHoveredYearX(clampedX);
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleMouseLeaveContainer = () => {
    handleMouseUpOrLeave();
    setHoveredYear(null);
    setHoveredYearX(null);
  };

  // Touch Pinch-to-zoom and Pan variables
  const lastTouchRef = useRef<{ x: number; scrollLeft: number } | null>(null);
  const touchPinchRef = useRef<{ dist: number; initialZoom: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (containerRef.current) {
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          scrollLeft: containerRef.current.scrollLeft
        };
      }
      touchPinchRef.current = null;
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchPinchRef.current = {
        dist,
        initialZoom: pixelsPerYear
      };
      lastTouchRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current && containerRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      containerRef.current.scrollLeft = lastTouchRef.current.scrollLeft - dx;
    } else if (e.touches.length === 2 && touchPinchRef.current && containerRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (dist > 10) {
        // Calculate new zoom factor
        const zoomRatio = dist / touchPinchRef.current.dist;
        const newZoom = Math.min(200, Math.max(0.015, touchPinchRef.current.initialZoom * zoomRatio));
        
        // Pivot around the center of pinch
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = (t1.clientX + t2.clientX) / 2 - rect.left + containerRef.current.scrollLeft;
        const centerYear = minHistoricYear + (centerX / timelineWidth) * totalYears;

        setPixelsPerYear(newZoom);

        // Adjust scroll to keep pinch-center static
        setTimeout(() => {
          if (containerRef.current) {
            const newTotalWidth = totalYears * newZoom;
            const newCenterX = ((centerYear - minHistoricYear) / totalYears) * newTotalWidth;
            containerRef.current.scrollLeft = newCenterX - (rect.width / 2);
          }
        }, 0);
      }
    }
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = null;
    touchPinchRef.current = null;
  };

  // Handle trackpad pinch-to-zoom on the scroll container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // e.ctrlKey is true when pinching on a trackpad
      if (e.ctrlKey) {
        e.preventDefault();
        
        let factor = 1 - e.deltaY * 0.01;
        // Clamp the zoom step to keep pinch scrolling extremely smooth and controlled
        factor = Math.min(1.15, Math.max(0.85, factor));

        setPixelsPerYear(prev => {
          const next = Math.min(200, Math.max(0.015, prev * factor));
          
          // Pivot around the mouse pointer's current client/viewport location relative to the container!
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          
          // Current scroll position before zoom
          const currentScrollLeft = container.scrollLeft;
          const mouseTimelineX = mouseX + currentScrollLeft;
          
          // Find ratio of mouse position relative to current total width
          const currentTotalWidth = Math.max(900, totalYears * prev);
          const ratio = mouseTimelineX / currentTotalWidth;
          
          setTimeout(() => {
            if (container) {
              const newTotalWidth = Math.max(900, totalYears * next);
              container.scrollLeft = ratio * newTotalWidth - mouseX;
            }
          }, 0);

          return next;
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, totalYears]);

  // Zoom helpers
  const zoomIn = () => {
    setPixelsPerYear(prev => {
      const next = Math.min(200, prev * 1.3);
      adjustScrollOnZoom(next);
      return next;
    });
  };

  const zoomOut = () => {
    setPixelsPerYear(prev => {
      const next = Math.max(0.015, prev / 1.3);
      adjustScrollOnZoom(next);
      return next;
    });
  };

  // Handle keyboard zoom shortcuts (Ctrl/Cmd +/-)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+" || e.key === "Add") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-" || e.key === "Subtract") {
          e.preventDefault();
          zoomOut();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomIn, zoomOut]);

  const adjustScrollOnZoom = (newZoom: number) => {
    if (!containerRef.current) return;
    const viewport = containerRef.current;
    const centerPercent = (viewport.scrollLeft + viewport.clientWidth / 2) / timelineWidth;
    setTimeout(() => {
      const newWidth = totalYears * newZoom;
      viewport.scrollLeft = centerPercent * newWidth - viewport.clientWidth / 2;
    }, 0);
  };

  const fitAll = () => {
    if (!containerRef.current) return;
    const viewportWidth = containerRef.current.clientWidth || 900;
    // Fit all exactly to viewport width so there is no empty space on the right
    const fitZoom = viewportWidth / totalYears;
    setPixelsPerYear(Math.max(0.015, Math.min(20, fitZoom)));
    setTimeout(() => {
      if (containerRef.current) containerRef.current.scrollLeft = 0;
    }, 10);
  };

  const jumpToYear = (targetYear: number) => {
    if (!containerRef.current) return;
    const targetX = getX(targetYear);
    const viewportWidth = containerRef.current.clientWidth;
    containerRef.current.scrollLeft = targetX - (viewportWidth / 2);
  };

  // Determine tick intervals: step is chosen from AVAILABLE_STEPS
  // step size * pixelsPerYear >= 140 (at least 140 pixels space between tick marks)
  let tickStep = 1000;
  for (const s of AVAILABLE_STEPS) {
    if (s * pixelsPerYear >= 110) {
      tickStep = s;
      break;
    }
  }

  // Generate grid ticks to render
  const ticks: { coordinateVal: number; label: string; isMinor: boolean }[] = [];
  const firstTickVal = Math.ceil(minHistoricYear / tickStep) * tickStep;

  for (let val = firstTickVal; val <= maxHistoricYear; val += tickStep) {
    let label = "";
    if (tickStep < 1) {
      // Month level
      const fraction = val % 1;
      const monthIndex = Math.round(fraction * 12);
      const year = Math.floor(val);
      const mNames = lang === "sr" ? MONTH_NAMES : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dot = lang === "sr" ? "." : "";
      label = `${mNames[monthIndex]} ${Math.abs(year)}${dot}`;
    } else {
      // Year level
      const dot = lang === "sr" ? "." : "";
      label = val === 0 ? (lang === "sr" ? "0." : "0") : `${Math.abs(val)}${dot}`;
    }

    ticks.push({
      coordinateVal: val,
      label,
      isMinor: false
    });

    // Add minor ticks if zoom level allows
    if (tickStep === 1 && pixelsPerYear > 5) {
      // Add quarters as minor ticks
      for (let m = 3; m <= 9; m += 3) {
        ticks.push({
          coordinateVal: val + m/12,
          label: `${MONTH_NAMES[m - 1]}`,
          isMinor: true
        });
      }
    } else if (tickStep === 10 && pixelsPerYear > 2) {
      // Add minor ticks for individual years
      for (let y = 1; y < 10; y++) {
        ticks.push({
          coordinateVal: val + y,
          label: `${val + y}`,
          isMinor: true
        });
      }
    }
  }

  // Layout calculations for overlapping stacks inside group lanes
  // We compute levels recursively for matching visual items
  const activeGroups = groups.filter(g => g.visible);

  // Group items by group name
  const itemsByGroup = activeGroups.map(grp => {
    const grItems = activeItems.filter(item => item.group === grp.name);

    // Calculate level layouts for items inside this group
    // Sort items by startYear ascending
    const sortedItems = [...grItems].sort((a, b) => {
      const aDec = toDecimalYear(a.startYear, a.startMonth);
      const bDec = toDecimalYear(b.startYear, b.startMonth);
      if (Math.abs(aDec - bDec) < 0.001) {
        // periods before events
        const aIsPeriod = typeof a.endYear === "number";
        const bIsPeriod = typeof b.endYear === "number";
        return (bIsPeriod ? 1 : 0) - (aIsPeriod ? 1 : 0);
      }
      return aDec - bDec;
    });

    // We compute levels for items inside this group based on visual block overlap.
    // If cards or periods do not overlap visually, we can place them on the exact same row level.
    const checkVisualOverlap = (itemA: TimelineItem, itemB: TimelineItem) => {
      const isPeriodA = typeof itemA.endYear === "number";
      const xStartA = getX(itemA.startYear, itemA.startMonth);
      const xEndA = isPeriodA ? getX(itemA.endYear!, itemA.endMonth) : xStartA;

      const isPeriodB = typeof itemB.endYear === "number";
      const xStartB = getX(itemB.startYear, itemB.startMonth);
      const xEndB = isPeriodB ? getX(itemB.endYear!, itemB.endMonth) : xStartB;

      // Calculate visual range [minX, maxX] for item A
      const minXA = isPeriodA ? xStartA : xStartA - 5;
      const maxXA = isPeriodA 
        ? Math.max(xStartA + 16, xEndA) 
        : xStartA + (isZoomedOut ? 160 : 190);

      // Calculate visual range [minX, maxX] for item B
      const minXB = isPeriodB ? xStartB : xStartB - 5;
      const maxXB = isPeriodB 
        ? Math.max(xStartB + 16, xEndB) 
        : xStartB + (isZoomedOut ? 160 : 190);

      // Overlap exists if the two visual spans intersect (minA < maxB and minB < maxA)
      return minXA < maxXB && minXB < maxXA;
    };

    const occupiedLevels: TimelineItem[][] = [];

    // Format visual items with assigned absolute properties
    const visualItems = sortedItems.map(item => {
      const xStart = getX(item.startYear, item.startMonth);
      const isPeriod = typeof item.endYear === "number";
      const xEnd = isPeriod ? getX(item.endYear!, item.endMonth) : xStart;

      // Find the first available stack level inside group
      let levelIndex = 0;
      while (true) {
        if (levelIndex >= occupiedLevels.length) {
          occupiedLevels.push([item]);
          break;
        } else {
          const hasOverlap = occupiedLevels[levelIndex].some(assignedItem => 
            checkVisualOverlap(assignedItem, item)
          );
          if (!hasOverlap) {
            occupiedLevels[levelIndex].push(item);
            break;
          } else {
            levelIndex++;
          }
        }
      }

      return {
        item,
        xStart,
        xEnd,
        isPeriod,
        level: levelIndex
      };
    });

    const totalLevels = occupiedLevels.length;
    const hasCardIconEnabled = preferences.showCardIcon ?? true;
    const baseRowSpacing = hasCardIconEnabled 
      ? (isZoomedOut ? 46 : 70) 
      : (isZoomedOut ? 38 : 58);
    const baseHeightOffset = hasCardIconEnabled 
      ? (isZoomedOut ? 36 : 46) 
      : (isZoomedOut ? 30 : 36);
    const minHeight = hasCardIconEnabled 
      ? (isZoomedOut ? 90 : 110) 
      : (isZoomedOut ? 76 : 90);
    const laneHeightPx = Math.max(
      minHeight * laneSpacingMultiplier,
      totalLevels * baseRowSpacing * laneSpacingMultiplier + baseHeightOffset * laneSpacingMultiplier
    );

    return {
      groupName: grp.name,
      groupColor: grp.color,
      visualItems,
      laneHeight: laneHeightPx
    };
  });

  // Calculate dynamic heights and cumulative positions for lane blocks
  const bottomAxisHeight = 44;
  let currentYAccumulator = bottomAxisHeight;
  const itemsByGroupWithY = itemsByGroup.map((lane) => {
    const topY = currentYAccumulator;
    const bottomY = currentYAccumulator + lane.laneHeight;
    currentYAccumulator = bottomY;
    return {
      ...lane,
      topY,
      bottomY
    };
  });

  const totalLanesHeight = itemsByGroup.reduce((acc, curr) => acc + curr.laneHeight, 0);
  const totalTimelineHeight = totalLanesHeight + bottomAxisHeight;

  // Jump to appropriate defaults on load if necessary
  useEffect(() => {
    // Jump to Year 0 on load
    jumpToYear(0);
  }, []);

  const isLightTheme = theme === "light";
  const skinInfo = (SKINS_CONFIG as any)[skin] || SKINS_CONFIG.hronika;
  const skinCardBorderColor = getSkinCardBorderColor(skin, theme as "light" | "dark");

  const minEventYear = items.length > 0 ? Math.min(...items.map(item => item.startYear)) : -4000;
  const maxEventYear = items.length > 0 ? Math.max(...items.map(item => item.startYear)) : new Date().getFullYear();
  const hasEventsAfterZero = items.some(item => item.startYear > 0);

  const getTooltipStyle = () => {
    if (!hoverPosition) return {};
    const width = 320;
    const height = 350;
    
    let x = hoverPosition.x;
    let y = hoverPosition.y;

    if (typeof window !== "undefined") {
      if (x + width + 20 > window.innerWidth) {
        x = x - width - 30; // Shift to the left of the cursor
      }
      if (y + height + 20 > window.innerHeight) {
        y = window.innerHeight - height - 20; // Pull up
      }
    }

    return {
      position: "fixed" as const,
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      zIndex: 100,
    };
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden relative transition ${
      isLightTheme ? (skin === "pro_studio" ? "bg-[#FAF9F6]" : "bg-[#ecebe5]") : (skin === "pro_studio" ? "bg-[#060910]" : "bg-[#191919]")
    }`}>
      {/* Notion-style Top Command Bar */}
      <NotionToolbar
        filters={filters}
        onFilterChange={onFilterChange || (() => {})}
        availableTags={availableTags}
        onAddCustomTag={onAddCustomTag}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        groups={groups}
        onToggleGroup={onToggleGroup}
        laneSpacingMultiplier={laneSpacingMultiplier}
        onChangeLaneSpacing={(val) => setLaneSpacingMultiplier(val)}
        showSingleYearCards={showSingleYearCards}
        onToggleSingleYearCards={() => setShowSingleYearCards(prev => !prev)}
        showEventLines={showEventLines}
        onToggleEventLines={() => setShowEventLines(prev => !prev)}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        preferences={preferences}
        skin={skin}
        onUpdatePreferences={onUpdatePreferences}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        fitAll={fitAll}
        jumpToYearZero={() => jumpToYear(0)}
        theme={theme}
        lang={lang}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onAddNewItem={onAddNewItem}
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onToggleLanguage={onToggleLanguage}
        items={items}
        jumpToYear={jumpToYear}
      />

      {/* Main timeline canvas content screen */}
      {/* Scrollable Container */}
      <div
        id="timeline_parent"
        ref={containerRef as any}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveWithHover}
        onMouseUp={handleMouseLeaveContainer}
        onMouseLeave={handleMouseLeaveContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex-1 overflow-x-auto overflow-y-auto cursor-grab active:cursor-grabbing select-none relative scroll-smooth focus:outline-none transition ${
          isLightTheme ? "bg-[#ecebe5]" : "bg-[#191919]"
        }`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="relative min-h-full"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* SVG Canvas Grid Overlay lines background */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ height: `${totalTimelineHeight}px` }}
          >
            {/* Vertical Year Grid Lines */}
            {ticks.map((tick, i) => {
              const x = getX(tick.coordinateVal);
              const isZero = tick.coordinateVal === 0;

              let strokeColor = "rgba(51, 65, 85, 0.55)";
              let strokeW = tick.isMinor ? 0.8 : 1.4;
              let dashArray: string | undefined = tick.isMinor ? "2,2" : undefined;

              if (skin === "pro_studio") {
                strokeColor = isZero 
                  ? "#10b981" 
                  : (tick.isMinor 
                      ? (isLightTheme ? "rgba(2, 132, 199, 0.12)" : "rgba(56, 189, 248, 0.14)") 
                      : (isLightTheme ? "rgba(2, 132, 199, 0.35)" : "rgba(56, 189, 248, 0.38)"));
                strokeW = isZero ? 2.2 : (tick.isMinor ? 0.8 : 1.4);
              } else {
                strokeColor = isZero 
                  ? "#1e433a" 
                  : (tick.isMinor 
                      ? (isLightTheme ? "rgba(55, 53, 47, 0.09)" : "rgba(255, 255, 255, 0.07)") 
                      : (isLightTheme ? "rgba(55, 53, 47, 0.16)" : "rgba(255, 255, 255, 0.13)"));
                strokeW = isZero ? 2 : (tick.isMinor ? 0.8 : 1.2);
              }

              return (
                <g key={`grid-${i}`}>
                   <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={totalTimelineHeight}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray={dashArray}
                  />
                </g>
              );
            })}

            {/* Interactive hovered year vertical cursor guide line */}
            {hoveredYear !== null && hoveredYearX !== null && (
              <line
                x1={hoveredYearX}
                y1={0}
                x2={hoveredYearX}
                y2={totalTimelineHeight}
                stroke={skinInfo.primary}
                strokeWidth={1.5}
                strokeDasharray="4,4"
                opacity={0.65}
                className="pointer-events-none"
              />
            )}

            {/* Horizontal Lanes Grid Dividers removed so no lines separate categories */}
          </svg>

          {/* Sticky Top Year Axis Time ruler */}
          <div
            className={`sticky top-0 left-0 z-20 flex items-center shrink-0 border-b transition ${
              skin === "hronika"
                ? (isLightTheme ? "bg-[#f7f6f3] border-[rgba(55,53,47,0.09)]" : "bg-[#202020] border-[rgba(255,255,255,0.09)]")
                : (isLightTheme ? "bg-[#e2e8f0] border-slate-300" : "bg-[#0f0f12] border-[#373735]")
            }`}
            style={{ height: `${bottomAxisHeight}px`, width: `${timelineWidth}px` }}
          >
            {ticks.map((tick, i) => {
              if (tick.isMinor) return null;
              const xExact = getX(tick.coordinateVal);
              const isZero = tick.coordinateVal === 0;
              return (
                <div
                  key={`axis-${i}`}
                  className="absolute font-mono text-[10px] font-bold border-l pl-1.5 h-6 flex items-center"
                  style={{ 
                    left: `${xExact}px`, 
                    transform: `translateX(-1px)`,
                    borderColor: isZero 
                      ? (isLightTheme ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)") 
                      : (isLightTheme ? "rgba(100, 116, 139, 0.4)" : "rgba(255, 255, 255, 0.25)"),
                    color: isLightTheme ? "#0f172a" : "#ffffff"
                  }}
                >
                  {tick.label}
                </div>
              );
            })}

            {/* Hovered Year Indicator on Ruler */}
            {hoveredYear !== null && hoveredYearX !== null && (
              <div
                className="absolute z-40 font-mono text-[11px] font-black px-2 py-0.5 rounded border shadow-md select-none pointer-events-none transition-transform flex items-center justify-center"
                style={{
                  left: `${hoveredYearX}px`,
                  transform: `translateX(-50%)`,
                  top: "2px", // upper half of the ruler bar
                  backgroundColor: hoveredYear === 0 
                    ? skinInfo.primary 
                    : (isLightTheme ? "rgba(255, 255, 255, 0.95)" : "rgba(30, 30, 35, 0.95)"),
                  borderColor: isLightTheme ? "rgba(100, 116, 139, 0.5)" : "rgba(255, 255, 255, 0.4)",
                  color: isLightTheme ? "#0f172a" : "#ffffff",
                }}
              >
                {hoveredYear === 0 ? (lang === "sr" ? "0." : "0") : `${Math.abs(hoveredYear)}${lang === "sr" ? "." : ""}`}
              </div>
            )}

            {/* Event Specific Year Labels on Ruler */}
            {showEventLines && activeItems.map((item) => {
              const itemGroupObj = groups.find(g => g.name === item.group);
              const itemColor = item.color || itemGroupObj?.color || "#eab308";
              const xStart = getX(item.startYear, item.startMonth);
              const isPeriod = typeof item.endYear === "number";
              const xEnd = isPeriod ? getX(item.endYear!, item.endMonth) : xStart;

              return (
                <React.Fragment key={`ruler-labels-${item.id}`}>
                  {/* Start Year Label Tag */}
                  <div
                    className="absolute font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded border text-white shadow-md z-30 transition-transform hover:scale-105 select-none"
                    style={{
                      left: `${xStart}px`,
                      transform: `translateX(-50%)`,
                      top: "22px", // sits beautifully on lower-half of the 44px top time area bar
                      backgroundColor: itemColor,
                      borderColor: isLightTheme ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)",
                    }}
                    title={`${item.title} (${lang === "sr" ? "početak" : "start"}): ${formatYearLabel(item.startYear, item.isApproximate)}`}
                  >
                    {formatYearLabel(item.startYear, item.isApproximate)}
                  </div>

                  {/* End Year Label Tag (only if group period has a specified end year) */}
                  {isPeriod && (
                    <div
                      className="absolute font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded border text-white shadow-md z-30 transition-transform hover:scale-105 select-none"
                      style={{
                        left: `${xEnd}px`,
                        transform: `translateX(-50%)`,
                        top: "22px",
                        backgroundColor: itemColor,
                        borderColor: isLightTheme ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)",
                      }}
                      title={`${item.title} (${lang === "sr" ? "kraj" : "end"}): ${formatYearLabel(item.endYear!, item.endApproximate)}`}
                    >
                      {formatYearLabel(item.endYear!, item.endApproximate)}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

           {/* Group lanes container list */}
          <div className={`flex flex-col ${isLightTheme ? 'bg-[#ecebe5]' : ''}`}>
             {itemsByGroupWithY.map((laneConfig, idx) => {
              const laneBgClass = skin === "pro_studio"
                ? (isLightTheme
                    ? (idx % 2 === 0 ? "bg-[#FAF9F6] hover:bg-[#F3EFEA]" : "bg-[#FFFFFF] hover:bg-[#F7F4EE]")
                    : (idx % 2 === 0 ? "bg-[#060910] hover:bg-[#0a0f1a]" : "bg-[#090d16] hover:bg-[#0d1422]"))
                : (isLightTheme
                    ? (idx % 2 === 0 ? "bg-[#ecebe5] hover:bg-[#e4e3dd]" : "bg-[#f3f2ec] hover:bg-[#eae9e3]")
                    : (idx % 2 === 0 ? "bg-[#181818] hover:bg-[#202020]" : "bg-[#1f1f1f] hover:bg-[#262626]"));

              return (
                <div
                  key={laneConfig.groupName}
                  onDoubleClick={(e) => {
                    if ((e.target as HTMLElement).closest('[group="card"]') || (e.target as HTMLElement).closest('.noclick')) return;
                    onAddNewItem?.(laneConfig.groupName);
                  }}
                  className={`relative transition-colors duration-150 ${laneBgClass}`}
                  style={{ height: `${laneConfig.laneHeight}px` }}
                  id={`lane_group_${laneConfig.groupName.replace(/\s+/g, '_')}`}
                >
                  {/* Floating Left Group Banner inside timeline */}
                  <div className="sticky left-0 top-2 z-10 ml-4 max-w-[200px] mb-2 pointer-events-auto">
                    <div 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onAddNewItem?.(laneConfig.groupName);
                      }}
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur?.();
                      }}
                      title={lang === "sr" ? "Dvoklik za dodavanje novog događaja u ovu kategoriju" : "Double-click to add a new event to this category"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold shadow-sm transition-all duration-200 cursor-pointer hover:scale-105 select-none ${
                        isLightTheme 
                          ? "bg-white text-slate-800 border border-slate-200 shadow-xs hover:bg-[#FAF8F5]" 
                          : "bg-[#141418]/95 backdrop-blur-xs border border-[#373735] text-slate-200 shadow-xs hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                        style={{ backgroundColor: laneConfig.groupColor }}
                      />
                      <span className={isLightTheme ? "text-slate-800" : "text-slate-200"}>{getTranslatedGroup(laneConfig.groupName, lang || "sr", t)}</span>
                      <span className={isLightTheme ? "text-slate-500 font-mono text-[10px]" : "text-[#7d7a75] font-mono text-[10px]"}>
                        ({laneConfig.visualItems.length})
                      </span>
                    </div>
                  </div>

                  {/* Render Visual items cards */}
                  {laneConfig.visualItems.map(({ item, xStart, xEnd, isPeriod, level }, idx) => {
                    const hasCardIconEnabled = preferences.showCardIcon ?? true;
                    const baseRowHeight = hasCardIconEnabled ? (isZoomedOut ? 46 : 66) : (isZoomedOut ? 38 : 54);
                    const rowHeight = baseRowHeight * laneSpacingMultiplier;
                    const topHeaderOffset = (isZoomedOut ? 32 : 42) * laneSpacingMultiplier;
                    const topPx = level * rowHeight + topHeaderOffset;
                    const pillWidth = isPeriod ? Math.max(16, xEnd - xStart) : (isZoomedOut ? 170 : (hasCardIconEnabled ? 270 : 195));
                    const isCardShort = isPeriod && pillWidth < 165;
                    const alternatingBgClass = "";
                    const rangeString = formatRange(
                      item.startYear,
                      item.startMonth,
                      item.endYear,
                      item.endMonth,
                      item.isApproximate,
                      item.endApproximate,
                      isCardShort
                    );

                    if (isPeriod) {
                      // 1. Render HORIZONTAL PERIOD BAR
                      return (
                        <div
                          key={item.id}
                          group="card"
                          className={`absolute group/card rounded-lg flex flex-col justify-center px-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer select-text duration-205 ${alternatingBgClass}`}
                          style={{
                            left: `${xStart}px`,
                            width: `${pillWidth}px`,
                            top: `${topPx}px`,
                            height: hasCardIconEnabled ? (isZoomedOut ? "34px" : "48px") : (isZoomedOut ? "26px" : "36px"),
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: skinCardBorderColor,
                            backgroundColor: isLightTheme
                              ? `${item.color || laneConfig.groupColor}12` // slightly lighter 7%
                              : `${item.color || laneConfig.groupColor}1A`, // transparent background
                            backdropFilter: "blur(1px)"
                          }}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest(".noclick")) return;
                            e.stopPropagation();
                            if (onSelectDetailItem) {
                              onSelectDetailItem(item);
                            }
                          }}
                          onMouseEnter={(e) => {
                            setHoveredItem(item);
                            setHoverPosition({ x: e.clientX + 15, y: e.clientY + 15 });
                          }}
                          onMouseMove={(e) => {
                            setHoverPosition({ x: e.clientX + 15, y: e.clientY + 15 });
                          }}
                          onMouseLeave={() => {
                            setHoveredItem(null);
                            setHoverPosition(null);
                          }}
                        >
                          <div className={`relative flex items-center justify-between gap-1.5 w-full h-full overflow-hidden ${isZoomedOut ? "py-0" : ""}`}>
                            {isZoomedOut ? (
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate pr-9">
                                {hasCardIconEnabled && item.image && (
                                  <img 
                                    src={item.image} 
                                    alt="" 
                                    className="w-4 h-4 rounded object-cover flex-shrink-0 border border-slate-300 dark:border-slate-850"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <span 
                                  className={`font-bold text-[10.5px] truncate shrink-0 ${!item.color ? (isLightTheme ? "text-slate-800" : "text-slate-100") : ""}`}
                                  style={item.color ? { color: item.color } : undefined} 
                                  title={item.title}
                                >
                                  {item.title}
                                </span>
                                <span className={`font-mono text-[8.5px] shrink-0 ${
                                  isLightTheme ? "text-slate-500" : "text-slate-400"
                                }`}>
                                  ({rangeString})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 min-w-0 flex-1 pr-9">
                                {hasCardIconEnabled && item.image && (
                                  <img 
                                    src={item.image} 
                                    alt="" 
                                    className="w-7 h-7 rounded object-cover flex-shrink-0 border border-slate-300 dark:border-slate-800"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                  <span 
                                    className={`font-bold text-[11px] truncate leading-tight ${!item.color ? (isLightTheme ? "text-slate-800" : "text-slate-100") : ""}`}
                                    style={item.color ? { color: item.color } : undefined} 
                                    title={item.title}
                                  >
                                    {item.title}
                                  </span>
                                  <div className={`flex items-center gap-1 font-mono text-[8.5px] overflow-hidden truncate mt-0.5 ${
                                    isLightTheme ? "text-slate-500" : "text-slate-400"
                                  }`}>
                                    <Calendar className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                    <span>{rangeString}</span>
                                    {item.sourceUrl && <span className="ml-0.5 text-[8.5px] text-amber-500 font-bold shrink-0" title={item.sourceUrl}>🔗</span>}
                                  </div>
                                  {hasCardIconEnabled && item.description && (
                                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-full">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Actions block visible on hover */}
                            <div className={`noclick flex gap-0.5 border rounded-md shadow-lg opacity-0 group-hover/card:opacity-100 transition absolute right-0.5 top-1/2 -translate-y-1/2 py-0.5 px-0.5 ${
                              isLightTheme ? "bg-white border-slate-200" : "bg-slate-900 border-slate-850"
                            }`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditItem(item);
                                }}
                                className="p-0.5 hover:text-amber-500 text-slate-400 rounded transition"
                                title="Uredi"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Da li ste sigurni da želite da obrišete događaj "${item.title}"?`)) {
                                    onDeleteItem(item.id);
                                  }
                                }}
                                className="p-0.5 hover:text-red-500 text-slate-405 rounded transition"
                                title="Obriši"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // 2. Render SINGLE EVENT MARKER
                      return (
                        <div
                          key={item.id}
                          className="absolute group/card flex items-start cursor-pointer select-text transition"
                          style={{
                            left: `${xStart}px`,
                            top: `${topPx}px`,
                            height: isZoomedOut ? "30px" : "40px"
                          }}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest(".noclick")) return;
                            e.stopPropagation();
                            if (onSelectDetailItem) {
                              onSelectDetailItem(item);
                            }
                          }}
                          onMouseEnter={(e) => {
                            setHoveredItem(item);
                            setHoverPosition({ x: e.clientX + 15, y: e.clientY + 15 });
                          }}
                          onMouseMove={(e) => {
                            setHoverPosition({ x: e.clientX + 15, y: e.clientY + 15 });
                          }}
                          onMouseLeave={() => {
                            setHoveredItem(null);
                            setHoverPosition(null);
                          }}
                        >
                          {/* Dot marker pin */}
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shadow-md shrink-0 z-10 translate-x-[-7px] ${isZoomedOut ? "mt-1.5" : "mt-2"} relative`}
                            style={{ 
                              borderColor: isLightTheme ? "#ffffff" : "#0a0a0c",
                              backgroundColor: item.color || laneConfig.groupColor 
                            }}
                          >
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                          </div>

                          {/* Line extension visual placeholder */}
                          <div 
                            className="absolute border-l border-dashed pointer-events-none"
                            style={{ 
                              left: "0px", 
                              borderColor: item.color || laneConfig.groupColor, 
                              top: isZoomedOut ? "12px" : "16px",
                              height: isZoomedOut ? "12px" : "20px",
                              opacity: 0.6
                            }} 
                          />

                          {/* Float Card Text box (only shown when pinned/enabled) */}
                          {showSingleYearCards && (
                            <div
                              group="card"
                              className={`rounded-lg shadow-xl px-2 ml-1 text-left relative transition flex ${alternatingBgClass} ${
                                isZoomedOut 
                                  ? "items-center py-0 max-w-[240px]" 
                                  : `flex-col justify-center py-0.5 ${item.image || hasCardIconEnabled ? "max-w-[280px]" : "max-w-[195px]"}`
                              } ${
                                isLightTheme 
                                  ? "bg-white text-slate-800" 
                                  : "bg-slate-900 text-slate-205"
                              }`}
                              style={{ 
                                height: hasCardIconEnabled ? (isZoomedOut ? "34px" : "48px") : (isZoomedOut ? "26px" : "36px"),
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: skinCardBorderColor
                              }}
                            >
                              <div className={`relative flex items-center justify-between gap-1.5 w-full h-full overflow-hidden`}>
                                {isZoomedOut ? (
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate pr-9">
                                    {hasCardIconEnabled && item.image && (
                                      <img 
                                        src={item.image} 
                                        alt="" 
                                        className="w-4 h-4 rounded object-cover flex-shrink-0 border border-slate-300 dark:border-slate-850"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <span 
                                      className={`font-bold text-[10.5px] truncate shrink-0 ${!item.color ? (isLightTheme ? "text-slate-800" : "text-slate-200") : ""}`}
                                      style={item.color ? { color: item.color } : undefined}
                                      title={item.title}
                                    >
                                      {item.title}
                                    </span>
                                    <span className="font-mono text-[8.5px] whitespace-nowrap shrink-0 flex items-center gap-0.5" style={{ color: item.color || laneConfig.groupColor }}>
                                      <MapPin className="w-2.2 h-2.2 shrink-0 opacity-80" /> {rangeString}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-9">
                                    {hasCardIconEnabled && item.image && (
                                      <img 
                                        src={item.image} 
                                        alt="" 
                                        className="w-7 h-7 rounded object-cover flex-shrink-0 border border-slate-300 dark:border-slate-850"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <div className="flex flex-col justify-center min-w-0 flex-1">
                                      <span 
                                        className={`font-bold text-[11px] truncate leading-tight ${!item.color ? (isLightTheme ? "text-slate-800" : "text-slate-200") : ""}`}
                                        style={item.color ? { color: item.color } : undefined}
                                        title={item.title}
                                      >
                                        {item.title}
                                      </span>
                                      <span className="font-mono text-[8.5px] whitespace-nowrap flex items-center gap-0.5 mt-0.5" style={{ color: item.color || laneConfig.groupColor }}>
                                        <MapPin className="w-2.2 h-2.2 shrink-0 opacity-80" /> {rangeString}
                                        {item.sourceUrl && <span className="ml-0.5 text-[8.5px] text-amber-500 font-bold shrink-0" title={item.sourceUrl}>🔗</span>}
                                      </span>
                                      {hasCardIconEnabled && item.description && (
                                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-full">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Actions block */}
                                <div className={`noclick flex gap-0.5 shadow-md border rounded-md opacity-0 group-hover/card:opacity-100 transition absolute right-0.5 top-1/2 -translate-y-1/2 px-0.5 py-0.5 ${
                                  isLightTheme ? "bg-white border-slate-250" : "bg-slate-900 border-slate-800"
                                }`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditItem(item);
                                    }}
                                    className="p-0.5 hover:text-amber-500 text-slate-400 rounded transition"
                                    title="Uredi"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Da li ste sigurni da želite da obrišete događaj "${item.title}"?`)) {
                                        onDeleteItem(item.id);
                                      }
                                    }}
                                    className="p-0.5 hover:text-red-500 text-slate-400 rounded transition"
                                    title="Obriši"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              );
            })}
          </div>

          {/* Foreground Event Specific Vertical Lines Overlay */}
          {showEventLines && (
            <svg
              className="absolute top-0 left-0 w-full pointer-events-none z-10"
              style={{ height: `${totalTimelineHeight}px` }}
            >
              {activeItems.map((item) => {
                const itemGroupObj = groups.find(g => g.name === item.group);
                const itemColor = item.color || itemGroupObj?.color || "#eab308";
                const xStart = getX(item.startYear, item.startMonth);
                const isPeriod = typeof item.endYear === "number";
                const xEnd = isPeriod ? getX(item.endYear!, item.endMonth) : xStart;

                return (
                  <g key={`foreground-event-lines-${item.id}`}>
                    {/* Start Year Vertical Guide Line */}
                    <line
                      x1={xStart}
                      y1={0}
                      x2={xStart}
                      y2={totalTimelineHeight}
                      stroke={itemColor}
                      strokeWidth={1.5}
                      strokeDasharray="3,3"
                      strokeOpacity={0.7}
                    />
                    {/* End Year Vertical Guide Line */}
                    {isPeriod && (
                      <line
                        x1={xEnd}
                        y1={0}
                        x2={xEnd}
                        y2={totalTimelineHeight}
                        stroke={itemColor}
                        strokeWidth={1.5}
                        strokeDasharray="3,3"
                        strokeOpacity={0.7}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive Rich Hover Popover / Tooltip Card */}
          {hoveredItem && hoverPosition && (
            <div
              style={{ ...getTooltipStyle(), borderColor: "#ea580a" }}
              className={`pointer-events-none rounded-xl border border-[#ea580a] p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ease-out z-[999] ${
                isLightTheme
                  ? "bg-white/95 text-slate-800 shadow-slate-300"
                  : "bg-slate-950/95 text-slate-100 shadow-black"
              }`}
            >
              {/* 1. Image Preview (sličica, ako je dodata) */}
              {hoveredItem.image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={hoveredItem.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* 2. Metadata: Group Badge & Date Range */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className="text-xs font-normal px-2 py-0.5 rounded border bg-[#18181f] text-[#cbd5e1] border-slate-750"
                >
                  {hoveredItem.group}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {formatRange(
                    hoveredItem.startYear,
                    hoveredItem.startMonth,
                    hoveredItem.endYear,
                    hoveredItem.endMonth,
                    hoveredItem.isApproximate,
                    hoveredItem.endApproximate,
                    false
                  )}
                </span>
              </div>

              {/* 3. Event Title */}
              <h4 className="text-xs font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white leading-snug">
                {hoveredItem.title}
              </h4>

              {/* 4. Short Description snippet */}
              {hoveredItem.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed mb-3 line-clamp-3">
                  {hoveredItem.description}
                </p>
              )}

              {/* 5. Link Source Web Preview (kratak preview teksta sa linka, ako je dodat) */}
              {hoveredItem.sourceUrl && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mb-2 uppercase tracking-wider">
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === "sr" ? "Pregled sa sajta" : "Site preview"}</span>
                  </div>

                  {linkPreview?.loading ? (
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-500 shrink-0" />
                      <span className="text-[10px] text-slate-400 animate-pulse">
                        {lang === "sr" ? "Učitavanje opisa..." : "Fetching description..."}
                      </span>
                    </div>
                  ) : linkPreview ? (
                    <div className="rounded p-2 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[240px]" title={linkPreview.title}>
                          {linkPreview.title}
                        </span>
                      </div>
                      
                      {linkPreview.description ? (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-3 italic">
                          {linkPreview.description}
                        </p>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 break-all leading-normal block">
                          {hoveredItem.sourceUrl}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 break-all leading-normal block bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded">
                      {hoveredItem.sourceUrl}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
