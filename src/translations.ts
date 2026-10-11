export type LangType = string;

export const translations = {
  sr: {
    // Header
    appName: "Hronika",
    appSub: "Vremenska linija biblijskih događaja",
    btnNew: "Novo",
    btnHelp: "Pomoć",
    btnExportJson: "Izvezi JSON",
    btnExportCsv: "Izvezi CSV",
    btnImportJson: "Uvezi JSON",
    btnImportCsv: "Uvezi CSV",
    appearanceSettings: "Podešavanja izgleda (Tema i Skinovi)",
    viewTimeline: "Vremenska linija",
    viewChronological: "Hrono prikaz",
    viewMap: "Geografska mapa (Beta)",
    viewSplit: "Podeljeni prikaz",
    tabTimeline: "Linija",
    tabChronological: "Hrono",
    tabMap: "Mapa (Beta)",
    tabSplit: "Podeljeno",
    geoSectionTitle: "Geografska lokacija",
    geoPresetLabel: "Izaberi poznato mesto:",
    geoPresetPlaceholder: "-- Izaberi istorijsku lokaciju --",
    geoCustomPlace: "Prilagođena lokacija",
    geoPlaceName: "Naziv lokacije (npr. Jerusalim, Vavilon)",
    geoLat: "Geografska širina (Lat)",
    geoLng: "Geografska dužina (Lng)",
    geoClearLocation: "Ukloni lokaciju",
    geoNoCoords: "Bez lokacije",
    geoDetectedAuto: "Automatski prepoznata lokacija",
    geoEventsOnMap: "događaja na mapi",
    mapModeToday: "Danas",
    mapModeHistory: "Istorija (Reljef)",
    mapModeKingdoms: "Kraljevstva i carstva",
    mapModeHistoryDesc: "Prirodni reljef i vegetacija bez savremenih granica",
    mapModeTodayDesc: "Savremena politička mapa sa državnim granicama",
    mapModeKingdomsDesc: "Istorijska kraljevstva i carstva sa tadašnjim granicama i prestonicama",
    geoSearchMap: "Pretraži lokacije na mapi...",
    geoAllLocations: "Sve lokacije",
    geoDetails: "Detalji",
    geoCenterOnMap: "Centriraj na mapi",
    geoNoMapEventsNotice: "Trenutno nema događaja sa lokacijom koji odgovaraju filterima.",
    noLocationEvents: "Događaji bez lokacije",
    addLocation: "Dodaj lokaciju",
    successImportJson: "Uspešno uvezeno {count} stavki iz JSON fajla!",
    errorImportJsonNoValid: "Fajl ne sadrži validne objekte vremenske linije.",
    errorImportJsonArray: "JSON fajl mora da bude niz objekata.",
    errorImportJsonFail: "Neuspelo učitavanje JSON fajla. Proveri ispravnost sintakse.",
    successImportCsv: "Uspešno uvezeno {count} stavki iz CSV fajla!",
    errorImportCsvNoValid: "Nismo pronašli validne redove u CSV fajlu. Proveri zaglavlja: title,group,startYear,endYear,description",
    errorImportCsvFail: "Došlo je do greške prilikom učitavanja CSV fajla.",

    // Language & Translation Pack
    languageSection: "Prevođenje",
    languageSectionDesc: "Kreirajte dokument na vašem Google Drive-u koji će u realnom vremenu uvoziti prevod u Hroniku.",
    targetLanguageSelect: "Izaberi jezik za prevođenje",
    targetLanguageSelectDesc: "Izaberite jezik za koji želite da kreirate prevod:",
    realtimeSyncActive: "Uvoz u realnom vremenu je aktivan",
    realtimeSyncDesc: "Izmene unete u Google Docs dokument se automatski u realnom vremenu uvoze u Hroniku.",
    btnConnectAndCreateDoc: "Poveži Google nalog i kreiraj dokument",
    btnCreateAndOpenDoc: "Kreiraj i otvori u Google Docs",
    lastSyncedAt: "Poslednji uvoz:",
    noDocCreatedYet: "Nije još kreiran Google Docs dokument za ovaj jezik.",
    realtimeLiveBadge: "Uživo / Real-time",
    activateThisLanguage: "Postavi kao jezik interfejsa",
    btnExportLangTemplate: "Preuzmi šablon (JSON)",
    btnExportLangCsv: "Preuzmi šablon za Google Drive",
    btnExportLangJson: "Preuzmi JSON šablon",
    btnImportLang: "Uvezi prevedeni fajl (JSON / CSV)",
    btnImportLangAny: "Uvezi prevod (JSON / CSV)",
    activeLangLabel: "Aktivni jezik interfejsa",
    langSrName: "srpski (podrazumevano)",
    langEnName: "engleski",
    customLangLoaded: "Prilagođeni prevod",
    btnResetDefaultLang: "Vrati na podrazumevani jezik",
    customLangCount: "prevedenih termina",
    importLangSuccessMsg: "Uspešno uvezen prevod „{name}“ sa {count} prevedenih termina!",
    importLangErrorMsg: "Neispravan jezički fajl. Proverite da li je fajl u ispravnom JSON, CSV ili TXT formatu.",
    downloadTemplateNotice: "Preuzeti fajl možete otvoriti u programu Google Docs, Notepad ili VS Code, upisati prevod i ponovo ga uvesti ovde.",
    langBadgeTemplate: "Šablon za prevod",
    googleDocsHelpTitle: "Direktno uređivanje u Google Docs:",
    btnOpenGoogleDocs: "Otvori u Google Docs",
    btnCreateGoogleDoc: "Kreiraj u Google Docs",
    btnSyncGoogleDocs: "Učitaj iz Google Docs",
    googleDocsSignIn: "Prijavi se putem Google-a",
    googleDocsSignOut: "Odjavi se",
    googleDocsSignedInAs: "Prijavljeni ste kao:",
    googleDocsDesc: "Kreira dokument na vašem Google Drive-u formatiran kao u NW Scheduler-u (ključ: Prevod) koji u realnom vremenu uvozi prevod u aplikaciju.",
    googleDocsCreatedNotice: "Google Docs dokument je uspešno kreiran i uvoz u realnom vremenu je aktivan!",
    googleDocsSyncSuccess: "Uspešno učitane izmene iz Google Docs-a!",
    googleDocsConfirmCreate: "Da li želite da kreirate novi dokument „Hronika - Prevod“ na vašem Google Drive-u?",
    btnDownloadTxt: "Preuzmi .txt (format za Google Docs)",


    // Groups / Themes
    groupWorldPowers: "Svetske sile",
    groupRulers: "Vladari",
    groupHolyScriptures: "Sveto pismo",
    groupHistoricalFigures: "Ličnosti",
    groupBiblicalEvents: "Biblijski događaji",
    groupWorldEvents: "Svetski događaji",

    // Sidebar
    sidebarTitle: "MENI",
    searchPlaceholder: "Pretraži događaje, opise i tagove",
    searchEventsDescTags: "Pretraži događaje, opise i tagove",
    helpTooltip: "Pomoć, kontakt, ostalo",
    helpMenuShortcuts: "Prečice na tastaturi",
    helpMenuSupport: "Podrška",
    helpMenuClearCache: "Obriši keš memoriju",
    groupSection: "Kategorije",
    showAll: "Prikaži sve",
    hideAll: "Sakrij sve",
    tagSection: "Filtriraj po tagu",
    allTags: "Svi tagovi",
    timespanSection: "Vremenski raspon (godine)",
    approx: "približno",
    scaleGroupHeights: "Visina grupa:",
    sidebarPin: "Prikvači panel (Pin)",
    sidebarUnpin: "Otkači panel (Unpin)",
    sidebarAutoHide: "Automatsko sakrivanje",
    sidebarAutoHideOn: "Auto-sakrivanje uključeno (otvara se na prelaz mišem)",
    sidebarAutoHideOff: "Auto-sakrivanje isključeno",
    sidebarNarrow: "Uzani okvir",
    sidebarExpand: "Proširi panel",
    sidebarCollapse: "Skupi u uzani okvir",
    sidebarToggleGroup: "Klikni za prikaz/sakrivanje grupe",
    sidebarActiveFilters: "Aktivni filteri",

    // Timeline
    groupHeight: "Visina grupa:",
    tipSwipe: "Savet: Prevucite vremenski prostor levo/desno za slobodnu navigaciju",
    btnZoomIn: "Uveličaj vremensku liniju (zoom)",
    btnZoomOut: "Smanji vremensku liniju (zoom)",
    btnResetZoom: "Resetuj uveličanje i centriraj",
    editBtn: "Uredi",
    deleteBtn: "Obriši",
    confirmDelete: "Da li ste sigurni da želite da obrišete događaj „{title}“?",
    singleYearCards: "Kartice:",
    singleYearPinned: "Pinovano",
    singleYearPinsOnly: "Samo čioda",

    // Help / Pomoć
    helpTitle: "Pomoć za korišćenje",
    helpIntro: "Dobrodošli u Hroniku - interaktivni vizuelizator istorijskih događaja i perioda sa bogatim opcijama prilagođavanja izgleda.",
    helpControlsTitle: "Navigacija i kontrole",
    helpControls1: "Prevlačenje mišem (Drag-to-pan): Kliknite i držite prazan prostor na vremenskoj liniji da biste je pomerali levo ili desno.",
    helpControls2: "Točkić miša (wheel): Pomeranje na točkić pomera vremensku liniju levo-desno.",
    helpControls3: "Zoom kontrole (+/-): Koristite tastere u donjem desnom uglu za uveličanje (prikaz meseci) ili smanjenje (veći istorijski raspon).",
    helpControls4: "Prilagođavanje visine (Visina grupa): Dugmići za promenu visine horizontalnih grupa omogućavaju optimalno pakovanje događaja bez preklapanja.",
    helpEditingTitle: "Uređivanje i unos podataka",
    helpEditing1: "Dodavanje novog unosa: Kliknite na dugme 'Novo' u zaglavlju. Možete odabrati tip 'Događaj' (jedna tačka) ili 'Period' (vremenski opseg sa početkom i krajem).",
    helpEditing2: "Godišnja doba i meseci: Prilikom unosa pored godine možete izabrati jedno od četiri godišnja doba (proleće, leto, jesen, zima) ili konkretan mesec za dodatnu preciznost.",
    helpEditing3: "Uređivanje unosa: Klikom na bilo koji događaj ili period otvorićete prozor za izmenu, odakle ga možete i obrisati.",
    helpEditing4: "Izvoz i Uvoz podataka: Preko dugmića u zaglavlju možete izvesti sve svoje podatke kao JSON ili CSV fajl, kao i učitati ih nazad.",
    helpDesignTitle: "Estetika i skinovi",
    helpDesign1: "Tema: Izaberite svetlu ili tamnu temu u meniju za podešavanja.",
    helpDesign2: "Skinovi izgleda: Tema Hronika pruža autentičan vizuelni identitet.",
    helpClose: "Zatvori",

    // Settings Modal
    settingsTitle: "Podešavanja",
    settingsTheme: "Tema / Izgled",
    themeNormal: "Standardna",
    themeDark: "Tamna",
    themeLight: "Svetla",
    settingsSkin: "Stil / Skin vizuelnog izgleda",
    skinProStudio: "Pro Studio",
    skinHronika: "Hronika",
    settingsFont: "Font",
    fontHronika: "Hronika",
    fontSerif: "Serif",
    fontMono: "Mono",
    settingsLanguage: "Jezik interfejsa",
    langSerbian: "srpski",
    langEnglish: "engleski",
    settingsClose: "Zatvori",

    // TimelineItemModal
    modalNewTitle: "Dodaj događaj ili period",
    modalEditTitle: "Izmeni: {title}",
    modalLabelType: "Vrsta unosa",
    typeEvent: "📍 Događaj",
    typePeriod: "📊 Period",
    labelTitle: "Naziv",
    titlePlaceholder: "npr. Julije Cezar, Pad Vavilona...",
    labelGroup: "Grupa",
    newGroupPlaceholder: "npr. Arheologija, Nauka...",
    newGroupLabel: "🆕 Nova grupa...",
    eraBCE: "pre n. e.",
    eraCE: "n. e.",
    approxLabel: "Približno",
    labelYear: "Godina",
    labelMonth: "God. doba / mesec",
    labelDescription: "Opis",
    descPlaceholder: "Detaljniji opis osobe, događaja...",
    labelSource: "Izvor (link)",
    sourcePlaceholder: "npr. https://sr.wikipedia.org/wiki/...",
    labelImage: "Sličica / ilustracija",
    imagePlaceholder: "Zalepi URL slike ili otpremi fajl...",
    imageUploadBtn: "Izaberi sliku",
    imageRemoveBtn: "Ukloni sliku",
    labelTags: "Tagovi",
    tagsInfo: "Odvoj zarezima",
    tagsPlaceholder: "npr. Antika, Vladari, Rim, Biblija, Rat",
    labelColor: "Boja (opciono)",
    colorDefault: "Podrazumevana",
    btnCancel: "Odustani",
    btnSave: "Sačuvaj",
    btnDelete: "Obriši",
    confirmDeleteItem: "Da li ste sigurni da želite da obrišete ovaj unos?",

    // Seasons
    seasonSpring: "proleće",
    seasonSummer: "leto",
    seasonAutumn: "jesen",
    seasonWinter: "zima",
    samoGodina: "samo godina",

    // Months
    jan: "januar",
    feb: "februar",
    mar: "mart",
    apr: "april",
    maj: "maj",
    jun: "jun",
    jul: "jul",
    avg: "avgust",
    sep: "septembar",
    okt: "oktobar",
    nov: "novembar",
    dec: "decembar",

    shortJan: "jan",
    shortFeb: "feb",
    shortMar: "mar",
    shortApr: "apr",
    shortMaj: "maj",
    shortJun: "jun",
    shortJul: "jul",
    shortAvg: "avg",
    shortSep: "sep",
    shortOkt: "okt",
    shortNov: "nov",
    shortDec: "dec",

    eraPre: "pre n. e.",
    eraN: "n. e.",
    eraPreShort: "pre n. e.",
    eraNShort: "n. e.",
    okoLabel: "oko",
    okoLabelShort: "o. ",

    // Additional translated elements
    settingsSubtitle: "Prilagodi izgled",
    themeLabel: "Tema / Izgled",
    themeDarkBtn: "Tamna",
    themeLightBtn: "Svetla",
    skinLabel: "Izgled",
    settingsApplyClose: "Primeni i zatvori",
    skinNameProStudio: "Pro Studio",
    skinNameHronika: "Hronika",

    helpAppTitle: "Pomoć za aplikaciju Hronika",
    helpMoveZoomTitle: "Pomeranje i Zumiranje",
    helpMoveTitle: "Pomeranje (Panovanije)",
    helpMoveDesc: "Kliknite bilo gde na slobodni prostor vremenske linije i prevucite mišem (levo ili desno) da biste se kretali kroz istoriju. Na telefonu to radite prostim prevlačenjem prsta.",
    helpZoomTitle: "Zumiranje",
    helpZoomDesc: "Koristite tastere + i - u kontrolnoj traci ili držite točkić miša / pinch-zoom prstima na mobilnim telefonima.",
    helpMobileTitle: "Mobilna verzija",
    helpMobileDesc: "Stranica dozvoljava prirodno pomeranje u svim pravcima (levo-desno i gore-dole) za maksimalnu udobnost prstiju.",
    helpYearBce: "Godina pre nove ere",
    helpYearCe: "Godina nove ere",
    helpYearManual: "Prilikom ručnog dodavanja, jednostavno izaberite eru u padajućoj sekciji, dok vrednost godine upisujete kao pozitivan čist broj.",
    helpCsvDesc: "Prva linija mora da navede tačna zaglavlja:",
    helpCsvNotice: "* endYear ostavite prazno za pojedinačni događaj. Za dodavanje tagova preko CSV, dodajte kolonu \"tags\" sa vrednostima razdvojenim tačka-zarezom (npr. \"Rim;Antika\").",
    helpCloseBtn: "Zatvori pomoć",
    btnNewProject: "Novi projekat",
    btnCopyLink: "Kopiraj link",
    btnMainProject: "Glavni projekat",
    copiedLinkToast: "Link uspešno kopiran!",
    badgeMainProject: "🏠 Glavni projekat",
    badgePrivateProject: "🔗 Privatni projekat"
  },
  en: {
    // Header
    appName: "Chronicle",
    appSub: "Interactive Historical Timeline",
    btnNew: "New",
    btnHelp: "Guide",
    btnExportJson: "Export JSON",
    btnExportCsv: "Export CSV",
    btnImportJson: "Import JSON",
    btnImportCsv: "Import CSV",
    appearanceSettings: "Appearance Settings (Themes & Skins)",
    viewTimeline: "Timeline View",
    viewChronological: "Chrono View",
    viewMap: "Geographic Map (Beta)",
    viewSplit: "Split View",
    tabTimeline: "Timeline",
    tabChronological: "Chrono",
    tabMap: "Map (Beta)",
    tabSplit: "Split",
    geoSectionTitle: "Geographic Location",
    geoPresetLabel: "Choose known place:",
    geoPresetPlaceholder: "-- Select historical location --",
    geoCustomPlace: "Custom location",
    geoPlaceName: "Location name (e.g. Jerusalem, Babylon)",
    geoLat: "Latitude",
    geoLng: "Longitude",
    geoClearLocation: "Remove location",
    geoNoCoords: "No location",
    geoDetectedAuto: "Auto-detected location",
    geoEventsOnMap: "events on map",
    mapModeToday: "Today",
    mapModeHistory: "History (Relief)",
    mapModeKingdoms: "Ancient Kingdoms",
    mapModeHistoryDesc: "Natural relief and vegetation without modern borders",
    mapModeTodayDesc: "Modern political map with state borders",
    mapModeKingdomsDesc: "Historical empires & kingdoms with ancient borders and capitals",
    geoSearchMap: "Search locations on map...",
    geoAllLocations: "All locations",
    geoDetails: "Details",
    geoCenterOnMap: "Center on map",
    geoNoMapEventsNotice: "No events with location match the current filters.",
    noLocationEvents: "Events without location",
    addLocation: "Add location",
    successImportJson: "Successfully imported {count} items from JSON!",
    errorImportJsonNoValid: "File does not contain valid timeline objects.",
    errorImportJsonArray: "JSON file must be an array of objects.",
    errorImportJsonFail: "Failed to load JSON. Please check file syntax.",
    successImportCsv: "Successfully imported {count} items from CSV!",
    errorImportCsvNoValid: "No valid rows found in CSV. Validate headers: title,group,startYear,endYear,description",
    errorImportCsvFail: "Error occurred while loading the CSV file.",

    // Language & Translation Pack
    languageSection: "Translation",
    languageSectionDesc: "Create a Google Docs document on your Google Drive that imports translations in real time into Chronicle.",
    targetLanguageSelect: "Select language for translation",
    targetLanguageSelectDesc: "Choose the target language you want to translate into:",
    realtimeSyncActive: "Real-time import is active",
    realtimeSyncDesc: "Changes entered in your Google Docs document are automatically imported into Chronicle in real time.",
    btnConnectAndCreateDoc: "Connect Google Account & Create Document",
    btnCreateAndOpenDoc: "Create and open in Google Docs",
    lastSyncedAt: "Last synced:",
    noDocCreatedYet: "No Google Docs document created yet for this language.",
    realtimeLiveBadge: "Live / Real-time",
    activateThisLanguage: "Set as interface language",
    btnExportLangTemplate: "Download Template (JSON)",
    btnExportLangCsv: "Download Template for Google Drive",
    btnExportLangJson: "Download JSON Template",
    btnImportLang: "Import Translated File (JSON / CSV)",
    btnImportLangAny: "Import Translation (JSON / CSV)",
    activeLangLabel: "Active Interface Language",
    langSrName: "Serbian (Default)",
    langEnName: "English",
    customLangLoaded: "Custom Translation",
    btnResetDefaultLang: "Reset to default language",
    customLangCount: "translated terms",
    importLangSuccessMsg: "Successfully imported translation '{name}' with {count} translated terms!",
    importLangErrorMsg: "Invalid language file format. Please ensure it is a valid JSON, CSV, or TXT file.",
    downloadTemplateNotice: "You can open the downloaded file in Google Docs, Notepad, or VS Code, translate the text, and import it back here.",
    langBadgeTemplate: "Translation Template",
    googleDocsHelpTitle: "Direct Editing in Google Docs:",
    btnOpenGoogleDocs: "Open in Google Docs",
    btnCreateGoogleDoc: "Create in Google Docs",
    btnSyncGoogleDocs: "Load from Google Docs",
    googleDocsSignIn: "Sign in with Google",
    googleDocsSignOut: "Sign out",
    googleDocsSignedInAs: "Signed in as:",
    googleDocsDesc: "Creates a formatted document on your Google Drive (key: translation) that imports translations into the app in real time.",
    googleDocsCreatedNotice: "Google Docs document created successfully and real-time import is active!",
    googleDocsSyncSuccess: "Translations successfully updated from Google Docs in real time!",
    googleDocsConfirmCreate: "Do you want to create a new translation document on your Google Drive?",
    btnDownloadTxt: "Download .txt (Google Docs format)",


    // Groups / Themes
    groupWorldPowers: "World Powers",
    groupRulers: "Rulers",
    groupHolyScriptures: "Holy Scriptures",
    groupHistoricalFigures: "Persons",
    groupBiblicalEvents: "Biblical Events",
    groupWorldEvents: "World Events",

    // Sidebar
    sidebarTitle: "MENU",
    searchPlaceholder: "Search events, descriptions, tags",
    searchEventsDescTags: "Search events, descriptions, tags",
    helpTooltip: "Help, contact, more",
    helpMenuShortcuts: "Keyboard shortcuts",
    helpMenuSupport: "Support",
    helpMenuClearCache: "Clear page cache",
    groupSection: "Categories",
    showAll: "Show All",
    hideAll: "Hide All",
    tagSection: "Filter by Tag",
    allTags: "All Tags",
    timespanSection: "Time Range (years)",
    approx: "approximate",
    scaleGroupHeights: "Group Spacing:",
    sidebarPin: "Pin sidebar",
    sidebarUnpin: "Unpin sidebar",
    sidebarAutoHide: "Auto-hide sidebar",
    sidebarAutoHideOn: "Auto-hide enabled (opens on hover)",
    sidebarAutoHideOff: "Auto-hide disabled",
    sidebarNarrow: "Narrow rail",
    sidebarExpand: "Expand sidebar",
    sidebarCollapse: "Collapse to narrow rail",
    sidebarToggleGroup: "Click to toggle group visibility",
    sidebarActiveFilters: "Active filters",

    // Timeline
    groupHeight: "Group Spacing:",
    tipSwipe: "Tip: Click and drag empty space left/right to navigate the timeline",
    btnZoomIn: "Zoom In Timeline",
    btnZoomOut: "Zoom Out Timeline",
    btnResetZoom: "Reset Zoom and Center",
    editBtn: "Edit",
    deleteBtn: "Delete",
    confirmDelete: "Are you sure you want to delete event \"{title}\"?",
    singleYearCards: "Cards:",
    singleYearPinned: "Pinned",
    singleYearPinsOnly: "Pins only",

    // Help / Uputstvo
    helpTitle: "User Guide",
    helpIntro: "Welcome to Chronicle - an interactive visualizer of historical events and periods with rich appearance customization options.",
    helpControlsTitle: "Navigation & Controls",
    helpControls1: "Drag-to-pan: Click and hold empty space on the timeline to pan left or right.",
    helpControls2: "Mouse wheel: Scroll to move the timeline left or right.",
    helpControls3: "Zoom controls (+/-): Use buttons in the bottom right corner to zoom in (view months) or zoom out (larger historic range).",
    helpControls4: "Spacing adjustments: Spacing/height buttons allow packing events optimally without overlaps.",
    helpEditingTitle: "Data Editing & Creation",
    helpEditing1: "Adding a new entry: Click 'New' in the header. Choose 'Event' (single point) or 'Period' (time range with start & end).",
    helpEditing2: "Seasons and months: Along with the year, you can choose one of the four seasons (Spring, Summer, Autumn, Winter) or a specific month for greater precision.",
    helpEditing3: "Editing an entry: Click on any event or period card to open the edit modal, from where you can also delete it.",
    helpEditing4: "Data Import & Export: Use header buttons to export your timeline as JSON or CSV, or import files back.",
    helpDesignTitle: "Aesthetics & Skins",
    helpDesign1: "Theme: Choose light or dark theme in the settings panel.",
    helpDesign2: "Aesthetic Skins: The Chronicle theme provides an authentic visual identity with custom layouts, clean line work, and typography.",
    helpClose: "Close",

    // Settings Modal
    settingsTitle: "Settings",
    settingsTheme: "Theme / Skin",
    themeNormal: "Standard",
    themeDark: "Dark",
    themeLight: "Light",
    settingsSkin: "Visual Styling Skin",
    skinProStudio: "Pro Studio",
    skinNameProStudio: "Pro Studio",
    skinNameHronika: "Chronicle",
    skinHronika: "Chronicle",
    settingsFont: "Site Font / Typography",
    fontHronika: "Hronika",
    fontSerif: "Serif",
    fontMono: "Mono",
    settingsLanguage: "Interface Language",
    langSerbian: "Serbian",
    langEnglish: "English",
    settingsClose: "Close",

    // TimelineItemModal
    modalNewTitle: "Add Event or Period",
    modalEditTitle: "Edit: {title}",
    modalLabelType: "Entry Type",
    typeEvent: "📍 Event",
    typePeriod: "📊 Period",
    labelTitle: "Title",
    titlePlaceholder: "e.g. Julius Caesar, Fall of Babylon...",
    labelGroup: "Group",
    newGroupPlaceholder: "e.g. Archeology, Science...",
    newGroupLabel: "🆕 New group...",
    eraBCE: "BCE",
    eraCE: "CE",
    approxLabel: "Approximate",
    labelYear: "Year",
    labelMonth: "Season / Month",
    labelDescription: "Description",
    descPlaceholder: "Detailed description of person, event...",
    labelSource: "Source (link)",
    sourcePlaceholder: "e.g. https://en.wikipedia.org/wiki/...",
    labelImage: "Image / Artwork",
    imagePlaceholder: "Paste image URL or upload file...",
    imageUploadBtn: "Choose local image",
    imageRemoveBtn: "Remove image",
    labelTags: "Tags",
    tagsInfo: "Comma-separated",
    tagsPlaceholder: "e.g. Antiquity, Rulers, Rome, Bible, War",
    labelColor: "Color (optional)",
    colorDefault: "Default",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnDelete: "Delete",
    confirmDeleteItem: "Are you sure you want to delete this entry?",

    // Seasons
    seasonSpring: "spring",
    seasonSummer: "summer",
    seasonAutumn: "autumn",
    seasonWinter: "winter",
    samoGodina: "year only",

    // Months
    jan: "January",
    feb: "February",
    mar: "March",
    apr: "April",
    maj: "May",
    jun: "June",
    jul: "July",
    avg: "August",
    sep: "September",
    okt: "October",
    nov: "November",
    dec: "December",

    shortJan: "Jan",
    shortFeb: "Feb",
    shortMar: "Mar",
    shortApr: "Apr",
    shortMaj: "May",
    shortJun: "Jun",
    shortJul: "Jul",
    shortAvg: "Aug",
    shortSep: "Sep",
    shortOkt: "Oct",
    shortNov: "Nov",
    shortDec: "Dec",

    eraPre: "BCE",
    eraN: "CE",
    eraPreShort: "BCE",
    eraNShort: "CE",
    okoLabel: "approx. ",
    okoLabelShort: "ca. ",

    // Additional translated elements
    settingsSubtitle: "Customize the layout of the interactive timeline",
    themeLabel: "Theme / Skin",
    themeDarkBtn: "Dark Theme",
    themeLightBtn: "Light Theme",
    skinLabel: "Select Skin / Design",
    settingsApplyClose: "Apply and Close",

    helpAppTitle: "Chronicle App Help",
    helpMoveZoomTitle: "Panning and Zooming",
    helpMoveTitle: "Panning (Drag-to-pan)",
    helpMoveDesc: "Click anywhere on the empty space of the timeline and drag your mouse (left or right) to move through history. On mobile devices, simply swipe with a finger.",
    helpZoomTitle: "Zooming (Zoom)",
    helpZoomDesc: "Use the + and - buttons in the control bar, scroll with the mouse wheel, or pinch-zoom with your fingers on mobile devices.",
    helpMobileTitle: "Mobile Version",
    helpMobileDesc: "The page supports smooth, natural panning in all directions (left-right and up-down) for maximum finger comfort.",
    helpYearBce: "Year before common era (BCE)",
    helpYearCe: "Year of common era (CE)",
    helpYearManual: "When manually adding an entry, simply select the era in the dropdown section and enter the year as a positive number.",
    helpCsvDesc: "The first line must specify the exact headers:",
    helpCsvNotice: "* Leave endYear empty for single events. To add tags via CSV, include a \"tags\" column with semicolon-separated values (e.g. \"Rome;Antiquity\").",
    helpCloseBtn: "Close Help",
    btnNewProject: "New Project",
    btnCopyLink: "Copy Link",
    btnMainProject: "Main Project",
    copiedLinkToast: "Link successfully copied!",
    badgeMainProject: "🏠 Main Project",
    badgePrivateProject: "🔗 Private Project"
  }
};

