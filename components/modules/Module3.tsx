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
const PAUSE_DURATION = 2000; // 2 seconds pause at top

export default function Module3({ expanded, onExpand, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bodiesRef = useRef<DetectedBody[]>([]);
  const startTimeRef = useRef<number>(0);
  
  // Game state - all in one ref to avoid stale closures
  const gameRef = useRef({
    dotX: 0.5,
    dotY: -0.1,
    dotSpeed: 0.01,
    strikes: 0,
    lastHitTime: 0,
    isComplete: false,
    isPaused: true,
    pauseStartTime: 0
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

  // Calculate modal based on time
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

  // Spawn new dot at random X position, paused at top
  const spawnNewDot = useCallback(() => {
    const game = gameRef.current;
    game.dotX = Math.random() * 0.7 + 0.15; // 15% to 85%
    game.dotY = 0.02; // Just below top
    game.dotSpeed = 0.006 + Math.random() * 0.004; // Random speed
    game.isPaused = true;
    game.pauseStartTime = Date.now();
    console.log('New dot spawned at X:', game.dotX.toFixed(2), '- pausing for 2 seconds');
  }, []);

  // Start the game
  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    
    // Reset everything
    gameRef.current = {
      dotX: 0.5,
      dotY: 0.02,
      dotSpeed: 0.008,
      strikes: 0,
      lastHitTime: 0,
      isComplete: false,
      isPaused: true,
      pauseStartTime: Date.now()
    };
    setStrikes(0);
    setIsComplete(false);

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
      startTimeRef.current = Date.now();
      gameRef.current.pauseStartTime = Date.now();
      setIsActive(true);
      setIsLoading(false);

      console.log('Game started! First dot pausing...');

      // Body detection interval (separate from animation)
      detectionIntervalRef.current = setInterval(async () => {
        if (gameRef.current.isComplete) return;
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
          // Ignore detection errors
        }
      }, 150);

      // Animation loop
      const animate = () => {
        const game = gameRef.current;
        
        // Check if game is over
        if (game.isComplete) {
          console.log('Game complete, stopping animation');
          return;
        }
        
        if (!canvasRef.current || !videoRef.current) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const now = Date.now();

        // Draw video (mirrored, grayscale)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw body boxes
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)';
        ctx.lineWidth = 2;
        bodiesRef.current.forEach(body => {
          const mirroredX = canvas.width - body.x - body.width;
          ctx.strokeRect(mirroredX, body.y, body.width, body.height);
        });

        // Handle dot pause
        if (game.isPaused) {
          if (now - game.pauseStartTime >= PAUSE_DURATION) {
            game.isPaused = false;
            console.log('Dot dropping!');
          }
        } else {
          // Move dot DOWN only
          game.dotY += game.dotSpeed;
        }

        // Draw dot
        const dotPixelX = game.dotX * canvas.width;
        const dotPixelY = game.dotY * canvas.height;

        // Pulsing effect while paused
        const dotSize = game.isPaused ? 12 + Math.sin(now * 0.01) * 3 : 12;

        ctx.fillStyle = '#FF3333';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(dotPixelX, dotPixelY, dotSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dotPixelX, dotPixelY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Check collision (only when dot is moving and on screen)
        if (!game.isPaused && game.dotY > 0.1 && game.dotY < 0.95) {
          const hitCooldown = now - game.lastHitTime > 500;
          
          if (hitCooldown) {
            // Check against mirrored body positions
            for (const body of bodiesRef.current) {
              const mirroredX = canvas.width - body.x - body.width;
              const padding = 15;
              
              if (
                dotPixelX > mirroredX - padding &&
                dotPixelX < mirroredX + body.width + padding &&
                dotPixelY > body.y - padding &&
                dotPixelY < body.y + body.height + padding
              ) {
                // HIT!
                game.strikes += 1;
                game.lastHitTime = now;
                setStrikes(game.strikes);
                
                console.log(`>>> STRIKE ${game.strikes}/${MAX_STRIKES} <<<`);
                
                // Flash effect
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(dotPixelX, dotPixelY, 60, 0, Math.PI * 2);
                ctx.fill();
                
                // Check if game over
                if (game.strikes >= MAX_STRIKES) {
                  console.log('GAME OVER - 5 strikes!');
                  game.isComplete = true;
                  setIsComplete(true);
                  
                  const timeTaken = (now - startTimeRef.current) / 1000;
                  const targetResult = { ...calculateTargetModal(timeTaken), time: timeTaken };
                  setResult(targetResult);
                  
                  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  
                  setTimeout(() => setShowExplanation(true), 500);
                  setTimeout(() => onComplete(targetResult.modalId), 3000);
                  return; // Stop animation
                }
                
                // Spawn new dot (not game over yet)
                spawnNewDot();
                break; // Exit collision loop
              }
            }
          }
        }

        // If dot went off bottom without hitting anyone, spawn new one
        if (game.dotY > 1.1) {
          console.log('Dot missed, spawning new one');
          spawnNewDot();
        }

        // Draw strike indicators
        for (let i = 0; i < MAX_STRIKES; i++) {
          const strikeX = canvas.width - 25 - (i * 22);
          ctx.beginPath();
          ctx.arc(strikeX, 25, 7, 0, Math.PI * 2);
          if (i < game.strikes) {
            ctx.fillStyle = '#FF3333';
            ctx.fill();
          } else {
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Update UI
        setElapsedTime((now - startTimeRef.current) / 1000);

        // Continue animation
        animationRef.current = requestAnimationFrame(animate);
      };

      // Start animation
      animationRef.current = requestAnimationFrame(animate);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to start');
      setIsLoading(false);
    }
  }, [calculateTargetModal, spawnNewDot, onComplete]);

  // Cleanup
  const stopDetection = useCallback(() => {
    console.log('Stopping detection...');
    gameRef.current.isComplete = true;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
              {/* Left: Camera */}
              <div className="flex-1 relative bg-black rounded overflow-hidden">
                <video ref={videoRef} className="hidden" playsInline muted autoPlay />
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
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black bg-opacity-70">
                    <div>{error}</div>
                  </div>
                )}
              </div>

              {/* Right: Status */}
              <div className="w-64 bg-black bg-opacity-50 rounded p-4 font-mono text-sm">
                {!isComplete ? (
                  <>
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">EVADING</div>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-[#FFE600]">{elapsedTime.toFixed(1)}s</div>
                    </div>
                    <div className="flex justify-center gap-2 mb-2">
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
                    <div className="text-center text-xs text-gray-500 mb-4">{strikes}/{MAX_STRIKES} strikes</div>
                    <div className="text-xs text-gray-500">Bodies: {bodyCount}</div>
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">5 STRIKES</div>
                    <div className="space-y-2 text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>time:</span>
                        <span className="text-[#FFE600]">{result?.time.toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>vector:</span>
                        <span className="text-[#FFE600]">{result?.modalId}</span>
                      </div>
                    </div>
                    {showExplanation && (
                      <div className="text-gray-500 text-xs leading-relaxed border-t border-gray-700 pt-3">
                        {result && result.time > 30 
                          ? "Exceptional evasion..."
                          : result && result.time > 15
                          ? "Solid coordination..."
                          : "Swift contact..."
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
