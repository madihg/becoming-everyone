"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AutonomousCursor from "@/components/cursor/AutonomousCursor";
import FloatingMarkers from "@/components/markers/FloatingMarkers";
import { useMultiplayer } from "@/components/multiplayer/MultiplayerProvider";
import RemoteCursors from "@/components/multiplayer/RemoteCursors";

interface AdminAuthProps {
  children: React.ReactNode;
}

/** Renders `value` letter-by-letter flush before `one` (reads as e.g. everyone, anyone). */
function TypedBeforeOne({
  value,
  animateChars,
  className,
}: {
  value: string;
  animateChars: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline flex-nowrap ${className ?? ""}`}
    >
      {value.split("").map((char, i) => (
        <span
          key={`${i}-${char}`}
          className={`inline-block ${animateChars ? "admin-auth-char" : ""}`}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
      <span className="inline-block">one</span>
    </span>
  );
}

function drawOrganicLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  time: number,
) {
  const segments = 16;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const slowTime = time * 0.0004;

  // Fat organic tube overlay
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 230, 0, 0.06)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const envelope = Math.sin(t * Math.PI);
    const sway =
      Math.sin(t * Math.PI * 3 + slowTime) * 15 * envelope +
      Math.sin(t * Math.PI * 5 + slowTime * 1.3) * 8 * envelope;
    const px = x1 + dx * t + nx * sway;
    const py = y1 + dy * t + ny * sway;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Thin bright line
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 230, 0, 0.5)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const envelope = Math.sin(t * Math.PI);
    const sway =
      Math.sin(t * Math.PI * 3 + slowTime) * 15 * envelope +
      Math.sin(t * Math.PI * 5 + slowTime * 1.3) * 8 * envelope;
    const px = x1 + dx * t + nx * sway;
    const py = y1 + dy * t + ny * sway;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawGlowBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, "rgba(255, 230, 0, 0.15)");
  gradient.addColorStop(1, "rgba(255, 230, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [input, setInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "input" | "colorTransition" | "drawPattern" | "complete"
  >("input");
  const [fadeOut, setFadeOut] = useState(false);
  const [dotPos, setDotPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const patternCanvasRef = useRef<HTMLCanvasElement>(null);
  const patternRafRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sharedText, updateText } = useMultiplayer();
  const isRemoteUpdate = useRef(false);
  const hasMounted = useRef(false);

  // On mount, clear any stale server text so the cursor animation always replays
  useEffect(() => {
    updateText("");
    const timer = setTimeout(() => {
      hasMounted.current = true;
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync remote text updates to local state (skip stale initial sync)
  useEffect(() => {
    if (!hasMounted.current) return;
    if (sharedText && sharedText !== input && animationPhase === "input") {
      isRemoteUpdate.current = true;
      setInput(sharedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedText]);

  const handleAutoType = useCallback(
    (char: string) => {
      setInput((prev) => {
        const next = prev + char;
        updateText(next);
        return next;
      });
    },
    [updateText],
  );

  useEffect(() => {
    if (input.toLowerCase() === "every") {
      setAnimationPhase("colorTransition");

      setTimeout(() => {
        setAnimationPhase("drawPattern");
      }, 1200);

      setTimeout(() => {
        setAnimationPhase("complete");
        setIsAuthenticated(true);
      }, 6000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Physarum drawing animation
  useEffect(() => {
    if (animationPhase !== "drawPattern") return;

    const canvas = patternCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Generate waypoints spread across the viewport
    const waypoints: { x: number; y: number }[] = [];
    for (let i = 0; i < 9; i++) {
      waypoints.push({
        x: 100 + Math.random() * (w - 200),
        y: 100 + Math.random() * (h - 200),
      });
    }

    let dotX = w / 2;
    let dotY = h / 2;
    let targetIdx = 0;
    let prevSegX = dotX;
    let prevSegY = dotY;
    const startTime = performance.now();
    const reachedWaypoints: { x: number; y: number }[] = [];

    // Start fade-out after 3.8s of drawing
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3800);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const target = waypoints[targetIdx];

      // Lerp toward target
      dotX += (target.x - dotX) * 0.05;
      dotY += (target.y - dotY) * 0.05;

      // Draw organic line from last drawn segment to current dot
      const segDist = Math.hypot(dotX - prevSegX, dotY - prevSegY);
      if (segDist > 4) {
        drawOrganicLine(ctx, prevSegX, prevSegY, dotX, dotY, elapsed);
        prevSegX = dotX;
        prevSegY = dotY;
      }

      // Check arrival at waypoint
      if (Math.hypot(target.x - dotX, target.y - dotY) < 8) {
        if (!reachedWaypoints.some((p) => p.x === target.x)) {
          reachedWaypoints.push(target);
          drawGlowBlob(ctx, target.x, target.y, 20);
        }
        targetIdx = (targetIdx + 1) % waypoints.length;
      }

      setDotPos({ x: dotX, y: dotY });
      patternRafRef.current = requestAnimationFrame(animate);
    };

    setDotPos({ x: w / 2, y: h / 2 });
    patternRafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(patternRafRef.current);
      clearTimeout(fadeTimer);
    };
  }, [animationPhase]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 bg-bg flex items-center justify-center z-[9999] transition-opacity duration-[800ms]"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      {animationPhase === "input" && (
        <>
          <FloatingMarkers />
          <div className="text-center relative z-10">
            <p className="text-[32px] font-mono text-white leading-relaxed">
              <span className="select-none">
                I&apos;ve always wanted to become{"\u00a0"}
              </span>
              <span className="inline-flex items-baseline relative">
                <span className="inline-flex">
                  {input.split("").map((char, i) => (
                    <span
                      key={`${i}-${char}`}
                      className="inline-block admin-auth-char"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      {char === " " ? "\u00a0" : char}
                    </span>
                  ))}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    updateText(e.target.value);
                  }}
                  className="absolute left-0 top-0 bg-transparent border-0 outline-none text-transparent caret-white w-full"
                  style={{
                    width: `${Math.max(input.length * 0.6, 0.6)}em`,
                    font: "inherit",
                  }}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <span>one</span>
              </span>
            </p>
          </div>
          <RemoteCursors />
          <AutonomousCursor onType={handleAutoType} inputRef={inputRef} />
        </>
      )}

      {animationPhase === "colorTransition" && (
        <div
          className="text-center transition-all duration-[1200ms] ease-linear"
          style={{
            color: "#FFE600",
          }}
        >
          <p className="text-[32px] font-mono leading-relaxed flex flex-wrap justify-center items-baseline px-4">
            <span className="select-none">
              I&apos;ve always wanted to become{"\u00a0"}
            </span>
            <TypedBeforeOne
              value={input}
              animateChars={false}
              className="text-[#FFE600]"
            />
          </p>
        </div>
      )}

      {animationPhase === "drawPattern" && (
        <>
          {/* Text fades down during drawing */}
          <div
            className="text-center transition-opacity duration-[2000ms]"
            style={{ color: "#FFE600", opacity: 0.3 }}
          >
            <p className="text-[32px] font-mono leading-relaxed flex flex-wrap justify-center items-baseline px-4">
              <span className="select-none">
                I&apos;ve always wanted to become{"\u00a0"}
              </span>
              <TypedBeforeOne
                value={input}
                animateChars={false}
                className="text-[#FFE600]"
              />
            </p>
          </div>

          {/* Drawing canvas */}
          <canvas
            ref={patternCanvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
          />

          {/* Animated yellow dot */}
          <div
            className="fixed pointer-events-none z-[10001]"
            style={{
              left: dotPos.x,
              top: dotPos.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: 12,
                height: 12,
                background: "#FFE600",
                boxShadow: "0 0 12px 4px rgba(255, 230, 0, 0.5)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
