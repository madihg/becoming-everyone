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
    "input" | "colorTransition" | "pixelDissolve" | "complete"
  >("input");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sharedText, updateText } = useMultiplayer();
  const isRemoteUpdate = useRef(false);

  // Sync remote text updates to local state
  useEffect(() => {
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
        setAnimationPhase("pixelDissolve");
        startPixelDissolve();
      }, 2500);

      setTimeout(() => {
        setAnimationPhase("complete");
        setIsAuthenticated(true);
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const startPixelDissolve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const text = `i've always wanted to become ${input}one`;
    const fontSize = 32;
    ctx.font = `${fontSize}px "Diatype Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const x = canvas.width / 2 - textWidth / 2;
    const y = canvas.height / 2 - textHeight / 2;

    const pixelSize = 4;
    const pixels: { x: number; y: number; delay: number }[] = [];

    for (let py = y; py < y + textHeight + 20; py += pixelSize) {
      for (let px = x - 20; px < x + textWidth + 20; px += pixelSize) {
        pixels.push({
          x: px,
          y: py,
          delay: Math.random() * 2000,
        });
      }
    }

    const startTime = Date.now();
    const duration = 2500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pixels.forEach((pixel) => {
        const pixelElapsed = elapsed - pixel.delay;
        if (pixelElapsed < 0) {
          ctx.fillStyle = "#FFE600";
          ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
        } else if (pixelElapsed < duration - pixel.delay) {
          const opacity = 1 - pixelElapsed / (duration - pixel.delay);
          ctx.fillStyle = `rgba(255, 230, 0, ${opacity})`;
          ctx.fillRect(
            pixel.x + Math.random() * 2 - 1,
            pixel.y + Math.random() * 2 - 1,
            pixelSize,
            pixelSize,
          );
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center z-[9999]">
      {animationPhase === "input" && (
        <>
          <FloatingMarkers />
          <div className="text-center relative z-10">
            <p className="text-[32px] font-mono text-white leading-relaxed">
              <span className="select-none">
                i&apos;ve always wanted to become{"\u00a0"}
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
          className="text-center transition-all duration-[2500ms] ease-linear"
          style={{
            color: "#FFE600",
          }}
        >
          <p className="text-[32px] font-mono leading-relaxed flex flex-wrap justify-center items-baseline px-4">
            <span className="select-none">
              i&apos;ve always wanted to become{"\u00a0"}
            </span>
            <TypedBeforeOne
              value={input}
              animateChars={false}
              className="text-[#FFE600]"
            />
          </p>
        </div>
      )}

      {animationPhase === "pixelDissolve" && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
