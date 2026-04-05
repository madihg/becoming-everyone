"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import type { FolderState, Tab, FileItem } from "@/types";

export default function AdminPage() {
  const [state, setState] = useState<FolderState | null>(null);
  const [windowZMap, setWindowZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(10);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const dragFolderIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderState) => setState(data));
  }, []);

  const persist = useCallback(async (newState: FolderState) => {
    setState(newState);
    await fetch("/api/folders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newState),
    });
  }, []);

  // Drag - use element rects for accurate cross-screen positioning
  const handleDragStart = useCallback(
    (e: React.DragEvent, folderId: string) => {
      dragFolderIdRef.current = folderId;
      const iconRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - iconRect.left,
        y: e.clientY - iconRect.top,
      };
      e.dataTransfer.effectAllowed = "move";
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTabId: string) => {
      e.preventDefault();
      if (!state || !dragFolderIdRef.current) return;
      const folderId = dragFolderIdRef.current;
      const containerRect = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - dragOffsetRef.current.x;
      const newY = e.clientY - containerRect.top - dragOffsetRef.current.y;
      persist({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                tabId: targetTabId,
                position: { x: Math.max(0, newX), y: Math.max(24, newY) },
              }
            : f,
        ),
      });
      dragFolderIdRef.current = null;
    },
    [state, persist],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFolderDoubleClick = useCallback(
    async (folderId: string) => {
      if (!state) return;
      const folder = state.folders.find((f) => f.id === folderId);
      if (!folder) return;
      const newOpen = !folder.isOpen;
      const newState = {
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: newOpen } : f,
        ),
      };
      setState(newState);
      if (newOpen) {
        const z = topZ + 1;
        setTopZ(z);
        setWindowZMap((prev) => ({ ...prev, [folderId]: z }));
      }
      await fetch(`/api/folders/${folderId}/open`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: newOpen }),
      });
    },
    [state, topZ],
  );

  const handleWindowClose = useCallback(
    (folderId: string) => {
      if (!state) return;
      setState({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: false } : f,
        ),
      });
      fetch(`/api/folders/${folderId}/open`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: false }),
      });
    },
    [state],
  );

  const handleWindowFocus = useCallback(
    (folderId: string) => {
      const z = topZ + 1;
      setTopZ(z);
      setWindowZMap((prev) => ({ ...prev, [folderId]: z }));
    },
    [topZ],
  );

  const handleFileDoubleClick = useCallback((file: FileItem) => {
    if (file.type === "html" || file.type === "executable") {
      window.open(file.path, "_blank");
    } else if (file.type === "image" || file.type === "video") {
      window.open(file.path, "_blank");
    }
  }, []);

  // Screen management
  const handleAddScreen = useCallback(() => {
    if (!state) return;
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      name: `Screen ${state.tabs.length + 1}`,
    };
    persist({ ...state, tabs: [...state.tabs, newTab] });
  }, [state, persist]);

  const handleRenameScreen = useCallback(
    (tabId: string, name: string) => {
      if (!state || !name.trim()) return;
      persist({
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, name: name.trim() } : t,
        ),
      });
      setEditingLabelId(null);
    },
    [state, persist],
  );

  const handleCloseScreen = useCallback(
    (tabId: string) => {
      if (!state || state.tabs.length <= 1) return;
      const remaining = state.tabs.find((t) => t.id !== tabId);
      if (!remaining) return;
      persist({
        ...state,
        tabs: state.tabs.filter((t) => t.id !== tabId),
        folders: state.folders.map((f) =>
          f.tabId === tabId ? { ...f, tabId: remaining.id } : f,
        ),
      });
    },
    [state, persist],
  );

  // Keyboard: Cmd+N to add screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAddScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAddScreen]);

  if (!state) return <div className="h-screen w-screen bg-bg" />;

  return (
    <div className="h-screen w-screen bg-bg flex relative">
      {state.tabs.map((tab, idx) => {
        const tabFolders = state.folders.filter((f) => f.tabId === tab.id);
        const openTabFolders = tabFolders.filter((f) => f.isOpen);
        return (
          <div
            key={tab.id}
            className="flex-1 relative"
            style={{
              backgroundImage:
                idx < state.tabs.length - 1
                  ? "linear-gradient(180deg, transparent, #2a2a2a 20%, #2a2a2a 80%, transparent)"
                  : "none",
              backgroundPosition: "right center",
              backgroundSize: "1px 100%",
              backgroundRepeat: "no-repeat",
            }}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragOver={handleDragOver}
          >
            <PhysarumBackground openFolders={openTabFolders} />

            {/* Screen label - double-click to rename, hover to show close */}
            <div className="absolute top-3 left-4 z-50 group/label flex items-center gap-2">
              {editingLabelId === tab.id ? (
                <input
                  ref={labelInputRef}
                  className="bg-transparent text-text-muted/60 text-[10px] font-mono outline-none border-b border-yellow/40 w-24 uppercase tracking-wider"
                  defaultValue={tab.name}
                  onBlur={(e) => handleRenameScreen(tab.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleRenameScreen(
                        tab.id,
                        (e.target as HTMLInputElement).value,
                      );
                    if (e.key === "Escape") setEditingLabelId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="text-[10px] font-mono text-text-muted/30 cursor-default uppercase tracking-wider select-none"
                  onDoubleClick={() => {
                    setEditingLabelId(tab.id);
                    setTimeout(() => labelInputRef.current?.select(), 0);
                  }}
                >
                  {tab.name}
                </span>
              )}
              {state.tabs.length > 1 && (
                <button
                  className="text-[9px] text-transparent group-hover/label:text-text-muted/40 hover:!text-white transition-colors"
                  onClick={() => handleCloseScreen(tab.id)}
                >
                  x
                </button>
              )}
            </div>

            {tabFolders.map((folder) => (
              <FolderIcon
                key={folder.id}
                folder={folder}
                draggable={true}
                onDragStart={handleDragStart}
                onDoubleClick={handleFolderDoubleClick}
              />
            ))}

            {tabFolders
              .filter((f) => f.isOpen)
              .map((folder) => (
                <FolderWindow
                  key={`window-${folder.id}`}
                  folder={folder}
                  zIndex={windowZMap[folder.id] || 10}
                  onClose={handleWindowClose}
                  onFocus={handleWindowFocus}
                  onFileDoubleClick={handleFileDoubleClick}
                />
              ))}
          </div>
        );
      })}

      {/* Add screen - barely visible, top-right */}
      <button
        className="absolute top-2 right-3 text-[11px] font-mono text-text-muted/20 hover:text-text-muted/60 transition-colors z-50"
        onClick={handleAddScreen}
        title="Add screen (Cmd+N)"
      >
        +
      </button>
    </div>
  );
}
