"use client";

import { useEffect, useRef, useState } from "react";
import type { Folder } from "@/types";

interface Props {
  openFolders: Folder[];
  everOpenedFolders: Folder[];
  allFolders: Folder[];
  folderSequence: string[];
  sequenceProgress: Set<string>;
}

export default function PhysarumBackground({
  openFolders,
  everOpenedFolders,
  allFolders,
  folderSequence,
  sequenceProgress,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Build position map from ALL folders (not just opened) so lines can reach un-opened targets
    const positionMap = new Map<string, { x: number; y: number }>();
    for (const f of allFolders) {
      if (!positionMap.has(f.id)) {
        positionMap.set(f.id, { x: f.position.x + 50, y: f.position.y + 40 });
      }
    }

    let time = 0;

    const drawShorelineBlob = (
      cx: number,
      cy: number,
      baseRadius: number,
      seed: number,
    ) => {
      const slowTime = time * 0.0003;
      ctx.beginPath();

      const points = 80;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const flow1 =
          Math.sin(angle * 3 + slowTime * 2 + seed) * (baseRadius * 0.12);
        const flow2 =
          Math.sin(angle * 5 + slowTime * 1.3 + seed * 1.7) *
          (baseRadius * 0.08);
        const flow3 =
          Math.sin(angle * 7 + slowTime * 0.8 + seed * 2.3) *
          (baseRadius * 0.05);
        const breath =
          Math.sin(slowTime * 0.5 + seed * 0.3) * (baseRadius * 0.04);
        const detail = Math.sin(angle * 20 + seed * 10) * (baseRadius * 0.02);
        const drift = Math.sin(slowTime + angle * 0.5) * (baseRadius * 0.03);
        const radius =
          baseRadius + flow1 + flow2 + flow3 + breath + detail + drift;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fill();
    };

    const drawOrganicTube = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      timeOffset: number,
    ) => {
      const slowTime = time * 0.0004;
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      const segments = 16;
      const dx = x2 - x1;
      const dy = y2 - y1;

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + dx * t;
        const sway1 =
          Math.sin(t * Math.PI * 2 + slowTime + timeOffset) *
          15 *
          Math.sin(t * Math.PI);
        const sway2 =
          Math.sin(t * Math.PI * 3 + slowTime * 0.7 + timeOffset) *
          8 *
          Math.sin(t * Math.PI);
        const y = y1 + dy * t + sway1 + sway2;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    const drawTravelingDots = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => {
      const slowTime = time * 0.0006;
      const dotCount = 3;

      for (let d = 0; d < dotCount; d++) {
        const phase = (slowTime + d / dotCount) % 1;
        const dx = x1 + (x2 - x1) * phase;
        const dy = y1 + (y2 - y1) * phase;

        const gradient = ctx.createRadialGradient(dx, dy, 0, dx, dy, 8);
        gradient.addColorStop(0, "rgba(255, 230, 0, 0.8)");
        gradient.addColorStop(1, "rgba(255, 230, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dx, dy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      time += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (everOpenedFolders.length === 0 && openFolders.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Build sequential pairs from folderSequence
      for (let i = 0; i < folderSequence.length - 1; i++) {
        const fromId = folderSequence[i];
        const toId = folderSequence[i + 1];
        const fromPos = positionMap.get(fromId);
        const toPos = positionMap.get(toId);

        if (!fromPos || !toPos) continue;
        if (!sequenceProgress.has(fromId)) continue;

        const isLatest =
          sequenceProgress.has(fromId) && !sequenceProgress.has(toId);
        const isCompleted =
          sequenceProgress.has(fromId) && sequenceProgress.has(toId);

        if (isCompleted) {
          // Persistent faded line
          ctx.strokeStyle = "rgba(255, 230, 0, 0.5)";
          ctx.lineWidth = 1;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.stroke();

          // Organic tube
          ctx.strokeStyle = "rgba(255, 230, 0, 0.06)";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          drawOrganicTube(fromPos.x, fromPos.y, toPos.x, toPos.y, i * 300);
        }

        if (isLatest) {
          // Active line with higher opacity
          ctx.strokeStyle = "rgba(255, 230, 0, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.stroke();

          // Traveling dots on the latest edge
          drawTravelingDots(fromPos.x, fromPos.y, toPos.x, toPos.y);
        }
      }

      // Draw blobs at ever-opened folder positions
      ctx.fillStyle = "rgba(255, 230, 0, 0.04)";
      everOpenedFolders.forEach((folder, idx) => {
        const pos = positionMap.get(folder.id);
        if (pos) drawShorelineBlob(pos.x, pos.y, 20, idx * 100 + 500);
      });

      // Draw active blobs at open folder positions
      ctx.fillStyle = "rgba(255, 230, 0, 0.08)";
      openFolders.forEach((folder, idx) => {
        const pos = positionMap.get(folder.id);
        if (pos) drawShorelineBlob(pos.x, pos.y, 30, idx * 100);
      });

      // Draw subtle tendrils reaching outward
      const slowTime = time * 0.0003;
      ctx.fillStyle = "rgba(255, 230, 0, 0.03)";
      openFolders.forEach((folder, idx) => {
        const pos = positionMap.get(folder.id);
        if (!pos) return;
        const reachX = pos.x + Math.sin(slowTime + idx) * 20;
        const reachY = pos.y + Math.cos(slowTime * 0.7 + idx) * 20;
        drawShorelineBlob(reachX, reachY, 15, idx * 200 + 50);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    openFolders,
    everOpenedFolders,
    allFolders,
    folderSequence,
    sequenceProgress,
    dimensions,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
