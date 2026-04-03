"use client";

import { useState, useRef, useCallback } from "react";
import type { Folder, FileItem } from "@/types";
import FileIcon from "@/components/icons/FileIcon";

interface Props {
  folder: Folder;
  zIndex: number;
  onClose: (folderId: string) => void;
  onFocus: (folderId: string) => void;
  onFileDoubleClick: (file: FileItem) => void;
}

export default function FolderWindow({
  folder,
  zIndex,
  onClose,
  onFocus,
  onFileDoubleClick,
}: Props) {
  const [pos, setPos] = useState({
    x: folder.position.x + 40,
    y: folder.position.y + 60,
  });
  const [size, setSize] = useState({ w: 420, h: 300 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Title bar drag
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onFocus(folder.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        setPos({
          x: dragRef.current.origX + (ev.clientX - dragRef.current.startX),
          y: dragRef.current.origY + (ev.clientY - dragRef.current.startY),
        });
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [folder.id, pos, onFocus],
  );

  // Resize handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: size.w,
        origH: size.h,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        setSize({
          w: Math.max(
            280,
            resizeRef.current.origW + (ev.clientX - resizeRef.current.startX),
          ),
          h: Math.max(
            200,
            resizeRef.current.origH + (ev.clientY - resizeRef.current.startY),
          ),
        });
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [size],
  );

  return (
    <div
      className="absolute"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex }}
      onMouseDown={() => onFocus(folder.id)}
    >
      {/* Drop shadow */}
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black/40 rounded-sm" />

      {/* Window frame */}
      <div className="relative w-full h-full flex flex-col rounded-sm overflow-hidden border border-[#444]">
        {/* Title bar - Mac OS 9 dark */}
        <div
          className="h-[22px] flex items-center px-2 cursor-move shrink-0 relative"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              #2a2a2a 0px,
              #2a2a2a 1px,
              #222 1px,
              #222 2px
            )`,
          }}
          onMouseDown={handleTitleMouseDown}
        >
          {/* Close box */}
          <button
            className="w-[11px] h-[11px] border border-[#555] bg-[#1a1a1a] hover:bg-[#ff5f57] mr-2 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClose(folder.id);
            }}
          />

          {/* Title */}
          <span className="text-[11px] font-mono text-text-muted truncate flex-1 text-center">
            {folder.name}
          </span>

          {/* Zoom box */}
          <div className="w-[11px] h-[11px] border border-[#555] bg-[#1a1a1a] ml-2 shrink-0" />
        </div>

        {/* Window body */}
        <div className="flex-1 bg-[#1a1a1a] overflow-auto p-3">
          {folder.contents.length === 0 ? (
            <span className="text-[11px] font-mono text-text-muted/50">
              Empty Folder
            </span>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {folder.contents.map((file) => (
                <FileIcon
                  key={file.id}
                  file={file}
                  onDoubleClick={() => onFileDoubleClick(file)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#444]">
          <line
            x1="11"
            y1="3"
            x2="3"
            y2="11"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="11"
            y1="7"
            x2="7"
            y2="11"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="11"
            y1="11"
            x2="11"
            y2="11"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
