'use client';

import { useState, useEffect, useRef } from 'react';

// IRON: Video on left, heartbeat monitor on right, images below

export default function Modal1Content() {
  const [currentImage, setCurrentImage] = useState(1);
  const [heartRate, setHeartRate] = useState(80);
  const [isStuck, setIsStuck] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartbeatRef = useRef<number[]>([]);
  
  // Load available images from public/iron/
  useEffect(() => {
    // Try to load images 1-20 (adjust as needed)
    const loadImages = async () => {
      const foundImages: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const formats = ['jpg', 'jpeg', 'png', 'webp'];
        for (const format of formats) {
          const path = `/iron/${i}.${format}`;
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

  // Heartbeat animation - random between 60-120, sometimes stuck
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to get stuck
      if (Math.random() < 0.05) {
        setIsStuck(true);
        setTimeout(() => setIsStuck(false), 1000 + Math.random() * 2000);
      }
      
      if (!isStuck) {
        // Random fluctuation
        setHeartRate(prev => {
          const change = (Math.random() - 0.5) * 20;
          const newRate = prev + change;
          return Math.max(60, Math.min(120, newRate));
        });
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isStuck]);

  // Draw heartbeat monitor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initialize heartbeat data
    if (heartbeatRef.current.length === 0) {
      heartbeatRef.current = new Array(200).fill(0.5);
    }
    
    let animationFrame: number;
    let time = 0;
    
    const animate = () => {
      time += 0.05;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate heartbeat waveform
      const beatFreq = heartRate / 60; // Beats per second
      const beatPhase = (time * beatFreq) % 1;
      
      // Push new value
      let value = 0.5;
      if (beatPhase < 0.1) {
        // P wave
        value = 0.5 + Math.sin(beatPhase * Math.PI * 10) * 0.1;
      } else if (beatPhase > 0.15 && beatPhase < 0.25) {
        // QRS complex
        const qrsPhase = (beatPhase - 0.15) / 0.1;
        if (qrsPhase < 0.3) value = 0.5 - qrsPhase * 0.3;
        else if (qrsPhase < 0.5) value = 0.35 + (qrsPhase - 0.3) * 3;
        else if (qrsPhase < 0.7) value = 0.95 - (qrsPhase - 0.5) * 2.5;
        else value = 0.45 + (qrsPhase - 0.7) * 0.17;
      } else if (beatPhase > 0.3 && beatPhase < 0.5) {
        // T wave
        const tPhase = (beatPhase - 0.3) / 0.2;
        value = 0.5 + Math.sin(tPhase * Math.PI) * 0.15;
      }
      
      // Add noise when stuck
      if (isStuck) {
        value = 0.5 + (Math.random() - 0.5) * 0.3;
      }
      
      heartbeatRef.current.push(value);
      heartbeatRef.current.shift();
      
      // Draw grid
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      // Draw heartbeat line
      ctx.strokeStyle = isStuck ? '#FF4444' : '#FFE600';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const data = heartbeatRef.current;
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * canvas.width;
        const y = (1 - data[i]) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw BPM text
      ctx.fillStyle = isStuck ? '#FF4444' : '#FFE600';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`${Math.round(heartRate)} BPM`, 10, 30);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrame);
  }, [heartRate, isStuck]);

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
      {/* Top section: Video left, Heartbeat right */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Video */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <video
            src="/iron/video.mp4"
            className="w-full h-full object-contain"
            controls
            autoPlay
            loop
            muted
          />
        </div>
        
        {/* Heartbeat Monitor */}
        <div className="w-80 bg-black rounded-lg overflow-hidden border border-gray-800">
          <canvas
            ref={canvasRef}
            width={320}
            height={200}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Bottom section: Image gallery */}
      <div className="h-48 bg-black rounded-lg border border-gray-800 flex items-center justify-center relative overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage - 1]}
              alt={`Iron ${currentImage}`}
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
            Drop images (1.jpg, 2.jpg, etc.) in public/iron/
          </div>
        )}
      </div>
    </div>
  );
}
