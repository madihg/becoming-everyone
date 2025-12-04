'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onComplete: (targetModalId: string) => void;
}

interface SyncData {
  timestamp: number;
  hands: number;
  confidence: number;
  syncId: string;
}

export default function Module1({ expanded, onExpand, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const isCompleteRef = useRef(false);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handCount, setHandCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [syncLogs, setSyncLogs] = useState<SyncData[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{ modalId: string; modalNum: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Generate random sync ID
  const generateSyncId = () => {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
  };

  // Calculate weighted random modal selection
  const calculateTargetModal = useCallback((count: number): { modalId: string; modalNum: number } => {
    const effectiveCount = Math.max(1, count);
    const maxModal = Math.min(effectiveCount, 8);
    const modalNum = Math.floor(Math.random() * maxModal) + 1;
    return { modalId: `modal${modalNum}`, modalNum };
  }, []);

  // Draw grayscale video and hand landmarks
  const drawToCanvas = useCallback((video: HTMLVideoElement, landmarks: any[] | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame (grayscale)
    ctx.save();
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw hand landmarks if available
    if (landmarks && landmarks.length > 0) {
      landmarks.forEach((handLandmarks: any[]) => {
        // Draw connections
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
        ctx.lineWidth = 2;
        
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20],
          [5, 9], [9, 13], [13, 17],
        ];

        connections.forEach(([start, end]) => {
          const startPoint = handLandmarks[start];
          const endPoint = handLandmarks[end];
          if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
          }
        });

        // Draw landmark points
        handLandmarks.forEach((landmark: any) => {
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    }
  }, []);

  // Start camera and hand detection
  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Video or canvas ref not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get camera stream
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      console.log('Camera access granted');
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            resolve();
          };
        }
      });
      
      await videoRef.current.play();
      console.log('Video playing');
      
      setIsActive(true);
      setIsLoading(false);

      // Store latest landmarks for drawing
      let latestLandmarks: any[] | null = null;

      // Start video draw loop IMMEDIATELY (don't wait for MediaPipe)
      const drawLoop = () => {
        if (videoRef.current && canvasRef.current && !isCompleteRef.current) {
          drawToCanvas(videoRef.current, latestLandmarks);
        }
        if (!isCompleteRef.current) {
          animationRef.current = requestAnimationFrame(drawLoop);
        }
      };
      drawLoop();

      // Load MediaPipe Hands in background
      console.log('Loading MediaPipe Hands...');
      try {
        const { Hands } = await import('@mediapipe/hands');
        
        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 10,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (isCompleteRef.current) return;
          
          const numHands = results.multiHandLandmarks?.length || 0;
          const avgConfidence = results.multiHandedness?.reduce(
            (sum: number, h: any) => sum + (h.score || 0), 0
          ) / Math.max(numHands, 1);

          setHandCount(numHands);
          setConfidence(avgConfidence || 0);
          
          // Update landmarks for draw loop
          latestLandmarks = results.multiHandLandmarks || null;

          // Add sync log
          setSyncLogs(prev => {
            const newLog: SyncData = {
              timestamp: Date.now(),
              hands: numHands,
              confidence: avgConfidence || 0,
              syncId: generateSyncId(),
            };
            return [...prev.slice(-15), newLog];
          });
        });

        handsRef.current = hands;
        console.log('MediaPipe Hands initialized');

        // Start detection loop (separate from draw loop)
        const detectLoop = async () => {
          if (videoRef.current && handsRef.current && !isCompleteRef.current) {
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (e) {
              // Silently handle detection errors
            }
          }
          if (!isCompleteRef.current) {
            setTimeout(detectLoop, 100); // Run detection at ~10fps to save CPU
          }
        };
        detectLoop();
        
      } catch (mpError) {
        console.warn('MediaPipe failed to load, continuing without hand detection:', mpError);
        // Video will still show, just no hand detection
      }
      
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(err.message || 'Failed to access camera');
      setIsLoading(false);
    }
  }, [drawToCanvas]);

  // Stop detection and cleanup
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isActive || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          isCompleteRef.current = true;
          setIsComplete(true);
          
          const targetResult = calculateTargetModal(handCount);
          setResult(targetResult);
          
          setTimeout(() => setShowExplanation(true), 500);
          
          setTimeout(() => {
            onComplete(targetResult.modalId);
          }, 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isComplete, handCount, calculateTargetModal, onComplete]);

  // Start detection when expanded
  useEffect(() => {
    if (expanded && !isActive && !isComplete && !isLoading) {
      startDetection();
    }
  }, [expanded, isActive, isComplete, isLoading, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  const progress = ((10 - timeLeft) / 10) * 100;

  return (
    <div className={`module-container ${expanded ? 'expanded' : ''}`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={!expanded ? onExpand : undefined}
      >
        <div className="text-gray-400 font-mono text-sm flex justify-between items-center">
          <span>Module 1 — raise your hands</span>
          {isActive && !isComplete && (
            <span className="text-[#FFE600]">{timeLeft}s</span>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 animate-expand">
            <div className="flex gap-4" style={{ minHeight: '300px' }}>
              {/* Left: Camera feed */}
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
                      <div className="animate-pulse">Initializing camera...</div>
                      <div className="text-xs mt-2 text-gray-500">Please allow camera access</div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black bg-opacity-70 p-4">
                    <div className="text-center">
                      <div>Camera error</div>
                      <div className="text-xs mt-2 text-gray-500">{error}</div>
                    </div>
                  </div>
                )}
                {!isActive && !isLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Click to start
                  </div>
                )}
              </div>

              {/* Right: Syncing panel */}
              <div className="w-64 bg-black bg-opacity-50 rounded p-4 font-mono text-sm overflow-hidden">
                {!isComplete ? (
                  <>
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      SYNCING
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-1 bg-gray-800 rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#FFE600] transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-gray-400">
                      <div className="flex justify-between">
                        <span>hands:</span>
                        <span className="text-gray-300">{handCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>confidence:</span>
                        <span className="text-gray-300">{confidence.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>sampling:</span>
                        <span className="text-gray-300">
                          {'█'.repeat(Math.min(handCount, 6))}{'░'.repeat(Math.max(0, 6 - handCount))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-gray-600 max-h-32 overflow-hidden">
                      {syncLogs.slice(-8).map((log, i) => (
                        <div key={log.timestamp + i} className="truncate animate-fade-in">
                          sync_{log.syncId.slice(0, 8)}... h:{log.hands}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      RESULT
                    </div>
                    
                    <div className="space-y-2 text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>total hands:</span>
                        <span className="text-[#FFE600]">{handCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>vector:</span>
                        <span className="text-[#FFE600]">{result?.modalId}</span>
                      </div>
                    </div>

                    {showExplanation && (
                      <div className="text-gray-500 text-xs leading-relaxed animate-fade-in border-t border-gray-700 pt-3">
                        The collective signal has been processed. 
                        The organism will now expand toward vector {result?.modalNum}...
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
