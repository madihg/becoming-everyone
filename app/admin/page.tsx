"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import FloatingWindow from "@/components/windows/FloatingWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import AdminAuth from "@/components/auth/AdminAuth";
import type { FolderState, Tab, FileItem } from "@/types";

function openMediaViewer(
  folderId: string,
  fileIndex: number,
  panelEl?: HTMLElement | null,
) {
  const rect = panelEl?.getBoundingClientRect();
  const w = rect ? Math.round(rect.width) : 960;
  const h = rect ? Math.round(rect.height) : 720;
  window.open(
    `/content/viewer?folder=${folderId}&index=${fileIndex}`,
    "_blank",
    `width=${w},height=${h},toolbar=no,menubar=no,location=no,status=no`,
  );
}

export default function AdminPage() {
  const [state, setState] = useState<FolderState | null>(null);
  const [windowZMap, setWindowZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(10);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [floatingWindows, setFloatingWindows] = useState<
    { id: string; title: string; src: string; zIndex: number }[]
  >([]);

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
                        y: Math.max(40, Math.min(maxY, newY)),
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

      // Special handling for camera folders
      if (folderId === "3R1-breaking") {
        window.open("/camera/3r1-breaking", "_blank");
        return;
      }
      if (folderId === "19R4-found") {
        window.open("/camera/19r4-found", "_blank");
        return;
      }

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
        const viewable = folder.contents
          .filter((f) => ["image", "video", "pdf"].includes(f.type))
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
          );
        if (viewable.length === 1) {
          const panel = document.querySelector<HTMLElement>(
            `[data-tab-panel="${folder.tabId}"]`,
          );
          queueMicrotask(() => openMediaViewer(folderId, 0, panel));
        }
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

  const handleFloatingWindowFocus = useCallback(
    (windowId: string) => {
      const newZ = topZ + 1;
      setTopZ(newZ);
      setFloatingWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, zIndex: newZ } : w)),
      );
    },
    [topZ],
  );

  const handleFileDoubleClick = useCallback(
    (file: FileItem, folderId: string) => {
      if (file.type === "html" || file.type === "executable") {
        // Open in floating window instead of new tab
        const newZ = Math.max(...floatingWindows.map((w) => w.zIndex), 50) + 1;
        setFloatingWindows((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            title: file.name,
            src: file.path,
            zIndex: newZ,
          },
        ]);
        return;
      }
      if (
        file.type === "image" ||
        file.type === "video" ||
        file.type === "pdf"
      ) {
        if (!state) return;
        const folder = state.folders.find((f) => f.id === folderId);
        if (!folder) return;
        const viewable = folder.contents
          .filter((f) => ["image", "video", "pdf"].includes(f.type))
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
          );
        const fileIndex = viewable.findIndex((f) => f.id === file.id);
        const panel = document.querySelector<HTMLElement>(
          `[data-tab-panel="${folder.tabId}"]`,
        );
        openMediaViewer(folderId, Math.max(0, fileIndex), panel);
      }
    },
    [state, floatingWindows],
  );

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

  // Auto-arrange: grid layout sorted by numeric prefix
  const handleAutoArrange = useCallback(
    (tabId: string) => {
      if (!state) return;
      const panel = document.querySelector<HTMLElement>(
        `[data-tab-panel="${tabId}"]`,
      );
      const panelWidth = panel ? panel.clientWidth : 600;
      const colWidth = 100;
      const rowHeight = 90;
      const startX = 30;
      const startY = 44;
      const cols = Math.max(
        1,
        Math.floor((panelWidth - startX * 2) / colWidth),
      );

      const tabFolders = state.folders
        .filter((f) => f.tabId === tabId)
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/^(\d+)/)?.[1] || "999", 10);
          const numB = parseInt(b.name.match(/^(\d+)/)?.[1] || "999", 10);
          return numA - numB;
        });

      const positionMap = new Map<string, { x: number; y: number }>();
      tabFolders.forEach((folder, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positionMap.set(folder.id, {
          x: startX + col * colWidth,
          y: startY + row * rowHeight,
        });
      });

      persist({
        ...state,
        folders: state.folders.map((f) => {
          const pos = positionMap.get(f.id);
          return pos ? { ...f, position: pos } : f;
        }),
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
    <AdminAuth>
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

              {/* Screen tab - VS Code style */}
              <div className="absolute top-0 left-0 right-0 z-50 flex items-end h-[28px] border-b border-[#2a2a2a]">
                <div className="flex items-center gap-0 h-full">
                  <div className="flex items-center h-full px-3 border-r border-[#333] bg-[#1a1a1a] rounded-t-sm">
                    {editingLabelId === tab.id ? (
                      <input
                        ref={labelInputRef}
                        className="bg-transparent text-[#ccc] text-[11px] font-mono outline-none w-20 uppercase tracking-wider"
                        defaultValue={tab.name}
                        onBlur={(e) =>
                          handleRenameScreen(tab.id, e.target.value)
                        }
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
                        className="text-[11px] font-mono text-[#999] cursor-default uppercase tracking-wider select-none"
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
                        className="ml-2 text-[10px] font-mono text-[#555] hover:text-white transition-colors leading-none"
                        onClick={() => handleCloseScreen(tab.id)}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
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
                    onFileDoubleClick={(file) =>
                      handleFileDoubleClick(file, folder.id)
                    }
                  />
                ))}

              {/* Auto-arrange button */}
              <button
                className="absolute bottom-3 right-3 z-50 text-[10px] font-mono text-[#444] hover:text-[#888] transition-colors px-2 py-1 border border-[#333] rounded-sm bg-[#111] hover:bg-[#1a1a1a]"
                onClick={() => handleAutoArrange(tab.id)}
                title="Arrange folders in grid"
              >
                Arrange
              </button>
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
          className="absolute top-0 right-0 h-[28px] px-3 flex items-center text-[13px] font-mono text-[#555] hover:text-white transition-colors z-50 border-b border-[#2a2a2a]"
          onClick={handleAddScreen}
          title="Add screen (Cmd+N)"
        >
          +
        </button>

        {/* Floating windows */}
        {floatingWindows.map((win) => (
          <FloatingWindow
            key={win.id}
            title={win.title}
            zIndex={win.zIndex}
            onClose={() =>
              setFloatingWindows((prev) => prev.filter((w) => w.id !== win.id))
            }
            onFocus={() => handleFloatingWindowFocus(win.id)}
          >
            <iframe src={win.src} className="w-full h-full border-0" />
          </FloatingWindow>
        ))}
      </div>
    </AdminAuth>
  );
}
