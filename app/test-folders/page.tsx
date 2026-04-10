"use client";

const FOLDERS = [
  {
    id: "1P1-service",
    label: "service",
    type: "P",
    icon: "/markers/phone.png",
  },
  { id: "2O1-anyone", label: "anyone", type: "O", icon: "/markers/webcam.png" },
  {
    id: "3R1-breaking",
    label: "breaking",
    type: "R",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  {
    id: "4W1-children",
    label: "children",
    type: "W",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  { id: "5P2-sleep", label: "sleep", type: "P", icon: "/markers/candle.png" },
  { id: "6O2-what", label: "what", type: "O", icon: "/markers/webcam.png" },
  { id: "7P3-lift", label: "lift", type: "P", icon: "/markers/weights.png" },
  {
    id: "8W2-move",
    label: "move",
    type: "W",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  { id: "9O3-win", label: "win", type: "O", icon: "/markers/webcam.png" },
  { id: "10P4-dance", label: "dance", type: "P", icon: "/markers/dance.png" },
  {
    id: "11R2-arms",
    label: "arms",
    type: "R",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  {
    id: "12W3-poly",
    label: "poly",
    type: "W",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  {
    id: "13P5-grieve",
    label: "grieve",
    type: "P",
    icon: "/markers/earpiece.png",
  },
  {
    id: "14R3-critic",
    label: "critic",
    type: "R",
    icon: "/markers/nbn/nbn-logo.svg",
  },
  {
    id: "15O4-agenda",
    label: "agenda",
    type: "O",
    icon: "/markers/webcam.png",
  },
  { id: "16P6-arson", label: "arson", type: "P", icon: "/markers/drone.png" },
  { id: "17P7-neural", label: "neural", type: "P", icon: "/markers/heart.png" },
  { id: "18P8-yellow", label: "yellow", type: "P", icon: "/markers/mold.png" },
  {
    id: "19R4-found",
    label: "found",
    type: "R",
    icon: "/markers/nbn/nbn-logo.svg",
  },
];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    P: "bg-white/20 text-white",
    O: "bg-blue-500/30 text-blue-300",
    R: "bg-red-500/30 text-red-300",
    W: "bg-amber-500/30 text-amber-300",
  };
  return (
    <span
      className={`absolute top-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded ${colors[type] || "bg-white/10 text-white/50"}`}
    >
      {type}
    </span>
  );
}

export default function TestFoldersPage() {
  return (
    <div className="min-h-screen bg-[#111] p-8">
      <h1 className="text-white font-mono text-xl mb-8">
        Folder Mockups - All 19 Folders
      </h1>

      <div className="grid grid-cols-4 gap-6 max-w-5xl">
        {FOLDERS.map((folder) => (
          <div key={folder.id} className="flex flex-col items-center gap-2">
            {/* Folder shape */}
            <div className="relative w-[140px] h-[110px]">
              {/* Tab */}
              <div
                className="absolute top-0 left-0 w-[45px] h-[18px] rounded-t-md"
                style={{
                  background: "linear-gradient(180deg, #444 0%, #333 100%)",
                  borderLeft: "1px solid #555",
                  borderTop: "1px solid #555",
                  borderRight: "1px solid #555",
                }}
              />
              {/* Body */}
              <div
                className="absolute top-[16px] left-0 right-0 bottom-0 rounded-tr-md rounded-b-md flex items-center justify-center p-4"
                style={{
                  background:
                    "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
                  border: "1px solid #555",
                }}
              >
                <TypeBadge type={folder.type} />
                <div
                  className="w-[60px] h-[60px] flex items-center justify-center"
                  style={{ filter: "grayscale(100%) contrast(1.3)" }}
                >
                  <img
                    src={folder.icon}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Label */}
            <span className="text-[11px] font-mono text-[#999] text-center">
              {folder.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
