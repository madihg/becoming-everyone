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

interface DodgeDot {
  x: number;
  y: number;
  speed: number;
  active: boolean;
}

const MAX_STRIKES = 5;

export default function Module3({ expanded, onExpand, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const dotRef = useRef<DodgeDot>({ x: 0.5, y: -0.1, speed: 0.012, active: true });
  const bodiesRef = useRef<DetectedBody[]>([]);
  const startTimeRef = useRef<number>(0);
  const isCompleteRef = useRef(false);
  const strikesRef = useRef(0);
  const lastHitTimeRef = useRef(0);
  
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
    // Longer time = higher modal numbers (they evaded well)
    // < 10 seconds = modals 1-2 (got hit fast)
    // 10-25 seconds = modals 3-5 
    // 25-45 seconds = modals 5-7
    // > 45 seconds = modals 7-8 (great evasion)
    let minModal: number, maxModal: number;
    
    if (timeTaken < 10) {
      minModal = 1;
      maxModal = 2;
    } else if (timeTaken < 25) {
      minModal = 3;
      maxModal = 5;
    } else if (timeTaken < 45) {
      minModal = 5;
      maxModal = 7;
    } else {
      minModal = 7;
      maxModal = 8;
    }
    
    const modalNum = Math.floor(Math.random() * (maxModal - minModal + 1)) + minModal;
    return { modalId: `modal${modalNum}`, modalNum };
  }, []);

  // Check if dot collides with any body
  const checkCollision = useCallback((dot: DodgeDot, bodies: DetectedBody[], canvasWidth: number, canvasHeight: number): boolean => {
    const dotX = dot.x * canvasWidth;
    const dotY = dot.y * canvasHeight;
    const dotRadius = 15;

    for (const body of bodies) {
      const padding = 10;
      if (
        dotX > body.x - padding &&
        dotX < body.x + body.width + padding &&
        dotY > body.y - padding &&
        dotY < body.y + body.height + padding
      ) {
        return true;
      }
    }
    return false;
  }, []);

  // Reset dot to new random position at top
  const resetDot = useCallback((): DodgeDot => {
    return {
      x: Math.random() * 0.7 + 0.15, // Random X (15%-85%)
      y: -0.05, // Start just above screen
      speed: 0.008 + Math.random() * 0.006, // Varying speed
      active: true
    };
  }, []);

  // Start detection
  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    strikesRef.current = 0;
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

      // Try to get preloaded model, or load it
      setLoadingStatus('Loading body detection...');
      let model = getPreloadedModel();
      if (!model) {
        model = await preloadBodyModel();
      }
      modelRef.current = model;

      setLoadingStatus('Ready!');
      
      // Initialize dot
      dotRef.current = resetDot();

      startTimeRef.current = Date.now();
      setIsActive(true);
      setIsLoading(false);

      // Animation and detection loop
      const animate = async () => {
        if (isCompleteRef.current || !videoRef.current || !canvasRef.current || !modelRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Detect bodies (throttled - not every frame)
        const now = Date.now();
        if (now - lastHitTimeRef.current > 100) { // Detect every 100ms
          try {
            const predictions = await modelRef.current.detect(videoRef.current);
            const bodies: DetectedBody[] = predictions
              .filter((p: any) => p.class === 'person' && p.score > 0.5)
              .map((p: any) => ({
                x: p.bbox[0],
                y: p.bbox[1],
                width: p.bbox[2],
                height: p.bbox[3]
              }));
            
            bodiesRef.current = bodies;
            setBodyCount(bodies.length);
          } catch (e) {
            // Continue even if detection fails
          }
        }

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

        // Update dot position - always falling down
        const dot = dotRef.current;
        dot.y += dot.speed;

        // Check if dot went off bottom of screen - reset it
        if (dot.y > 1.1) {
          dotRef.current = resetDot();
        }

        // Draw dot
        const dotX = dot.x * canvas.width;
        const dotY = dot.y * canvas.height;

        ctx.fillStyle = '#FF3333';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Check collision (with mirrored body positions)
        const mirroredBodies = bodiesRef.current.map(body => ({
          ...body,
          x: canvas.width - body.x - body.width
        }));
        
        // Only check collision if dot is on screen and enough time since last hit
        if (dot.y > 0 && dot.y < 1 && now - lastHitTimeRef.current > 500) {
          if (checkCollision(dot, mirroredBodies, canvas.width, canvas.height)) {
            // HIT! Add a strike
            strikesRef.current += 1;
            setStrikes(strikesRef.current);
            lastHitTimeRef.current = now;
            
            // Flash effect at hit location
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 50, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset dot to new position
            dotRef.current = resetDot();
            
            // Check if game over (5 strikes)
            if (strikesRef.current >= MAX_STRIKES) {
              isCompleteRef.current = true;
              setIsComplete(true);
              
              const timeTaken = (Date.now() - startTimeRef.current) / 1000;
              const targetResult = { ...calculateTargetModal(timeTaken), time: timeTaken };
              setResult(targetResult);
              
              // Full screen flash
              ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              setTimeout(() => setShowExplanation(true), 500);
              setTimeout(() => onComplete(targetResult.modalId), 3000);
              
              return;
            }
          }
        }

        // Draw strike indicators
        const strikeY = 30;
        for (let i = 0; i < MAX_STRIKES; i++) {
          const strikeX = canvas.width - 30 - (i * 25);
          ctx.beginPath();
          ctx.arc(strikeX, strikeY, 8, 0, Math.PI * 2);
          if (i < strikesRef.current) {
            ctx.fillStyle = '#FF3333';
            ctx.fill();
          } else {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Update elapsed time
        setElapsedTime((Date.now() - startTimeRef.current) / 1000);

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err.message || 'Failed to start');
      setIsLoading(false);
    }
  }, [calculateTargetModal, checkCollision, resetDot, onComplete]);

  // Cleanup
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
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
