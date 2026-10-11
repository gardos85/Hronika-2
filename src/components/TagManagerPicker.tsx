import React, { useState, useRef, useEffect } from "react";
import { NotionColor, TagConfig } from "../types";
import { 
  X, 
  MoreHorizontal, 
  Trash2, 
  Plus, 
  GripVertical, 
  Check, 
  ChevronDown,
  Tag as TagIcon
} from "lucide-react";

export const NOTION_COLORS_LIST: Array<{
  id: NotionColor;
  labelEn: string;
  labelSr: string;
  bgLight: string;
  textLight: string;
  bgDark: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  previewBg: string;
}> = [
  {
    id: "default",
    labelEn: "Default",
    labelSr: "Podrazumevana",
    bgLight: "bg-slate-100",
    textLight: "text-slate-800",
    bgDark: "bg-slate-800/70",
    textDark: "text-slate-200",
    borderLight: "border-slate-200",
    borderDark: "border-slate-700",
    previewBg: "#E2E8F0"
  },
  {
    id: "gray",
    labelEn: "Gray",
    labelSr: "Siva",
    bgLight: "bg-zinc-100",
    textLight: "text-zinc-700",
    bgDark: "bg-zinc-800/80",
    textDark: "text-zinc-300",
    borderLight: "border-zinc-200",
    borderDark: "border-zinc-700",
    previewBg: "#D4D4D8"
  },
  {
    id: "brown",
    labelEn: "Brown",
    labelSr: "Braon",
    bgLight: "bg-[#F3EBE6]",
    textLight: "text-[#64473A]",
    bgDark: "bg-[#43302B]/60",
    textDark: "text-[#D8B4A6]",
    borderLight: "border-[#E7D6CD]",
    borderDark: "border-[#604238]",
    previewBg: "#D8B4A6"
  },
  {
    id: "orange",
    labelEn: "Orange",
    labelSr: "Narandžasta",
    bgLight: "bg-[#FAECE0]",
    textLight: "text-[#8A4A18]",
    bgDark: "bg-[#4D2E14]/60",
    textDark: "text-[#FDBA74]",
    borderLight: "border-[#F4D3B8]",
    borderDark: "border-[#7C3D12]",
    previewBg: "#FDBA74"
  },
  {
    id: "yellow",
    labelEn: "Yellow",
    labelSr: "Žuta",
    bgLight: "bg-[#FBF3DB]",
    textLight: "text-[#89632A]",
    bgDark: "bg-[#473B17]/60",
    textDark: "text-[#FDE047]",
    borderLight: "border-[#F6E3B4]",
    borderDark: "border-[#715A16]",
    previewBg: "#FDE047"
  },
  {
    id: "green",
    labelEn: "Green",
    labelSr: "Zelena",
    bgLight: "bg-[#EBF5EE]",
    textLight: "text-[#285A35]",
    bgDark: "bg-[#1B3F25]/60",
    textDark: "text-[#86EFAC]",
    borderLight: "border-[#D1EBD8]",
    borderDark: "border-[#14532D]",
    previewBg: "#86EFAC"
  },
  {
    id: "blue",
    labelEn: "Blue",
    labelSr: "Plava",
    bgLight: "bg-[#E7F3F8]",
    textLight: "text-[#184F68]",
    bgDark: "bg-[#16384C]/60",
    textDark: "text-[#93C5FD]",
    borderLight: "border-[#CEE7F2]",
    borderDark: "border-[#1E40AF]",
    previewBg: "#93C5FD"
  },
  {
    id: "purple",
    labelEn: "Purple",
    labelSr: "Ljubičasta",
    bgLight: "bg-[#F3EEF8]",
    textLight: "text-[#53306B]",
    bgDark: "bg-[#3B1F50]/60",
    textDark: "text-[#D8B4FE]",
    borderLight: "border-[#E5D7F2]",
    borderDark: "border-[#6B21A8]",
    previewBg: "#D8B4FE"
  },
  {
    id: "pink",
    labelEn: "Pink",
    labelSr: "Roze",
    bgLight: "bg-[#F9EFF3]",
    textLight: "text-[#6E2E4E]",
    bgDark: "bg-[#4B1A32]/60",
    textDark: "text-[#F472B6]",
    borderLight: "border-[#F2D7E3]",
    borderDark: "border-[#831843]",
    previewBg: "#F472B6"
  },
  {
    id: "red",
    labelEn: "Red",
    labelSr: "Crvena",
    bgLight: "bg-[#FDEBEC]",
    textLight: "text-[#78282B]",
    bgDark: "bg-[#4C171A]/60",
    textDark: "text-[#FCA5A5]",
    borderLight: "border-[#FAD0D3]",
    borderDark: "border-[#991B1B]",
    previewBg: "#FCA5A5"
  }
];

