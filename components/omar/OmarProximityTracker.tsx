"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  dialogue: string[];
}

export default function OmarProximityTracker({ dialogue }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Initialize webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
  }, []);

  // Dialogue advancement - show each sentence every 2 seconds
  useEffect(() => {
    if (!cameraReady) return;

    const interval = setInterval(() => {
      setDialogueIndex((prev) => {
        if (prev < dialogue.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [cameraReady, dialogue.length]);

  // Render loop - B&W grainy video
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const w = canvas.width;
      const h = canvas.height;

      // Draw grayscale + high contrast video
      ctx.filter = "grayscale(100%) contrast(1.3)";
      ctx.drawImage(video, 0, 0, w, h);
      ctx.filter = "none";

      // Add film grain noise
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 60;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      // Slight vignette
      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        w * 0.3,
        w / 2,
        h / 2,
        w * 0.7,
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [cameraReady]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-mono relative">
      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas for visual rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-text-muted/50 text-sm">Starting camera...</span>
        </div>
      )}
    </div>
  );
}
