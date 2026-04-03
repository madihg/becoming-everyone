"use client";

import { useState, useRef } from "react";
import type { Tab } from "@/types";

interface Props {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabCreate: () => void;
  onTabRename: (tabId: string, name: string) => void;
  onTabClose: (tabId: string) => void;
  onDropOnTab: (tabId: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onTabCreate,
  onTabRename,
  onTabClose,
  onDropOnTab,
}: Props) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (tabId: string) => {
    setEditingTabId(tabId);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleRenameSubmit = (tabId: string, name: string) => {
    if (name.trim()) {
      onTabRename(tabId, name.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex items-center gap-0 bg-bg border-b border-folder-border px-2 h-9">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-2 px-3 h-full text-[11px] font-mono cursor-pointer
            border-r border-folder-border transition-colors
            ${activeTabId === tab.id ? "bg-folder text-white" : "text-text-muted hover:text-white"}
            ${dragOverTabId === tab.id ? "bg-folder-border" : ""}
          `}
          onClick={() => onTabChange(tab.id)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverTabId(tab.id);
          }}
          onDragLeave={() => setDragOverTabId(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverTabId(null);
            onDropOnTab(tab.id);
          }}
        >
          {editingTabId === tab.id ? (
            <input
              ref={inputRef}
              className="bg-transparent text-white text-[11px] font-mono outline-none w-20 border-b border-yellow"
              defaultValue={tab.name}
              onBlur={(e) => handleRenameSubmit(tab.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit(
                    tab.id,
                    (e.target as HTMLInputElement).value,
                  );
                }
                if (e.key === "Escape") setEditingTabId(null);
              }}
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => handleDoubleClick(tab.id)}>
              {tab.name}
            </span>
          )}

          {tabs.length > 1 && (
            <button
              className="text-text-muted hover:text-white text-[9px] ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              x
            </button>
          )}
        </div>
      ))}

      <button
        className="px-2 h-full text-text-muted hover:text-white text-[13px] font-mono"
        onClick={onTabCreate}
      >
        +
      </button>
    </div>
  );
}
