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
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Pointer-based drag
  const dragRef = useRef<{
    folderId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragFolderId, setDragFolderId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

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

  // Pointer drag - folder follows cursor in real time
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, folderId: string) => {
      e.preventDefault();
      const iconRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      let isDragging = false;

      dragRef.current = {
        folderId,
        offsetX: e.clientX - iconRect.left,
        offsetY: e.clientY - iconRect.top,
      };

      const handleMove = (ev: PointerEvent) => {
        if (!isDragging) {
          const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
          if (dist < 5) return;
          isDragging = true;
          setDragFolderId(folderId);
        }
        setDragPos({ x: ev.clientX, y: ev.clientY });
      };

      const handleUp = (ev: PointerEvent) => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);

        if (!isDragging) {
          dragRef.current = null;
          return;
        }

        const drag = dragRef.current;
        if (!drag) return;

        // Find which panel the cursor is over
        const panels =
          document.querySelectorAll<HTMLElement>("[data-tab-panel]");
        let targetTabId: string | undefined;
        let targetRect: DOMRect | undefined;

        for (const panel of panels) {
          const rect = panel.getBoundingClientRect();
          if (
            ev.clientX >= rect.left &&
            ev.clientX <= rect.right &&
            ev.clientY >= rect.top &&
            ev.clientY <= rect.bottom
          ) {
            targetTabId = panel.dataset.tabPanel;
            targetRect = rect;
            break;
          }
        }

        if (targetTabId && targetRect) {
          const newX = ev.clientX - targetRect.left - drag.offsetX;
          const newY = ev.clientY - targetRect.top - drag.offsetY;
          const maxX = targetRect.width - 80;
          const maxY = targetRect.height - 70;

          setState((prev) => {
            if (!prev) return prev;
            const newState = {
              ...prev,
              folders: prev.folders.map((f) =>
                f.id === drag.folderId
                  ? {
                      ...f,
                      tabId: targetTabId!,
                      position: {
                        x: Math.max(0, Math.min(maxX, newX)),
                        y: Math.max(24, Math.min(maxY, newY)),
                      },
                    }
                  : f,
              ),
            };
            fetch("/api/folders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newState),
            });
            return newState;
          });
        }

        dragRef.current = null;
        setDragFolderId(null);
        setDragPos(null);
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [],
  );

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
            data-tab-panel={tab.id}
            className="flex-1 relative overflow-hidden"
            style={{
              borderRight:
                idx < state.tabs.length - 1 ? "1px solid #2a2a2a" : "none",
            }}
          >
            <PhysarumBackground openFolders={openTabFolders} />

            {/* Screen label with close button */}
            <div className="absolute top-2 left-3 z-50 flex items-center gap-1.5">
              {editingLabelId === tab.id ? (
                <input
                  ref={labelInputRef}
                  className="bg-transparent text-text-muted text-[11px] font-mono outline-none border-b border-yellow/40 w-24 uppercase tracking-wider"
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
                  className="text-[11px] font-mono text-text-muted/50 cursor-default uppercase tracking-wider select-none"
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
                  className="text-[10px] font-mono text-text-muted/30 hover:text-white transition-colors leading-none"
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
                isDragging={dragFolderId === folder.id}
                onPointerDown={handlePointerDown}
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

      {/* Floating drag ghost - follows cursor */}
      {dragFolderId &&
        dragPos &&
        dragRef.current &&
        (() => {
          const folder = state.folders.find((f) => f.id === dragFolderId);
          if (!folder) return null;
          return (
            <div
              className="fixed pointer-events-none z-[9999]"
              style={{
                left: dragPos.x - dragRef.current!.offsetX,
                top: dragPos.y - dragRef.current!.offsetY,
              }}
            >
              <div className="flex flex-col items-center opacity-80">
                <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
                  <path
                    d="M2 8C2 6.89543 2.89543 6 4 6H20L24 2H4C2.89543 2 2 2.89543 2 4V8Z"
                    fill="#2a2a2a"
                  />
                  <rect
                    x="2"
                    y="8"
                    width="60"
                    height="40"
                    rx="2"
                    fill="#1a1a1a"
                    stroke="#444"
                    strokeWidth="1"
                  />
                </svg>
                <span className="mt-1 text-[11px] font-mono text-white text-center leading-tight max-w-[80px] truncate">
                  {folder.name}
                </span>
              </div>
            </div>
          );
        })()}

      {/* Add screen button */}
      <button
        className="absolute top-2 right-3 text-[11px] font-mono text-text-muted/30 hover:text-text-muted/60 transition-colors z-50"
        onClick={handleAddScreen}
        title="Add screen (Cmd+N)"
      >
        +
      </button>
    </div>
  );
}
