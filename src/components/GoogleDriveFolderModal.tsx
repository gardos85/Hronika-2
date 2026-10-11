import React, { useState, useEffect } from "react";
import { 
  X, 
  Folder, 
  FolderPlus, 
  HardDrive, 
  FolderCheck, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  Loader2, 
  Check, 
  Plus, 
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { 
  listDriveFolders, 
  createDriveFolder, 
  DriveFolderItem 
} from "../services/googleDocsService";
import { LangType, getAppTranslations } from "../translations";

interface Breadcrumb {
  id: string;
  name: string;
}

interface GoogleDriveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangType;
  theme: "light" | "dark";
  skinPrimaryColor?: string;
  initialFolderId?: string;
  initialFolderName?: string;
  onSelectFolder: (folderId: string, folderName: string) => void;
}

export function GoogleDriveFolderModal({
  isOpen,
  onClose,
  lang,
  theme,
  skinPrimaryColor = "#1e433a",
  initialFolderId = "root",
  initialFolderName,
  onSelectFolder
}: GoogleDriveFolderModalProps) {
  const t = getAppTranslations(lang);
  const isEn = lang === "en";

  const rootName = isEn ? "My Drive (Root)" : "Moj disk (Koren)";
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { id: "root", name: rootName }
  ]);
  const [currentParentId, setCurrentParentId] = useState<string>("root");
  const [folders, setFolders] = useState<DriveFolderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selected folder
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string }>({
    id: initialFolderId || "root",
    name: initialFolderName || rootName
  });

  // Search & New Folder
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Load folders when parentId changes or modal opens
  const fetchFolders = async (parentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listDriveFolders(parentId);
      setFolders(list);
    } catch (err: any) {
      setError(err.message || (isEn ? "Failed to load Google Drive folders." : "Greška pri učitavanju foldera sa Google Drive-a."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFolders(currentParentId);
    }
  }, [isOpen, currentParentId]);

  // Reset when initial props change
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder({
        id: initialFolderId || "root",
        name: initialFolderName || rootName
      });
    }
  }, [isOpen, initialFolderId, initialFolderName]);

  if (!isOpen) return null;

  const handleNavigateInto = (folder: DriveFolderItem) => {
    setCurrentParentId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSelectedFolder({ id: folder.id, name: folder.name });
    setSearchQuery("");
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    if (!target) return;
    setCurrentParentId(target.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setSelectedFolder({ id: target.id, name: target.name });
    setSearchQuery("");
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const created = await createDriveFolder(newFolderName.trim(), currentParentId);
      setNewFolderName("");
      setIsCreatingNew(false);
      // Reload folders and auto-select created folder
      await fetchFolders(currentParentId);
      setSelectedFolder({ id: created.id, name: created.name });
    } catch (err: any) {
      setError(err.message || (isEn ? "Failed to create folder." : "Greška pri kreiranju foldera."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirm = () => {
    onSelectFolder(selectedFolder.id, selectedFolder.name);
    onClose();
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
      id="modal_google_drive_folder_picker"
    >
      <div 
        className={`w-full max-w-xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden cursor-default transition-all ${
          theme === "light" 
            ? "bg-white border-slate-200 text-slate-900 shadow-slate-300/50" 
            : "bg-[#0f0f12] border-[#373735] text-[#eaeaea] shadow-black/80"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          theme === "light" ? "border-slate-100 bg-slate-50/50" : "border-[#373735] bg-[#0f0f12]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E443A]/30 text-[#3E927B] flex items-center justify-center shadow-xs shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isEn ? "Select Google Drive Folder" : "Izaberite folder na Google Drive-u"}
              </h2>
              <p className={`text-xs ${theme === "light" ? "text-slate-500" : "text-[#ada9a3]"}`}>
                {isEn 
                  ? "Choose destination folder for the English translation document" 
                  : "Izaberite gde će se kreirati dokument sa prevodima za srpski jezik"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition cursor-pointer ${
              theme === "light" 
                ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800" 
                : "hover:bg-[#161619] text-[#ada9a3] hover:text-white"
            }`}
            title={t.btnCancel || "Zatvori"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumbs & Controls */}
        <div className={`p-3 sm:px-5 border-b flex flex-wrap items-center justify-between gap-2 ${
          theme === "light" ? "bg-slate-100/60 border-slate-200/80" : "bg-[#161619] border-[#373735]"
        }`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium py-1 max-w-full">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id + idx}>
                  <button
                    type="button"
                    onClick={() => handleNavigateBreadcrumb(idx)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition cursor-pointer shrink-0 ${
                      isLast 
                        ? (theme === "light" ? "bg-white text-slate-900 font-bold shadow-2xs" : "bg-[#1E443A] text-white font-bold shadow-2xs")
                        : (theme === "light" ? "text-slate-600 hover:bg-slate-200/80" : "text-[#ada9a3] hover:bg-[#0f0f12]")
                    }`}
                  >
                    {idx === 0 ? <HardDrive className="w-3.5 h-3.5" /> : <FolderOpen className="w-3.5 h-3.5" />}
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{crumb.name}</span>
                  </button>
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchFolders(currentParentId)}
            disabled={isLoading}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              theme === "light" ? "hover:bg-slate-200 text-slate-600" : "hover:bg-[#0f0f12] text-[#ada9a3]"
            }`}
            title={isEn ? "Refresh folder list" : "Osveži listu foldera"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search & New Folder Action Bar */}
        <div className={`p-3 sm:px-5 flex items-center gap-2 border-b border-dashed ${
          theme === "light" ? "border-slate-200" : "border-[#373735]"
        }`}>
          <div className={`relative flex-1 flex items-center rounded-lg border px-2.5 py-1.5 text-xs ${
            theme === "light" ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#161619] border-[#373735] text-[#eaeaea]"
          }`}>
            <Search className="w-3.5 h-3.5 opacity-50 mr-2 shrink-0 text-[#ada9a3]" />
            <input 
              type="text"
              placeholder={isEn ? "Search folders..." : "Filtriraj foldere..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[#ada9a3]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="opacity-60 hover:opacity-100 cursor-pointer text-[#ada9a3]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isCreatingNew ? (
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer shrink-0 ${
                theme === "light" 
                  ? "bg-white border-slate-300 hover:bg-slate-50 text-slate-700" 
                  : "bg-[#161619] border-[#373735] hover:bg-[#1E443A]/30 hover:border-[#3E927B]/50 text-[#eaeaea]"
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#3E927B]" />
              <span>{isEn ? "New Folder" : "Novi folder"}</span>
            </button>
          ) : (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-1.5 shrink-0">
              <input 
                type="text"
                autoFocus
                placeholder={isEn ? "Folder name..." : "Naziv foldera..."}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs outline-none w-36 sm:w-44 ${
                  theme === "light" ? "bg-white border-slate-400 text-slate-900" : "bg-[#0f0f12] border-[#3E927B] text-[#eaeaea]"
                }`}
              />
              <button
                type="submit"
                disabled={isCreating || !newFolderName.trim()}
                className="px-2.5 py-1.5 bg-[#1E443A] hover:bg-[#255246] text-white border border-[#3E927B]/40 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isEn ? "Create" : "Kreiraj")}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreatingNew(false); setNewFolderName(""); }}
                className="p-1.5 rounded-lg text-xs opacity-70 hover:opacity-100 cursor-pointer text-[#ada9a3]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Folder List Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1.5 min-h-[220px]">
          {error && (
            <div className="p-3 rounded-xl bg-[#A34836]/10 border border-[#A34836]/30 text-[#A34836] dark:text-[#E08D79] text-xs mb-3">
              {error}
            </div>
          )}

          {/* Current directory selection tile (e.g. My Drive or Current Folder) */}
          <div 
            onClick={() => setSelectedFolder({ id: currentParentId, name: breadcrumbs[breadcrumbs.length - 1].name })}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              selectedFolder.id === currentParentId
                ? (theme === "light" ? "bg-[#1E443A]/10 border-[#1E443A] text-[#1E443A] font-semibold ring-1 ring-[#1E443A]" : "bg-[#1E443A]/30 border-[#3E927B] text-white font-semibold ring-1 ring-[#3E927B]/60")
                : (theme === "light" ? "bg-slate-50/70 border-slate-200 hover:bg-slate-100" : "bg-[#161619] border-[#373735] hover:bg-[#1E443A]/20")
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1E443A]/40 text-[#3E927B] flex items-center justify-center shrink-0">
                {currentParentId === "root" ? <HardDrive className="w-4 h-4" /> : <FolderCheck className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-2">
                  <span>{breadcrumbs[breadcrumbs.length - 1].name}</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-[#1E443A]/40 text-[#B8D8C0] border border-[#3E927B]/30">
                    {isEn ? "Current Location" : "Trenutna lokacija"}
                  </span>
                </div>
                <p className={`text-[10px] ${theme === "light" ? "text-slate-500" : "text-[#ada9a3]"}`}>
                  {isEn ? "Save translation file in this folder" : "Sačuvaj fajl za prevod u ovom folderu"}
                </p>
              </div>
            </div>

            {selectedFolder.id === currentParentId && (
              <div className="w-5 h-5 rounded-full bg-[#3E927B] text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Loading spinner */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center text-xs opacity-70 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#3E927B]" />
              <span>{isEn ? "Loading Google Drive folders..." : "Učitavanje foldera sa Google Drive-a..."}</span>
            </div>
          )}

          {/* Subfolders list */}
          {!isLoading && filteredFolders.length > 0 && (
            <div className="pt-2">
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1 ${theme === "light" ? "text-slate-500" : "text-[#ada9a3]"}`}>
                {isEn ? "Subfolders" : "Podfolderi"} ({filteredFolders.length})
              </div>
              <div className="space-y-1">
                {filteredFolders.map(f => {
                  const isSelected = selectedFolder.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFolder({ id: f.id, name: f.name })}
                      onDoubleClick={() => handleNavigateInto(f)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer group ${
                        isSelected
                          ? (theme === "light" ? "bg-[#1E443A]/10 border-[#1E443A] text-[#1E443A] ring-1 ring-[#1E443A] font-semibold" : "bg-[#1E443A]/30 border-[#3E927B] text-white ring-1 ring-[#3E927B]/60 font-semibold")
                          : (theme === "light" ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-[#161619] border-[#373735] hover:bg-[#1E443A]/20 text-[#eaeaea]")
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-4 h-4 shrink-0 text-[#3E927B]" />
                        <span className="text-xs truncate">{f.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#3E927B] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateInto(f);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                            theme === "light" ? "hover:bg-slate-200 text-slate-600" : "hover:bg-[#1E443A] text-[#ada9a3] hover:text-white"
                          }`}
                          title={isEn ? "Open folder" : "Otvori folder"}
                        >
                          <span>{isEn ? "Open" : "Otvori"}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && filteredFolders.length === 0 && (
            <div className={`py-6 text-center text-xs ${theme === "light" ? "text-slate-500" : "text-[#ada9a3]"}`}>
              {searchQuery 
                ? (isEn ? "No folders match your search." : "Nijedan folder ne odgovara pretrazi.") 
                : (isEn ? "No subfolders found in this directory. You can create a new folder above." : "Nema podfoldera u ovom direktorijumu. Možete kreirati novi folder iznad.")}
            </div>
          )}
        </div>

        {/* Footer with Selected Folder & Action */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          theme === "light" ? "bg-slate-50 border-slate-200" : "bg-[#0f0f12] border-[#373735]"
        }`}>
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto truncate">
            <span className={`shrink-0 ${theme === "light" ? "text-slate-500" : "text-[#ada9a3]"}`}>{isEn ? "Selected:" : "Izabrano:"}</span>
            <div className="flex items-center gap-1 font-bold text-[#74BAA0] truncate">
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{selectedFolder.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                theme === "light" 
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-700" 
                  : "bg-[#161619] border border-[#373735] hover:bg-[#25252b] text-[#ada9a3]"
              }`}
            >
              {isEn ? "Cancel" : "Odustani"}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E443A] hover:bg-[#255246] text-white border border-[#3E927B]/40 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FolderCheck className="w-4 h-4 text-[#74BAA0]" />
              <span>{isEn ? "Confirm & Use Folder" : "Potvrdi i izaberi folder"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
