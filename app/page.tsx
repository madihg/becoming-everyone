"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FolderIcon, { IconContent } from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import FloatingWindow from "@/components/windows/FloatingWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import FolderGuideCursor from "@/components/cursor/FolderGuideCursor";
import AdminAuth from "@/components/auth/AdminAuth";
import MultiplayerProvider from "@/components/multiplayer/MultiplayerProvider";
import { FOLDER_SEQUENCE } from "@/config/folder-sequence";
import type { FolderState, FileItem } from "@/types";

let nextWindowSide: "left" | "right" = "right";

function openExternalWindow(url: string) {
  const w = Math.floor(screen.availWidth / 3);
  const h = Math.floor(screen.availHeight * 0.6);
  const side = nextWindowSide;
  nextWindowSide = side === "right" ? "left" : "right";
  const left = side === "right" ? screen.availWidth - w : 0;
  window.open(
    url,
    "_blank",
    `width=${w},height=${h},left=${left},top=0,toolbar=no,menubar=no,location=no,status=no`,
  );
}

export default function Home() {
  const [state, setState] = useState<FolderState | null>(null);
  const [windowZMap, setWindowZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(10);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [floatingWindows, setFloatingWindows] = useState<
    { id: string; title: string; src: string; zIndex: number }[]
  >([]);
  const [everOpenedIds, setEverOpenedIds] = useState<Set<string>>(new Set());
  const [openMode, setOpenMode] = useState<"ext" | "int">("ext");

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

      const folder = state.folders.find((f) => f.id === folderId);
      if (!folder) return;
      const newOpen = !folder.isOpen;

      if (newOpen) {
        setEverOpenedIds((prev) => new Set([...prev, folderId]));
      }
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
      if (openMode === "ext") {
        if (file.type === "html" || file.type === "executable") {
          openExternalWindow(file.path);
        } else if (
          file.type === "image" ||
          file.type === "video" ||
          file.type === "pdf" ||
          file.type === "audio"
        ) {
          if (!state) return;
          const folder = state.folders.find((f) => f.id === folderId);
          if (!folder) return;
          const viewable = folder.contents
            .filter((f) => ["image", "video", "pdf", "audio"].includes(f.type))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true }),
            );
          const fileIndex = viewable.findIndex((f) => f.id === file.id);
          openExternalWindow(
            `/content/viewer?folder=${folderId}&index=${Math.max(0, fileIndex)}`,
          );
        }
      } else {
        if (file.type === "html" || file.type === "executable") {
          const newZ =
            Math.max(...floatingWindows.map((w) => w.zIndex), 50) + 1;
          setFloatingWindows((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              title: file.name,
              src: file.path,
              zIndex: newZ,
            },
          ]);
        } else if (
          file.type === "image" ||
          file.type === "video" ||
          file.type === "pdf" ||
          file.type === "audio"
        ) {
          if (!state) return;
          const folder = state.folders.find((f) => f.id === folderId);
          if (!folder) return;
          const viewable = folder.contents
            .filter((f) => ["image", "video", "pdf", "audio"].includes(f.type))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true }),
            );
          const fileIndex = viewable.findIndex((f) => f.id === file.id);
          openExternalWindow(
            `/content/viewer?folder=${folderId}&index=${Math.max(0, fileIndex)}`,
          );
        }
      }
    },
    [state, floatingWindows, openMode],
  );

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

  const handleAutoArrange = useCallback(() => {
    if (!state) return;
    const tabId = state.tabs[0]?.id;
    if (!tabId) return;
    const panel = document.querySelector<HTMLElement>(
      `[data-tab-panel="${tabId}"]`,
    );
    const panelW = panel ? panel.clientWidth : 900;
    const panelH = panel ? panel.clientHeight : 700;

    // Categorize by type prefix
    const pFolders = state.folders.filter((f) => f.id.match(/^\d+P/));
    const oFolders = state.folders.filter((f) => f.id.match(/^\d+O/));
    const rwFolders = state.folders.filter((f) => f.id.match(/^\d+[RW]/));

    // Seeded random from folder id (consistent offsets across reloads)
    const seededRandom = (seed: string) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) {
        h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
      }
      return ((h & 0x7fffffff) % 1000) / 1000;
    };

    const colWidth = 115;
    const rowHeight = 100;

    const layoutCluster = (
      folders: typeof state.folders,
      originX: number,
      originY: number,
      cols: number,
    ) => {
      const result = new Map<string, { x: number; y: number }>();
      const sorted = [...folders].sort((a, b) => {
        const numA = parseInt(a.id.match(/^(\d+)/)?.[1] || "999", 10);
        const numB = parseInt(b.id.match(/^(\d+)/)?.[1] || "999", 10);
        return numA - numB;
      });
      sorted.forEach((folder, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const r = seededRandom(folder.id);
        const r2 = seededRandom(folder.id + "y");
        const offsetX = (r - 0.5) * 24;
        const offsetY = (r2 - 0.5) * 24;
        result.set(folder.id, {
          x: Math.max(10, originX + col * colWidth + offsetX),
          y: Math.max(40, originY + row * rowHeight + offsetY),
        });
      });
      return result;
    };

    // P cluster: left side
    const pPositions = layoutCluster(pFolders, 30, 50, 2);
    // O cluster: top-right
    const oPositions = layoutCluster(oFolders, panelW * 0.6, 50, 2);
    // R+W cluster: bottom-right
    const rwPositions = layoutCluster(
      rwFolders,
      panelW * 0.55,
      panelH * 0.45,
      3,
    );

    const allPositions = new Map([
      ...pPositions,
      ...oPositions,
      ...rwPositions,
    ]);

    persist({
      ...state,
      folders: state.folders.map((f) => {
        const pos = allPositions.get(f.id);
        return pos ? { ...f, position: pos } : f;
      }),
    });
  }, [state, persist]);

  // Auto-arrange into clusters on first load
  const shouldAutoArrange = useRef(true);
  useEffect(() => {
    if (!state || !shouldAutoArrange.current) return;
    if (state.tabs.length === 0) return;
    shouldAutoArrange.current = false;
    const timer = setTimeout(() => {
      handleAutoArrange();
    }, 200);
    return () => clearTimeout(timer);
  }, [state, handleAutoArrange]);

  if (!state) return <div className="h-screen w-screen bg-bg" />;

  // Derive cursor target: first folder in sequence not yet opened
  const nextIdx = FOLDER_SEQUENCE.findIndex((id) => !everOpenedIds.has(id));
  const nextTargetId = nextIdx >= 0 ? FOLDER_SEQUENCE[nextIdx] : null;
  const nextTargetFolder = nextTargetId
    ? state.folders.find((f) => f.id === nextTargetId)
    : null;

  // Compute viewport-absolute position for cursor target
  let cursorTarget: { x: number; y: number } | null = null;
  if (nextTargetFolder) {
    const tabId = state.tabs[0]?.id;
    const panel = tabId
      ? document.querySelector<HTMLElement>(`[data-tab-panel="${tabId}"]`)
      : null;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      cursorTarget = {
        x: rect.left + nextTargetFolder.position.x + 50,
        y: rect.top + nextTargetFolder.position.y + 40,
      };
    }
  }

  return (
    <MultiplayerProvider>
      <AdminAuth>
        {(() => {
          const tab = state.tabs[0];
          const allFolders = state.folders;
          const openFolders = allFolders.filter((f) => f.isOpen);
          const everOpenedFolders = allFolders.filter((f) =>
            everOpenedIds.has(f.id),
          );

          return (
            <div className="h-screen w-screen bg-bg relative overflow-hidden">
              <div data-tab-panel={tab.id} className="absolute inset-0">
                <PhysarumBackground
                  openFolders={openFolders}
                  everOpenedFolders={everOpenedFolders}
                  allFolders={allFolders}
                  folderSequence={FOLDER_SEQUENCE}
                  sequenceProgress={everOpenedIds}
                />

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
                            setTimeout(
                              () => labelInputRef.current?.select(),
                              0,
                            );
                          }}
                        >
                          {tab.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {allFolders.map((folder) => (
                  <FolderIcon
                    key={folder.id}
                    folder={folder}
                    draggable={true}
                    isDragging={dragFolderId === folder.id}
                    onPointerDown={handlePointerDown}
                    onDoubleClick={handleFolderDoubleClick}
                  />
                ))}

                {openFolders.map((folder) => (
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

                <button
                  className="absolute bottom-3 left-3 z-50 text-[10px] font-mono text-[#444] hover:text-[#888] transition-colors px-2 py-1 border border-[#333] rounded-sm bg-[#111] hover:bg-[#1a1a1a]"
                  onClick={handleAutoArrange}
                  title="Arrange folders in grid"
                >
                  Arrange
                </button>
              </div>

              {dragFolderId &&
                dragPos &&
                dragRef.current &&
                (() => {
                  const folder = state.folders.find(
                    (f) => f.id === dragFolderId,
                  );
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
                        <div
                          className="w-[100px] h-[80px] flex items-center justify-center"
                          style={{ filter: "grayscale(100%) contrast(1.3)" }}
                        >
                          <IconContent folderId={folder.id} />
                        </div>
                        <span className="mt-1 text-[12px] font-mono text-white text-center leading-tight max-w-[110px] truncate">
                          {folder.name}
                        </span>
                      </div>
                    </div>
                  );
                })()}

              <div className="absolute bottom-3 right-3 z-50">
                <select
                  value={openMode}
                  onChange={(e) => setOpenMode(e.target.value as "ext" | "int")}
                  className="text-[10px] font-mono text-[#888] bg-[#111] border border-[#333] rounded-sm px-2 py-1 outline-none cursor-pointer hover:border-[#555] transition-colors"
                  title="File open mode: ext (external windows) / int (internal floating)"
                >
                  <option value="ext">ext</option>
                  <option value="int">int</option>
                </select>
              </div>

              {floatingWindows.map((win) => (
                <FloatingWindow
                  key={win.id}
                  title={win.title}
                  zIndex={win.zIndex}
                  onClose={() =>
                    setFloatingWindows((prev) =>
                      prev.filter((w) => w.id !== win.id),
                    )
                  }
                  onFocus={() => handleFloatingWindowFocus(win.id)}
                >
                  <iframe src={win.src} className="w-full h-full border-0" />
                </FloatingWindow>
              ))}

              <FolderGuideCursor targetPosition={cursorTarget} />
            </div>
          );
        })()}
      </AdminAuth>
    </MultiplayerProvider>
  );
}
