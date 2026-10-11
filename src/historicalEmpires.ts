/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineItem } from "./types";

export interface EmpireCity {
  nameSr: string;
  nameEn: string;
  lat: number;
  lng: number;
  roleSr: string;
  roleEn: string;
  isCapital?: boolean;
}

export interface WolMapInfo {
  id: number;
  code: string;
  titleSr: string;
  titleEn: string;
  descriptionSr: string;
  descriptionEn: string;
  publicationSr: string;
  publicationEn: string;
  docUrlSr: string;
  docUrlEn: string;
  relatedEmpireId?: "babylon" | "assyria" | "egypt" | "medopersia" | "greece" | "rome";
}

export interface HistoricalEmpire {
  id: "babylon" | "assyria" | "egypt" | "medopersia" | "greece" | "rome";
  nameSr: string;
  nameEn: string;
  startYear: number;
  endYear: number;
  peakYear: number;
  rulerSr: string;
  rulerEn: string;
  capitalSr: string;
  capitalEn: string;
  color: string;
  borderColor: string;
  descriptionSr: string;
  descriptionEn: string;
  significanceSr: string;
  significanceEn: string;
  territorySr: string;
  territoryEn: string;
  capitalCoords: [number, number];
  polygon: [number, number][] | [number, number][][];
  cities: EmpireCity[];
  campaignRoute?: {
    nameSr: string;
    nameEn: string;
    coords: [number, number][];
  };
  wolMap?: WolMapInfo;
}

/**
 * Official Bible Atlas Maps from Watchtower Online Library (wol.jw.org / jw.org)
 * From publication "Pogledajmo dobru zemlju" (See the Good Land - gl) and Appendix B9
 */
export const WOL_BIBLE_MAPS: WolMapInfo[] = [
  {
    id: 1,
    code: "gl-12-13",
    titleSr: "Carstva napadaju Obećanu zemlju (Vavilonsko i Asirsko carstvo)",
    titleEn: "Empires Attack the Promised Land (Babylonian and Assyrian Empires)",
    descriptionSr: "Zvanična mapa iz 'Pogledajmo dobru zemlju' (gl str. 12–13). Prikazuje vojne pohode Vavilona i Asirije, pad Samarije (740. p. n. e.) i opsadu i razorenje Jerusalima od strane kralja Nabuhodonosora (607. p. n. e.).",
    descriptionEn: "Official map from 'See the Good Land' (gl pp. 12–13). Shows the military routes of Babylon and Assyria, fall of Samaria (740 BCE), and siege and fall of Jerusalem under Nebuchadnezzar (607 BCE).",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 12–13) & Dodatak B9",
    publicationEn: "'See the Good Land' (gl pp. 12–13) & Appendix B9",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003106",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003106",
    relatedEmpireId: "babylon"
  },
  {
    id: 23,
    code: "gl-26-27",
    titleSr: "Božji narod se vraća u svoju zemlju (Medo-persijsko carstvo)",
    titleEn: "God's People Return to Their Land (Medo-Persian Empire)",
    descriptionSr: "Zvanična mapa iz 'Pogledajmo dobru zemlju' (gl str. 26–27). Prikazuje Medo-persijsko carstvo od reke Ind do Nila i Egejskog mora, carske prestonice Suzu i Persepolj, i rute povratka Jevreja u domovinu pod Kirom Velikim 537. p. n. e.",
    descriptionEn: "Official map from 'See the Good Land' (gl pp. 26–27). Depicts the Medo-Persian Empire from the Indus River to Egypt, royal cities Susa and Persepolis, and Jewish return routes under Cyrus in 537 BCE.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 26–27) & Dodatak B9",
    publicationEn: "'See the Good Land' (gl pp. 26–27) & Appendix B9",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003108",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003108",
    relatedEmpireId: "medopersia"
  },
  {
    id: 15,
    code: "gl-28-29",
    titleSr: "Grčka i Rim utiču na Jevreje (Grčko i Rimsko carstvo)",
    titleEn: "Greece and Rome Influence the Jews (Grecian and Roman Empires)",
    descriptionSr: "Zvanična mapa iz 'Pogledajmo dobru zemlju' (gl str. 28–29). Prikazuje osvajanja Aleksandra Velikog, podelu carstva na četiri helenistička kraljevstva (Seleukidi i Ptolemeji) i rimsku aneksiju Judeje 63. p. n. e.",
    descriptionEn: "Official map from 'See the Good Land' (gl pp. 28–29). Shows Alexander's conquests, division into four Hellenistic kingdoms, and Roman occupation of Judea in 63 BCE.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 28–29) & Dodatak B9",
    publicationEn: "'See the Good Land' (gl pp. 28–29) & Appendix B9",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003112",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003112",
    relatedEmpireId: "greece"
  },
  {
    id: 13,
    code: "gl-8-9",
    titleSr: "Od Egipta do Obećane zemlje (Egipatsko carstvo i Izlazak)",
    titleEn: "From Egypt to the Promised Land (Egyptian Empire & The Exodus)",
    descriptionSr: "Zvanična mapa iz 'Pogledajmo dobru zemlju' (gl str. 8–9). Prikazuje dolinu Nila, Memfis, Rameses, prolazak kroz Crveno more, Sinajsku goru i 40-godišnje putovanje Izraelaca do Hanana.",
    descriptionEn: "Official map from 'See the Good Land' (gl pp. 8–9). Shows the Nile Valley, Memphis, Rameses, Red Sea crossing, Mount Sinai, and 40 years of wandering.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 8–9)",
    publicationEn: "'See the Good Land' (gl pp. 8–9)",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003110",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003110",
    relatedEmpireId: "egypt"
  },
  {
    id: 41,
    code: "gl-32-33",
    titleSr: "Širenje hrišćanstva i rimske provincije (Rimsko carstvo)",
    titleEn: "Christianity Spreads Abroad (Roman Empire Provinces)",
    descriptionSr: "Zvanična mapa iz 'Pogledajmo dobru zemlju' (gl str. 32–33). Prikazuje rimske provincije u 1. veku n. e., Sredozemno more i misionarska putovanja apostola Pavla.",
    descriptionEn: "Official map from 'See the Good Land' (gl pp. 32–33). Details Roman provinces in the 1st century CE, Mediterranean world, and Paul's missionary travels.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 32–33)",
    publicationEn: "'See the Good Land' (gl pp. 32–33)",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003114",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003114",
    relatedEmpireId: "rome"
  },
  {
    id: 3,
    code: "gl-4-5",
    titleSr: "Zemlje u biblijsko doba i ključni gradovi (Opšta mapa)",
    titleEn: "The Lands of the Bible & Key Cities (Overview Map)",
    descriptionSr: "Sveobuhvatna geografska karta Srednjeg istoka i Sredozemlja iz 'Pogledajmo dobru zemlju' (gl str. 4–5) sa reljefom, rekom Nil, Eufratom, Tigrom i svim istorijskim prestonicama.",
    descriptionEn: "Comprehensive physical map of the Middle East and Mediterranean from 'See the Good Land' (gl pp. 4–5) featuring topography, rivers, and key ancient capitals.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 4–5)",
    publicationEn: "'See the Good Land' (gl pp. 4–5)",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003102",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003102"
  },
  {
    id: 7,
    code: "gl-20-21",
    titleSr: "Jerusalim i Solomonov hram (pre pada 607. p. n. e.)",
    titleEn: "Jerusalem and the Temple of Solomon (Before the Fall in 607 BCE)",
    descriptionSr: "Detaljan plan drevnog Jerusalima sa Davidovim gradom, Solomonovim hramom, Ofelom i dolinama Kinron i Hinom.",
    descriptionEn: "Detailed layout of ancient Jerusalem with the City of David, Solomon's Temple, Ophel, and Kidron and Hinnom valleys.",
    publicationSr: "„Pogledajmo dobru zemlju“ (gl str. 20–21)",
    publicationEn: "'See the Good Land' (gl pp. 20–21)",
    docUrlSr: "https://wol.jw.org/sr-Latn/wol/d/r353/lp-sbo/1102003126",
    docUrlEn: "https://wol.jw.org/en/wol/d/r1/lp-e/1102003126"
  }
];

