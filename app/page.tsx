"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FolderIcon, { IconContent } from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import FloatingWindow from "@/components/windows/FloatingWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import FolderGuideCursor from "@/components/cursor/FolderGuideCursor";
import RemoteCursors from "@/components/multiplayer/RemoteCursors";
import AdminAuth from "@/components/auth/AdminAuth";
import MultiplayerProvider, {
  useMultiplayer,
} from "@/components/multiplayer/MultiplayerProvider";
import { FOLDER_SEQUENCE } from "@/config/folder-sequence";
import type { FolderState, FileItem } from "@/types";

function SpacebarController({
  navigatingToFolder,
  setNavigatingToFolder,
  nextTargetId,
  openFolderAndFiles,
  onAllComplete,
}: {
  navigatingToFolder: string | null;
  setNavigatingToFolder: (id: string | null) => void;
  nextTargetId: string | null;
  openFolderAndFiles: (folderId: string) => void;
  onAllComplete: () => void;
}) {
  const { sendMessage, lastEvent } = useMultiplayer();

  // Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      )
        return;
      e.preventDefault();
      if (navigatingToFolder) return;
      if (!nextTargetId) {
        onAllComplete();
        return;
      }
      setNavigatingToFolder(nextTargetId);
      sendMessage({ type: "open_folder", folderId: nextTargetId });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    navigatingToFolder,
    nextTargetId,
    setNavigatingToFolder,
    sendMessage,
    onAllComplete,
  ]);

  // Remote open_folder events
  useEffect(() => {
    if (!lastEvent || lastEvent.type !== "open_folder") return;
    const folderId = lastEvent.folderId as string;
    if (!folderId || navigatingToFolder) return;
    setNavigatingToFolder(folderId);
  }, [
    lastEvent,
    navigatingToFolder,
    setNavigatingToFolder,
    openFolderAndFiles,
  ]);

  return null;
}

let nextWindowSide: "left" | "right" = "right";
const openWindowRefs: Window[] = [];

function openExternalWindow(url: string) {
  const inset = 0.15;
  const totalW = Math.floor(screen.availWidth * (1 - 2 * inset));
  const totalH = Math.floor(screen.availHeight * (1 - 2 * inset));
  const w = Math.floor(totalW / 3);
  const h = Math.floor(totalH * 0.6);
  const side = nextWindowSide;
  nextWindowSide = side === "right" ? "left" : "right";
  const leftOffset = Math.floor(screen.availWidth * inset);
  const topOffset = Math.floor(screen.availHeight * inset);
  const left = side === "right" ? leftOffset + totalW - w : leftOffset;
  const ref = window.open(
    url,
    "_blank",
    `width=${w},height=${h},left=${left},top=${topOffset},toolbar=no,menubar=no,location=no,status=no`,
  );
  if (ref) openWindowRefs.push(ref);
}

function openExternalWindowSized(
  url: string,
  windowCount: number,
  windowIndex: number,
) {
  const inset = 0.15;
  const totalW = Math.floor(screen.availWidth * (1 - 2 * inset));
  const totalH = Math.floor(screen.availHeight * (1 - 2 * inset));
  const w = Math.floor(totalW / windowCount);
  const h = totalH;
  const leftOffset = Math.floor(screen.availWidth * inset);
  const topOffset = Math.floor(screen.availHeight * inset);
  const left = leftOffset + windowIndex * w;
  const ref = window.open(
    url,
    "_blank",
    `width=${w},height=${h},left=${left},top=${topOffset},toolbar=no,menubar=no,location=no,status=no`,
  );
  if (ref) openWindowRefs.push(ref);
}

function closeAllExternalWindows() {
  openWindowRefs.forEach((w) => {
    try {
      w.close();
    } catch {}
  });
  openWindowRefs.length = 0;
}

