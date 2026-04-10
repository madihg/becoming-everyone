"use client";

import { useState, useEffect, useRef } from "react";

interface MarkerConfig {
  id: string;
  src: string;
  style: React.CSSProperties;
}

const MARKERS: MarkerConfig[] = [
  {
    id: "weights",
    src: "/markers/weights.png",
    style: { top: "12%", left: "8%", maxWidth: "27vw" },
  },
  {
    id: "drone",
    src: "/markers/drone.png",
    style: { top: "8%", right: "10%", maxWidth: "24vw" },
  },
  {
    id: "heart",
    src: "/markers/heart.png",
    style: { bottom: "12%", right: "8%", maxWidth: "24vw" },
  },
  {
    id: "mold",
    src: "/markers/mold.png",
    style: { top: "45%", left: "5%", maxWidth: "30vw" },
  },
  {
    id: "phone",
    src: "/markers/phone.png",
    style: { top: "18%", right: "30%", maxWidth: "21vw" },
  },
  {
    id: "candle",
    src: "/markers/candle.png",
    style: { bottom: "20%", left: "35%", maxWidth: "15vw" },
  },
  {
    id: "nbn",
    src: "/markers/nbn/nbn-logo.svg",
    style: { top: "40%", right: "12%", maxWidth: "24vw" },
  },
  {
    id: "dance",
    src: "/markers/dance.png",
    style: { bottom: "8%", right: "30%", maxWidth: "24vw" },
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
