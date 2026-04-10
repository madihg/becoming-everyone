"use client";

import { useState, useEffect, useRef } from "react";

interface MarkerConfig {
  id: string;
  src: string;
  style: React.CSSProperties;
}

const MARKERS: MarkerConfig[] = [
  {
    id: "phone",
    src: "/markers/phone.png",
    style: { top: "5%", left: "5%", maxWidth: "16vw" },
  },
  {
    id: "webcam",
    src: "/markers/webcam.png",
    style: { top: "3%", right: "25%", maxWidth: "18vw" },
  },
  {
    id: "weights",
    src: "/markers/weights.png",
    style: { top: "5%", left: "30%", maxWidth: "20vw" },
  },
  {
    id: "drone",
    src: "/markers/drone.png",
    style: { top: "3%", right: "5%", maxWidth: "18vw" },
  },
  {
    id: "candle",
    src: "/markers/candle.png",
    style: { bottom: "15%", left: "5%", maxWidth: "11vw" },
  },
  {
    id: "nbn",
    src: "/markers/nbn/nbn-logo.svg",
    style: { top: "8%", right: "12%", maxWidth: "18vw" },
  },
  {
    id: "dance",
    src: "/markers/dance.png",
    style: { bottom: "5%", right: "25%", maxWidth: "18vw" },
  },
  {
    id: "heart",
    src: "/markers/heart.png",
    style: { bottom: "5%", right: "5%", maxWidth: "18vw" },
  },
  {
    id: "mold",
    src: "/markers/mold.png",
    style: { bottom: "5%", left: "3%", maxWidth: "22vw" },
  },
  {
    id: "earpiece",
    src: "/markers/earpiece.png",
    style: { bottom: "12%", left: "25%", maxWidth: "16vw" },
  },
];

export default function FloatingMarkers() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      // Pause 3-6s between activations
      const pause = 3000 + Math.random() * 3000;
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        // Pick a random marker
        const idx = Math.floor(Math.random() * MARKERS.length);
        setActiveId(MARKERS[idx].id);
        // Let it animate for 8-12s, then deactivate
        const dur = 8000 + Math.random() * 4000;
        timerRef.current = setTimeout(() => {
          if (cancelled) return;
          setActiveId(null);
          cycle();
        }, dur);
      }, pause);
    };

    timerRef.current = setTimeout(cycle, 1500);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {MARKERS.map((marker) => (
        <div
          key={marker.id}
          className={`absolute ${activeId === marker.id ? "marker-hover" : ""}`}
          style={{
            ...marker.style,
            animationDuration: "10s",
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
