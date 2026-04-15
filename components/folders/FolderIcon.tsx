"use client";

import type { Folder } from "@/types";

interface Props {
  folder: Folder;
  draggable?: boolean;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent, folderId: string) => void;
  onDoubleClick?: (folderId: string) => void;
}

const ICON_MAP: Record<string, string> = {
  "1P1-service": "/markers/phone.png",
  "2O1-anyone": "/markers/webcam.png",
  "3R1-breaking": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "4W1-children": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "5P2-sleep": "/markers/candle.png",
  "6O2-what": "/markers/webcam.png",
  "7P3-lift": "/markers/weights.png",
  "8W2-move": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "9O3-win": "/markers/webcam.png",
  "10P4-dance": "/markers/dance.png",
  "11R2-arms": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "12W3-poly": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "13P5-grieve": "/markers/earpiece.png",
  "14R3-critic": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
  "15O4-agenda": "/markers/webcam.png",
  "16P6-arson": "/markers/drone.png",
  "17P7-neural": "/markers/heart.png",
  "18P8-yellow": "/markers/mold.png",
  "19R4-found": "/markers/nbn/NBN_whitetext_transparetnbackground.png",
};

export function IconContent({ folderId }: { folderId: string }) {
  const src = ICON_MAP[folderId];
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="w-full h-full object-contain"
    />
  );
}

export default function FolderIcon({
  folder,
  draggable = false,
  isDragging = false,
  onPointerDown,
  onDoubleClick,
}: Props) {
  return (
    <div
      className="absolute flex flex-col items-center select-none group"
      style={{
        left: folder.position.x,
        top: folder.position.y,
        opacity: isDragging ? 0.3 : 1,
        cursor: draggable ? "grab" : "pointer",
      }}
      onPointerDown={
        draggable ? (e) => onPointerDown?.(e, folder.id) : undefined
      }
      onDoubleClick={() => onDoubleClick?.(folder.id)}
    >
      <div
        className="w-[100px] h-[80px] flex items-center justify-center"
        style={{
          filter: "grayscale(100%) contrast(1.3)",
          opacity: folder.isOpen ? 1 : 0.85,
        }}
      >
        <IconContent folderId={folder.id} />
      </div>

      <span className="mt-1 text-[12px] font-mono text-[#ccc] group-hover:text-white transition-colors text-center leading-tight max-w-[110px] truncate">
        {folder.name}
      </span>
    </div>
  );
}
