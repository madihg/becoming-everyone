"use client";

interface MarkerConfig {
  id: string;
  src: string;
  style: React.CSSProperties;
  animDuration: number;
}

const MARKERS: MarkerConfig[] = [
  {
    id: "weights",
    src: "/markers/weights.png",
    style: { top: "12%", left: "8%", maxWidth: "9vw" },
    animDuration: 10,
  },
  {
    id: "drone",
    src: "/markers/drone.png",
    style: { top: "8%", right: "10%", maxWidth: "8vw" },
    animDuration: 11,
  },
  {
    id: "heart",
    src: "/markers/heart.png",
    style: { bottom: "12%", right: "8%", maxWidth: "8vw" },
    animDuration: 12,
  },
  {
    id: "mold",
    src: "/markers/mold.png",
    style: { top: "45%", left: "5%", maxWidth: "10vw" },
    animDuration: 8,
  },
  {
    id: "phone",
    src: "/markers/phone.png",
    style: { top: "18%", right: "30%", maxWidth: "7vw" },
    animDuration: 10,
  },
  {
    id: "candle",
    src: "/markers/candle.png",
    style: { bottom: "20%", left: "35%", maxWidth: "5vw" },
    animDuration: 11,
  },
  {
    id: "nbn",
    src: "/markers/nbn/nbn-3.svg",
    style: { top: "40%", right: "12%", maxWidth: "8vw" },
    animDuration: 10,
  },
];

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
          }}
        >
          <img
            src={marker.src}
            alt=""
            draggable={false}
            className="marker-image"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      ))}
    </div>
  );
}
