"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import type { FolderState, FileItem } from "@/types";

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

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderState) => setState(data));
  }, []);

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
      setState({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: true } : f,
        ),
      });
      const z = topZ + 1;
      setTopZ(z);
      setWindowZMap((prev) => ({ ...prev, [folderId]: z }));

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

  const handleFileDoubleClick = useCallback((file: FileItem) => {
    if (file.type === "html" || file.type === "executable") {
      window.open(file.path, "_blank");
    } else if (file.type === "image" || file.type === "video") {
      window.open(file.path, "_blank");
    }
  }, []);

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
        return (
          <div
            key={tab.id}
            className="flex-1 relative overflow-hidden"
            style={{
              borderRight:
                idx < visibleTabs.length - 1 ? "1px solid #2a2a2a" : "none",
            }}
          >
            <PhysarumBackground openFolders={openTabFolders} />

            {/* Screen label */}
            <div className="absolute top-2 left-3 text-[11px] font-mono text-text-muted/30 pointer-events-none z-10 uppercase tracking-wider select-none">
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
                  onFileDoubleClick={handleFileDoubleClick}
                />
              ))}
          </div>
        );
      })}
    </main>
  );
}
