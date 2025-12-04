'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Extend Window for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onComplete: (targetModalId: string) => void;
}

export default function Module2({ expanded, onExpand, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const idleAnimationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const isCompleteRef = useRef(false);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accumulation, setAccumulation] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<{ modalId: string; modalNum: number; time: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const THRESHOLD = 100; // Accumulation threshold to reach
  const DECAY_RATE = 0.03; // Slow decay during silence

  // Calculate weighted modal selection based on time
  // Faster = higher modal numbers (more spread), Slower = lower (focused)
  const calculateTargetModal = useCallback((timeTaken: number): { modalId: string; modalNum: number } => {
    // Under 5 seconds = fast (modals 5-8)
    // 5-10 seconds = medium (modals 3-6)
    // Over 10 seconds = slow (modals 1-4)
    let minModal: number, maxModal: number;
    
    if (timeTaken < 5) {
      minModal = 5;
      maxModal = 8;
    } else if (timeTaken < 10) {
      minModal = 3;
      maxModal = 6;
    } else {
      minModal = 1;
      maxModal = 4;
    }
    
    const modalNum = Math.floor(Math.random() * (maxModal - minModal + 1)) + minModal;
    return { modalId: `modal${modalNum}`, modalNum };
  }, []);

  // Draw idle waveform (flat line with subtle animation)
  const drawIdleWaveform = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle animated flat line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFE600';
    ctx.beginPath();

    const centerY = canvas.height / 2;
    for (let x = 0; x < canvas.width; x++) {
      const wave = Math.sin(x * 0.02 + time * 0.002) * 5;
      if (x === 0) {
        ctx.moveTo(x, centerY + wave);
      } else {
        ctx.lineTo(x, centerY + wave);
      }
    }
    ctx.stroke();

    // Draw glow effect
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }, []);

  // Draw waveform visualization
  const drawWaveform = useCallback((analyser: AnalyserNode, dataArray: Uint8Array<ArrayBuffer>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteTimeDomainData(dataArray);

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFE600';
    ctx.beginPath();

    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw glow effect
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }, []);

  // Start audio capture
  const startAudio = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      
      console.log('Microphone access granted');
      streamRef.current = stream;

      // Create audio context and analyser
      // Use webkitAudioContext for older browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Resume audio context (required by Chrome's autoplay policy)
      // Chrome keeps AudioContext suspended until user interaction
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting resume...');
        await audioContext.resume();
        console.log('AudioContext resumed:', audioContext.state);
      }
      
      // Double-check it's running
      if (audioContext.state !== 'running') {
        console.warn('AudioContext not running, state:', audioContext.state);
        // Try resume again after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        await audioContext.resume();
      }
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Smaller for faster response
      analyser.smoothingTimeConstant = 0.5; // Less smoothing for more responsiveness

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const freqArray = new Uint8Array(bufferLength);

      console.log('Audio setup complete. Context state:', audioContext.state);
      console.log('Stream tracks:', stream.getAudioTracks().map(t => ({ enabled: t.enabled, muted: t.muted, readyState: t.readyState })));
      
      startTimeRef.current = Date.now();
      setIsActive(true);
      setIsLoading(false);

      let currentAccumulation = 0;
      let frameCount = 0;

      // Animation loop
      const animate = () => {
        if (isCompleteRef.current) return;

        frameCount++;

        // Get frequency data for volume
        analyser.getByteFrequencyData(freqArray);
        
        // Calculate RMS volume (more accurate than average)
        let sum = 0;
        let maxVal = 0;
        for (let i = 0; i < freqArray.length; i++) {
          sum += freqArray[i] * freqArray[i];
          if (freqArray[i] > maxVal) maxVal = freqArray[i];
        }
        const rms = Math.sqrt(sum / freqArray.length);
        const normalizedVolume = rms / 128; // 0-2 range roughly

        // Debug log every second
        if (frameCount % 60 === 0) {
          console.log('Audio debug:', { 
            rms: rms.toFixed(2), 
            maxVal, 
            normalizedVolume: normalizedVolume.toFixed(3),
            accumulation: currentAccumulation.toFixed(2),
            contextState: audioContext.state 
          });
        }

        setCurrentVolume(normalizedVolume);

        // Update accumulation - calibrated for ~3-5 second fill time
        // At 60fps, 200 frames = ~3 seconds
        const volumeContribution = normalizedVolume * 0.75; // 3x faster
        currentAccumulation += volumeContribution;
        currentAccumulation -= DECAY_RATE; // Gentle decay during silence
        currentAccumulation = Math.max(0, Math.min(currentAccumulation, THRESHOLD + 10));
        
        setAccumulation(currentAccumulation);

        // Update elapsed time
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);

        // Check if threshold reached
        if (currentAccumulation >= THRESHOLD && !isCompleteRef.current) {
          isCompleteRef.current = true;
          setIsComplete(true);
          
          const timeTaken = elapsed;
          const targetResult = { ...calculateTargetModal(timeTaken), time: timeTaken };
          setResult(targetResult);
          
          setTimeout(() => setShowExplanation(true), 500);
          
          setTimeout(() => {
            onComplete(targetResult.modalId);
          }, 3000);
          
          return;
        }

        // Draw waveform
        drawWaveform(analyser, dataArray);

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

    } catch (err: any) {
      console.error('Audio error:', err);
      setError(err.message || 'Failed to access microphone');
      setIsLoading(false);
    }
  }, [calculateTargetModal, drawWaveform, onComplete]);

  // Stop audio and cleanup
  const stopAudio = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  // Draw idle animation when expanded but not yet active
  useEffect(() => {
    if (expanded && !isActive && !isComplete) {
      let time = 0;
      let running = true;
      
      const idleAnimation = () => {
        if (!running) return;
        time += 16;
        drawIdleWaveform(time);
        idleAnimationRef.current = requestAnimationFrame(idleAnimation);
      };
      idleAnimation();
      
      return () => {
        running = false;
        if (idleAnimationRef.current) {
          cancelAnimationFrame(idleAnimationRef.current);
        }
      };
    }
  }, [expanded, isActive, isComplete, drawIdleWaveform]);

  // Start audio when expanded
  useEffect(() => {
    if (expanded && !isActive && !isComplete && !isLoading) {
      startAudio();
    }
  }, [expanded, isActive, isComplete, isLoading, startAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const progressPercent = Math.min((accumulation / THRESHOLD) * 100, 100);

  return (
    <div className={`module-container ${expanded ? 'expanded' : ''}`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={!expanded ? onExpand : undefined}
      >
        <div className="text-gray-400 font-mono text-sm flex justify-between items-center">
          <span>Module 2 — fill the vessel with sound</span>
          {isActive && !isComplete && (
            <span className="text-[#FFE600]">{elapsedTime.toFixed(1)}s</span>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 animate-expand">
            <div className="flex gap-4" style={{ minHeight: '300px' }}>
              {/* Left: Audio waveform */}
              <div className="flex-1 relative bg-black rounded overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={300}
                  className="w-full h-full"
                  style={{ filter: isComplete ? 'brightness(0.5)' : 'none' }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black bg-opacity-70">
                    <div className="text-center">
                      <div className="animate-pulse">Initializing audio...</div>
                      <div className="text-xs mt-2 text-gray-500">Please allow microphone access</div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black bg-opacity-70 p-4">
                    <div className="text-center">
                      <div>Microphone error</div>
                      <div className="text-xs mt-2 text-gray-500">{error}</div>
                    </div>
                  </div>
                )}
                {!isActive && !isLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Click to start
                  </div>
                )}
                
                {/* Volume indicator */}
                {isActive && !isComplete && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-2 bg-gray-800 rounded overflow-hidden">
                      <div 
                        className="h-full bg-[#FFE600] transition-all duration-75"
                        style={{ width: `${Math.min(currentVolume * 50, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">current volume</div>
                  </div>
                )}
              </div>

              {/* Right: Accumulation panel */}
              <div className="w-64 bg-black bg-opacity-50 rounded p-4 font-mono text-sm overflow-hidden">
                {!isComplete ? (
                  <>
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      ACCUMULATING
                    </div>
                    
                    {/* Vertical meter - glass filling with water */}
                    <div className="flex flex-col items-center mb-4">
                      {/* Threshold label */}
                      <div className="text-xs text-gray-500 mb-1">threshold</div>
                      
                      {/* Glass container */}
                      <div 
                        className="relative overflow-hidden rounded"
                        style={{ 
                          width: '80px', 
                          height: '150px',
                          border: '2px solid #4B5563',
                          backgroundColor: '#111'
                        }}
                      >
                        {/* Yellow fill - rises from bottom */}
                        <div 
                          style={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${progressPercent}%`,
                            backgroundColor: '#FFE600',
                            transition: 'height 0.1s linear'
                          }}
                        />
                        
                        {/* Percentage text overlay */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl"
                          style={{ 
                            color: progressPercent > 40 ? '#000' : '#FFE600',
                            textShadow: progressPercent > 40 ? 'none' : '0 0 10px rgba(255,230,0,0.5)'
                          }}
                        >
                          {Math.floor(progressPercent)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-gray-400 text-xs">
                      <div className="flex justify-between">
                        <span>accumulation:</span>
                        <span className="text-gray-300">{accumulation.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>target:</span>
                        <span className="text-gray-300">{THRESHOLD}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>elapsed:</span>
                        <span className="text-gray-300">{elapsedTime.toFixed(1)}s</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-gray-400 mb-3 border-b border-gray-700 pb-2">
                      RESULT
                    </div>
                    
                    <div className="space-y-2 text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>time taken:</span>
                        <span className="text-[#FFE600]">{result?.time.toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>vector:</span>
                        <span className="text-[#FFE600]">{result?.modalId}</span>
                      </div>
                    </div>

                    {showExplanation && (
                      <div className="text-gray-500 text-xs leading-relaxed animate-fade-in border-t border-gray-700 pt-3">
                        {result && result.time < 5 
                          ? "Rapid collective response detected. The organism surges toward a distant vector..."
                          : result && result.time < 10
                          ? "Steady accumulation complete. The organism extends toward a new territory..."
                          : "Patient gathering achieved. The organism creeps toward a nearby vector..."
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