function getWindowLayout(contents: FileItem[]) {
  const viewable = contents.filter((f) =>
    ["image", "video", "audio", "pdf"].includes(f.type),
  );
  const html = contents.filter((f) => f.type === "html");
  const exec = contents.filter((f) => f.type === "executable");
  let idx = 0;
  const viewerIndex = viewable.length > 0 ? idx++ : -1;
  const htmlMap = new Map(html.map((f) => [f.id, idx++]));
  const execMap = new Map(exec.map((f) => [f.id, idx++]));
  const windowCount = Math.max(
    (viewable.length > 0 ? 1 : 0) + html.length + exec.length,
    1,
  );
  return { windowCount, viewerIndex, htmlMap, execMap };
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
  const [navigatingToFolder, setNavigatingToFolder] = useState<string | null>(
    null,
  );
  const [showCredits, setShowCredits] = useState(false);

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
      .then((data: FolderState) => {
        setState(data);
        try {
          const stored = localStorage.getItem("everOpenedIds");
          if (stored) {
            const ids = JSON.parse(stored) as string[];
            setEverOpenedIds(new Set(ids));
          }
        } catch {}
      });
  }, []);

  // Sync everOpenedIds to localStorage
  useEffect(() => {
    if (everOpenedIds.size === 0) return;
    localStorage.setItem("everOpenedIds", JSON.stringify([...everOpenedIds]));
  }, [everOpenedIds]);

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
      if (!state) return;
      const folder = state.folders.find((f) => f.id === folderId);
      if (!folder) return;
      const layout = getWindowLayout(folder.contents);

      if (openMode === "ext") {
        if (file.type === "html" || file.type === "executable") {
          const idx =
            layout.htmlMap.get(file.id) ?? layout.execMap.get(file.id) ?? 0;
          openExternalWindowSized(file.path, layout.windowCount, idx);
        } else if (
          file.type === "image" ||
          file.type === "video" ||
          file.type === "pdf" ||
          file.type === "audio"
        ) {
          const viewable = folder.contents
            .filter((f) => ["image", "video", "pdf", "audio"].includes(f.type))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true }),
            );
          const fileIndex = viewable.findIndex((f) => f.id === file.id);
          openExternalWindowSized(
            `/content/viewer?folder=${folderId}&index=${Math.max(0, fileIndex)}`,
            layout.windowCount,
            layout.viewerIndex,
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
          const viewable = folder.contents
            .filter((f) => ["image", "video", "pdf", "audio"].includes(f.type))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true }),
            );
          const fileIndex = viewable.findIndex((f) => f.id === file.id);
          openExternalWindowSized(
            `/content/viewer?folder=${folderId}&index=${Math.max(0, fileIndex)}`,
            layout.windowCount,
            layout.viewerIndex,
          );
        }
      }
    },
    [state, floatingWindows, openMode],
  );

  // Open a folder and auto-open all its files (spacebar flow)
  const openFolderAndFiles = useCallback(
    (folderId: string) => {
      if (!state) return;

      // Close all external windows from previous folder
      closeAllExternalWindows();

      // Close all open folders and open the target in one state update
      const newState = {
        ...state,
        folders: state.folders.map((f) => {
          if (f.id === folderId) return { ...f, isOpen: true };
          if (f.isOpen) return { ...f, isOpen: false };
          return f;
        }),
      };
      setState(newState);
      setEverOpenedIds((prev) => new Set([...prev, folderId]));

      const z = topZ + 1;
      setTopZ(z);
      setWindowZMap((prev) => ({ ...prev, [folderId]: z }));

      // Persist open states
      fetch(`/api/folders/${folderId}/open`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: true }),
      });
      state.folders.forEach((f) => {
        if (f.isOpen && f.id !== folderId) {
          fetch(`/api/folders/${f.id}/open`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isOpen: false }),
          });
        }
      });

      // Open files with smart sizing
      const folder = state.folders.find((f) => f.id === folderId);
      if (!folder || folder.contents.length === 0) return;

      const viewableMedia = folder.contents.filter((f) =>
        ["image", "video", "audio", "pdf"].includes(f.type),
      );
      const htmlFiles = folder.contents.filter((f) => f.type === "html");
      const execFiles = folder.contents.filter((f) => f.type === "executable");

      const windowCount =
        (viewableMedia.length > 0 ? 1 : 0) +
        htmlFiles.length +
        execFiles.length;
      if (windowCount === 0) return;

      let windowIndex = 0;

      if (viewableMedia.length > 0) {
        openExternalWindowSized(
          `/content/viewer?folder=${folderId}&index=0`,
          windowCount,
          windowIndex,
        );
        windowIndex++;
      }

      for (const file of htmlFiles) {
        openExternalWindowSized(file.path, windowCount, windowIndex);
        windowIndex++;
      }

      for (const file of execFiles) {
        openExternalWindowSized(file.path, windowCount, windowIndex);
        windowIndex++;
      }
    },
    [state, topZ],
  );

  // Called when guide dot arrives at target folder
  const handleDotArrived = useCallback(() => {
    if (!navigatingToFolder) return;
    openFolderAndFiles(navigatingToFolder);
    setNavigatingToFolder(null);
  }, [navigatingToFolder, openFolderAndFiles]);

  // Called when all 19 folders have been opened and spacebar pressed again
  const handleAllComplete = useCallback(() => {
    closeAllExternalWindows();
    if (state) {
      setState({
        ...state,
        folders: state.folders.map((f) =>
          f.isOpen ? { ...f, isOpen: false } : f,
        ),
      });
      state.folders.forEach((f) => {
        if (f.isOpen) {
          fetch(`/api/folders/${f.id}/open`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isOpen: false }),
          });
        }
      });
    }
    setShowCredits(true);
  }, [state]);

  const handleReset = useCallback(() => {
    closeAllExternalWindows();
    if (state) {
      const newState = {
        ...state,
        folders: state.folders.map((f) =>
          f.isOpen ? { ...f, isOpen: false } : f,
        ),
      };
      setState(newState);
      state.folders.forEach((f) => {
        if (f.isOpen) {
          fetch(`/api/folders/${f.id}/open`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isOpen: false }),
          });
        }
      });
    }
    setEverOpenedIds(new Set());
    localStorage.removeItem("everOpenedIds");
    setNavigatingToFolder(null);
    setShowCredits(false);
  }, [state]);

  const handleGoBack = useCallback(() => {
    let lastIdx = -1;
    for (let i = FOLDER_SEQUENCE.length - 1; i >= 0; i--) {
      if (everOpenedIds.has(FOLDER_SEQUENCE[i])) {
        lastIdx = i;
        break;
      }
    }
    if (lastIdx <= 0) return;
    const removed = FOLDER_SEQUENCE[lastIdx];
    const newSet = new Set(everOpenedIds);
    newSet.delete(removed);
    setEverOpenedIds(newSet);
    if (newSet.size > 0) {
      localStorage.setItem("everOpenedIds", JSON.stringify([...newSet]));
    } else {
      localStorage.removeItem("everOpenedIds");
    }
    setShowCredits(false);
    setNavigatingToFolder(null);
    openFolderAndFiles(FOLDER_SEQUENCE[lastIdx - 1]);
  }, [everOpenedIds, openFolderAndFiles]);

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

    const seededRandom = (seed: string) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) {
        h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
      }
      return ((h & 0x7fffffff) % 1000) / 1000;
    };

    const margin = 40;
    const spacingX = 120;
    const spacingY = 100;
    const placed: { x: number; y: number }[] = [];

    // Place in FOLDER_SEQUENCE order for organic scatter
    const ordered = FOLDER_SEQUENCE.map((id) =>
      state.folders.find((f) => f.id === id),
    ).filter(Boolean) as typeof state.folders;
    const remaining = state.folders.filter(
      (f) => !FOLDER_SEQUENCE.includes(f.id),
    );
    const allToPlace = [...ordered, ...remaining];

    const positions = new Map<string, { x: number; y: number }>();

    for (const folder of allToPlace) {
      const r1 = seededRandom(folder.id);
      const r2 = seededRandom(folder.id + "y");
      let x = margin + r1 * (panelW - 2 * margin - 80);
      let y = margin + 40 + r2 * (panelH - 2 * margin - 70);

      let attempts = 0;
      while (attempts < 50) {
        let collision = false;
        for (const p of placed) {
          if (Math.abs(p.x - x) < spacingX && Math.abs(p.y - y) < spacingY) {
            collision = true;
            break;
          }
        }
        if (!collision) break;
        const jr = seededRandom(folder.id + attempts.toString());
        const jr2 = seededRandom(folder.id + "j" + attempts.toString());
        x = margin + jr * (panelW - 2 * margin - 80);
        y = margin + 40 + jr2 * (panelH - 2 * margin - 70);
        attempts++;
      }

      placed.push({ x, y });
      positions.set(folder.id, { x: Math.max(10, x), y: Math.max(40, y) });
    }

    persist({
      ...state,
      folders: state.folders.map((f) => {
        const pos = positions.get(f.id);
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

  // Derive cursor target: navigating folder or first unopened in sequence
  const nextIdx = FOLDER_SEQUENCE.findIndex((id) => !everOpenedIds.has(id));
  const nextTargetId = nextIdx >= 0 ? FOLDER_SEQUENCE[nextIdx] : null;
  const cursorFolderId = navigatingToFolder ?? nextTargetId;
  const cursorFolder = cursorFolderId
    ? state.folders.find((f) => f.id === cursorFolderId)
    : null;

  // Compute viewport-absolute position for cursor target
  let cursorTarget: { x: number; y: number } | null = null;
  if (cursorFolder) {
    const tabId = state.tabs[0]?.id;
    const panel = tabId
      ? document.querySelector<HTMLElement>(`[data-tab-panel="${tabId}"]`)
      : null;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      cursorTarget = {
        x: rect.left + cursorFolder.position.x + 50,
        y: rect.top + cursorFolder.position.y + 40,
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
            <MultiplayerProvider room="folders">
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

                  <div className="absolute bottom-3 left-3 z-50 flex gap-1">
                    <button
                      className="text-[10px] font-mono text-[#444] hover:text-[#888] transition-colors px-2 py-1 border border-[#333] rounded-sm bg-[#111] hover:bg-[#1a1a1a]"
                      onClick={handleGoBack}
                      title="Go back one folder"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="10,3 5,8 10,13" />
                      </svg>
                    </button>
                    <button
                      className="text-[10px] font-mono text-[#444] hover:text-[#888] transition-colors px-2 py-1 border border-[#333] rounded-sm bg-[#111] hover:bg-[#1a1a1a]"
                      onClick={handleReset}
                      title="Reset sequence"
                    >
                      &#x21BB;
                    </button>
                  </div>
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

                <FolderGuideCursor
                  targetPosition={cursorTarget}
                  navigating={navigatingToFolder !== null}
                  onArrived={handleDotArrived}
                />
                <SpacebarController
                  navigatingToFolder={navigatingToFolder}
                  setNavigatingToFolder={setNavigatingToFolder}
                  nextTargetId={nextTargetId}
                  openFolderAndFiles={openFolderAndFiles}
                  onAllComplete={handleAllComplete}
                />
                <RemoteCursors />

                {showCredits && (
                  <div
                    className="fixed inset-0 bg-bg z-[9999] flex items-center justify-center"
                    style={{
                      animation: "credits-fade-in 2s ease forwards",
                      opacity: 0,
                    }}
                  >
                    <div className="text-center font-mono text-white space-y-8">
                      <p className="text-[32px]">Thank you</p>
                      <div className="text-[20px] text-[#d1d5db] space-y-3">
                        <p>CultureHub LA</p>
                        <p>Stacy</p>
                        <p>Josephine Made</p>
                        <p>Geo Morjan Jihad</p>
                        <p>Bina Senator</p>
                      </div>
                      <p className="text-[20px] text-[#FFE600]">Prop 46</p>
                    </div>
                    <style jsx>{`
                      @keyframes credits-fade-in {
                        to {
                          opacity: 1;
                        }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </MultiplayerProvider>
          );
        })()}
      </AdminAuth>
    </MultiplayerProvider>
  );
}
