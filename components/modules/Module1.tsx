'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';

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
  const handsRef = useRef<Hands | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [isActive, setIsActive] = useState(false);
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
    const effectiveCount = Math.max(1, count); // At least 1
    const maxModal = Math.min(effectiveCount, 8);
    const modalNum = Math.floor(Math.random() * maxModal) + 1;
    return { modalId: `modal${modalNum}`, modalNum };
  }, []);

  // Start camera and hand detection
  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 10,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: Results) => {
        if (isComplete) return;
        
        const numHands = results.multiHandLandmarks?.length || 0;
        const avgConfidence = results.multiHandedness?.reduce(
          (sum, h) => sum + (h.score || 0), 0
        ) / Math.max(numHands, 1);

        setHandCount(numHands);
        setConfidence(avgConfidence || 0);

        // Add sync log
        setSyncLogs(prev => {
          const newLog: SyncData = {
            timestamp: Date.now(),
            hands: numHands,
            confidence: avgConfidence || 0,
            syncId: generateSyncId(),
          };
          return [...prev.slice(-15), newLog]; // Keep last 15 entries
        });

        // Draw to canvas
        drawToCanvas(results);
      });

      handsRef.current = hands;
      setIsActive(true);

      // Start detection loop
      const detectFrame = async () => {
        if (videoRef.current && handsRef.current && !isComplete) {
          await handsRef.current.send({ image: videoRef.current });
        }
        if (!isComplete) {
          animationRef.current = requestAnimationFrame(detectFrame);
        }
      };

      // Wait for video to be ready
      videoRef.current.onloadeddata = () => {
        detectFrame();
      };
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }, [isComplete]);

  // Draw grayscale video and hand landmarks
  const drawToCanvas = (results: Results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame (grayscale)
    ctx.save();
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw hand landmarks
    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks) => {
        // Draw connections
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
        ctx.lineWidth = 2;
        
        // Simplified connections for hands
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17], // Palm
        ];

        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          ctx.beginPath();
          ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
          ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
          ctx.stroke();
        });

        // Draw landmark points
        landmarks.forEach((landmark) => {
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
  };

  // Stop detection and cleanup
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (handsRef.current) {
      handsRef.current.close();
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isActive || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Complete!
          setIsComplete(true);
          const targetResult = calculateTargetModal(handCount);
          setResult(targetResult);
          
          // Show explanation after a moment
          setTimeout(() => setShowExplanation(true), 500);
          
          // Trigger slime movement after explanation
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
    if (expanded && !isActive && !isComplete) {
      startDetection();
    }
  }, [expanded, isActive, isComplete, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  // Progress bar percentage
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
            {/* Main content area - two columns */}
            <div className="flex gap-4" style={{ minHeight: '300px' }}>
              {/* Left: Camera feed */}
              <div className="flex-1 relative bg-black rounded overflow-hidden">
                <video
                  ref={videoRef}
                  className="hidden"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                  style={{ filter: isComplete ? 'brightness(0.5)' : 'none' }}
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Initializing camera...
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
                    
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-1 bg-gray-800 rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#FFE600] transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Live stats */}
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

                    {/* Scrolling sync logs */}
                    <div className="mt-4 space-y-1 text-xs text-gray-600 max-h-32 overflow-hidden">
                      {syncLogs.slice(-8).map((log, i) => (
                        <div key={log.timestamp + i} className="truncate animate-fade-in">
                          sync_{log.syncId.slice(0, 8)}... h:{log.hands}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Result panel */
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
