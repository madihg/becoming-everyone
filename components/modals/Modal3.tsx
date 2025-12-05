'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// MOVE: Camera + OpenAI choreographer + TTS + 45s timer

export default function Modal3Content() {
  const [isLoading, setIsLoading] = useState(true);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const lastCallRef = useRef<number>(0);
  const hasCalledRef = useRef(false);
  
  // Initialize camera and body detection
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await import('@tensorflow/tfjs-core');
        
        if (!mounted) return;
        
        modelRef.current = await cocoSsd.load();
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoading(false);
          detectLoop();
        }
      } catch (err: any) {
        console.error('Init error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Detection loop
  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;
    
    if (!video || !canvas || !model || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw mirrored grayscale video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    try {
      const predictions = await model.detect(video);
      const bodies = predictions.filter((p: any) => p.class === 'person');
      
      if (bodies.length > 0) {
        setBodyDetected(true);
        
        // Draw body outline
        const body = bodies[0];
        const [bx, by, bw, bh] = body.bbox;
        const mirroredX = canvas.width - bx - bw;
        
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 2;
        ctx.strokeRect(mirroredX, by, bw, bh);
        
        // Call choreographer if not already called or 45s passed
        const now = Date.now();
        if (!hasCalledRef.current || (now - lastCallRef.current > 45000 && !isSpeaking)) {
          hasCalledRef.current = true;
          lastCallRef.current = now;
          callChoreographer();
        }
      } else {
        setBodyDetected(false);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
    
    animationRef.current = requestAnimationFrame(detectLoop);
  }, [isSpeaking]);

  // Call OpenAI choreographer
  const callChoreographer = async () => {
    setIsSpeaking(true);
    setTimeUntilNext(null);
    
    try {
      const response = await fetch('/api/choreographer', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get instruction');
      }
      
      const data = await response.json();
      const instruction = data.instruction;
      
      setCurrentInstruction(instruction);
      
      // Use Web Speech API for TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(instruction);
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        utterance.volume = 1;
        
        utterance.onend = () => {
          setIsSpeaking(false);
          startTimer();
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          startTimer();
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // No TTS available, just show text
        setTimeout(() => {
          setIsSpeaking(false);
          startTimer();
        }, 5000);
      }
    } catch (err: any) {
      console.error('Choreographer error:', err);
      setError(err.message);
      setIsSpeaking(false);
      startTimer();
    }
  };

  // 45 second timer
  const startTimer = () => {
    let remaining = 45;
    setTimeUntilNext(remaining);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeUntilNext(remaining);
      
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeUntilNext(null);
      }
    }, 1000);
  };

  return (
    <div className="h-[70vh] flex flex-col gap-4">
      {/* Camera feed */}
      <div className="flex-1 bg-black rounded-lg border border-gray-800 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Loading camera & model...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm p-4">
            {error}
          </div>
        )}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        
        {/* Status indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${bodyDetected ? 'bg-[#FFE600]' : 'bg-gray-600'}`} />
          <span className="text-gray-400 text-sm font-mono">
            {bodyDetected ? 'BODY DETECTED' : 'SCANNING...'}
          </span>
        </div>
        
        {/* Timer */}
        {timeUntilNext !== null && (
          <div className="absolute top-4 right-4 text-gray-500 text-sm font-mono">
            Next instruction in {timeUntilNext}s
          </div>
        )}
      </div>
      
      {/* Instruction display */}
      <div className="h-48 bg-black rounded-lg border border-gray-800 p-6 overflow-auto">
        {currentInstruction ? (
          <div className="space-y-4">
            <div className={`text-lg font-mono leading-relaxed ${isSpeaking ? 'text-[#FFE600]' : 'text-gray-300'}`}>
              {currentInstruction}
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-2 text-[#FFE600] text-sm">
                <div className="w-2 h-2 bg-[#FFE600] rounded-full animate-pulse" />
                Speaking...
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-center h-full flex items-center justify-center">
            {isLoading ? 'Initializing...' : bodyDetected ? 'Preparing instruction...' : 'Position yourself in frame'}
          </div>
        )}
      </div>
    </div>
  );
}
