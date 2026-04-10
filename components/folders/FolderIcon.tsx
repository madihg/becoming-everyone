"use client";

import type { Folder } from "@/types";

interface Props {
  folder: Folder;
  draggable?: boolean;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent, folderId: string) => void;
  onDoubleClick?: (folderId: string) => void;
}

const ICON_MAP: Record<
  string,
  { type: "image" | "svg" | "text"; src?: string; svgId?: string }
> = {
  "1P1-service": { type: "text" },
  "2O1-anyone": { type: "image", src: "/markers/webcam.png" },
  "3R1-breaking": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "4W1-children": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "5P2-sleep": { type: "svg", svgId: "candle" },
  "6O2-what": { type: "image", src: "/markers/webcam.png" },
  "7P3-lift": { type: "image", src: "/markers/dumbbell.png" },
  "8W2-move": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "9O3-win": { type: "image", src: "/markers/webcam.png" },
  "10P4-dance": { type: "svg", svgId: "body" },
  "11R2-arms": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "12W3-poly": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "13P5-grieve": { type: "svg", svgId: "nodes" },
  "14R3-critic": { type: "image", src: "/markers/nbn/nbn-3.svg" },
  "15O4-agenda": { type: "image", src: "/markers/webcam.png" },
  "16P6-arson": { type: "image", src: "/markers/drone.png" },
  "17P7-neural": { type: "svg", svgId: "heart" },
  "18P8-yellow": { type: "svg", svgId: "physarum" },
  "19R4-found": { type: "image", src: "/markers/nbn/nbn-3.svg" },
};

function BodySilhouette() {
  return (
    <svg
      viewBox="0 0 100 160"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="50" cy="18" r="10" />
      <line
        x1="50"
        y1="28"
        x2="50"
        y2="80"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="42"
        x2="25"
        y2="65"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="42"
        x2="75"
        y2="65"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="80"
        x2="30"
        y2="120"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="80"
        x2="70"
        y2="120"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="25" cy="65" r="4" opacity="0.6" />
      <circle cx="75" cy="65" r="4" opacity="0.6" />
      <circle cx="50" cy="42" r="4" opacity="0.6" />
      <circle cx="50" cy="80" r="4" opacity="0.6" />
      <circle cx="30" cy="120" r="4" opacity="0.6" />
      <circle cx="70" cy="120" r="4" opacity="0.6" />
    </svg>
  );
}

function NodeNetwork() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <line
        x1="30"
        y1="30"
        x2="90"
        y2="30"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="30"
        y1="30"
        x2="60"
        y2="70"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="90"
        y1="30"
        x2="60"
        y2="70"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="60"
        y1="70"
        x2="20"
        y2="100"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="60"
        y1="70"
        x2="100"
        y2="100"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="20"
        y1="100"
        x2="100"
        y2="100"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="90"
        y1="30"
        x2="100"
        y2="100"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <circle cx="30" cy="30" r="6" />
      <circle cx="90" cy="30" r="6" />
      <circle cx="60" cy="70" r="8" opacity="0.8" />
      <circle cx="20" cy="100" r="5" />
      <circle cx="100" cy="100" r="5" />
    </svg>
  );
}

function AnatomicalHeart() {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path d="M100 200 C100 200 20 140 20 80 C20 50 40 20 70 20 C85 20 95 30 100 45 C105 30 115 20 130 20 C160 20 180 50 180 80 C180 140 100 200 100 200Z" />
      <path
        d="M60 30 C50 10 30 5 20 15"
        stroke="white"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M140 30 C150 10 170 5 180 15"
        stroke="white"
        strokeWidth="4"
        fill="none"
      />
      <path d="M55 15 L45 0" stroke="white" strokeWidth="3" fill="none" />
      <path d="M145 15 L155 0" stroke="white" strokeWidth="3" fill="none" />
      <path
        d="M100 45 L100 10 L90 0"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
      <path d="M100 10 L110 0" stroke="white" strokeWidth="3" fill="none" />
    </svg>
  );
}

function PhysarumShape() {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g opacity="0.9">
        <path
          d="M150 100 C130 90 100 85 60 80 C40 78 20 82 10 90"
          stroke="white"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C160 80 170 60 180 30 C185 15 190 10 200 5"
          stroke="white"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C170 110 200 115 240 120 C260 122 280 118 290 110"
          stroke="white"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C140 120 130 150 125 175 C123 185 118 192 110 195"
          stroke="white"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C155 115 165 140 180 160 C190 172 200 178 215 180"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="150" cy="100" r="8" opacity="0.6" />
        <circle cx="60" cy="80" r="4" opacity="0.4" />
        <circle cx="180" cy="30" r="3" opacity="0.4" />
        <circle cx="240" cy="120" r="4" opacity="0.4" />
        <circle cx="125" cy="175" r="3" opacity="0.4" />
      </g>
    </svg>
  );
}

function CandleShape() {
  return (
    <svg
      viewBox="0 0 60 160"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect x="18" y="60" width="24" height="95" rx="2" opacity="0.8" />
      <line x1="30" y1="60" x2="30" y2="38" stroke="white" strokeWidth="1.5" />
      <path
        d="M30 38 C25 28 22 18 26 8 C28 3 30 0 30 0 C30 0 32 3 34 8 C38 18 35 28 30 38Z"
        opacity="0.9"
      />
    </svg>
  );
}

function IconContent({ folderId }: { folderId: string }) {
  const config = ICON_MAP[folderId];
  if (!config) return null;

  if (config.type === "text") {
    return (
      <span
        className="text-white font-mono text-2xl font-normal tracking-tight"
        style={{ fontFamily: "'Diatype Mono', monospace" }}
      >
        (650)
      </span>
    );
  }

  if (config.type === "image" && config.src) {
    return (
      <img
        src={config.src}
        alt=""
        draggable={false}
        className="w-full h-full object-contain"
      />
    );
  }

  if (config.svgId === "body") return <BodySilhouette />;
  if (config.svgId === "nodes") return <NodeNetwork />;
  if (config.svgId === "heart") return <AnatomicalHeart />;
  if (config.svgId === "physarum") return <PhysarumShape />;
  if (config.svgId === "candle") return <CandleShape />;

  return null;
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
          opacity: folder.isOpen ? 0.6 : 0.4,
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