export const HISTORICAL_EMPIRES: Record<string, HistoricalEmpire> = {
  // 1. NOVOVAVILONSKO CARSTVO - Aktuelno u vreme pada Jerusalima 607. pre n. e.
  babylon: {
    id: "babylon",
    nameSr: "Novovavilonsko carstvo (Vavilon)",
    nameEn: "Neo-Babylonian Empire (Babylon)",
    startYear: -626,
    endYear: -539,
    peakYear: -607,
    rulerSr: "Nabuhodonosor II (Navuhodonosor)",
    rulerEn: "Nebuchadnezzar II",
    capitalSr: "Vavilon (Babylon) na reci Eufrat",
    capitalEn: "Babylon on the Euphrates River",
    color: "#D97706", // Royal Babylonian Amber/Gold
    borderColor: "#F59E0B",
    descriptionSr: "Vodeća svetska sila u vreme pada Jerusalima 607. pre n. e. Pod vođstvom kralja Nabuhodonosora II, vavilonska vojska razorila je Solomonov hram, sravnila zidine Jerusalima i odvela narod Jude u 70-godišnje vavilonsko ropstvo.",
    descriptionEn: "The dominant world power during the fall of Jerusalem in 607 BCE. Under King Nebuchadnezzar II, the Babylonian army destroyed Solomon's Temple, tore down Jerusalem's walls, and took Judah into 70-year Babylonian exile.",
    significanceSr: "Označava početak Vavilonskog ropstva i 'vremena neznabožaca'. Vavilonska zlatna glava u Danilovom proročanstvu o velikom liku.",
    significanceEn: "Marks the beginning of the Babylonian exile and the Gentile Times. The head of gold in Daniel's prophetic image.",
    territorySr: "Mesopotamija (Eufrat i Tigar), cela Sirija, Fenikija, Juda sa Jerusalimom, do granice sa Egiptom (Vadi el-Ariš). Teritorija strogo prati kopnenu obalu bez sečenja Sredozemnog mora i Persijskog zaliva.",
    territoryEn: "Mesopotamia (Euphrates and Tigris), all of Syria, Phoenicia, Judah with Jerusalem, reaching the border of Egypt (Wadi El-Arish). Borders hug the continental coastlines.",
    capitalCoords: [32.5422, 44.4210],
    wolMap: WOL_BIBLE_MAPS[0],
    // Strictly follows continental coastline: Levant coast, Persian Gulf shore, staying strictly on land
    polygon: [
      [30.00, 48.55], // Persian Gulf / mouth of Shatt al-Arab
      [30.25, 47.90], // Basra northern marshlands
      [30.60, 47.30], // Lower Euphrates
      [30.85, 46.50], // Ur of the Chaldeans
      [31.00, 45.80], // Southern alluvial border of Euphrates
      [31.40, 44.80], // Edge of Arabian Desert / Najaf
      [31.95, 44.00], // Desert fringe of Babylonia / Karbala
      [32.60, 42.80], // Western Mesopotamia boundary
      [33.20, 41.20], // Syrian Desert southern approach
      [33.50, 39.50], // Palmyra desert boundary
      [33.30, 37.80], // Damascus desert approach
      [32.90, 36.80], // East of Damascus / Bashan
      [32.20, 36.10], // Gilead / Ammon border
      [31.40, 35.80], // Moab border (east of Dead Sea)
      [30.80, 35.50], // Edom frontier
      [30.60, 34.60], // Negev / Sinai border
      [31.10, 33.90], // Approach to Wadi El-Arish (Torrent of Egypt)
      [31.15, 33.80], // Wadi El-Arish mouth at Mediterranean coast
      // HUGGING MEDITERRANEAN COASTLINE OF THE LEVANT (NO CROSSING WATER):
      [31.25, 34.20], // Rafah coast
      [31.50, 34.45], // Gaza coast
      [31.67, 34.56], // Ashkelon coast
      [31.85, 34.65], // Ashdod coast
      [32.05, 34.75], // Joppa / Tel Aviv coast
      [32.40, 34.88], // Plain of Sharon coast
      [32.50, 34.90], // Dor coast
      [32.82, 34.98], // Mount Carmel promontory / Haifa coast
      [32.93, 35.08], // Bay of Acre / Akko coast
      [33.10, 35.13], // Achzib coast
      [33.27, 35.20], // Tyre (mainland Phoenician coast)
      [33.38, 35.26], // Sarepta coast
      [33.56, 35.37], // Sidon coast
      [33.89, 35.50], // Beirut coast
      [34.12, 35.65], // Byblos (Gebal) coast
      [34.25, 35.75], // Batroun coast
      [34.44, 35.84], // Tripoli coast
      [34.89, 35.88], // Tartus / opposite Arvad island
      [35.15, 35.92], // Baniyas coast
      [35.35, 35.93], // Jebleh coast
      [35.53, 35.78], // Latakia / Ugarit coast
      [35.86, 35.85], // Ras al-Bassit coast
      [35.95, 35.90], // Mouth of Orontes River (Seleucia Pieria)
      [36.58, 36.17], // Gulf of Issus (Iskenderun) coast
      // NORTHERN BORDER ALONG TAURUS & FOOTHILLS (STAYING SOUTH OF LAKE VAN):
      [36.95, 36.45], // Amanus Mountains pass / Syrian Gates
      [36.90, 37.10], // Northern Syria plain (Aleppo)
      [36.83, 38.02], // Carchemish on Euphrates
      [36.95, 38.70], // Haran northern plain
      [37.15, 39.50], // Edessa / Urfa plain
      [37.20, 40.50], // Gozan / Khabur river headwaters
      [37.18, 41.50], // Nisibis (Nusaybin) foothills
      [37.25, 42.50], // Upper Tigris (strictly south of Lake Van, staying on land)
      // EASTERN BORDER ALONG ZAGROS FOOTHILLS (BORDER WITH MEDIA & ELAM):
      [36.60, 43.15], // Nineveh / upper Tigris valley
      [36.20, 44.00], // Arbela (Erbil)
      [35.47, 44.40], // Kirkuk (Arrapkha)
      [34.80, 45.10], // Zagros foothills
      [34.00, 45.80], // Diyala River valley
      [33.30, 46.50], // Border with Media
      [32.50, 47.10], // Susiana plain western fringe
      [31.80, 47.70], // Lower Tigris-Euphrates alluvial plain
      [30.80, 48.20], // Marshes north of Basra
      [30.00, 48.55]  // Back to Persian Gulf coast
    ],
    cities: [
      {
        nameSr: "Vavilon (Prestonica)",
        nameEn: "Babylon (Capital)",
        lat: 32.5422,
        lng: 44.4210,
        roleSr: "Carski dvor Nabuhodonosora II, Viseći vrtovi, Ištarina kapija",
        roleEn: "Royal court of Nebuchadnezzar II, Hanging Gardens, Ishtar Gate",
        isCapital: true
      },
      {
        nameSr: "Jerusalim (Pad 607. p. n. e.)",
        nameEn: "Jerusalem (Fell 607 BCE)",
        lat: 31.7683,
        lng: 35.2137,
        roleSr: "Opsednut i razoren 607. pre n. e., Solomonov hram spaljen",
        roleEn: "Besieged and destroyed in 607 BCE, Solomon's Temple burned"
      },
      {
        nameSr: "Ribla",
        nameEn: "Riblah",
        lat: 34.4500,
        lng: 36.5667,
        roleSr: "Glavni vojni štab Nabuhodonosora tokom opsade Jerusalima",
        roleEn: "Military headquarters of Nebuchadnezzar during Jerusalem's siege"
      },
      {
        nameSr: "Karkemiš",
        nameEn: "Carchemish",
        lat: 36.8289,
        lng: 38.0153,
        roleSr: "Prekretnička bitka 605. p. n. e. - Vavilon slama egipatsku vojsku",
        roleEn: "Decisive battle 605 BCE - Babylon crushes Egyptian army"
      },
      {
        nameSr: "Tir",
        nameEn: "Tyre",
        lat: 33.2708,
        lng: 35.2039,
        roleSr: "Fenička metropola koju je Nabuhodonosor opsedao 13 godina",
        roleEn: "Phoenician city besieged by Nebuchadnezzar for 13 years"
      },
      {
        nameSr: "Ur Haldejski",
        nameEn: "Ur of the Chaldees",
        lat: 30.9622,
        lng: 46.1044,
        roleSr: "Drevno svetilište i kolevka donje Mesopotamije",
        roleEn: "Ancient sanctuary and cradle of lower Mesopotamia"
      }
    ],
    campaignRoute: {
      nameSr: "Vojni pohod Nabuhodonosora na Jerusalim (607. pre n. e.)",
      nameEn: "Nebuchadnezzar's Military Campaign against Jerusalem (607 BCE)",
      coords: [
        [32.5422, 44.4210], // Vavilon
        [33.3152, 44.3661], // Bagdad / Sippar
        [34.4267, 40.9167], // Dura Europos (uz Eufrat)
        [35.9500, 39.0100], // Raka (srednji Eufrat)
        [36.8289, 38.0153], // Karkemiš (gornji Eufrat)
        [36.2021, 37.1343], // Alepo
        [35.1318, 36.7578], // Hamat
        [34.4500, 36.5667], // Ribla (štab kralja Nabuhodonosora)
        [33.5138, 36.2765], // Damask
        [32.8500, 35.8000], // Gilead / dolina Jordana
        [31.7683, 35.2137]  // Jerusalim
      ]
    }
  },

  // 2. ASIRSKO CARSTVO - Prethodna svetska sila (oko 900 - 609. pre n. e.)
  assyria: {
    id: "assyria",
    nameSr: "Asirsko carstvo",
    nameEn: "Assyrian Empire",
    startYear: -900,
    endYear: -609,
    peakYear: -700,
    rulerSr: "Sanhiriv (Sennacherib) i Asurbanipal",
    rulerEn: "Sennacherib and Ashurbanipal",
    capitalSr: "Niniva (Nineveh) na reci Tigar",
    capitalEn: "Nineveh on the Tigris River",
    color: "#B91C1C", // Terracotta / Crimson Red
    borderColor: "#DC2626",
    descriptionSr: "Gvozdena vojna sila koja je razorila Samariju 740. pre n. e. i raselila desetoplemensko carstvo Izraela. Kralj Sanhiriv je 732. p. n. e. neuspešno opsedao Jerusalim u vreme kralja Jezekije.",
    descriptionEn: "Iron military empire that destroyed Samaria in 740 BCE and exiled the ten-tribe kingdom of Israel. King Sennacherib unsuccessfully besieged Jerusalem in 732 BCE during King Hezekiah's reign.",
    significanceSr: "Sila koja je odvela Izrael u ropstvo i pretila uništiti Jerusalim.",
    significanceEn: "The power that took Israel captive and threatened to destroy Jerusalem.",
    territorySr: "Severna i južna Mesopotamija, Sirija, Izrael (Samarija), fenikijska obala. Granice strogo prate reljef i obalu Levanta.",
    territoryEn: "Northern and southern Mesopotamia, Syria, Israel (Samaria), and Phoenician coast.",
    capitalCoords: [36.3587, 43.1528],
    wolMap: WOL_BIBLE_MAPS[0],
    polygon: [
      [30.00, 48.50], // Basra / Persian Gulf shore
      [30.80, 46.50], // Ur
      [31.80, 44.50], // Southern Mesopotamia
      [32.80, 42.50], // Central Euphrates
      [33.50, 39.50], // Syrian desert border
      [33.00, 37.00], // Damascus
      [32.28, 35.80], // Samaria inland approach
      [31.50, 34.45], // Gaza coast
      [32.05, 34.75], // Joppa coast
      [32.82, 34.98], // Mount Carmel coast
      [33.27, 35.20], // Tyre coast
      [33.56, 35.37], // Sidon coast
      [34.44, 35.84], // Tripoli coast
      [35.53, 35.78], // Latakia coast
      [36.58, 36.17], // Gulf of Issus coast
      [36.80, 35.50], // Cilician plain
      [37.20, 37.00], // Taurus foothills
      [37.40, 39.50], // Upper Euphrates
      [37.50, 41.50], // Upper Tigris (strictly south of Lake Van)
      [37.30, 43.50], // Corduene foothills
      [36.80, 44.50], // Nineveh northern frontier (west of Lake Urmia)
      [35.50, 45.30], // Kirkuk / Zagros foothills
      [34.00, 46.00], // Border with Media
      [32.50, 47.20], // Susiana border
      [31.00, 48.00], // Lower Tigris
      [30.00, 48.50]  // Back to Persian Gulf
    ],
    cities: [
      {
        nameSr: "Niniva (Prestonica)",
        nameEn: "Nineveh (Capital)",
        lat: 36.3587,
        lng: 43.1528,
        roleSr: "Carska prestonica Asirije (kod današnjeg Mosula)",
        roleEn: "Imperial capital of Assyria (near modern Mosul)",
        isCapital: true
      },
      {
        nameSr: "Asur",
        nameEn: "Assur",
        lat: 35.4569,
        lng: 43.2611,
        roleSr: "Drevna verska kolevka i prva prestonica",
        roleEn: "Ancient religious cradle and first capital"
      },
      {
        nameSr: "Samarija",
        nameEn: "Samaria",
        lat: 32.2770,
        lng: 35.1880,
        roleSr: "Prestonica Izraela, pala pod Asiriju 740. pre n. e.",
        roleEn: "Capital of Israel, fell to Assyria in 740 BCE"
      }
    ]
  },

  // 3. EGIPATSKO CARSTVO - Drevna svetska sila (Mojsije, Izlazak, Faraoni)
  egypt: {
    id: "egypt",
    nameSr: "Egipatsko carstvo (Novo carstvo)",
    nameEn: "Egyptian Empire (New Kingdom)",
    startYear: -1600,
    endYear: -1070,
    peakYear: -1450,
    rulerSr: "Tutmes III / Ramzes II",
    rulerEn: "Thutmose III / Ramesses II",
    capitalSr: "Teba (Luksor) i Memfis",
    capitalEn: "Thebes (Luxor) and Memphis",
    color: "#0D9488", // Egyptian Turquoise / Nile Teal
    borderColor: "#14B8A6",
    descriptionSr: "Prva velika biblijska svetska sila. U Egiptu su potomci Jakova postali mnogobrojan narod i bili u ropstvu sve do čudesnog Izlaska pod Mojsijem oko 1513. pre n. e.",
    descriptionEn: "The first great biblical world power. In Egypt the descendants of Jacob grew into a nation and were enslaved until the miraculous Exodus under Moses around 1513 BCE.",
    significanceSr: "Zemlja ropstva i deset pošasti koje su ponizile egipatske bogove.",
    significanceEn: "Land of bondage and the ten plagues that humbled Egypt's gods.",
    territorySr: "Dolina Nila, delta, Sinajsko poluostrvo i hananska obala. Obala Crvenog i Sredozemnog mora strogo prati reljef kopna.",
    territoryEn: "Nile valley, delta, Sinai Peninsula, and Canaanite coast. Never crosses water.",
    capitalCoords: [25.7, 32.6],
    wolMap: WOL_BIBLE_MAPS[3],
    polygon: [
      [24.00, 32.90], // First Cataract of the Nile (Aswan)
      [25.00, 32.70], // Nile Valley
      [25.70, 32.60], // Thebes (Luxor)
      [27.00, 31.20], // Asyut
      [28.50, 30.80], // Middle Egypt
      [29.30, 30.50], // Fayum oasis
      [29.85, 31.25], // Memphis
      [30.80, 30.20], // Western Nile Delta
      [31.20, 29.90], // Alexandria on Mediterranean
      // COASTLINE OF NILE DELTA & SINAI:
      [31.35, 30.30], // Rosetta mouth of Nile
      [31.55, 31.10], // Baltim (northern tip of Delta)
      [31.45, 31.80], // Damietta mouth of Nile
      [31.25, 32.30], // Port Said / Pelusium entrance
      [31.15, 33.00], // Bardawil lagoon coast
      [31.12, 33.80], // Wadi El-Arish (mouth at Mediterranean)
      [31.50, 34.45], // Gaza coast
      [32.60, 35.10], // Megiddo inland Canaan
      [33.20, 35.30], // Phoenician coast expansion
      [32.80, 35.60], // Sea of Galilee region
      [31.76, 35.21], // Jerusalem approach
      [30.60, 35.20], // Negev frontier
      [29.55, 34.95], // Gulf of Aqaba tip (Eilat/Aqaba)
      [28.50, 34.60], // Gulf of Aqaba western shoreline
      [27.80, 34.30], // Ras Muhammad (southern tip of Sinai)
      [28.20, 33.70], // Gulf of Suez eastern shore
      [29.95, 32.55], // Suez / Red Sea apex
      [29.50, 32.40], // Gulf of Suez western shore
      [27.80, 33.60], // Red Sea Egyptian mainland coast
      [26.10, 34.20], // Quseir coast
      [24.50, 33.30], // Eastern Desert approach
      [24.00, 32.90]  // Back to Aswan
    ],
    cities: [
      {
        nameSr: "Memfis",
        nameEn: "Memphis",
        lat: 29.8499,
        lng: 31.2585,
        roleSr: "Drevna severna prestonica kod delte Nila",
        roleEn: "Ancient northern capital near Nile Delta",
        isCapital: true
      },
      {
        nameSr: "Teba (Luksor)",
        nameEn: "Thebes (Luxor)",
        lat: 25.6872,
        lng: 32.6396,
        roleSr: "Carska prestonica Novog carstva",
        roleEn: "Imperial capital of the New Kingdom"
      }
    ]
  },

  // 4. MEDO-PERSIJSKO CARSTVO (539 - 331. pre n. e.)
  medopersia: {
    id: "medopersia",
    nameSr: "Medo-persijsko carstvo (Ahemenidi)",
    nameEn: "Medo-Persian Empire (Achaemenid)",
    startYear: -539,
    endYear: -331,
    peakYear: -480,
    rulerSr: "Kir Veliki, Darije Veliki, Kserks (Ahasver), Artakserks",
    rulerEn: "Cyrus the Great, Darius the Great, Xerxes, Artaxerxes",
    capitalSr: "Suza (Šušan), Persepolj i Pasargad",
    capitalEn: "Susa (Shushan), Persepolis, Pasargadae",
    color: "#2563EB", // Royal Persian Blue
    borderColor: "#3B82F6",
    descriptionSr: "Svetska sila koja je 539. pre n. e. pod Kirom Velikim osvojila Vavilon. Kir je izdao dekret o povratku Jevreja u domovinu i obnovi hrama u Jerusalimu.",
    descriptionEn: "World power that conquered Babylon in 539 BCE under Cyrus the Great. Cyrus issued the decree for Jews to return to their homeland and rebuild the temple.",
    significanceSr: "Srebrne grudi u Danilovom kipu. Period knjiga o Jestiri, Ezri i Nemiji.",
    significanceEn: "The breasts of silver in Daniel's image. Era of Esther, Ezra, and Nehemiah.",
    territorySr: "Od reke Ind do Nila, Male Azije i Trakije. Ivice teritorije strogo prate morske obale (Egejsko, Sredozemno, Crno, Kaspijsko more i Persijski zaliv) bez sečenja vodenih površina.",
    territoryEn: "From the Indus to the Nile, Asia Minor, and Thrace. Borders precisely follow continental coastlines.",
    capitalCoords: [32.1903, 48.2436],
    wolMap: WOL_BIBLE_MAPS[1],
    polygon: [
      // BLACK SEA COAST OF ANATOLIA (NORTH):
      [41.70, 41.50], // Colchis / Black Sea east
      [41.40, 36.30], // Samsun coast
      [41.80, 34.50], // Sinop coast
      [41.00, 31.00], // Bithynia coast
      [40.80, 29.00], // Bosporus / Byzantium
      [41.00, 27.50], // Thrace (European bridgehead)
      [40.20, 26.40], // Hellespont (Dardanelles)
      // AEGEAN COAST OF ASIA MINOR:
      [39.50, 26.10], // Troas coast
      [38.40, 27.10], // Smyrna coast
      [37.90, 27.30], // Ephesus coast
      [37.50, 27.30], // Miletus coast
      [37.00, 27.50], // Halicarnassus / Caria
      // SOUTHERN MEDITERRANEAN COAST OF ASIA MINOR:
      [36.50, 29.50], // Lycia coast (opposite Rhodes)
      [36.90, 30.70], // Antalya / Pamphylia coast
      [36.30, 32.50], // Anamur / Cilicia coast
      [36.80, 35.80], // Gulf of Issus / Cilicia
      // LEVANT MEDITERRANEAN COASTLINE DOWN TO EGYPT:
      [35.53, 35.78], // Latakia coast
      [34.44, 35.84], // Tripoli coast
      [33.89, 35.50], // Beirut coast
      [33.27, 35.20], // Tyre coast
      [32.82, 34.98], // Mount Carmel coast
      [32.05, 34.75], // Joppa coast
      [31.50, 34.45], // Gaza coast
      [31.15, 33.80], // Wadi El-Arish
      [31.25, 32.30], // Pelusium
      [31.55, 31.10], // Nile Delta north coast
      [31.20, 29.90], // Alexandria coast
      // DOWN THE NILE TO ELEPHANTINE (ASWAN):
      [29.85, 31.25], // Memphis
      [25.70, 32.60], // Thebes
      [24.00, 32.90], // Elephantine / Aswan
      // CROSS SUEZ & SINAI TO ARABIAN DESERT NORTH:
      [27.80, 34.30], // Sinai southern tip
      [29.50, 34.90], // Aqaba
      [31.00, 36.50], // Edom / Moab
      [31.50, 43.00], // Northern Arabian Desert fringe
      [30.00, 48.00], // Basra / head of Persian Gulf
      // IRANIAN SHORELINE OF PERSIAN GULF & STRAIT OF HORMUZ:
      [29.90, 50.20], // Bushehr coast
      [27.80, 52.00], // Asaluyeh coast
      [27.10, 56.30], // Bandar Abbas / Strait of Hormuz
      // MAKRAN COAST OF ARABIAN SEA TO INDUS:
      [25.60, 58.00], // Jask coast
      [25.30, 60.50], // Chahbahar coast
      [25.10, 62.30], // Gwadar coast
      [24.80, 67.00], // Indus River Delta / Karachi coast
      // UP THE INDUS VALLEY TO TAXILA / GANDHARA:
      [26.50, 68.00], // Lower Indus
      [29.00, 70.50], // Central Indus valley
      [32.00, 71.50], // Punjab frontier
      [34.00, 72.50], // Taxila / Peshawar
      // BACTRIA & SOGDIANA (CENTRAL ASIA):
      [36.70, 68.00], // Bactra (Balkh)
      [39.50, 67.00], // Maracanda (Samarkand)
      [40.50, 63.50], // Amu Darya (Oxus) River
      [39.00, 56.00], // Hyrcania eastern desert
      // SOUTHERN SHORE OF CASPIAN SEA (HUGGING THE COAST):
      [37.00, 54.00], // Gorgan coast
      [36.60, 51.50], // Chalus coast
      [37.40, 49.50], // Rasht / Gilan coast
      // CAUCASUS & ARMENIA BACK TO BLACK SEA:
      [39.00, 48.00], // Azerbaijan / Media Atropatene
      [41.50, 45.00], // Iberia / Georgia
      [42.00, 42.00], // Colchis mountains
      [41.70, 41.50]  // Back to Black Sea coast
    ],
    cities: [
      {
        nameSr: "Suza (Šušan)",
        nameEn: "Susa (Shushan)",
        lat: 32.1903,
        lng: 48.2436,
        roleSr: "Carska zimska rezidencija (događaji iz knjige o Jestiri)",
        roleEn: "Royal winter palace (setting for Book of Esther)",
        isCapital: true
      },
      {
        nameSr: "Persepolj",
        nameEn: "Persepolis",
        lat: 29.9354,
        lng: 52.8917,
        roleSr: "Ceremonijalna carska prestonica Darija Velikog",
        roleEn: "Ceremonial imperial capital of Darius the Great"
      }
    ]
  },

  // 5. GRČKO CARSTVO (336 - 63. pre n. e.)
  greece: {
    id: "greece",
    nameSr: "Grčko carstvo (Aleksandar Veliki)",
    nameEn: "Grecian Empire (Alexander the Great)",
    startYear: -336,
    endYear: -63,
    peakYear: -323,
    rulerSr: "Aleksandar Veliki (Makedonski)",
    rulerEn: "Alexander the Great",
    capitalSr: "Pela, Aleksandrija i Vavilon",
    capitalEn: "Pella, Alexandria, Babylon",
    color: "#059669", // Emerald Greek Green
    borderColor: "#10B981",
    descriptionSr: "Aleksandar Veliki je za samo nekoliko godina munjevito osvojio Persijsko carstvo. Širenje grčkog jezika (koine) pripremilo je svet za pisanje Hrišćanskih grčkih spisa (Novog zaveta).",
    descriptionEn: "Alexander the Great swiftly conquered the Persian Empire. Spread of Greek (Koine) paved the way for the Christian Greek Scriptures.",
    significanceSr: "Bakarni trbuh i butine u Danilu; brzi krilati leopard sa četiri glave.",
    significanceEn: "Belly and thighs of bronze in Daniel; the swift winged leopard with four heads.",
    territorySr: "Grčka, Mala Azija, Levant, Egipat, Mesopotamija, Persija do Indije. Kopnene rute Aleksandra prate kontinentalni luk bez presecanja Sredozemnog mora.",
    territoryEn: "Greece, Asia Minor, Levant, Egypt, Mesopotamia, Persia to India. Follows the continental landmass.",
    capitalCoords: [40.7583, 22.5208],
    wolMap: WOL_BIBLE_MAPS[2],
    polygon: [
      // GREEK MAINLAND & MACEDONIA:
      [37.50, 22.00], // Peloponnese (Sparta)
      [37.97, 23.70], // Athens / Attica
      [39.50, 22.80], // Thessaly
      [40.80, 22.50], // Pella (Macedonian capital)
      [41.20, 25.50], // Thrace
      [40.20, 26.40], // Hellespont crossing
      // ASIA MINOR COASTLINE:
      [39.50, 26.10], // Troas (Granicus)
      [38.40, 27.10], // Sardis / Smyrna
      [37.90, 27.30], // Ephesus
      [37.00, 27.50], // Halicarnassus
      [36.50, 29.50], // Lycia
      [36.90, 30.70], // Pamphylia
      [36.80, 35.80], // Issus (famous battlefield)
      // LEVANT COASTLINE DOWN TO EGYPT:
      [35.53, 35.78], // Latakia coast
      [33.89, 35.50], // Beirut coast
      [33.27, 35.20], // Tyre (7-month siege)
      [31.50, 34.45], // Gaza (siege of Gaza)
      [31.20, 29.90], // Alexandria in Egypt (founded by Alexander)
      [29.85, 31.25], // Memphis in Egypt
      // RETURN BY LAND THROUGH MESOPOTAMIA TO INDIA:
      [31.50, 34.50], // Levant land bridge
      [33.50, 36.30], // Damascus
      [35.50, 38.50], // Thapsacus / Euphrates crossing
      [36.35, 43.15], // Gaugamela / Arbela (decisive battle)
      [32.54, 44.42], // Babylon (Alexander's imperial capital)
      [32.19, 48.24], // Susa
      [29.93, 52.89], // Persepolis (burned by Alexander)
      [36.70, 68.00], // Bactra
      [34.00, 72.50], // Indus River / Taxila
      [24.80, 67.00], // Indus Delta / mouth at Arabian Sea
      // RETURN ROUTE VIA GEDROSIA & PERSIAN GULF COAST:
      [25.30, 60.50], // Makran coast
      [27.10, 56.30], // Strait of Hormuz
      [29.90, 50.20], // Bushehr
      [30.00, 48.00], // Basra
      [33.00, 44.00], // Babylonia
      [36.00, 38.00], // Northern Syria
      [39.00, 32.00], // Central Anatolia (Gordium)
      [40.80, 28.00], // Propontis
      [37.50, 22.00]  // Back to Peloponnese
    ],
    cities: [
      {
        nameSr: "Aleksandrija",
        nameEn: "Alexandria",
        lat: 31.2001,
        lng: 29.9187,
        roleSr: "Središte helenističke nauke i nastanka Septuaginte",
        roleEn: "Hub of Hellenistic learning and translation of the Septuagint",
        isCapital: true
      },
      {
        nameSr: "Pela",
        nameEn: "Pella",
        lat: 40.7583,
        lng: 22.5208,
        roleSr: "Prestonica drevne Makedonije i rodno mesto Aleksandra",
        roleEn: "Capital of ancient Macedonia and birthplace of Alexander"
      },
      {
        nameSr: "Vavilon",
        nameEn: "Babylon",
        lat: 32.5422,
        lng: 44.4210,
        roleSr: "Prestonica gde je Aleksandar preminuo 323. pre n. e.",
        roleEn: "Capital where Alexander died in 323 BCE"
      }
    ]
  },

  // 6. RIMSKO CARSTVO (63. pre n. e. - 476. n. e.)
  // Rendered as multi-polygon: Europe, Asia/Levant, North Africa.
  // The Mediterranean Sea ("Mare Nostrum") remains open water!
  rome: {
    id: "rome",
    nameSr: "Rimsko carstvo",
    nameEn: "Roman Empire",
    startYear: -63,
    endYear: 476,
    peakYear: 70,
    rulerSr: "Cezar Avgust, Tiberije, Klaudije, Neron, Tit",
    rulerEn: "Caesar Augustus, Tiberius, Claudius, Nero, Titus",
    capitalSr: "Rim (Roma)",
    capitalEn: "Rome",
    color: "#7C3AED", // Imperial Roman Purple
    borderColor: "#8B5CF6",
    descriptionSr: "Šesta svetska sila biblijskog proročanstva. Vladala je u vreme rođenja, službe i smrti Isusa Hrista, kao i apostola. Rimske legije pod vođstvom Tita razorile su Jerusalim i drugi hram 70. godine n. e.",
    descriptionEn: "The sixth world power of Bible prophecy. Ruled during the birth, ministry, and death of Jesus Christ and the apostles. Roman legions under Titus destroyed Jerusalem and the Second Temple in 70 CE.",
    significanceSr: "Gvozdene noge Danilovog kipa. Vladavina pod kojom se hrišćanstvo proširilo.",
    significanceEn: "Iron legs of Daniel's image. Empire under which Christianity spread.",
    territorySr: "Provincije u Evropi, Aziji i severnoj Africi. Sredozemno more ('Mare Nostrum') ostaje prirodno otvoreno vodeno prostranstvo jer granice prate kopno kontinenta.",
    territoryEn: "Provinces across Europe, Asia Minor, Levant, and North Africa. Mediterranean Sea remains open water.",
    capitalCoords: [41.9028, 12.4964],
    wolMap: WOL_BIBLE_MAPS[4],
    // Multi-polygon separating Europe, Asia Minor & Levant, and North Africa
    polygon: [
      // 1. EUROPEAN LANDMASS: Britannia, Gaul, Hispania, Italia, Illyricum, Greece, Thrace
      [
        [54.98, -1.60], // Hadrian's Wall / Britannia
        [51.50, -0.12], // Londinium (London)
        [51.05, 2.37],  // Gallia Belgica
        [50.94, 6.96],  // Colonia (Cologne on Rhine)
        [50.00, 8.27],  // Mogontiacum (Mainz on Rhine)
        [48.50, 11.50], // Raetia / Danube frontier
        [48.20, 16.37], // Vindobona (Vienna on Danube)
        [47.50, 19.04], // Aquincum (Budapest on Danube)
        [44.82, 20.46], // Singidunum (Belgrade on Danube)
        [44.18, 28.65], // Tomis / Constanta on Black Sea
        [41.00, 28.97], // Byzantium / Thrace
        // COASTLINE OF GREECE & ADRIATIC:
        [40.64, 22.94], // Thessalonica
        [37.97, 23.72], // Athens / Achaea
        [36.40, 22.50], // Peloponnese southern coast
        [38.30, 21.40], // Gulf of Corinth
        [39.60, 19.90], // Corcyra / Epirus
        [42.65, 18.09], // Illyricum / Dalmatian coast (Dubrovnik)
        [45.30, 14.40], // Upper Adriatic (Rijeka/Pula)
        [45.43, 12.33], // Venice lagoon
        [43.90, 12.90], // Ravenna
        [40.83, 17.40], // Brindisi / Apulia
        [38.00, 16.00], // Calabria / tip of Italian boot
        [37.50, 15.00], // Sicily (Catania)
        [38.10, 13.30], // Sicily (Palermo)
        [40.85, 14.26], // Naples / Pompeii
        [41.90, 12.50], // Roma (Imperial Capital)
        [43.70, 10.40], // Pisa / Etruria
        [43.71, 7.26],  // Nice / Gallia Narbonensis
        [43.30, 5.37],  // Massilia (Marseille)
        // HISPANIAN MEDITERRANEAN COAST:
        [41.38, 2.17],  // Tarraco / Barcelona
        [39.46, -0.37], // Valentia
        [37.60, -0.98], // Carthago Nova (Cartagena)
        [36.72, -4.42], // Malaca (Malaga)
        [36.14, -5.35], // Gibraltar (Pillars of Hercules)
        // ATLANTIC COAST OF HISPANIA & GAUL:
        [36.52, -6.29], // Gades (Cadiz)
        [38.72, -9.13], // Olisipo (Lisbon)
        [42.24, -8.72], // Gallaecia (Vigo)
        [43.36, -8.41], // Brigantium (A Coruña)
        [43.46, -3.80], // Bay of Biscay coast (Santander)
        [44.83, -0.57], // Burdigala (Bordeaux)
        [47.21, -1.55], // Nantes (Loire mouth)
        [48.39, -4.48], // Brest (Brittany)
        [49.50, 0.10],  // Le Havre / Seine mouth
        [51.12, 1.31],  // Dover / Britannia
        [54.98, -1.60]  // Back to Hadrian's Wall
      ],
      // 2. ASIA MINOR & LEVANT LANDMASS: Anatolia, Syria, Phoenicia, Judea
      [
        [41.00, 29.00], // Bosporus (Asian side)
        [41.25, 31.50], // Heraclea Pontica
        [42.00, 35.15], // Sinope on Black Sea
        [41.00, 39.70], // Trapezus (Trabzon)
        [39.90, 41.27], // Armenia frontier (Erzurum approach)
        [37.50, 42.00], // Upper Tigris frontier
        [36.83, 38.00], // Zeugma / Euphrates frontier
        [34.50, 40.80], // Dura Europos on Euphrates
        [34.56, 38.27], // Palmyra (desert frontier)
        [32.50, 36.50], // Bostra (Arabia Petraea)
        [30.32, 35.44], // Petra (Nabataean capital)
        [31.25, 34.20], // Gaza coast
        [31.76, 35.21], // Jerusalem (Judea)
        [32.05, 34.75], // Joppa coast
        [32.50, 34.90], // Caesarea Maritima (Roman governor seat)
        [33.27, 35.20], // Tyre coast
        [33.89, 35.50], // Berytus (Beirut) coast
        [35.53, 35.78], // Laodicea (Latakia) coast
        [36.20, 36.15], // Antioch on the Orontes
        [36.80, 35.80], // Cilicia (Tarsus - birthplace of Paul)
        [36.90, 30.70], // Attalia (Antalya / Pamphylia)
        [36.50, 29.50], // Myra (Lycia)
        [37.00, 27.50], // Halicarnassus
        [37.90, 27.30], // Ephesus (Proconsular Asia)
        [38.40, 27.10], // Smyrna
        [39.50, 26.10], // Troas
        [40.20, 26.40], // Hellespont (Asian shore)
        [41.00, 29.00]  // Back to Bosporus
      ],
      // 3. NORTH AFRICAN LANDMASS: Egypt, Cyrenaica, Africa Proconsularis, Numidia, Mauretania
      [
        [35.80, -5.30], // Tingis (Tangier / Strait of Gibraltar)
        [35.70, -0.60], // Caesarea Mauretaniae
        [36.75, 3.05],  // Icosium (Algiers)
        [36.80, 10.18], // Carthago (Carthage)
        [35.82, 10.63], // Hadrumetum (Sousse)
        [32.89, 13.18], // Oea (Tripoli)
        [32.30, 15.10], // Leptis Magna
        [32.10, 20.06], // Berenice (Benghazi / Cyrenaica)
        [32.80, 21.85], // Cyrene
        [31.20, 29.90], // Alexandria (Aegyptus)
        [31.45, 31.80], // Nile Delta coast
        [31.25, 32.30], // Pelusium
        [29.85, 31.25], // Memphis
        [24.00, 32.90], // Elephantine / Aswan (southern Roman limes)
        [24.00, 31.00], // Libyan desert border
        [28.00, 25.00], // Sahara desert frontier
        [30.00, 15.00], // Fezzan northern border
        [32.00, 8.00],  // Limes Tripolitanus
        [34.00, 2.00],  // Numidian desert border
        [32.00, -4.00], // Mauretania Tingitana inland
        [35.80, -5.30]  // Back to Tangier
      ]
    ],
    cities: [
      {
        nameSr: "Rim (Prestonica)",
        nameEn: "Rome (Capital)",
        lat: 41.9028,
        lng: 12.4964,
        roleSr: "Prestonica Carstva, sedište Cezara i Senata",
        roleEn: "Imperial capital, seat of Caesar and Senate",
        isCapital: true
      },
      {
        nameSr: "Jerusalim (Razoren 70. n. e.)",
        nameEn: "Jerusalem (Destroyed 70 CE)",
        lat: 31.7683,
        lng: 35.2137,
        roleSr: "Provincija Judeja, razoren od strane rimskih legija pod Titom 70. n. e.",
        roleEn: "Judea province, destroyed by Roman legions under Titus in 70 CE"
      },
      {
        nameSr: "Cezareja",
        nameEn: "Caesarea Maritima",
        lat: 32.5000,
        lng: 34.8900,
        roleSr: "Sedište rimskog namesnika Pontija Pilata i mesto gde je kršten Kornelije",
        roleEn: "Seat of Roman governor Pontius Pilate and where Cornelius was baptized"
      }
    ]
  }
};

