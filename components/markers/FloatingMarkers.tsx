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
    style: { top: "3%", left: "2%", maxWidth: "12vw" },
  },
  {
    id: "webcam",
    src: "/markers/webcam.png",
    style: { top: "2%", right: "30%", maxWidth: "13.5vw" },
  },
  {
    id: "weights",
    src: "/markers/weights.png",
    style: { top: "3%", left: "22%", maxWidth: "15vw" },
  },
  {
    id: "drone",
    src: "/markers/drone.png",
    style: { top: "2%", right: "2%", maxWidth: "13.5vw" },
  },
  {
    id: "candle",
    src: "/markers/candle.png",
    style: { bottom: "18%", left: "2%", maxWidth: "8vw" },
  },
  {
    id: "nbn",
    src: "/markers/nbn/NBN_whitetext_transparetnbackground.png",
    style: { top: "6%", right: "15%", maxWidth: "9vw" },
  },
  {
    id: "dance",
    src: "/markers/dance.png",
    style: { bottom: "3%", right: "30%", maxWidth: "13.5vw" },
  },
  {
    id: "heart",
    src: "/markers/heart.png",
    style: { bottom: "3%", right: "2%", maxWidth: "13.5vw" },
  },
  {
    id: "mold",
    src: "/markers/mold.png",
    style: { bottom: "3%", left: "2%", maxWidth: "16.5vw" },
  },
  {
    id: "earpiece",
    src: "/markers/earpiece.png",
    style: { bottom: "15%", left: "20%", maxWidth: "12vw" },
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
