"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  dialogue: string[];
}

type DistanceZone = "far" | "medium" | "close";

export default function OmarProximityTracker({ dialogue }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLoaded, setPoseLoaded] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [currentZone, setCurrentZone] = useState<DistanceZone>("far");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const poseLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

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
        console.error("BlazePose failed:", err);
        setPoseError("Body tracking unavailable");
      }
    }
    initPose();

    return () => {
      poseLandmarkerRef.current?.close();
    };
  }, []);

  // Calculate distance zone from bounding box
  const calculateZone = useCallback(
    (landmarks: Array<{ x: number; y: number; z: number }>) => {
      const xs = landmarks.map((l) => l.x);
      const ys = landmarks.map((l) => l.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      const boxArea = width * height;

      if (boxArea > 0.5) return "close" as DistanceZone;
      if (boxArea > 0.2) return "medium" as DistanceZone;
      return "far" as DistanceZone;
    },
    [],
  );

  // Dialogue advancement - show each sentence every 2 seconds
  useEffect(() => {
    if (!poseLoaded) return;

    const interval = setInterval(() => {
      setDialogueIndex((prev) => {
        if (prev < dialogue.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [poseLoaded, dialogue.length]);

  // Render loop - visual effects based on zone
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

      // Clear canvas
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pose detection
      let zone: DistanceZone = "far";
      let landmarks: Array<{ x: number; y: number; z: number }> | undefined;

      if (poseLandmarkerRef.current && poseLoaded) {
        try {
          const results = poseLandmarkerRef.current.detectForVideo(
            video,
            performance.now(),
          );

          if (results.landmarks && results.landmarks.length > 0) {
            const detectedLandmarks = results.landmarks[0];
            landmarks = detectedLandmarks;
            zone = calculateZone(detectedLandmarks);
            setCurrentZone(zone);
          }
        } catch {
          // Silently handle detection errors
        }
      }

      // Visual rendering based on zone
      if (landmarks) {
        if (zone === "far") {
          // Abstract blue blob with soft edges
          drawBlueBlob(ctx, landmarks, canvas.width, canvas.height);
        } else if (zone === "medium") {
          // Blurry B&W video with blue tint
          drawBlurryVideo(ctx, video, canvas.width, canvas.height);
        } else {
          // Clear blue silhouette outline
          drawBlueSilhouette(ctx, landmarks, canvas.width, canvas.height);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [poseLoaded, calculateZone]);

  // Draw abstract blue blob (far)
  function drawBlueBlob(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number }>,
    w: number,
    h: number,
  ) {
    // Find center of mass
    const centerX =
      landmarks.reduce((sum, l) => sum + l.x, 0) / landmarks.length;
    const centerY =
      landmarks.reduce((sum, l) => sum + l.y, 0) / landmarks.length;

    // Radial gradient centered on body
    const gradient = ctx.createRadialGradient(
      centerX * w,
      centerY * h,
      50,
      centerX * w,
      centerY * h,
      200,
    );
    gradient.addColorStop(0, "rgba(100, 150, 255, 0.6)");
    gradient.addColorStop(0.5, "rgba(100, 150, 255, 0.3)");
    gradient.addColorStop(1, "rgba(100, 150, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // Draw blurry B&W video with blue tint (medium)
  function drawBlurryVideo(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    w: number,
    h: number,
  ) {
    // Draw grayscale video
    ctx.filter = "grayscale(100%) blur(8px)";
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = "none";

    // Blue tint overlay
    ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
    ctx.fillRect(0, 0, w, h);
  }

  // Draw clear blue silhouette outline (close)
  function drawBlueSilhouette(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number }>,
    w: number,
    h: number,
  ) {
    // Draw grayscale video
    ctx.filter = "grayscale(100%)";
    ctx.drawImage(videoRef.current!, 0, 0, w, h);
    ctx.filter = "none";

    // Draw blue outline around body
    ctx.strokeStyle = "#6496ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#6496ff";
    ctx.shadowBlur = 10;

    // Connect key landmarks to form outline
    const outline = [0, 1, 2, 3, 7, 8, 11, 12, 23, 24, 25, 26, 27, 28];
    ctx.beginPath();
    outline.forEach((idx, i) => {
      if (landmarks[idx]) {
        const x = landmarks[idx].x * w;
        const y = landmarks[idx].y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-mono relative">
      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas for visual rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Dialogue overlay */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <p className="text-white text-3xl text-center max-w-2xl px-8 leading-relaxed">
          {dialogue[dialogueIndex]}
        </p>
      </div>

      {/* Error/loading states */}
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
  );
}
