"use client";

import { useEffect, useRef } from "react";

interface Props {
  targetPosition: { x: number; y: number } | null;
  navigating?: boolean;
  onArrived?: () => void;
}

export default function FolderGuideCursor({
  targetPosition,
  navigating = false,
  onArrived,
}: Props) {
  const dotRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const currentPos = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);
  const arrivedRef = useRef(false);
  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;

  // Reset arrived flag when navigating starts
  useEffect(() => {
    if (navigating) {
      arrivedRef.current = false;
    }
  }, [navigating]);

  useEffect(() => {
    if (!targetPosition || !dotRef.current) return;

    if (!initialized.current) {
      currentPos.current = { x: targetPosition.x, y: targetPosition.y };
      initialized.current = true;
    }

    let time = 0;

    const animate = () => {
      time += 0.016;

      const isNavigating = navigating && !arrivedRef.current;
      const lerpSpeed = isNavigating ? 0.12 : 0.03;

      currentPos.current.x +=
        (targetPosition.x - currentPos.current.x) * lerpSpeed;
      currentPos.current.y +=
        (targetPosition.y - currentPos.current.y) * lerpSpeed;

      // Orbit only when not navigating
      let orbitX = 0;
      let orbitY = 0;
      if (!isNavigating) {
        orbitX = Math.cos(time * 1.2) * 35 + Math.sin(time * 0.7) * 10;
        orbitY = Math.sin(time * 0.9) * 25 + Math.cos(time * 1.5) * 8;
      }

      // Check arrival during navigation
      if (isNavigating) {
        const dx = targetPosition.x - currentPos.current.x;
        const dy = targetPosition.y - currentPos.current.y;
        if (Math.hypot(dx, dy) < 3) {
          arrivedRef.current = true;
          onArrivedRef.current?.();
        }
      }

      const finalX = currentPos.current.x + orbitX;
      const finalY = currentPos.current.y + orbitY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetPosition, navigating]);

  if (!targetPosition) return null;

  return (
    <div
      ref={dotRef}
      className="fixed top-0 left-0 pointer-events-none z-[9998]"
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: "#ffe600",
        boxShadow: "0 0 12px 4px rgba(255, 230, 0, 0.4)",
        opacity: 0,
        animation: "cursor-fade-in 1s ease forwards",
      }}
    >
      <style jsx>{`
        @keyframes cursor-fade-in {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
