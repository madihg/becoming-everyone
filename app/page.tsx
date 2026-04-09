"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import FloatingWindow from "@/components/windows/FloatingWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import type { FolderState, FileItem } from "@/types";

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

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-bg" />}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [state, setState] = useState<FolderState | null>(null);
  const [windowZMap, setWindowZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(10);
  const [floatingWindows, setFloatingWindows] = useState<
    { id: string; title: string; src: string; zIndex: number }[]
  >([]);
  const [everOpenedIds, setEverOpenedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderState) => setState(data));
  }, []);

  // Track ever-opened folders
  useEffect(() => {
    if (!state) return;
    const currentlyOpen = state.folders
      .filter((f) => f.isOpen)
      .map((f) => f.id);
    if (currentlyOpen.length > 0) {
      setEverOpenedIds((prev) => new Set([...prev, ...currentlyOpen]));
    }
  }, [state]);

  // Poll for admin changes every second
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/folders")
        .then((r) => r.json())
        .then((data: FolderState) => setState(data));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFolderDoubleClick = useCallback(
    async (folderId: string) => {
      if (!state) return;

      const folder = state.folders.find((f) => f.id === folderId);
      setState({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: true } : f,
        ),
      });
      const z = topZ + 1;
      setTopZ(z);
      setWindowZMap((prev) => ({ ...prev, [folderId]: z }));

      if (folder) {
        const viewable = folder.contents
          .filter((f) => ["image", "video", "pdf", "audio"].includes(f.type))
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
        body: JSON.stringify({ isOpen: true }),
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
        const panel = document.querySelector<HTMLElement>(
          `[data-tab-panel="${folder.tabId}"]`,
        );
        openMediaViewer(folderId, Math.max(0, fileIndex), panel);
      }
    },
    [state, floatingWindows],
  );

  if (!state) return <div className="h-screen w-screen bg-bg" />;

  // Side-by-side screens matching admin. ?tab=id shows single screen.
  const visibleTabs = tabParam
    ? state.tabs.filter((t) => t.id === tabParam)
    : state.tabs;

  return (
    <main className="h-screen w-screen bg-bg flex">
      {visibleTabs.map((tab, idx) => {
        const tabFolders = state.folders.filter((f) => f.tabId === tab.id);
        const openTabFolders = tabFolders.filter((f) => f.isOpen);
        const everOpenedTabFolders = tabFolders.filter((f) =>
          everOpenedIds.has(f.id),
        );
        return (
          <div
            key={tab.id}
            data-tab-panel={tab.id}
            className="flex-1 relative overflow-hidden"
            style={{
              borderRight:
                idx < visibleTabs.length - 1 ? "1px solid #2a2a2a" : "none",
            }}
          >
            <PhysarumBackground
              openFolders={openTabFolders}
              everOpenedFolders={everOpenedTabFolders}
            />

            {/* Screen label */}
            <div className="absolute top-2 left-3 text-[11px] font-mono text-[#555] pointer-events-none z-10 uppercase tracking-wider select-none">
              {tab.name}
            </div>

            {tabFolders.map((folder) => (
              <FolderIcon
                key={folder.id}
                folder={folder}
                draggable={false}
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
          </div>
        );
      })}

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
    </main>
  );
}
