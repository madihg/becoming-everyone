"use client";

import type { Folder } from "@/types";

interface Props {
  folder: Folder;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, folderId: string) => void;
  onDoubleClick?: (folderId: string) => void;
}

export default function FolderIcon({
  folder,
  draggable = false,
  onDragStart,
  onDoubleClick,
}: Props) {
  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer select-none group"
      style={{ left: folder.position.x, top: folder.position.y }}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, folder.id)}
      onDoubleClick={() => onDoubleClick?.(folder.id)}
    >
      {/* Mac OS folder shape */}
      <svg
        width="64"
        height="52"
        viewBox="0 0 64 52"
        fill="none"
        className="transition-colors"
      >
        {/* Folder tab */}
        <path
          d="M2 8C2 6.89543 2.89543 6 4 6H20L24 2H4C2.89543 2 2 2.89543 2 4V8Z"
          fill={folder.isOpen ? "#2a2a2a" : "#1e1e1e"}
        />
        {/* Folder body */}
        <rect
          x="2"
          y="8"
          width="60"
          height="40"
          rx="2"
          fill={folder.isOpen ? "#2a2a2a" : "#1a1a1a"}
          stroke="#333333"
          strokeWidth="1"
        />
        {/* Subtle inner highlight */}
        <rect x="3" y="9" width="58" height="1" fill="rgba(255,255,255,0.03)" />
      </svg>

      {/* Folder name */}
      <span className="mt-1 text-[11px] font-mono text-text-muted group-hover:text-white transition-colors text-center leading-tight max-w-[80px] truncate">
        {folder.name}
      </span>
    </div>
  );
}
