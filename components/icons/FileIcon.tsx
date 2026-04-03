"use client";

import type { FileItem } from "@/types";

interface Props {
  file: FileItem;
  onDoubleClick: () => void;
}

function IconShape({ children }: { children: React.ReactNode }) {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
      {/* Document base shape with folded corner */}
      <path
        d="M4 2H28L36 10V44C36 45.1 35.1 46 34 46H6C4.9 46 4 45.1 4 44V4C4 2.9 4.9 2 6 2H4Z"
        fill="#1e1e1e"
        stroke="#444"
        strokeWidth="1"
      />
      {/* Folded corner */}
      <path d="M28 2V10H36" fill="#252525" stroke="#444" strokeWidth="1" />
      {/* Type indicator */}
      {children}
    </svg>
  );
}

function TypeIndicator({ type }: { type: FileItem["type"] }) {
  switch (type) {
    case "image":
      return (
        <IconShape>
          {/* Mountain/landscape glyph */}
          <path d="M10 36L16 28L20 32L26 24L30 36H10Z" fill="#555" />
          <circle cx="14" cy="22" r="2" fill="#555" />
        </IconShape>
      );
    case "video":
      return (
        <IconShape>
          {/* Play triangle */}
          <path d="M15 20L28 28L15 36V20Z" fill="#555" />
        </IconShape>
      );
    case "pdf":
      return (
        <IconShape>
          <text x="12" y="34" fill="#555" fontSize="9" fontFamily="monospace">
            PDF
          </text>
        </IconShape>
      );
    case "document":
      return (
        <IconShape>
          {/* Horizontal lines */}
          <line x1="10" y1="22" x2="30" y2="22" stroke="#444" strokeWidth="1" />
          <line x1="10" y1="26" x2="30" y2="26" stroke="#444" strokeWidth="1" />
          <line x1="10" y1="30" x2="26" y2="30" stroke="#444" strokeWidth="1" />
          <line x1="10" y1="34" x2="22" y2="34" stroke="#444" strokeWidth="1" />
        </IconShape>
      );
    case "audio":
      return (
        <IconShape>
          {/* Waveform */}
          <path
            d="M10 28H13V24H16V32H19V22H22V34H25V26H28V30H30"
            stroke="#555"
            strokeWidth="1.5"
            fill="none"
          />
        </IconShape>
      );
    case "executable":
      return (
        <IconShape>
          {/* Terminal prompt */}
          <text x="11" y="30" fill="#555" fontSize="10" fontFamily="monospace">
            {">_"}
          </text>
        </IconShape>
      );
    case "html":
      return (
        <IconShape>
          <text x="9" y="32" fill="#555" fontSize="9" fontFamily="monospace">
            {"</>"}
          </text>
        </IconShape>
      );
    case "presentation":
      return (
        <IconShape>
          {/* Presentation slide shape */}
          <rect
            x="10"
            y="20"
            width="20"
            height="14"
            rx="1"
            fill="none"
            stroke="#555"
            strokeWidth="1"
          />
          <line x1="20" y1="34" x2="20" y2="38" stroke="#555" strokeWidth="1" />
          <line x1="14" y1="38" x2="26" y2="38" stroke="#555" strokeWidth="1" />
        </IconShape>
      );
    default:
      return <IconShape>{null}</IconShape>;
  }
}

export default function FileIcon({ file, onDoubleClick }: Props) {
  return (
    <div
      className="flex flex-col items-center cursor-pointer select-none group"
      onDoubleClick={onDoubleClick}
    >
      <TypeIndicator type={file.type} />
      <span className="mt-1 text-[10px] font-mono text-text-muted group-hover:text-white transition-colors text-center leading-tight max-w-[72px] line-clamp-2">
        {file.name}
      </span>
    </div>
  );
}