export function getTagColorStyle(colorName: NotionColor = "default", isLight = false) {
  const cfg = NOTION_COLORS_LIST.find(c => c.id === colorName) || NOTION_COLORS_LIST[0];
  return {
    className: isLight 
      ? `${cfg.bgLight} ${cfg.textLight} ${cfg.borderLight} border`
      : `${cfg.bgDark} ${cfg.textDark} ${cfg.borderDark} border`,
    previewBg: cfg.previewBg
  };
}

export function NotionTagPill({
  name,
  color = "default",
  isLight = false,
  onRemove,
  onClick,
  className = ""
}: {
  name: string;
  color?: NotionColor;
  isLight?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  key?: React.Key;
}) {
  const { className: colorClass } = getTagColorStyle(color, isLight);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-tight select-none ${colorClass} ${onClick ? "cursor-pointer hover:opacity-85" : ""} ${className}`}
    >
      <span className="truncate max-w-[140px]">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none p-0.5 rounded-xs transition"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

interface TagManagerPickerProps {
  selectedTagNames: string[];
  onChange: (tags: string[]) => void;
  availableTags: TagConfig[];
  onAddCustomTag: (name: string, color?: NotionColor) => void;
  onUpdateTag: (oldName: string, newConfig: Partial<TagConfig>) => void;
  onDeleteTag: (name: string) => void;
  theme?: "dark" | "light";
  lang?: string;
  placeholder?: string;
}

export function TagManagerPicker({
  selectedTagNames,
  onChange,
  availableTags,
  onAddCustomTag,
  onUpdateTag,
  onDeleteTag,
  theme = "dark",
  lang = "sr",
  placeholder
}: TagManagerPickerProps) {
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [editTagName, setEditTagName] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setEditingTag(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = availableTags.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatchExists = availableTags.some(
    t => t.name.toLowerCase() === search.trim().toLowerCase()
  );

  const handleToggleTag = (tagName: string) => {
    if (selectedTagNames.includes(tagName)) {
      onChange(selectedTagNames.filter(t => t !== tagName));
    } else {
      onChange([...selectedTagNames, tagName]);
    }
  };

  const handleCreateNew = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    // assign random color or default
    const availableColors: NotionColor[] = ["blue", "green", "yellow", "orange", "purple", "pink", "red", "brown", "gray"];
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    onAddCustomTag(trimmed, randomColor);
    onChange([...selectedTagNames, trimmed]);
    setSearch("");
  };

  const openTagEditor = (tag: TagConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
    setEditTagName(tag.name);
  };

  const handleSaveTagEdit = () => {
    if (!editingTag) return;
    const trimmed = editTagName.trim();
    if (trimmed && trimmed !== editingTag.name) {
      onUpdateTag(editingTag.name, { name: trimmed });
      // Update selected tags as well if present
      if (selectedTagNames.includes(editingTag.name)) {
        onChange(selectedTagNames.map(t => (t === editingTag.name ? trimmed : t)));
      }
    }
    setEditingTag(null);
  };

  const handleChangeTagColor = (color: NotionColor) => {
    if (!editingTag) return;
    onUpdateTag(editingTag.name, { color });
    setEditingTag(prev => prev ? { ...prev, color } : null);
  };

  const handleDeleteCurrentTag = () => {
    if (!editingTag) return;
    onDeleteTag(editingTag.name);
    onChange(selectedTagNames.filter(t => t !== editingTag.name));
    setEditingTag(null);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search and Tags Input Container (Notion Style) */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`min-h-[38px] p-1.5 rounded-lg border transition flex flex-wrap items-center gap-1.5 cursor-text ${
          isLight 
            ? "bg-white border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300" 
            : "bg-slate-950 border-slate-800 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/30"
        }`}
      >
        {selectedTagNames.map(tagName => {
          const cfg = availableTags.find(t => t.name === tagName) || { id: tagName, name: tagName, color: "default" as NotionColor };
          return (
            <NotionTagPill
              key={tagName}
              name={cfg.name}
              color={cfg.color}
              isLight={isLight}
              onRemove={() => handleToggleTag(tagName)}
            />
          );
        })}

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (search.trim() && !exactMatchExists) {
                handleCreateNew();
              } else if (filteredTags.length > 0) {
                handleToggleTag(filteredTags[0].name);
                setSearch("");
              }
            } else if (e.key === "Backspace" && search === "" && selectedTagNames.length > 0) {
              onChange(selectedTagNames.slice(0, -1));
            }
          }}
          placeholder={selectedTagNames.length === 0 ? (placeholder || (lang === "sr" ? "Izaberi opciju ili kreiraj..." : "Select an option or create one...")) : ""}
          className={`flex-1 min-w-[120px] bg-transparent outline-none text-xs px-1 py-0.5 ${
            isLight ? "text-slate-800 placeholder:text-slate-400" : "text-slate-200 placeholder:text-slate-500"
          }`}
        />
      </div>

      {/* Popover Dropdown Menu (Notion-style list) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl border shadow-2xl z-50 overflow-hidden flex animate-in fade-in zoom-in-95 duration-100 ${
            isLight 
              ? "bg-white border-slate-200 text-slate-800 shadow-slate-300/60" 
              : "bg-[#18181b] border-slate-800 text-slate-200 shadow-black/80"
          }`}
          style={{ maxHeight: "320px" }}
        >
          {/* Main List Column */}
          <div className="flex-1 flex flex-col min-w-0 max-h-[300px] overflow-y-auto p-1.5">
            <div className={`px-2.5 py-1.5 text-[11px] font-medium select-none ${isLight ? "text-slate-400" : "text-slate-500"}`}>
              {lang === "sr" ? "Izaberi opciju ili kreiraj novu" : "Select an option or create one"}
            </div>

            {/* List of tags */}
            <div className="space-y-0.5">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagNames.includes(tag.name);
                const isCurrentEditing = editingTag?.name === tag.name;

                return (
                  <div
                    key={tag.id || tag.name}
                    onClick={() => handleToggleTag(tag.name)}
                    className={`group/row flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition select-none ${
                      isCurrentEditing
                        ? isLight ? "bg-slate-100" : "bg-slate-800/80"
                        : isLight ? "hover:bg-slate-100/80" : "hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <GripVertical className={`w-3.5 h-3.5 opacity-30 group-hover/row:opacity-70 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                      <NotionTagPill
                        name={tag.name}
                        color={tag.color}
                        isLight={isLight}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      
                      {/* 3-dots button for Notion-style settings */}
                      <button
                        type="button"
                        onClick={(e) => openTagEditor(tag, e)}
                        className={`p-1 rounded transition opacity-0 group-hover/row:opacity-100 ${
                          isLight ? "hover:bg-slate-200 text-slate-500" : "hover:bg-slate-700 text-slate-400"
                        }`}
                        title={lang === "sr" ? "Uredi tag" : "Edit tag"}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create new tag option if typed text doesn't exist */}
              {search.trim() && !exactMatchExists && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition text-left cursor-pointer ${
                    isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {lang === "sr" ? "Kreiraj " : "Create "}
                    <span className="font-bold underline">{search.trim()}</span>
                  </span>
                </button>
              )}

              {filteredTags.length === 0 && !search.trim() && (
                <div className={`text-center py-4 text-xs ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  {lang === "sr" ? "Nema tagova. Upišite naziv da kreirate novi." : "No tags yet. Type a name to create one."}
                </div>
              )}
            </div>
          </div>

          {/* Tag Editor Side Panel / Sub-menu (Notion Style popup as requested) */}
          {editingTag && (
            <div 
              className={`w-60 border-l p-3 flex flex-col gap-3 shadow-xl overflow-y-auto ${
                isLight ? "bg-white border-slate-200" : "bg-[#1c1c20] border-slate-800"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Row: Rename Input */}
              <div className="space-y-1">
                <div className={`flex items-center rounded-lg border px-2 py-1 focus-within:ring-2 ${
                  isLight 
                    ? "bg-white border-slate-300 focus-within:border-[#3E927B] focus-within:ring-[#3E927B]/20" 
                    : "bg-[#161619] border-[#373735] focus-within:border-[#3E927B] focus-within:ring-[#3E927B]/20"
                }`}>
                  <NotionTagPill
                    name={editTagName || editingTag.name}
                    color={editingTag.color}
                    isLight={isLight}
                    className="mr-1.5"
                  />
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    onBlur={handleSaveTagEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveTagEdit();
                      }
                    }}
                    placeholder={lang === "sr" ? "Preimenuj..." : "Rename..."}
                    className={`flex-1 bg-transparent text-xs outline-none font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}
                    autoFocus
                  />
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDeleteCurrentTag}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 transition cursor-pointer ${
                  isLight ? "hover:bg-red-50" : "hover:bg-red-950/40"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "sr" ? "Obriši tag" : "Delete"}</span>
              </button>

              <div className={`h-[1px] ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />

              {/* Colors List (Notion Style Color Selection with colored square + checkmark) */}
              <div className="space-y-1">
                <div className={`text-[11px] font-semibold px-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {lang === "sr" ? "Boje" : "Colors"}
                </div>
                <div className="space-y-0.5 max-h-[140px] overflow-y-auto pr-0.5">
                  {NOTION_COLORS_LIST.map((c) => {
                    const isSelected = editingTag.color === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleChangeTagColor(c.id)}
                        className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition select-none ${
                          isSelected
                            ? isLight ? "bg-slate-100 font-semibold" : "bg-slate-800 font-semibold"
                            : isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded border border-black/10 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: c.previewBg }}
                          />
                          <span className={`text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                            {lang === "sr" ? c.labelSr : c.labelEn}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