export type TranslationDictionary = typeof translations.sr;
export type TranslationKey = keyof TranslationDictionary;

// In-memory or localStorage custom translation overlay per language
const customTranslationCache: Record<string, Partial<TranslationDictionary> | null> = {
  sr: null,
  en: null
};

export function loadSavedCustomTranslation(lang: LangType = "sr"): Partial<TranslationDictionary> | null {
  if (customTranslationCache[lang]) return customTranslationCache[lang];
  try {
    const raw = localStorage.getItem(`hronika_custom_translation_${lang}_v1`);
    if (raw) {
      const parsed = JSON.parse(raw);
      customTranslationCache[lang] = parsed;
      return parsed;
    }
    // Check legacy key for Serbian only
    if (lang === "sr") {
      const legacyRaw = localStorage.getItem("hronika_custom_translation_v1");
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        customTranslationCache.sr = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return null;
}

export function saveCustomTranslation(data: Partial<TranslationDictionary>, lang: LangType = "sr"): void {
  customTranslationCache[lang] = data;
  try {
    localStorage.setItem(`hronika_custom_translation_${lang}_v1`, JSON.stringify(data));
    if (lang === "sr") {
      localStorage.setItem("hronika_custom_translation_v1", JSON.stringify(data));
    }
  } catch (_) {}
}

export function clearCustomTranslation(lang: LangType = "sr"): void {
  customTranslationCache[lang] = null;
  try {
    localStorage.removeItem(`hronika_custom_translation_${lang}_v1`);
    if (lang === "sr") {
      localStorage.removeItem("hronika_custom_translation_v1");
    }
  } catch (_) {}
}

export function getAppTranslations(lang: LangType): TranslationDictionary {
  const base = lang === "en" ? translations.en : translations.sr;
  const custom = loadSavedCustomTranslation(lang);
  if (custom && Object.keys(custom).length > 0) {
    return { ...base, ...custom } as TranslationDictionary;
  }
  return base as TranslationDictionary;
}

// Helper to parse CSV lines respecting quotes and delimiters
function parseCsvRow(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// Tab-Separated Values (TSV) text for instant, clean clipboard paste into Google Sheets (columns match perfectly)
export function getLanguageTsvText(): string {
  const rows: string[] = ["key\tEnglish\tSrpski"];
  const keys = Object.keys(translations.en) as (keyof TranslationDictionary)[];
  for (const key of keys) {
    const enVal = String(translations.en[key] || "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
    const srVal = String(translations.sr[key] || "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
    rows.push(`${key}\t${enVal}\t${srVal}`);
  }
  return rows.join("\r\n");
}

const GOOGLE_SHEETS_TEMPLATE_URL_KEY = "hronika_google_sheets_template_copy_url";

export function getGoogleSheetsTemplateUrl(): string {
  try {
    const saved = localStorage.getItem(GOOGLE_SHEETS_TEMPLATE_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (_) {}
  // Default to sheets.new (creates a fresh sheet) or public copy link
  return "https://sheets.new";
}

export function saveGoogleSheetsTemplateUrl(url: string): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(GOOGLE_SHEETS_TEMPLATE_URL_KEY);
    } else {
      localStorage.setItem(GOOGLE_SHEETS_TEMPLATE_URL_KEY, url.trim());
    }
  } catch (_) {}
}

// Download helpers
export function exportLanguageCsvTemplate(lang: LangType = "sr") {
  // If active language is English, column headers and content are based on English
  const isEn = lang === "en";
  const colHeader = isEn ? "English" : "Srpski";
  const rows: string[] = [`key,English,${colHeader}`];

  const keys = Object.keys(translations.en) as (keyof TranslationDictionary)[];
  for (const key of keys) {
    const enVal = String(translations.en[key] || "").replace(/"/g, '""').replace(/\r?\n/g, " ");
    const currentVal = String(
      (isEn ? translations.en[key] : translations.sr[key]) || ""
    ).replace(/"/g, '""').replace(/\r?\n/g, " ");
    rows.push(`"${key}","${enVal}","${currentVal}"`);
  }

  const csvContent = "\uFEFF" + rows.join("\r\n"); // UTF-8 BOM for Excel / Google Sheets
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isEn ? "hronika_translation_en.csv" : "hronika_translation_sr.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLanguageJsonTemplate(lang: LangType = "sr") {
  const isEn = lang === "en";
  const data = {
    schema: "hronika-translation-v1",
    sourceLanguage: "English",
    targetLanguage: isEn ? "English" : "Srpski",
    name: isEn ? "Hronika - English Translation" : "Hronika - Srpski Prevod",
    translations: isEn ? translations.en : translations.sr,
    source: translations.en
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isEn ? "hronika_translation_en.json" : "hronika_translation_sr.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLanguageTxtTemplate(lang: LangType = "sr") {
  const isEn = lang === "en";
  const lines: string[] = isEn
    ? [
        "# HRONIKA - TRANSLATION TEMPLATE (ENGLISH)",
        "# INSTRUCTION: Each line follows the format 'key: Translation text'.",
        "# Only edit the text on the right side of the colon (:).",
        "# Do not delete or modify the key names on the left side.",
        "",
      ]
    : [
        "# HRONIKA - PREVOD / TRANSLATION (SRPSKI)",
        "# UPUTSTVO: Svaki red je u formatu ključ: Prevod teksta",
        "# Menjajte samo tekst sa desne strane dvotačke (:).",
        "# Nemojte brisati niti menjati nazive ključeva sa leve strane.",
        "",
      ];

  const keys = Object.keys(translations.en) as (keyof TranslationDictionary)[];
  for (const key of keys) {
    const val = String((isEn ? translations.en[key] : translations.sr[key]) || "").replace(/\r?\n/g, " ");
    lines.push(`${key}: ${val}`);
  }
  const txtContent = lines.join("\r\n");
  const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isEn ? "hronika_translation_en.txt" : "hronika_translation_sr.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseTranslationFile(rawContent: string, fileName: string): { count: number; data: Partial<TranslationDictionary>; name: string } {
  const isJson = fileName.toLowerCase().endsWith(".json") || rawContent.trim().startsWith("{");
  const result: Partial<TranslationDictionary> = {};
  let detectedName = fileName;

  if (isJson) {
    const parsed = JSON.parse(rawContent);
    const dict = parsed.translations || parsed;
    detectedName = parsed.name || fileName;

    for (const [k, v] of Object.entries(dict)) {
      if (typeof v === "string" && v.trim()) {
        (result as any)[k] = v.trim();
      }
    }
  } else {
    // Check if file is in "key: translation" text format (Google Docs / TXT format)
    const lines = rawContent.split(/\r?\n/);
    let colonMatches = 0;
    for (const line of lines.slice(0, 30)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("//") && /^[a-zA-Z0-9_\-]+\s*:\s*.+$/.test(trimmed)) {
        colonMatches++;
      }
    }

    if (colonMatches >= 3 || fileName.toLowerCase().endsWith(".txt")) {
      // Parse key: value lines
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
        const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
        if (match) {
          const key = match[1].trim();
          const translation = match[2].trim();
          if (key && translation) {
            (result as any)[key] = translation;
          }
        }
      }
    } else {
      // CSV Parsing (handles comma or semicolon delimiter, quoted values, escaped quotes)
      if (lines.length > 0) {
        const headerLine = lines[0];
        const delimiter = headerLine.includes(";") ? ";" : ",";

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = parseCsvRow(line, delimiter);
          if (cols.length >= 3) {
            const key = cols[0].trim().replace(/^"|"$/g, "");
            const translation = cols[2].trim().replace(/^"|"$/g, "");
            if (key && translation) {
              (result as any)[key] = translation;
            }
          } else if (cols.length === 2) {
            const key = cols[0].trim().replace(/^"|"$/g, "");
            const translation = cols[1].trim().replace(/^"|"$/g, "");
            if (key && translation) {
              (result as any)[key] = translation;
            }
          }
        }
      }
    }
  }

  const count = Object.keys(result).length;
  if (count === 0) {
    throw new Error("No valid translations found");
  }

  return { count, data: result, name: detectedName };
}

