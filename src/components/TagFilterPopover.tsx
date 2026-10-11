import React, { useState, useRef, useEffect } from "react";
import { TagConfig, NotionColor } from "../types";
import { NotionTagPill, NOTION_COLORS_LIST } from "./TagManagerPicker";
import { Filter, X, ChevronDown, Check, MoreHorizontal, Trash2, Plus } from "lucide-react";

interface TagFilterPopoverProps {
  availableTags: TagConfig[];
  selectedTag: string; // single selected or empty
  onSelectTag: (tag: string) => void;
  onAddCustomTag?: (name: string, color?: NotionColor) => void;
  onUpdateTag?: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag?: (name: string) => void;
  theme?: "dark" | "light";
  lang?: "sr" | "en";
  className?: string;
}

export function TagFilterPopover({
  availableTags,
  selectedTag,
  onSelectTag,
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  theme = "dark",
  lang = "sr",
  className = ""
}: TagFilterPopoverProps) {
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [editTagName, setEditTagName] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingTag(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTagConfig = availableTags.find(t => t.name === selectedTag);

  const filteredTags = availableTags.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatchExists = availableTags.some(
    t => t.name.toLowerCase() === search.trim().toLowerCase()
  );

  const handleCreateNew = () => {
    const trimmed = search.trim();
    if (!trimmed || !onAddCustomTag) return;
    const availableColors: NotionColor[] = ["blue", "green", "yellow", "orange", "purple", "pink", "red", "brown", "gray"];
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    onAddCustomTag(trimmed, randomColor);
    onSelectTag(trimmed);
    setSearch("");
  };

  const handleSaveTagEdit = () => {
    if (!editingTag || !onUpdateTag) return;
    const trimmed = editTagName.trim();
    if (trimmed && trimmed !== editingTag.name) {
      onUpdateTag(editingTag.name, { name: trimmed });
      if (selectedTag === editingTag.name) {
        onSelectTag(trimmed);
      }
    }
    setEditingTag(null);
  };

  const handleChangeTagColor = (color: NotionColor) => {
    if (!editingTag || !onUpdateTag) return;
    onUpdateTag(editingTag.name, { color });
    setEditingTag(prev => prev ? { ...prev, color } : null);
  };

  const handleDeleteCurrentTag = () => {
    if (!editingTag || !onDeleteTag) return;
    onDeleteTag(editingTag.name);
    if (selectedTag === editingTag.name) {
      onSelectTag("");
    }
    setEditingTag(null);
  };

  return (
    <div className={`relative inline-block ${isOpen ? "z-[9999]" : "z-20"} ${className}`} ref={popoverRef}>
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer shadow-xs ${
          selectedTag
            ? isLight
              ? "bg-[#D96B27]/15 border-[#D96B27]/40 text-[#D96B27] font-bold"
              : "bg-[#1E443A] border-[#28594D] text-white font-bold"
            : isLight
              ? "bg-white border-[#E5E0D8] text-[#1C1D1C] hover:bg-[#FAF8F5]"
              : "bg-[#1F2120] border-[#383A39] text-[#F0EFED] hover:bg-[#262827]"
        }`}
        id="btn_filter_tags_popover"
      >
        <Filter className={`w-3.5 h-3.5 ${selectedTag ? (isLight ? "text-[#D96B27]" : "text-white") : (isLight ? "text-[#686963]" : "text-[#8E908B]")}`} />
        <span>{lang === "sr" ? "Filter" : "Filter"}</span>
        {selectedTag && (
          <span className="flex items-center gap-1 pl-1">
            <NotionTagPill
              name={activeTagConfig?.name || selectedTag}
              color={activeTagConfig?.color || "default"}
              isLight={isLight}
              onRemove={() => onSelectTag("")}
            />
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""} text-slate-400`} />
      </button>

      {/* Popover Dropdown (Notion Menu) */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl border shadow-2xl z-[9999] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 opacity-100 ${
            isLight 
              ? "bg-white border-[#1E443A] text-slate-800 shadow-slate-400/30" 
              : "bg-[#121215] border-[#1E443A] text-slate-200 shadow-black"
          }`}
        >
          {/* Header Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#121215]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "sr" ? "Pretraži ili kreiraj tag..." : "Search or create tag..."}
              className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#1E443A] outline-none bg-slate-900 text-white"
              autoFocus
            />
          </div>

          <div className="flex max-h-72 bg-white dark:bg-[#121215]">
            {/* Tags list */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 bg-white dark:bg-[#121215]">
              {/* Option "All / Svi" */}
              <div
                onClick={() => {
                  onSelectTag("");
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition select-none text-xs ${
                  !selectedTag
                    ? "bg-[#1E443A] font-bold text-white"
                    : "bg-[#1E443A]/60 hover:bg-[#1E443A] text-white"
                }`}
              >
                <span>{lang === "sr" ? "Svi događaji (bez filtera)" : "All events (no filter)"}</span>
                {!selectedTag && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              {filteredTags.map((tag) => {
                const isSelected = selectedTag === tag.name;
                const isEditing = editingTag?.name === tag.name;

                return (
                  <div
                    key={tag.name}
                    onClick={() => {
                      onSelectTag(tag.name);
                      setIsOpen(false);
                    }}
                    className={`group/row flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-[#1E443A] text-white font-bold"
                        : "bg-[#1E443A]/60 hover:bg-[#1E443A] text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <NotionTagPill
                        name={tag.name}
                        color={tag.color}
                        isLight={isLight}
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      
                      {/* Notion 3-dots */}
                      {onUpdateTag && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTag(tag);
                            setEditTagName(tag.name);
                          }}
                          className="p-1 rounded transition opacity-0 group-hover/row:opacity-100 bg-[#1E443A] hover:bg-[#255246] text-white"
                          title={lang === "sr" ? "Uredi tag" : "Edit tag"}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Create new tag inline button */}
              {search.trim() && !exactMatchExists && onAddCustomTag && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition text-left cursor-pointer bg-[#1E443A] hover:bg-[#255246] text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>
                    {lang === "sr" ? "Kreiraj tag " : "Create tag "}
                    <span className="font-bold underline">{search.trim()}</span>
                  </span>
                </button>
              )}
            </div>

            {/* Editing sub-menu */}
            {editingTag && onUpdateTag && (
              <div 
                className={`w-48 border-l p-2.5 flex flex-col gap-2.5 overflow-y-auto ${
                  isLight ? "bg-white border-slate-200" : "bg-[#1c1c20] border-slate-800"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Rename */}
                <div>
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    onBlur={handleSaveTagEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTagEdit();
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-[#1E443A] outline-none font-medium bg-slate-900 text-white"
                  />
                </div>

                {/* Delete */}
                {onDeleteTag && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentTag}
                    className="flex items-center gap-1.5 text-xs bg-[#1E443A] hover:bg-[#255246] text-white font-medium py-1 px-2 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                    <span>{lang === "sr" ? "Obriši tag" : "Delete"}</span>
                  </button>
                )}

                <div className={`h-[1px] ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />

                {/* Colors */}
                <div className="space-y-0.5">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                    {lang === "sr" ? "Boje" : "Colors"}
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-0.5 pr-0.5">
                    {NOTION_COLORS_LIST.map((c) => {
                      const isColorSelected = editingTag.color === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleChangeTagColor(c.id)}
                          className={`flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer text-xs transition ${
                            isColorSelected 
                              ? "bg-[#1E443A] font-bold text-white"
                              : "hover:bg-[#1E443A]/40 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-3 h-3 rounded-xs border border-black/10 shrink-0" 
                              style={{ backgroundColor: c.previewBg }} 
                            />
                            <span className="text-[11px]">{lang === "sr" ? c.labelSr : c.labelEn}</span>
                          </div>
                          {isColorSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