/**
 * Returns the relevant historical world power based on the year
 */
export function getEmpireForYear(year: number): HistoricalEmpire {
  // Pad Jerusalima 607. pre n. e. (Vavilon 626 - 539 BCE)
  if (year >= -626 && year <= -539) {
    return HISTORICAL_EMPIRES.babylon;
  }
  // Asirija (oko 900 - 609 BCE)
  if (year >= -900 && year < -626) {
    return HISTORICAL_EMPIRES.assyria;
  }
  // Egipat (oko 1600 - 1070 BCE)
  if (year <= -1070) {
    return HISTORICAL_EMPIRES.egypt;
  }
  // Medo-Persija (539 - 331 BCE)
  if (year > -539 && year <= -331) {
    return HISTORICAL_EMPIRES.medopersia;
  }
  // Grčka (336 - 63 BCE)
  if (year > -331 && year <= -63) {
    return HISTORICAL_EMPIRES.greece;
  }
  // Rim (63 BCE - 476 CE)
  return HISTORICAL_EMPIRES.rome;
}

/**
 * Matches a user's timeline item to historical empire geographic map datasets
 */
export function findEmpireForTimelineItem(item: TimelineItem): HistoricalEmpire | null {
  const text = `${item.title || ""} ${item.group || ""} ${(item.tags || []).join(" ")} ${item.description || ""} ${item.ruler || ""}`.toLowerCase();

  if (text.includes("egipat") || text.includes("egypt") || text.includes("ramzes") || text.includes("faraon")) {
    return HISTORICAL_EMPIRES.egypt;
  }
  if (text.includes("asirij") || text.includes("assyri") || text.includes("niniva") || text.includes("senahiriv")) {
    return HISTORICAL_EMPIRES.assyria;
  }
  if (text.includes("vavilon") || text.includes("babylon") || text.includes("nabuhodonosor")) {
    return HISTORICAL_EMPIRES.babylon;
  }
  if (text.includes("persij") || text.includes("persia") || text.includes("medo") || text.includes("kir ") || text.includes("darije")) {
    return HISTORICAL_EMPIRES.medopersia;
  }
  if (text.includes("grčk") || text.includes("grck") || text.includes("greec") || text.includes("aleksandar") || text.includes("makedon")) {
    return HISTORICAL_EMPIRES.greece;
  }
  if (text.includes("rim") || text.includes("rome") || text.includes("rimsk") || text.includes("cezar") || text.includes("avgust")) {
    return HISTORICAL_EMPIRES.rome;
  }

  // Fallback if item is in a World Power group/category
  const grp = (item.group || "").toLowerCase();
  const isWorldPower = grp.includes("svetsk") || grp.includes("world power") || (item.tags || []).some(t => t.toLowerCase().includes("svetska"));
  if (isWorldPower && typeof item.startYear === "number") {
    return getEmpireForYear(item.startYear);
  }

  return null;
}

