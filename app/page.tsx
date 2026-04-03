"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import type { FolderState, FileItem } from "@/types";

export default function Home() {
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

  // Poll for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/folders")
        .then((r) => r.json())
        .then((data: FolderState) => setState(data));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFolderDoubleClick = useCallback(
    async (folderId: string) => {
      if (!state) return;
      const newState = {
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: true } : f,
        ),
      };
      setState(newState);
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

  // Default: show ALL folders. Only filter by tab if ?tab= is explicitly set.
  const visibleFolders = tabParam
    ? state.folders.filter((f) => f.tabId === tabParam)
    : state.folders;
  const openFolders = state.folders.filter((f) => f.isOpen);

  return (
    <main className="h-screen w-screen bg-bg relative">
      <PhysarumBackground openFolders={openFolders} />

      {visibleFolders.map((folder) => (
        <FolderIcon
          key={folder.id}
          folder={folder}
          draggable={false}
          onDoubleClick={handleFolderDoubleClick}
        />
      ))}

      {visibleFolders
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
    </main>
  );
}
