'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getPreloadedModel, preloadBodyModel } from '@/app/page';

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onComplete: (targetModalId: string) => void;
}

interface DetectedBody {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_STRIKES = 5;

export default function Module3({ expanded, onExpand, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const bodiesRef = useRef<DetectedBody[]>([]);
  const startTimeRef = useRef<number>(0);
  const gameStateRef = useRef({
    dotX: 0.5,
    dotY: -0.1,
    dotSpeed: 0.01,
    strikes: 0,
    lastHitTime: 0,
    isComplete: false
  });
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{ modalId: string; modalNum: number; time: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bodyCount, setBodyCount] = useState(0);
  const [strikes, setStrikes] = useState(0);

  // Calculate modal based on time to get 5 strikes
  const calculateTargetModal = useCallback((timeTaken: number): { modalId: string; modalNum: number } => {
    let minModal: number, maxModal: number;
    
    if (timeTaken < 10) {
      minModal = 1; maxModal = 2;
    } else if (timeTaken < 25) {
      minModal = 3; maxModal = 5;
    } else if (timeTaken < 45) {
      minModal = 5; maxModal = 7;
    } else {
      minModal = 7; maxModal = 8;
    }
    
    const modalNum = Math.floor(Math.random() * (maxModal - minModal + 1)) + minModal;
    return { modalId: `modal${modalNum}`, modalNum };
  }, []);

  // Reset dot to new random position
  const resetDot = useCallback(() => {
    const state = gameStateRef.current;
    state.dotX = Math.random() * 0.7 + 0.15;
    state.dotY = -0.1;
    state.dotSpeed = 0.008 + Math.random() * 0.006;
  }, []);

  // Check collision
  const checkCollision = useCallback((dotX: number, dotY: number, bodies: DetectedBody[], canvasWidth: number, canvasHeight: number): boolean => {
    const pixelX = dotX * canvasWidth;
    const pixelY = dotY * canvasHeight;

    for (const body of bodies) {
      // Mirror the body X position
      const mirroredX = canvasWidth - body.x - body.width;
      const padding = 15;
      
      if (
        pixelX > mirroredX - padding &&
        pixelX < mirroredX + body.width + padding &&
        pixelY > body.y - padding &&
        pixelY < body.y + body.height + padding
      ) {
        return true;
      }
    }
    return false;
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
    const state = gameStateRef.current;
    if (state.isComplete) return;
    
    state.isComplete = true;
    setIsComplete(true);
    
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const targetResult = { ...calculateTargetModal(timeTaken), time: timeTaken };
    setResult(targetResult);
    
    setTimeout(() => setShowExplanation(true), 500);
    setTimeout(() => onComplete(targetResult.modalId), 3000);
  }, [calculateTargetModal, onComplete]);

  // Start detection
  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    
    // Reset game state
    gameStateRef.current = {
      dotX: 0.5,
      dotY: -0.1,
      dotSpeed: 0.01,
      strikes: 0,
      lastHitTime: 0,
      isComplete: false
    };
    setStrikes(0);

    try {
      // Get camera
      setLoadingStatus('Accessing camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve();
        }
      });
      await videoRef.current.play();

      // Get model
      setLoadingStatus('Loading body detection...');
      let model = getPreloadedModel();
      if (!model) {
        model = await preloadBodyModel();
      }
      modelRef.current = model;

      setLoadingStatus('Ready!');
      resetDot();
      startTimeRef.current = Date.now();
      setIsActive(true);
      setIsLoading(false);

      // SEPARATE detection loop (runs independently, non-blocking)
      const runDetection = async () => {
        if (gameStateRef.current.isComplete) return;
        if (!videoRef.current || !modelRef.current) return;
        
        try {
          const predictions = await modelRef.current.detect(videoRef.current);
          bodiesRef.current = predictions
            .filter((p: any) => p.class === 'person' && p.score > 0.5)
            .map((p: any) => ({
              x: p.bbox[0],
              y: p.bbox[1],
              width: p.bbox[2],
              height: p.bbox[3]
            }));
          setBodyCount(bodiesRef.current.length);
        } catch (e) {
          console.warn('Detection error:', e);
        }
      };
      
      // Run detection every 150ms (separate from animation)
      detectionIntervalRef.current = setInterval(runDetection, 150);
      runDetection(); // Initial detection

      // ANIMATION loop (synchronous, smooth)
      const animate = () => {
        const state = gameStateRef.current;
        if (state.isComplete) return;
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const now = Date.now();

        // Draw video (mirrored, grayscale)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw body bounding boxes
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)';
        ctx.lineWidth = 2;
        bodiesRef.current.forEach(body => {
          const mirroredX = canvas.width - body.x - body.width;
          ctx.strokeRect(mirroredX, body.y, body.width, body.height);
        });

        // Update dot position
        state.dotY += state.dotSpeed;

        // Reset dot if it goes off bottom
        if (state.dotY > 1.15) {
          resetDot();
        }

        // Draw dot
        const dotPixelX = state.dotX * canvas.width;
        const dotPixelY = state.dotY * canvas.height;

        ctx.fillStyle = '#FF3333';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(dotPixelX, dotPixelY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dotPixelX, dotPixelY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Check collision (only if dot is on screen and cooldown passed)
        if (state.dotY > 0.05 && state.dotY < 0.95 && now - state.lastHitTime > 600) {
          if (checkCollision(state.dotX, state.dotY, bodiesRef.current, canvas.width, canvas.height)) {
            // HIT!
            state.strikes += 1;
            state.lastHitTime = now;
            setStrikes(state.strikes);
            
            console.log(`Strike ${state.strikes}/${MAX_STRIKES}`);
            
            // Flash effect
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(dotPixelX, dotPixelY, 60, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset dot
            resetDot();
            
            // Check game over
            if (state.strikes >= MAX_STRIKES) {
              ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              handleGameOver();
              return;
            }
          }
        }

        // Draw strike indicators on canvas
        for (let i = 0; i < MAX_STRIKES; i++) {
          const strikeX = canvas.width - 25 - (i * 22);
          ctx.beginPath();
          ctx.arc(strikeX, 25, 7, 0, Math.PI * 2);
          if (i < state.strikes) {
            ctx.fillStyle = '#FF3333';
            ctx.fill();
          } else {
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Update elapsed time
        setElapsedTime((now - startTimeRef.current) / 1000);

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err.message || 'Failed to start');
      setIsLoading(false);
    }
  }, [checkCollision, resetDot, handleGameOver]);

  // Cleanup
  const stopDetection = useCallback(() => {
    gameStateRef.current.isComplete = true;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Start when expanded
  useEffect(() => {
    if (expanded && !isActive && !isComplete && !isLoading) {
      startDetection();
    }
  }, [expanded, isActive, isComplete, isLoading, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return (
    <div className={`module-container ${expanded ? 'expanded' : ''}`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={!expanded ? onExpand : undefined}
      >
        <div className="text-gray-400 font-mono text-sm flex justify-between items-center">
          <span>Module 3 — dodge the signal</span>
          {isActive && !isComplete && (
            <span className="text-[#FFE600]">{strikes}/{MAX_STRIKES} strikes</span>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 animate-expand">
            <div className="flex gap-4" style={{ minHeight: '300px' }}>
              {/* Left: Camera with dot game */}
              <div className="flex-1 relative bg-black rounded overflow-hidden">
                <video
                  ref={videoRef}
                  className="hidden"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                  style={{ filter: isComplete ? 'brightness(0.5)' : 'none' }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black bg-opacity-70">
                    <div className="text-center">
                      <div className="animate-pulse">{loadingStatus}</div>
                      <div className="text-xs mt-2 text-gray-500">This may take a moment</div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black bg-opacity-70 p-4">
                    <div className="text-center">
                      <div>Error</div>
                      <div className="text-xs mt-2 text-gray-500">{error}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Status panel */}
              <div className="w-64 bg-black bg-opacity-50 rounded p-4 font-mono text-sm overflow-hidden">
                {!isComplete ? (
                  <>
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      EVADING
                    </div>
                    
                    <div className="space-y-3 text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#FFE600]">
                          {elapsedTime.toFixed(1)}s
                        </div>
                        <div className="text-xs text-gray-500 mt-1">elapsed time</div>
                      </div>
                      
                      {/* Strike counter */}
                      <div className="flex justify-center gap-2 my-4">
                        {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                          <div 
                            key={i}
                            className="w-4 h-4 rounded-full border-2"
                            style={{
                              backgroundColor: i < strikes ? '#FF3333' : 'transparent',
                              borderColor: i < strikes ? '#FF3333' : '#666'
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        {strikes}/{MAX_STRIKES} strikes
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span>bodies detected:</span>
                        <span className="text-gray-300">{bodyCount}</span>
                      </div>
                      
                      <div className="text-xs text-gray-600 mt-4 leading-relaxed">
                        Avoid the red signal. 5 strikes and you're out.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      5 STRIKES
                    </div>
                    
                    <div className="space-y-2 text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>total time:</span>
                        <span className="text-[#FFE600]">{result?.time.toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>vector:</span>
                        <span className="text-[#FFE600]">{result?.modalId}</span>
                      </div>
                    </div>

                    {showExplanation && (
                      <div className="text-gray-500 text-xs leading-relaxed animate-fade-in border-t border-gray-700 pt-3">
                        {result && result.time > 45 
                          ? "Exceptional evasion. The organism demonstrated remarkable collective awareness..."
                          : result && result.time > 25
                          ? "Solid coordination. The collective moved as one..."
                          : result && result.time > 10
                          ? "Brief resistance. The signals found their marks..."
                          : "Swift contact. The collective was quickly tagged..."
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
