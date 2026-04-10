"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  /** Called once per character when the cursor starts typing */
  onType: (char: string) => void;
  /** Reference to the input element so the cursor can animate toward it */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** How long the cursor drifts before typing (ms) */
  wanderDuration?: number;
}

export default function AutonomousCursor({
  onType,
  inputRef,
  wanderDuration = 15000,
}: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"wander" | "approach" | "type" | "done">(
    "wander",
  );
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wanderRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  // Initialize at a random position
  useEffect(() => {
    const padding = 100;
    setPos({
      x: padding + Math.random() * (window.innerWidth - padding * 2),
      y: padding + Math.random() * (window.innerHeight - padding * 2),
    });
    setVisible(true);
    startTimeRef.current = Date.now();
  }, []);

  // Random wandering movement
  const pickNewWaypoint = useCallback(() => {
    if (phaseRef.current !== "wander") return;
    const padding = 80;
    setPos({
      x: padding + Math.random() * (window.innerWidth - padding * 2),
      y: padding + Math.random() * (window.innerHeight - padding * 2),
    });
    const delay = 1500 + Math.random() * 2000;
    wanderRef.current = setTimeout(pickNewWaypoint, delay);
  }, []);

  useEffect(() => {
    if (phase === "wander") {
      const delay = 800 + Math.random() * 1200;
      wanderRef.current = setTimeout(pickNewWaypoint, delay);
      return () => {
        if (wanderRef.current) clearTimeout(wanderRef.current);
      };
    }
  }, [phase, pickNewWaypoint]);

  // Timer to transition from wander to approach
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (phaseRef.current === "wander") {
        setPhase("approach");
      }
    }, wanderDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [wanderDuration]);

  // Spacebar skips wander phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && phaseRef.current === "wander") {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        if (wanderRef.current) clearTimeout(wanderRef.current);
        setPhase("approach");
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Approach the input field
  useEffect(() => {
    if (phase !== "approach") return;
    if (wanderRef.current) clearTimeout(wanderRef.current);

    const el = inputRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // After the CSS transition completes (~1s), start typing
    const timeout = setTimeout(() => {
      setPhase("type");
    }, 1200);
    return () => clearTimeout(timeout);
  }, [phase, inputRef]);

  // Type "every" character by character
  useEffect(() => {
    if (phase !== "type") return;
    const word = "every";
    let i = 0;

    const typeNext = () => {
      if (i >= word.length) {
        setPhase("done");
        return;
      }
      onType(word[i]);
      i++;
      setTimeout(typeNext, 250 + Math.random() * 150);
    };

    // Brief pause before first character
    const timeout = setTimeout(typeNext, 400);
    return () => clearTimeout(timeout);
  }, [phase, onType]);

  // Hide when done
  if (phase === "done" || !visible) return null;

  const transitionDuration =
    phase === "wander" ? "2.5s" : phase === "approach" ? "1s" : "0.1s";

  return (
    <div
      className="fixed pointer-events-none z-[10000]"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        transition: `left ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1), top ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: 12,
          height: 12,
          background: "#FFE600",
          boxShadow: "0 0 10px 3px rgba(255, 230, 0, 0.5)",
        }}
      />
    </div>
  );
}
