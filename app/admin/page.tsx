"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FolderIcon from "@/components/folders/FolderIcon";
import FolderWindow from "@/components/windows/FolderWindow";
import PhysarumBackground from "@/components/physarum/PhysarumBackground";
import TabBar from "@/components/admin/TabBar";
import type { FolderState, Tab, FileItem } from "@/types";

export default function AdminPage() {
  const [state, setState] = useState<FolderState | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [windowZMap, setWindowZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(10);
  const dragFolderIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderState) => {
        setState(data);
        if (data.tabs.length > 0) setActiveTabId(data.tabs[0].id);
      });
  }, []);

  const persist = useCallback(async (newState: FolderState) => {
    setState(newState);
    await fetch("/api/folders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newState),
    });
  }, []);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, folderId: string) => {
      dragFolderIdRef.current = folderId;
      const folder = state?.folders.find((f) => f.id === folderId);
      if (folder) {
        dragOffsetRef.current = {
          x: e.clientX - folder.position.x,
          y: e.clientY - folder.position.y,
        };
      }
      e.dataTransfer.effectAllowed = "move";
      const img = new Image();
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    },
    [state],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!state || !dragFolderIdRef.current) return;
      const folderId = dragFolderIdRef.current;
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;
      persist({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                position: { x: Math.max(0, newX), y: Math.max(36, newY) },
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

  // Folder open/close
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
      const newState = {
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, isOpen: false } : f,
        ),
      };
      setState(newState);
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

  // Tab handlers
  const handleTabCreate = useCallback(() => {
    if (!state) return;
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = { id: newId, name: `Screen ${state.tabs.length + 1}` };
    persist({ ...state, tabs: [...state.tabs, newTab] });
    setActiveTabId(newId);
  }, [state, persist]);

  const handleTabRename = useCallback(
    (tabId: string, name: string) => {
      if (!state) return;
      persist({
        ...state,
        tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, name } : t)),
      });
    },
    [state, persist],
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (!state || state.tabs.length <= 1) return;
      const firstTab = state.tabs.find((t) => t.id !== tabId);
      if (!firstTab) return;
      persist({
        ...state,
        tabs: state.tabs.filter((t) => t.id !== tabId),
        folders: state.folders.map((f) =>
          f.tabId === tabId ? { ...f, tabId: firstTab.id } : f,
        ),
      });
      if (activeTabId === tabId) setActiveTabId(firstTab.id);
    },
    [state, persist, activeTabId],
  );

  const handleDropOnTab = useCallback(
    (tabId: string) => {
      if (!state || !dragFolderIdRef.current) return;
      const folderId = dragFolderIdRef.current;
      persist({
        ...state,
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, tabId, position: { x: 80, y: 80 } } : f,
        ),
      });
      dragFolderIdRef.current = null;
    },
    [state, persist],
  );

  if (!state) return <div className="h-screen w-screen bg-bg" />;

  const openFolders = state.folders.filter((f) => f.isOpen);

  return (
    <div className="h-screen w-screen bg-bg flex flex-col">
      <TabBar
        tabs={state.tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onTabCreate={handleTabCreate}
        onTabRename={handleTabRename}
        onTabClose={handleTabClose}
        onDropOnTab={handleDropOnTab}
      />

      {/* Side-by-side tab surfaces */}
      <div className="flex-1 flex">
        {state.tabs.map((tab) => {
          const tabFolders = state.folders.filter((f) => f.tabId === tab.id);
          return (
            <div
              key={tab.id}
              className="flex-1 relative"
              style={{
                borderRight:
                  state.tabs.indexOf(tab) < state.tabs.length - 1
                    ? "1px solid #2a2a2a"
                    : "none",
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <PhysarumBackground
                openFolders={openFolders.filter((f) => f.tabId === tab.id)}
              />

              {/* Tab label overlay */}
              <div className="absolute top-2 left-3 text-[10px] font-mono text-text-muted/40 pointer-events-none">
                {tab.name}
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
      </div>
    </div>
  );
}
