"use client";

import { useEffect, useRef, useState } from "react";
import type { Folder } from "@/types";

interface Props {
  openFolders: Folder[];
  everOpenedFolders: Folder[];
}

export default function PhysarumBackground({
  openFolders,
  everOpenedFolders,
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

    const animate = () => {
      time += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (openFolders.length === 0 && everOpenedFolders.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Draw persistent faded lines between ever-opened folder pairs
      if (everOpenedFolders.length > 1) {
        ctx.strokeStyle = "rgba(255, 230, 0, 0.5)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        for (let i = 0; i < everOpenedFolders.length; i++) {
          for (let j = i + 1; j < everOpenedFolders.length; j++) {
            const a = everOpenedFolders[i];
            const b = everOpenedFolders[j];
            ctx.beginPath();
            ctx.moveTo(a.position.x + 32, a.position.y + 26);
            ctx.lineTo(b.position.x + 32, b.position.y + 26);
            ctx.stroke();
          }
        }
      }

      // Draw faded blobs at ever-opened folder positions
      ctx.fillStyle = "rgba(255, 230, 0, 0.04)";
      everOpenedFolders.forEach((folder, idx) => {
        drawShorelineBlob(
          folder.position.x + 32,
          folder.position.y + 26,
          20,
          idx * 100 + 500,
        );
      });

      // Draw tubes between ALL pairs of folders (complex web)
      if (openFolders.length > 1) {
        ctx.strokeStyle = "rgba(255, 230, 0, 0.06)";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";

        for (let i = 0; i < openFolders.length; i++) {
          for (let j = i + 1; j < openFolders.length; j++) {
            const a = openFolders[i];
            const b = openFolders[j];
            drawOrganicTube(
              a.position.x + 32,
              a.position.y + 26,
              b.position.x + 32,
              b.position.y + 26,
              (i + j) * 300,
            );
          }
        }
      }

      // Draw straight yellow lines between ALL pairs (complex web)
      if (openFolders.length > 1) {
        ctx.strokeStyle = "rgba(255, 230, 0, 0.5)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        for (let i = 0; i < openFolders.length; i++) {
          for (let j = i + 1; j < openFolders.length; j++) {
            const a = openFolders[i];
            const b = openFolders[j];
            ctx.beginPath();
            ctx.moveTo(a.position.x + 32, a.position.y + 26);
            ctx.lineTo(b.position.x + 32, b.position.y + 26);
            ctx.stroke();
          }
        }
      }

      // Draw blobs at open folder positions
      ctx.fillStyle = "rgba(255, 230, 0, 0.08)";
      openFolders.forEach((folder, idx) => {
        drawShorelineBlob(
          folder.position.x + 32,
          folder.position.y + 26,
          30,
          idx * 100,
        );
      });

      // Draw subtle tendrils reaching toward nearest closed folder
      // (visual anticipation of the next opening)
      const slowTime = time * 0.0003;
      ctx.fillStyle = "rgba(255, 230, 0, 0.03)";
      openFolders.forEach((folder, idx) => {
        const reachX = folder.position.x + 32 + Math.sin(slowTime + idx) * 20;
        const reachY =
          folder.position.y + 26 + Math.cos(slowTime * 0.7 + idx) * 20;
        drawShorelineBlob(reachX, reachY, 15, idx * 200 + 50);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [openFolders, everOpenedFolders, dimensions]);

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
