"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Candle {
  id: number;
  x: number;
  landed: boolean;
}

export default function CandlesPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);
  const nextId = useRef(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access required");
      setHasPermission(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    startCamera();

    return () => {
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const spawnCandle = useCallback(() => {
    const id = nextId.current++;
    const x = Math.random() * 90 + 5; // 5% to 95% horizontal
    setCandles((prev) => [...prev, { id, x, landed: false }]);
  }, []);

  const handleLanded = useCallback((id: number) => {
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, landed: true } : c)),
    );
  }, []);

  // Spawn a candle every 5 seconds once camera is active
  useEffect(() => {
    if (!hasPermission) return;

    const interval = setInterval(spawnCandle, 5000);
    return () => clearInterval(interval);
  }, [hasPermission, spawnCandle]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-white text-xl font-mono">{error}</p>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-yellow text-black font-mono text-lg hover:bg-white transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Candles layer */}
          <div className="absolute inset-0 pointer-events-none">
            {candles.map((candle) => (
              <CandleDrop
                key={candle.id}
                x={candle.x}
                landed={candle.landed}
                onLanded={() => handleLanded(candle.id)}
              />
            ))}

            {/* Warm glow at bottom as candles land */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: "15vh",
                background: `linear-gradient(to top, rgba(255, 180, 80, ${Math.min(0.6, candles.filter((c) => c.landed).length * 0.08)}), transparent)`,
                transition: "background 1s ease",
              }}
            />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes candle-fall {
          0% {
            top: -50px;
          }
          100% {
            top: calc(100vh - 50px);
          }
        }
      `}</style>
    </div>
  );
}

function CandleDrop({
  x,
  landed,
  onLanded,
}: {
  x: number;
  landed: boolean;
  onLanded: () => void;
}) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (landed) return;

    const el = ref.current;
    if (!el) return;

    const handleEnd = () => {
      onLanded();
    };

    el.addEventListener("animationend", handleEnd);
    return () => el.removeEventListener("animationend", handleEnd);
  }, [landed, onLanded]);

  return (
    <img
      ref={ref}
      src="/content/candle.png"
      alt=""
      style={{
        position: "absolute",
        left: `${x}%`,
        height: "50px",
        width: "auto",
        filter: "grayscale(100%) brightness(1.3) contrast(1.1)",
        opacity: 0.85,
        transform: "translateX(-50%)",
        ...(landed
          ? { top: "calc(100vh - 50px)", animation: "none" }
          : { animation: "candle-fall 3s linear forwards" }),
      }}
    />
  );
}
