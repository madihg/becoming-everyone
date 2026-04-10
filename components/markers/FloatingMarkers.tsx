"use client";

interface MarkerConfig {
  id: string;
  type: "image" | "svg" | "text";
  src?: string;
  content?: React.ReactNode;
  style: React.CSSProperties;
  animDuration: number;
}

const MARKERS: MarkerConfig[] = [
  {
    id: "dumbbell",
    type: "image",
    src: "/markers/dumbbell.png",
    style: { top: "12%", left: "8%", maxWidth: "9vw" },
    animDuration: 10,
  },
  {
    id: "drone",
    type: "image",
    src: "/markers/drone.png",
    style: { top: "8%", right: "10%", maxWidth: "8vw" },
    animDuration: 11,
  },
  {
    id: "flame",
    type: "image",
    src: "/markers/flame.png",
    style: { bottom: "15%", left: "12%", maxWidth: "7vw" },
    animDuration: 9,
  },
  {
    id: "heart",
    type: "svg",
    style: { bottom: "12%", right: "8%", maxWidth: "8vw", width: "8vw" },
    animDuration: 12,
  },
  {
    id: "physarum",
    type: "svg",
    style: { top: "45%", left: "5%", maxWidth: "10vw", width: "10vw" },
    animDuration: 8,
  },
  {
    id: "650",
    type: "text",
    style: { top: "18%", right: "30%", fontSize: "clamp(14px, 2vw, 28px)" },
    animDuration: 10,
  },
  {
    id: "candle",
    type: "svg",
    style: { bottom: "20%", left: "35%", maxWidth: "5vw", width: "5vw" },
    animDuration: 11,
  },
  {
    id: "nbn",
    type: "image",
    src: "/markers/nbn/nbn-3.svg",
    style: { top: "40%", right: "12%", maxWidth: "8vw" },
    animDuration: 10,
  },
];

function AnatomicalHeart() {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M100 200 C100 200 20 140 20 80 C20 50 40 20 70 20 C85 20 95 30 100 45 C105 30 115 20 130 20 C160 20 180 50 180 80 C180 140 100 200 100 200Z" />
      <path
        d="M60 30 C50 10 30 5 20 15"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M140 30 C150 10 170 5 180 15"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M70 55 C75 45 85 40 100 45"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M130 55 C125 45 115 40 100 45"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M80 80 Q90 90 100 80 Q110 90 120 80"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M55 15 L45 0"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M145 15 L155 0"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M100 45 L100 10 L90 0"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M100 10 L110 0"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}

function PhysarumShape() {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.9">
        <path
          d="M150 100 C130 90 100 85 60 80 C40 78 20 82 10 90"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C160 80 170 60 180 30 C185 15 190 10 200 5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C170 110 200 115 240 120 C260 122 280 118 290 110"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C140 120 130 150 125 175 C123 185 118 192 110 195"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M150 100 C155 115 165 140 180 160 C190 172 200 178 215 180"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M60 80 C50 70 35 55 25 40"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M60 80 C55 95 50 110 45 130"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M180 30 C170 25 155 20 140 15"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M240 120 C245 135 248 150 250 165"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M240 120 C250 110 260 95 270 85"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="150" cy="100" r="8" opacity="0.6" />
        <circle cx="60" cy="80" r="4" opacity="0.4" />
        <circle cx="180" cy="30" r="3" opacity="0.4" />
        <circle cx="240" cy="120" r="4" opacity="0.4" />
        <circle cx="125" cy="175" r="3" opacity="0.4" />
        <circle cx="180" cy="160" r="3" opacity="0.4" />
      </g>
    </svg>
  );
}

function CandleShape() {
  return (
    <svg
      viewBox="0 0 60 160"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="18" y="60" width="24" height="95" rx="2" opacity="0.8" />
      <ellipse cx="30" cy="155" rx="14" ry="4" opacity="0.4" />
      <line
        x1="30"
        y1="60"
        x2="30"
        y2="38"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M30 38 C25 28 22 18 26 8 C28 3 30 0 30 0 C30 0 32 3 34 8 C38 18 35 28 30 38Z"
        opacity="0.9"
      />
      <ellipse cx="30" cy="20" rx="4" ry="8" opacity="0.3" />
    </svg>
  );
}

function MarkerContent({ marker }: { marker: MarkerConfig }) {
  if (marker.type === "image" && marker.src) {
    return (
      <img
        src={marker.src}
        alt=""
        draggable={false}
        className="marker-image"
        style={{ width: "100%", height: "auto" }}
      />
    );
  }

  if (marker.type === "text") {
    return (
      <span
        className="marker-image"
        style={{
          fontFamily: "'Diatype Mono', monospace",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        (650)
      </span>
    );
  }

  if (marker.id === "heart") return <AnatomicalHeart />;
  if (marker.id === "physarum") return <PhysarumShape />;
  if (marker.id === "candle") return <CandleShape />;

  return null;
}

export default function FloatingMarkers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {MARKERS.map((marker) => (
        <div
          key={marker.id}
          className="absolute marker-hover"
          style={{
            ...marker.style,
            animationDuration: `${marker.animDuration}s`,
            color: "white",
          }}
        >
          <MarkerContent marker={marker} />
        </div>
      ))}
    </div>
  );
}
