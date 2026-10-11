/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { TimelineItem, GroupConfig, TimelineFilter, ViewMode, UserPreferences, TagConfig, NotionColor } from "../types";
import { NotionToolbar } from "./NotionToolbar";
import { resolveItemLocation, HISTORICAL_GEO_PRESETS } from "../geoData";
import { 
  HISTORICAL_EMPIRES, 
  getEmpireForYear, 
  findEmpireForTimelineItem,
  HistoricalEmpire,
  WOL_BIBLE_MAPS,
  WolMapInfo
} from "../historicalEmpires";
import { formatRange, getTranslatedGroup } from "../utils";
import { translations, LangType, getAppTranslations } from "../translations";
import { DraggableEventCard, detectEventCategory } from "./DraggableEventCard";
import { WolMapModal } from "./WolMapModal";
import { 
  MapPin, 
  Search, 
  Maximize2, 
  Compass, 
  Eye, 
  Edit3, 
  Layers, 
  Calendar, 
  SlidersHorizontal,
  PlusCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Crown,
  Shield,
  Map as MapIcon,
  Flag,
  Globe,
  Flame,
  Info,
  BookOpen,
  Pin,
  Trees,
  Mountain,
  Sparkles
} from "lucide-react";

interface MapAnalyticsViewProps {
  items: TimelineItem[];
  groups: GroupConfig[];
  filters: TimelineFilter;
  theme: "dark" | "light";
  skin: string;
  lang: LangType;
  onSelectDetailItem: (item: TimelineItem | null) => void;
  onEditItem: (item: TimelineItem) => void;
  onUpdateItem?: (updated: TimelineItem) => void;
  selectedDetailItem: TimelineItem | null;
  onFilterChange: (filters: TimelineFilter) => void;
  availableTags: TagConfig[];
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  onToggleGroup?: (groupName: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  preferences?: UserPreferences;
  onUpdatePreferences?: (prefs: Partial<UserPreferences>) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onAddNewItem?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onToggleLanguage?: () => void;
}

interface GeoEventItem {
  item: TimelineItem;
  location: {
    name?: string;
    lat: number;
    lng: number;
  };
  isAutoDetected: boolean;
  groupColor: string;
}

type MapTileStyle = "history_relief" | "history_kingdoms" | "today_borders" | "esri_topo";

export function MapAnalyticsView({
  items,
  groups,
  filters,
  theme,
  skin,
  lang,
  onSelectDetailItem,
  onEditItem,
  onUpdateItem,
  selectedDetailItem,
  onFilterChange,
  availableTags = [],
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  onToggleGroup,
  viewMode = "map",
  onViewModeChange = () => {},
  preferences = { theme: "dark", skin: "hronika", showCardIcon: true },
  onUpdatePreferences = () => {},
  isFullscreen = false,
  onToggleFullscreen,
  onAddNewItem,
  onOpenHelp,
  onOpenSettings,
  onToggleLanguage
}: MapAnalyticsViewProps) {
  const t = getAppTranslations(lang);
  const isEn = lang === "en";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const empireLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [localSearch, setLocalSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGeoItem, setSelectedGeoItem] = useState<GeoEventItem | null>(null);

  // Historical World Powers state
  const [selectedEmpireKey, setSelectedEmpireKey] = useState<string>("auto");
  const [showEmpireTerritory, setShowEmpireTerritory] = useState<boolean>(true);
  const [showCampaignRoute, setShowCampaignRoute] = useState<boolean>(true);
  const [showEmpireCities, setShowEmpireCities] = useState<boolean>(true);
  const [mapTileStyle, setMapTileStyle] = useState<MapTileStyle>("history_relief");
  const [showInfoBanner, setShowInfoBanner] = useState<boolean>(true);

  // Authentic WOL maps modal & Picture-in-Picture floating map states
  const [showWolModal, setShowWolModal] = useState<boolean>(false);
  const [selectedWolMapId, setSelectedWolMapId] = useState<number>(1);
  const [pinnedPipMap, setPinnedPipMap] = useState<WolMapInfo | null>(null);
  const [isPipCollapsed, setIsPipCollapsed] = useState<boolean>(false);

  // Group color lookup
  const groupColorMap = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((g) => map.set(g.name, g.color));
    return map;
  }, [groups]);

  // Compute located items from filtered items
  const { locatedEvents, unlocatedEvents } = useMemo(() => {
    const located: GeoEventItem[] = [];
    const unlocated: TimelineItem[] = [];

    items.forEach((item) => {
      const resolved = resolveItemLocation(item);
      const color = item.color || groupColorMap.get(item.group) || "#3b82f6";

      if (resolved) {
        located.push({
          item,
          location: resolved.location,
          isAutoDetected: resolved.isAutoDetected,
          groupColor: color,
        });
      } else {
        unlocated.push(item);
      }
    });

    return { locatedEvents: located, unlocatedEvents: unlocated };
  }, [items, groupColorMap]);

  // Filtered located items for map and list
  const filteredLocatedEvents = useMemo(() => {
    if (!localSearch.trim()) return locatedEvents;
    const q = localSearch.toLowerCase().trim();
    return locatedEvents.filter((ev) => {
      const title = ev.item.title.toLowerCase();
      const locName = (ev.location.name || "").toLowerCase();
      const desc = ev.item.description.toLowerCase();
      const tags = ev.item.tags.join(" ").toLowerCase();
      return title.includes(q) || locName.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [locatedEvents, localSearch]);

  // User-created World Power items in the timeline
  const userWorldPowerItems = useMemo(() => {
    return items.filter((it) => detectEventCategory(it) === "SVETSKA_SILA");
  }, [items]);

  // Determine active empire for geographic boundary and map overlay:
  // Resolved ONLY from user's manual items or selected world power event!
  const activeEmpire: HistoricalEmpire | null = useMemo(() => {
    if (selectedDetailItem) {
      const matched = findEmpireForTimelineItem(selectedDetailItem);
      if (matched) return matched;
    }

    if (selectedEmpireKey && selectedEmpireKey !== "auto" && HISTORICAL_EMPIRES[selectedEmpireKey]) {
      return HISTORICAL_EMPIRES[selectedEmpireKey];
    }

    if (userWorldPowerItems.length > 0) {
      const firstEmpire = findEmpireForTimelineItem(userWorldPowerItems[0]);
      if (firstEmpire) return firstEmpire;
    }

    return null;
  }, [selectedEmpireKey, selectedDetailItem, userWorldPowerItems]);

  const handleCardUpdate = (updatedItem: TimelineItem) => {
    if (onUpdateItem) {
      onUpdateItem(updatedItem);
    } else {
      onEditItem(updatedItem);
    }
  };

  const displayedCardItem = selectedDetailItem;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on the ancient Near East / Fertile Crescent & Mediterranean basin
      const map = L.map(mapContainerRef.current, {
        center: [33.0, 39.0],
        zoom: 5,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      // Zoom control in top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Layer groups for clean layered rendering
      const empireLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      empireLayerRef.current = empireLayer;
      routeLayerRef.current = routeLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Zero-API-Key Reliable Tile Layers
    // In "history_relief" and "history_kingdoms", use World_Physical_Map (pure physical relief, no modern country borders)
    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}";
    let tileAttribution = '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Ancient Physical Relief & Terrain (No Borders)';

    if (mapTileStyle === "today_borders") {
      // Provide clean, clear modern labels matching the chosen language
      // CartoDB Voyager and OSM tiles provide crisp Latin and localized naming without HTTP 429 / CORS blocking
      tileUrl = lang === "sr"
        ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    } else if (mapTileStyle === "history_kingdoms") {
      // Pure physical relief base layer - historical empires and kingdom borders are overlaid directly as authentic ancient territories
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}";
      tileAttribution = '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Ancient Physical Relief & Historical Kingdoms';
    } else if (mapTileStyle === "esri_topo") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      tileAttribution = '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Topographic Atlas';
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      subdomains: "abc",
      maxZoom: 18,
      attribution: tileAttribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;

    // Force size recomputation
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [mapTileStyle, lang]);

  // Resize observer to handle drawer toggle and window changes smoothly
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render Historical Empire Territory, Borders, Capital, Cities, and Military Campaign Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const empireLayer = empireLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !empireLayer || !routeLayer) return;

    empireLayer.clearLayers();
    routeLayer.clearLayers();

    // Render Historical Empire Territories & Borders
    // In "history_kingdoms" mode, draw all historical empires on the pure physical relief with their borders, prominent names, and capitals
    if (mapTileStyle === "history_kingdoms") {
      Object.values(HISTORICAL_EMPIRES).forEach((emp) => {
        if (!emp.polygon || emp.polygon.length === 0) return;
        const isCurrentActive = activeEmpire?.id === emp.id;
        
        const polygon = L.polygon(emp.polygon as any, {
          color: emp.borderColor,
          fillColor: emp.color,
          fillOpacity: isCurrentActive ? 0.35 : 0.22,
          weight: isCurrentActive ? 3.5 : 2,
          dashArray: isCurrentActive ? undefined : "4, 4",
        }).addTo(empireLayer);

        polygon.bindPopup(`
          <div class="p-3 text-xs space-y-1.5 font-sans">
            <div class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]" style="color: ${emp.borderColor}">
              <span>👑 ${isEn ? "Ancient Empire / Kingdom" : "Drevno carstvo / kraljevstvo"}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${isEn ? emp.nameEn : emp.nameSr}</h4>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">
              <span class="font-semibold">${isEn ? "Era:" : "Period:"}</span> ${formatRange(emp.startYear, undefined, emp.endYear, undefined, true, true, false, lang)}
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">
              <span class="font-semibold">${isEn ? "Capital:" : "Prestonica:"}</span> ${isEn ? emp.capitalEn : emp.capitalSr}
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">
              <span class="font-semibold">${isEn ? "Ruler:" : "Vladar:"}</span> ${isEn ? emp.rulerEn : emp.rulerSr}
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              ${isEn ? emp.descriptionEn : emp.descriptionSr}
            </p>
          </div>
        `);

        // Add prominent kingdom label on map
        if (emp.capitalCoords) {
          const kingdomName = isEn ? emp.nameEn : emp.nameSr;
          const capitalName = isEn ? emp.capitalEn : emp.capitalSr;
          
          const labelIcon = L.divIcon({
            className: "ancient-empire-label",
            html: `
              <div style="transform: translate(-50%, -50%);" class="pointer-events-none text-center select-none">
                <div class="px-2 py-0.5 rounded-md font-black text-xs tracking-wider shadow-lg border backdrop-blur-sm whitespace-nowrap"
                  style="background-color: ${emp.color}dd; color: #ffffff; border-color: ${emp.borderColor}; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                  👑 ${kingdomName}
                </div>
                <div class="text-[10px] font-bold text-amber-200 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  ★ ${capitalName}
                </div>
              </div>
            `,
          });

          L.marker(emp.capitalCoords, { icon: labelIcon, interactive: false }).addTo(empireLayer);
        }

        // Add historical cities for each ancient empire
        emp.cities?.forEach((city) => {
          const cityName = isEn ? city.nameEn : city.nameSr;
          const cityRole = isEn ? city.roleEn : city.roleSr;
          
          const cityMarker = L.circleMarker([city.lat, city.lng], {
            radius: city.isCapital ? 6 : 4,
            fillColor: city.isCapital ? "#f59e0b" : emp.borderColor,
            color: "#ffffff",
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.9,
          }).addTo(empireLayer);

          cityMarker.bindPopup(`
            <div class="p-2.5 text-xs space-y-1 font-sans">
              <div class="flex items-center gap-1 font-bold text-amber-500 text-[10px] uppercase">
                <span>${city.isCapital ? "★ " + (isEn ? "Capital" : "Prestonica") : "🏛️ " + (isEn ? "Ancient City" : "Antički grad")}</span>
              </div>
              <h5 class="font-bold text-sm text-slate-900 dark:text-white">${cityName}</h5>
              <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">${cityRole}</p>
            </div>
          `);
        });
      });
    } else if (showEmpireTerritory && activeEmpire && activeEmpire.polygon && activeEmpire.polygon.length > 0) {
      const polygon = L.polygon(activeEmpire.polygon as any, {
        color: activeEmpire.borderColor,
        fillColor: activeEmpire.color,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: "5, 5",
      }).addTo(empireLayer);

      polygon.bindPopup(`
        <div class="p-3 text-xs space-y-1 font-sans">
          <div class="flex items-center gap-1.5 font-bold text-amber-500 uppercase tracking-wider text-[10px]">
            <span>🏛️ ${isEn ? "Territory Contour" : "Granice teritorije"}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">${isEn ? activeEmpire.nameEn : activeEmpire.nameSr}</h4>
        </div>
      `);
    }
  }, [activeEmpire, showEmpireTerritory, mapTileStyle, isEn, lang]);

  // Update Event Markers from filteredLocatedEvents
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (filteredLocatedEvents.length === 0) return;

    filteredLocatedEvents.forEach((geoItem) => {
      const { item, location, groupColor, isAutoDetected } = geoItem;
      const latLng: [number, number] = [location.lat, location.lng];

      const isSelected = selectedDetailItem?.id === item.id;
      const yearText = formatRange(
        item.startYear,
        item.startMonth,
        item.endYear,
        item.endMonth,
        item.isApproximate,
        item.endApproximate,
        true,
        lang
      );

      // Custom HTML Marker icon
      const customIcon = L.divIcon({
        className: "custom-geo-marker-wrapper",
        html: `
          <div class="custom-geo-marker group relative" style="transform: translate(-50%, -100%);">
            <div class="geo-pulse-ring" style="background-color: ${groupColor}; opacity: ${isSelected ? "0.8" : "0.25"};"></div>
            
            <div class="relative flex flex-col items-center">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all border-2"
                style="
                  background-color: ${groupColor}; 
                  border-color: ${isSelected ? "#ffffff" : "rgba(255,255,255,0.7)"};
                  box-shadow: 0 4px 14px ${groupColor}88;
                  transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
                "
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>

              <!-- Compact Year Tag -->
              <div 
                class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight whitespace-nowrap shadow border pointer-events-none"
                style="
                  background-color: ${theme === "dark" ? "#0f172a" : "#ffffff"};
                  color: ${theme === "dark" ? "#f1f5f9" : "#0f172a"};
                  border-color: ${groupColor};
                "
              >
                ${yearText}
              </div>
            </div>
          </div>
        `,
        iconSize: [32, 52],
        iconAnchor: [16, 52],
        popupAnchor: [0, -48],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(markersLayer);

      // Marker popup content
      const popupDiv = document.createElement("div");
      popupDiv.className = "p-4 max-w-xs space-y-2.5 font-sans";
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b pb-2 border-slate-700/30">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white" style="background-color: ${groupColor};">
            ${item.group}
          </span>
          <span class="text-xs font-semibold opacity-80">
            ${yearText}
          </span>
        </div>

        <h4 class="font-bold text-sm leading-snug line-clamp-2 text-slate-900 dark:text-white">
          ${item.title}
        </h4>

        ${
          location.name
            ? `
          <div class="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${location.name}${isAutoDetected ? ` (${t.geoDetectedAuto})` : ""}</span>
          </div>
        `
            : ""
        }

        ${
          item.description
            ? `
          <p class="text-xs opacity-75 line-clamp-2 leading-relaxed text-slate-700 dark:text-slate-300">
            ${item.description}
          </p>
        `
            : ""
        }

        <div class="flex items-center gap-2 pt-2 border-t border-slate-700/30">
          <button id="geo-btn-detail-${item.id}" class="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1E443A] hover:bg-[#28594D] text-white transition flex items-center justify-center gap-1.5 cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            ${t.geoDetails}
          </button>
          <button id="geo-btn-edit-${item.id}" class="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-700/40 hover:bg-slate-700 hover:text-white transition flex items-center justify-center cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on("popupopen", () => {
        setSelectedGeoItem(geoItem);
        const detailBtn = document.getElementById(`geo-btn-detail-${item.id}`);
        const editBtn = document.getElementById(`geo-btn-edit-${item.id}`);

        if (detailBtn) {
          detailBtn.onclick = () => onSelectDetailItem(item);
        }
        if (editBtn) {
          editBtn.onclick = () => onEditItem(item);
        }
      });

      marker.on("click", () => {
        setSelectedGeoItem(geoItem);
        onSelectDetailItem(geoItem.item);
      });
    });
  }, [filteredLocatedEvents, selectedDetailItem, theme, lang]);

  // Center on event when selected
  useEffect(() => {
    if (!selectedDetailItem || !mapInstanceRef.current) return;
    const resolved = resolveItemLocation(selectedDetailItem);
    if (resolved) {
      mapInstanceRef.current.flyTo([resolved.location.lat, resolved.location.lng], 8, {
        duration: 1.2,
      });
    }
  }, [selectedDetailItem]);

  const handleFlyToEvent = (geoItem: GeoEventItem) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([geoItem.location.lat, geoItem.location.lng], 9, {
      duration: 1.2,
    });
    setSelectedGeoItem(geoItem);
    onSelectDetailItem(geoItem.item);
  };

  const handleFitEmpire = () => {
    if (!mapInstanceRef.current || !activeEmpire.polygon) return;
    const allPoints: [number, number][] = Array.isArray(activeEmpire.polygon[0][0])
      ? (activeEmpire.polygon as [number, number][][]).flat()
      : (activeEmpire.polygon as [number, number][]);
    const bounds = L.latLngBounds(allPoints);
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 7 });
    }
  };

  const handleFocusJerusalemAndBabylon = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [31.7683, 35.2137], // Jerusalim
      [32.5422, 44.4210], // Vavilon
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 7 });
  };

  const isLightTheme = theme === "light";

  const handleChooseEmpire = (key: string) => {
    setSelectedEmpireKey(key);
    onSelectDetailItem(null);
    setShowInfoBanner(true);
    if (key !== "auto" && HISTORICAL_EMPIRES[key]?.wolMap) {
      setSelectedWolMapId(HISTORICAL_EMPIRES[key].wolMap!.id);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none bg-slate-950">
      {/* Notion-style Top Command Bar */}
      <NotionToolbar
        filters={filters}
        onFilterChange={onFilterChange}
        availableTags={availableTags}
        onAddCustomTag={onAddCustomTag}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        groups={groups}
        onToggleGroup={onToggleGroup || (() => {})}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        preferences={preferences}
        onUpdatePreferences={onUpdatePreferences}
        theme={theme}
        lang={lang}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onAddNewItem={onAddNewItem}
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onToggleLanguage={onToggleLanguage}
      />

      <div className="flex-1 relative w-full h-full flex overflow-hidden">
        {/* MAP CANVAS */}
        <div className="flex-1 relative h-full w-full">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* 1. TOP SELECTOR RIBBON: User World Powers & Map Controls */}
        <div className="absolute top-3 left-3 right-14 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* World Powers Selector: ONLY User's manually entered World Powers */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl backdrop-blur-md shadow-xl border pointer-events-auto bg-slate-900/90 border-slate-700/70 text-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 text-amber-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>{isEn ? "WORLD POWER:" : "SVETSKA SILA:"}</span>
            </span>

            {userWorldPowerItems.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic px-2 py-1">
                {isEn ? "(Add a World Power in timeline)" : "(Dodajte događaj kategorije Svetska sila)"}
              </span>
            ) : (
              userWorldPowerItems.map((wpItem) => {
                const isSelected = selectedDetailItem?.id === wpItem.id;
                const empireData = findEmpireForTimelineItem(wpItem);
                const color = wpItem.color || empireData?.color || "#f59e0b";

                return (
                  <button
                    key={wpItem.id}
                    onClick={() => {
                      onSelectDetailItem(wpItem);
                      if (empireData?.id) {
                        setSelectedEmpireKey(empireData.id);
                      }
                      if (empireData?.polygon && empireData.polygon.length > 0 && mapInstanceRef.current) {
                        const poly = L.polygon(empireData.polygon as any);
                        mapInstanceRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] });
                      } else if (wpItem.location && mapInstanceRef.current) {
                        mapInstanceRef.current.setView([wpItem.location.lat, wpItem.location.lng], 6);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "shadow-md ring-1 ring-white/50"
                        : "hover:bg-slate-800 text-slate-200"
                    }`}
                    style={{
                      backgroundColor: isSelected ? color : "transparent",
                      color: isSelected ? "#000000" : color,
                    }}
                    title={wpItem.title}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{wpItem.title}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Map Controls: Danas / Istorija Switch + Authentic JW.ORG Maps */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-md shadow-xl border pointer-events-auto bg-slate-900/90 border-slate-700/70 text-slate-200">
            {/* Quick Switch / Slider: Danas (Today) vs Istorija Reljef (History Relief) vs Kraljevstva (Ancient Kingdoms) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                onClick={() => setMapTileStyle("today_borders")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  mapTileStyle === "today_borders"
                    ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
                title={t.mapModeTodayDesc}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t.mapModeToday}</span>
              </button>

              <button
                onClick={() => setMapTileStyle("history_relief")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  mapTileStyle === "history_relief"
                    ? "bg-[#1E443A] text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
                title={t.mapModeHistoryDesc}
              >
                <Mountain className="w-3.5 h-3.5 text-white" />
                <span>{isEn ? "Relief" : "Reljef"}</span>
              </button>

              <button
                onClick={() => {
                  setMapTileStyle("history_kingdoms");
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([33.0, 39.0], 5);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  mapTileStyle === "history_kingdoms"
                    ? "bg-[#D96B27] text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
                title={t.mapModeKingdomsDesc}
              >
                <Crown className="w-3.5 h-3.5 text-white" />
                <span>{t.mapModeKingdoms}</span>
              </button>
            </div>

            {/* Authentic wol.jw.org & jw.org Bible Maps Viewer Button */}
            <button
              onClick={() => {
                setSelectedWolMapId(activeEmpire?.wolMap?.id || 1);
                setShowWolModal(true);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-[#1E443A] hover:bg-[#28594D] text-white shadow-md border border-[#3E927B]/30"
              title={isEn ? "Authentic Maps from wol.jw.org & jw.org" : "Zvanične karte iz 'Pogledajmo dobru zemlju' sa wol.jw.org"}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>{isEn ? "JW.ORG Maps" : "wol.jw.org Mape"}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[10px] font-mono font-bold">
                {WOL_BIBLE_MAPS.length}
              </span>
            </button>

            {activeEmpire && (
              <button
                onClick={handleFitEmpire}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                title={isEn ? "Fit entire empire bounds" : "Prikaži celo carstvo"}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedDetailItem && (
              <div className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 bg-[#D96B27]/15 text-[#D96B27] border border-[#D96B27]/30">
                <Crown className="w-3.5 h-3.5" />
                <span>{selectedDetailItem.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CONTROLS: Stats & Locations Drawer Toggle */}
        <div className="absolute bottom-4 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg border text-xs font-semibold ${
              theme === "dark"
                ? "bg-slate-900/85 border-slate-700/60 text-slate-200"
                : "bg-white/90 border-slate-200/80 text-slate-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#D96B27]" />
            <span>
              <strong className="text-[#D96B27] font-bold">{filteredLocatedEvents.length}</strong>{" "}
              {t.geoEventsOnMap}
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Sakrij bočni panel" : "Prikaži listu lokacija"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg border text-xs font-medium transition hover:scale-105 active:scale-95 cursor-pointer ${
              theme === "dark"
                ? "bg-slate-900/85 border-slate-700/60 text-slate-200 hover:bg-slate-800"
                : "bg-white/90 border-slate-200/80 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D96B27]" />
            <span className="hidden sm:inline">{t.geoAllLocations}</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE DRAWER: Search & Located Events list */}
      {isSidebarOpen && (
        <aside
          className={`w-80 md:w-96 border-l flex flex-col h-full z-10 shadow-2xl transition-all duration-200 shrink-0 ${
            theme === "dark"
              ? "bg-[#0f1117] border-slate-800 text-slate-200"
              : "bg-white border-slate-200 text-slate-800"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-700/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D96B27]" />
              <h3 className="font-bold text-xs tracking-wider uppercase">
                {t.geoSectionTitle || "Geografske lokacije"}
              </h3>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-700/20 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t.geoSearchMap || "Pretraži lokacije na mapi..."}
                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border focus:outline-none transition ${
                  theme === "dark"
                    ? "bg-slate-900/90 border-slate-700 focus:border-amber-500 text-slate-200 placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-800 placeholder-slate-400"
                }`}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Event Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLocatedEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {t.geoNoMapEventsNotice || "Nema događaja sa unetom lokacijom."}
              </div>
            ) : (
              filteredLocatedEvents.map((ev) => {
                const { item, location, groupColor } = ev;
                const isSelected = selectedDetailItem?.id === item.id;
                const yearText = formatRange(
                  item.startYear,
                  item.startMonth,
                  item.endYear,
                  item.endMonth,
                  item.isApproximate,
                  item.endApproximate,
                  true,
                  lang
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => handleFlyToEvent(ev)}
                    style={{ borderColor: "#ea580a" }}
                    className={`p-3 rounded-xl border border-[#ea580a] text-xs transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#1E443A]/20 shadow-md ring-1 ring-[#1E443A]"
                        : theme === "dark"
                        ? "bg-slate-800/40 hover:bg-slate-800/80"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: groupColor }}
                      >
                        {item.group}
                      </span>
                      <span className="font-mono text-[11px] font-semibold opacity-75">{yearText}</span>
                    </div>

                    <h4 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white">{item.title}</h4>

                    <div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
                      <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[220px]">
                          {location.name || "Geografska koordinata"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="p-1 hover:text-amber-400 transition cursor-pointer"
                          title="Uredi događaj"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* DRAGGABLE & EDITABLE EVENT DETAIL CARD ON MAP */}
      {displayedCardItem && (
        <DraggableEventCard
          item={displayedCardItem}
          onClose={() => {
            onSelectDetailItem(null);
          }}
          onUpdateItem={handleCardUpdate}
          onEditFullModal={(it) => onEditItem(it)}
          theme={theme}
          skin={skin}
          lang={lang}
          initialPosition={{ x: 20, y: 72 }}
          isEmpireCard={false}
          isBabylonFall607={false}
          showEmpireTerritory={showEmpireTerritory}
          onToggleEmpireTerritory={() => setShowEmpireTerritory(!showEmpireTerritory)}
          showCampaignRoute={showCampaignRoute}
          onToggleCampaignRoute={() => setShowCampaignRoute(!showCampaignRoute)}
          hasCampaignRoute={Boolean(activeEmpire?.campaignRoute)}
          wolMapInfo={activeEmpire?.wolMap}
          availableTags={availableTags}
          onAddCustomTag={onAddCustomTag}
          onUpdateTag={onUpdateTag}
          onDeleteTag={onDeleteTag}
          onOpenWolMap={(mapId) => {
            setSelectedWolMapId(mapId || activeEmpire?.wolMap?.id || 1);
            setShowWolModal(true);
          }}
        />
      )}

      {/* FLOATING PICTURE-IN-PICTURE (PiP) OFFICIAL MAP FROM wol.jw.org */}
      {pinnedPipMap && (
        <div 
          className="absolute bottom-16 right-4 z-[500] w-72 sm:w-84 md:w-96 rounded-2xl overflow-hidden border shadow-2xl bg-[#181918]/95 border-[#D96B27]/50 backdrop-blur-md pointer-events-auto transition-all"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-[#1F2120] border-b border-[#383A39]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-[#E8702A] truncate">
                {isEn ? pinnedPipMap.titleEn : pinnedPipMap.titleSr}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setSelectedWolMapId(pinnedPipMap.id);
                  setShowWolModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={isEn ? "Open full modal" : "Prikaži preko celog ekrana"}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPipCollapsed(!isPipCollapsed)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={isPipCollapsed ? "Otvori prikaz" : "Umanji prikaz"}
              >
                {isPipCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setPinnedPipMap(null)}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                title="Zatvori plutajuću mapu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {!isPipCollapsed && (
            <div 
              className="relative cursor-pointer group bg-black"
              onClick={() => {
                setSelectedWolMapId(pinnedPipMap.id);
                setShowWolModal(true);
              }}
            >
              <img
                src={`/api/wol_map?id=${pinnedPipMap.id}`}
                alt={isEn ? pinnedPipMap.titleEn : pinnedPipMap.titleSr}
                className="w-full h-40 object-cover object-center group-hover:opacity-90 transition"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition">
                <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  {isEn ? "Click to view full size" : "Klikni za punu veličinu"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WOL BIBLE MAPS MODAL */}
      <WolMapModal
        isOpen={showWolModal}
        onClose={() => setShowWolModal(false)}
        lang={lang}
        initialMapId={selectedWolMapId}
        pinnedMapId={pinnedPipMap?.id || null}
        onPinPipMap={(map) => {
          if (pinnedPipMap?.id === map.id) {
            setPinnedPipMap(null);
          } else {
            setPinnedPipMap(map);
          }
        }}
      />
      </div>
    </div>
  );
}
