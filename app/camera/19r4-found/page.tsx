"use client";

import { useEffect, useRef, useState } from "react";

export default function Camera19R4Found() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

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

  const tickerText =
    "BREAKING NEWS • NEW BEIRUT 2046 • OMAR [LAST NAME] FOUND IN NORTH NEW BEIRUT • [SIGNAL GLITCH] FOUND WANTING • [SIGNAL GLITCH] FOUND BLOOMING • [SIGNAL GLITCH] FOUND GUILTY • [SIGNAL GLITCH] FOUND RISING • BEGGING FOR A DANCE • SHAKING LEGS LIKE A LOCUST • RAISING AN ARMY • IN THIS STORY GOD DOES NOT SHOW UP AT THE END • ME MATE ME MATE • ";

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
          {/* Camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Breaking news banner */}
          <div className="absolute top-0 left-0 right-0 bg-red-600 py-2 px-4 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white text-red-600 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider">
                Breaking News
              </div>
              <div className="text-white font-mono text-xs uppercase tracking-wide">
                NEW BEIRUT 2046 • OMAR [LAST NAME] FOUND
              </div>
            </div>
          </div>

          {/* Scrolling ticker at bottom with glitch effect */}
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 py-2 overflow-hidden z-10">
            <div className="ticker-wrapper">
              <div className="ticker-content font-mono text-white text-sm uppercase tracking-wide whitespace-nowrap">
                {tickerText}
                {tickerText}
                {tickerText}
              </div>
            </div>
          </div>

          <style jsx>{`
            .ticker-wrapper {
              width: 100%;
              overflow: hidden;
            }
            .ticker-content {
              display: inline-block;
              animation: scroll-left 100s linear infinite;
            }
            @keyframes scroll-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-33.333%);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
