'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// SLEEPER: Images at top, camera with candles around detected body at bottom

export default function Modal2Content() {
  const [currentImage, setCurrentImage] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candlePositions, setCandlePositions] = useState<{x: number; y: number; flicker: number}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const animationRef = useRef<number>();
  
  // Load images from public/sleeper/
  useEffect(() => {
    const loadImages = async () => {
      const foundImages: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const formats = ['jpg', 'jpeg', 'png', 'webp'];
        for (const format of formats) {
          const path = `/sleeper/${i}.${format}`;
          try {
            const res = await fetch(path, { method: 'HEAD' });
            if (res.ok) {
              foundImages.push(path);
              break;
            }
          } catch {
            // Continue
          }
        }
      }
      setImages(foundImages);
    };
    loadImages();
  }, []);

  // Initialize camera and body detection
  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      try {
        // Load COCO-SSD model
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await import('@tensorflow/tfjs-core');
        
        if (!mounted) return;
        
        modelRef.current = await cocoSsd.load();
        
        // Get camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoading(false);
          
          // Start detection loop
          detectBodies();
        }
      } catch (err) {
        console.error('Camera/model error:', err);
        setIsLoading(false);
      }
    };
    
    initCamera();
    
    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Body detection and candle placement
  const detectBodies = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;
    
    if (!video || !canvas || !model || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectBodies);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw mirrored video (grayscale)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Detect bodies
    try {
      const predictions = await model.detect(video);
      const bodies = predictions.filter((p: any) => p.class === 'person');
      
      if (bodies.length > 0) {
        const body = bodies[0];
        const [bx, by, bw, bh] = body.bbox;
        
        // Mirror the x coordinate
        const mirroredX = canvas.width - bx - bw;
        
        // Place candles around body: head, feet, left side, right side
        const newCandles = [
          // Head (top center)
          { x: mirroredX + bw / 2, y: by - 20, flicker: Math.random() },
          // Left of head
          { x: mirroredX - 20, y: by + 30, flicker: Math.random() },
          // Right of head
          { x: mirroredX + bw + 20, y: by + 30, flicker: Math.random() },
          // Left side middle
          { x: mirroredX - 30, y: by + bh / 2, flicker: Math.random() },
          // Right side middle
          { x: mirroredX + bw + 30, y: by + bh / 2, flicker: Math.random() },
          // Left foot
          { x: mirroredX + bw * 0.3, y: by + bh + 20, flicker: Math.random() },
          // Right foot
          { x: mirroredX + bw * 0.7, y: by + bh + 20, flicker: Math.random() },
          // Extra around body
          { x: mirroredX - 15, y: by + bh * 0.3, flicker: Math.random() },
          { x: mirroredX + bw + 15, y: by + bh * 0.7, flicker: Math.random() },
        ];
        
        setCandlePositions(newCandles);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
    
    // Draw candles
    const time = Date.now() * 0.003;
    candlePositions.forEach((candle, i) => {
      // Flicker effect
      const flicker = Math.sin(time + candle.flicker * 10) * 0.3 + 0.7;
      const size = 8 + Math.sin(time * 2 + i) * 2;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(
        candle.x, candle.y, 0,
        candle.x, candle.y, size * 4
      );
      gradient.addColorStop(0, `rgba(255, 200, 100, ${0.6 * flicker})`);
      gradient.addColorStop(0.3, `rgba(255, 150, 50, ${0.3 * flicker})`);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(candle.x, candle.y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Core light
      ctx.fillStyle = `rgba(255, 255, 200, ${flicker})`;
      ctx.beginPath();
      ctx.arc(candle.x, candle.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    animationRef.current = requestAnimationFrame(detectBodies);
  }, [candlePositions]);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImage(prev => prev >= images.length ? 1 : prev + 1);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImage(prev => prev <= 1 ? images.length : prev - 1);
    }
  };

  return (
    <div className="h-[70vh] flex flex-col gap-4">
      {/* Top: Image gallery */}
      <div className="h-48 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage - 1]}
              alt={`Sleeper ${currentImage}`}
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFE600] text-3xl"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFE600] text-3xl"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-sm font-mono">
              {currentImage} / {images.length}
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-sm">
            Drop images (1.jpg, 2.jpg, etc.) in public/sleeper/
          </div>
        )}
      </div>
      
      {/* Bottom: Camera with candle lights */}
      <div className="flex-1 bg-black rounded-lg border border-gray-800 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Loading camera...
          </div>
        )}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        <div className="absolute bottom-2 left-2 text-gray-600 text-xs font-mono">
          {candlePositions.length > 0 ? `${candlePositions.length} lights around body` : 'Waiting for body...'}
        </div>
      </div>
    </div>
  );
}
