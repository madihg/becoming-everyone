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
      }, 10000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Criss-cross line drawing animation
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

    // 10 lines crossing the viewport edge-to-edge
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const edge = i % 4;
      const t1 = (i * 0.13 + 0.1) % 1;
      const t2 = (i * 0.17 + 0.3) % 1;
      if (edge === 0) lines.push({ x1: t1 * w, y1: 0, x2: t2 * w, y2: h });
      else if (edge === 1) lines.push({ x1: w, y1: t1 * h, x2: 0, y2: t2 * h });
      else if (edge === 2) lines.push({ x1: t2 * w, y1: h, x2: t1 * w, y2: 0 });
      else lines.push({ x1: 0, y1: t2 * h, x2: w, y2: t1 * h });
    }

    const msPerLine = 700;
    let currentLine = 0;
    let lineProgress = 0;
    const startTime = performance.now();

    // Start fade-out after 7.5s
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 7500);

    const animate = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      currentLine = Math.min(Math.floor(elapsed / msPerLine), lines.length - 1);
      lineProgress = Math.min(
        (elapsed - currentLine * msPerLine) / msPerLine,
        1,
      );

      // Redraw all completed lines
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 230, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      for (let i = 0; i < currentLine; i++) {
        const l = lines[i];
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      }

      // Draw current line partially
      if (currentLine < lines.length) {
        const l = lines[currentLine];
        const ex = l.x1 + (l.x2 - l.x1) * lineProgress;
        const ey = l.y1 + (l.y2 - l.y1) * lineProgress;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        setDotPos({ x: ex, y: ey });
      }

      if (elapsed < lines.length * msPerLine) {
        patternRafRef.current = requestAnimationFrame(animate);
      }
    };

    const l0 = lines[0];
    setDotPos({ x: l0.x1, y: l0.y1 });
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
