'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// SPEAK: Speech-to-text word capture, list 10 words, then instruction

export default function Modal4Content() {
  const [words, setWords] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  
  // Initialize speech recognition
  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can change or make multi-language
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript = transcript;
        }
      }
      
      setCurrentTranscript(interimTranscript);
      
      if (finalTranscript) {
        // Extract individual words
        const newWords = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
        
        setWords(prev => {
          const updated = [...prev, ...newWords];
          if (updated.length >= 10) {
            // Stop at 10 words
            recognition.stop();
            setIsListening(false);
            setIsComplete(true);
            return updated.slice(0, 10);
          }
          return updated;
        });
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`Recognition error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      // Restart if not complete and was listening
      if (!isComplete && isListening) {
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isComplete, isListening]);

  // Initialize audio visualizer
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        drawVisualizer();
      } catch (err: any) {
        console.error('Audio error:', err);
        setError('Microphone access denied');
      }
    };
    
    initAudio();
  }, []);

  // Draw audio visualizer
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw waveform
    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
      
      // Gradient from yellow to orange
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, isListening ? '#FFE600' : '#666');
      gradient.addColorStop(1, isListening ? '#FF9500' : '#333');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }
    
    // Draw current transcript
    if (currentTranscript && isListening) {
      ctx.fillStyle = 'rgba(255, 230, 0, 0.8)';
      ctx.font = '16px monospace';
      ctx.fillText(currentTranscript, 10, 30);
    }
    
    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, [isListening, currentTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isComplete) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="h-[70vh] flex gap-4">
      {/* Left: Audio visualization */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-black rounded-lg border border-gray-800 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-full"
          />
          
          {/* Status */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-gray-400 text-sm font-mono">
              {isListening ? 'LISTENING' : isComplete ? 'COMPLETE' : 'READY'}
            </span>
          </div>
          
          {error && (
            <div className="absolute top-4 left-4 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Controls */}
        {!isComplete && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`py-3 rounded-lg font-mono text-sm transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-[#FFE600] hover:bg-yellow-400 text-black'
            }`}
          >
            {isListening ? 'STOP' : 'START LISTENING'}
          </button>
        )}
      </div>
      
      {/* Right: Word list */}
      <div className="w-64 bg-black rounded-lg border border-gray-800 p-4 flex flex-col">
        <div className="text-gray-400 text-sm font-mono mb-4 border-b border-gray-800 pb-2">
          CAPTURED WORDS ({words.length}/10)
        </div>
        
        <div className="flex-1 overflow-auto">
          {words.map((word, i) => (
            <div 
              key={i}
              className="text-[#FFE600] font-mono text-lg mb-2 animate-fade-in"
            >
              {i + 1}. {word}
            </div>
          ))}
        </div>
        
        {/* Instruction after 10 words */}
        {isComplete && (
          <div className="mt-4 p-4 border border-[#FFE600] rounded-lg animate-fade-in">
            <div className="text-[#FFE600] font-mono text-sm mb-2">INSTRUCTION:</div>
            <div className="text-gray-300 text-lg leading-relaxed">
              Now, speak with all these words.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
