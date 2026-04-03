"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DANCE_SCRIPT, POSE_CONNECTIONS } from "@/lib/dance-script";
import type { DanceCommand } from "@/lib/dance-script";

export default function DancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [commandIndex, setCommandIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [poseLoaded, setPoseLoaded] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
  }, []);

  // Initialize BlazePose
  useEffect(() => {
    async function initPose() {
      try {
        const { PoseLandmarker, FilesetResolver } =
          await import("@mediapipe/tasks-vision");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        poseLandmarkerRef.current = landmarker;
        setPoseLoaded(true);
      } catch (err) {
        console.error("BlazePose failed, no fallback available:", err);
        setPoseError("Body tracking unavailable");
        // Still allow the interface to work without tracking
      }
    }
    initPose();

    return () => {
      poseLandmarkerRef.current?.close();
    };
  }, []);

  // Camera + skeleton render loop
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

      // Draw video in grayscale
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Pose detection + skeleton overlay
      if (poseLandmarkerRef.current && poseLoaded) {
        try {
          const results = poseLandmarkerRef.current.detectForVideo(
            video,
            performance.now(),
          );

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
          }
        } catch {
          // Silently handle detection errors during animation
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [poseLoaded]);

  // Draw skeleton with yellow bars
  function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number; z: number; visibility: number }>,
    w: number,
    h: number,
  ) {
    // Glow effect
    ctx.shadowColor = "#FFE600";
    ctx.shadowBlur = 6;

    // Connection bars
    ctx.strokeStyle = "#FFE600";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    POSE_CONNECTIONS.forEach(([start, end]) => {
      const a = landmarks[start];
      const b = landmarks[end];
      if (a && b && a.visibility > 0.3 && b.visibility > 0.3) {
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
    });

    // Keypoints
    ctx.fillStyle = "#FFE600";
    landmarks.forEach((lm) => {
      if (lm.visibility > 0.3) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.shadowBlur = 0;
  }

  // Typing animation
  const typeText = useCallback((text: string, onDone: () => void) => {
    setIsTyping(true);
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        onDone();
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Command sequencer
  const advanceCommand = useCallback(() => {
    setCommandIndex((prev) => {
      const next = prev + 1;
      if (next >= DANCE_SCRIPT.length) return prev;
      return next;
    });
  }, []);

  useEffect(() => {
    if (commandIndex < 0 || commandIndex >= DANCE_SCRIPT.length) return;

    const cmd = DANCE_SCRIPT[commandIndex];
    const cleanup = typeText(cmd.text, () => {
      if (cmd.duration) {
        timerRef.current = setTimeout(advanceCommand, cmd.duration);
      }
    });

    return () => {
      cleanup();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [commandIndex, typeText, advanceCommand]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (commandIndex < 0) {
          setCommandIndex(0);
        } else {
          advanceCommand();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandIndex, advanceCommand]);

  const currentCmd = commandIndex >= 0 ? DANCE_SCRIPT[commandIndex] : null;

  return (
    <div className="h-screen w-screen bg-black flex font-mono">
      {/* Camera view - 70% */}
      <div className="flex-[7] relative">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {poseError && (
          <div className="absolute top-4 left-4 text-text-muted/50 text-xs">
            {poseError}
          </div>
        )}

        {!poseLoaded && !poseError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-muted/50 text-sm">
              Loading body tracker...
            </span>
          </div>
        )}
      </div>

      {/* Command panel - 30% */}
      <div className="flex-[3] border-l border-folder-border flex flex-col">
        <div className="flex-1 p-6 flex flex-col justify-end overflow-hidden">
          {commandIndex < 0 ? (
            <div className="text-text-muted/40 text-sm">
              Press space to begin
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show history of commands */}
              {DANCE_SCRIPT.slice(0, commandIndex).map((cmd, idx) => (
                <p
                  key={idx}
                  className={`text-text-muted/30 ${
                    cmd.type === "feedback" ? "text-sm" : "text-base"
                  }`}
                >
                  {cmd.text}
                </p>
              ))}

              {/* Current command */}
              {currentCmd && (
                <p
                  className={`transition-all duration-300 ${
                    currentCmd.type === "intro"
                      ? "text-2xl text-white font-bold"
                      : currentCmd.type === "feedback"
                        ? "text-lg text-yellow"
                        : "text-xl text-white leading-relaxed"
                  }`}
                >
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-[2px] h-[1em] bg-yellow ml-1 animate-pulse" />
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
