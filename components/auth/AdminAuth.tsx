"use client";

import { useState, useEffect, useRef } from "react";

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [input, setInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "input" | "colorTransition" | "pixelDissolve" | "complete"
  >("input");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (input.toLowerCase() === "every") {
      // Start color transition
      setAnimationPhase("colorTransition");

      // After 2.5s, start pixel dissolve
      setTimeout(() => {
        setAnimationPhase("pixelDissolve");
        startPixelDissolve();
      }, 2500);

      // After 5s total, complete
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

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const text = `i've always wanted to be ${input}one`;
    const fontSize = 32;
    ctx.font = `${fontSize}px "Diatype Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Get text dimensions
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const x = canvas.width / 2 - textWidth / 2;
    const y = canvas.height / 2 - textHeight / 2;

    // Create pixel grid
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
          // Not started yet - draw normal
          ctx.fillStyle = "#FFE600";
          ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
        } else if (pixelElapsed < duration - pixel.delay) {
          // Dissolving - random static
          const opacity = 1 - pixelElapsed / (duration - pixel.delay);
          ctx.fillStyle = `rgba(255, 230, 0, ${opacity})`;
          ctx.fillRect(
            pixel.x + Math.random() * 2 - 1,
            pixel.y + Math.random() * 2 - 1,
            pixelSize,
            pixelSize,
          );
        }
        // Else: fully dissolved - don't draw
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
        <div className="text-center">
          <p className="text-[32px] font-mono text-white leading-relaxed">
            i&apos;ve always wanted to be{" "}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white caret-white inline"
              style={{ width: `${Math.max(input.length, 1) * 19}px` }}
              autoFocus
            />
            one
          </p>
        </div>
      )}

      {animationPhase === "colorTransition" && (
        <div
          className="text-center transition-all duration-[2500ms] ease-linear"
          style={{
            color: "#FFE600",
          }}
        >
          <p className="text-[32px] font-mono leading-relaxed">
            i&apos;ve always wanted to be {input}one
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
