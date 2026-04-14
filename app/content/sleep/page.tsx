"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SLEEP_SCRIPT } from "@/lib/sleep-script";

export default function SleepPage() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const advanceLine = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= SLEEP_SCRIPT.length) return prev;
      return next;
    });
  }, []);

  // When currentIndex changes, animate the new line in
  useEffect(() => {
    if (currentIndex < 0) return;
    // Small delay before making visible (so it mounts at opacity 0 first)
    const t = setTimeout(() => {
      setVisibleLines((prev) => [...prev, currentIndex]);
    }, 50);
    return () => clearTimeout(t);
  }, [currentIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || currentIndex < 0 || currentIndex >= SLEEP_SCRIPT.length)
      return;

    const line = SLEEP_SCRIPT[currentIndex];
    const extraDelay = line.isStanzaBreak ? 1500 : 0;

    timerRef.current = setTimeout(() => {
      advanceLine();
    }, line.duration + extraDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, advanceLine]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!startedRef.current) {
          startedRef.current = true;
          setCurrentIndex(0);
        } else {
          setIsPaused((prev) => !prev);
        }
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        if (!startedRef.current) {
          startedRef.current = true;
          setCurrentIndex(0);
        } else {
          advanceLine();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceLine]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      {currentIndex < 0 && (
        <div className="text-text-muted text-sm font-mono animate-pulse">
          Rest
        </div>
      )}

      {currentIndex >= 0 && (
        <div className="max-w-3xl w-full h-full relative px-16">
          {/* Lines container - positioned so current line is at center */}
          <div
            ref={containerRef}
            className="absolute left-16 right-16 transition-transform duration-1000 ease-out"
            style={{
              top: "50%",
              transform: `translateY(-${currentIndex * 3.2}rem)`,
            }}
          >
            {SLEEP_SCRIPT.slice(0, currentIndex + 1).map((line, idx) => {
              const isVisible = visibleLines.includes(idx);
              const isCurrent = idx === currentIndex;
              const age = currentIndex - idx;
              const opacity = isCurrent ? 1 : Math.max(0.1, 1 - age * 0.1);

              return (
                <div
                  key={idx}
                  className="py-2"
                  style={{
                    opacity: isVisible ? opacity : 0,
                    transition: "opacity 1.5s ease-in-out",
                  }}
                >
                  <p
                    className={`font-mono text-center leading-relaxed ${
                      line.isQuote ? "italic text-white/90" : "text-white"
                    }`}
                    style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)" }}
                  >
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPaused && (
        <div className="fixed bottom-8 text-text-muted text-xs font-mono">
          PAUSED - press space to resume
        </div>
      )}
    </div>
  );
}
