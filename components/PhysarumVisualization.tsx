'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ModalConfig } from '@/types';

interface Props {
  modals: ModalConfig[];
  revealedModals: string[];
  onRevealModal: (modalId: string) => void;
  onBecomeClick: (modalId: string) => void;
  targetModal: string | null;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  phase: number;
  isMoving: boolean;
  targetX?: number;
  targetY?: number;
}

export default function PhysarumVisualization({
  modals,
  revealedModals,
  onRevealModal,
  onBecomeClick,
  targetModal,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const blobsRef = useRef<Blob[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const hasReachedTargetRef = useRef(false);
  const previousTargetRef = useRef<string | null>(null);

  // Initialize central blob
  useEffect(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    blobsRef.current = [{
      x: centerX,
      y: centerY,
      radius: 80,
      phase: 0,
      isMoving: false,
    }];
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle target modal changes
  useEffect(() => {
    if (targetModal && targetModal !== previousTargetRef.current) {
      const modal = modals.find(m => m.id === targetModal);
      if (modal && blobsRef.current.length > 0) {
        hasReachedTargetRef.current = false;
        previousTargetRef.current = targetModal;
        
        const centerBlob = blobsRef.current[0];
        const targetX = modal.x * dimensions.width;
        const targetY = modal.y * dimensions.height;
        
        const movingBlob: Blob = {
          x: centerBlob.x,
          y: centerBlob.y,
          radius: 50,
          phase: Math.random() * Math.PI * 2,
          isMoving: true,
          targetX,
          targetY,
        };
        
        blobsRef.current.push(movingBlob);
      }
    }
  }, [targetModal, modals, dimensions]);

  // Check if blob reached target
  const checkTargetReached = useCallback((blob: Blob) => {
    if (!blob.isMoving || blob.targetX === undefined || blob.targetY === undefined) return false;
    const dist = Math.sqrt(Math.pow(blob.x - blob.targetX, 2) + Math.pow(blob.y - blob.targetY, 2));
    return dist < 30;
  }, []);

  // Draw shoreline blob (complex irregular edge like a coastline)
  const drawShorelineBlob = (ctx: CanvasRenderingContext2D, cx: number, cy: number, baseRadius: number, time: number, seed: number) => {
    ctx.fillStyle = '#FFE600';
    ctx.beginPath();
    
    const points = 60; // More points = more detail
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      
      // Multiple noise frequencies for shoreline effect
      const noise1 = Math.sin(angle * 8 + time * 0.5 + seed) * (baseRadius * 0.08);
      const noise2 = Math.sin(angle * 15 + time * 0.3 + seed * 2) * (baseRadius * 0.04);
      const noise3 = Math.sin(angle * 25 + time * 0.2 + seed * 3) * (baseRadius * 0.02);
      const noise4 = Math.sin(angle * 40 + seed * 5) * (baseRadius * 0.015); // High freq static detail
      
      // Slow organic pulsing
      const pulse = Math.sin(time * 0.02 + seed) * (baseRadius * 0.03);
      
      const radius = baseRadius + noise1 + noise2 + noise3 + noise4 + pulse;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
  };

  // Draw organic tube connection (like H: Cellular Tubes)
  const drawOrganicTube = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, time: number) => {
    ctx.strokeStyle = '#FFE600';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    // Multiple organic segments
    const segments = 12;
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + dx * t;
      // Organic wave motion
      const waveOffset = Math.sin(t * Math.PI * 3 + time * 0.002) * 20 * Math.sin(t * Math.PI);
      const y = y1 + dy * t + waveOffset;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      time += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const blobs = blobsRef.current;
      const centerBlob = blobs[0];

      // Update moving blobs
      blobs.forEach((blob) => {
        if (blob.isMoving && blob.targetX !== undefined && blob.targetY !== undefined) {
          const dx = blob.targetX - blob.x;
          const dy = blob.targetY - blob.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 5) {
            const speed = 2;
            blob.x += (dx / dist) * speed;
            blob.y += (dy / dist) * speed;
          }
          
          if (checkTargetReached(blob) && !hasReachedTargetRef.current && targetModal) {
            hasReachedTargetRef.current = true;
            blob.isMoving = false;
            setTimeout(() => onRevealModal(targetModal), 500);
          }
        }
        
        blob.phase += 0.015;
      });

      // Draw organic tube connections from center to other blobs
      blobs.slice(1).forEach((blob, index) => {
        drawOrganicTube(ctx, centerBlob.x, centerBlob.y, blob.x, blob.y, time + index * 1000);
      });

      // Draw blobs with shoreline edges
      blobs.forEach((blob, index) => {
        drawShorelineBlob(ctx, blob.x, blob.y, blob.radius, time, index * 100);
      });

      // Draw modal dots (grey pulsating)
      modals.forEach(modal => {
        const x = modal.x * canvas.width;
        const y = modal.y * canvas.height;
        const isRevealed = revealedModals.includes(modal.id);
        const isTarget = modal.id === targetModal;

        const basePulse = Math.sin(time * 0.002 + modal.x * 10 + modal.y * 10) * 0.15 + 0.85;
        const pulse = isTarget ? basePulse * 1.3 : basePulse;
        const radius = 8 * pulse;

        // Draw dot with shoreline edge
        ctx.fillStyle = isRevealed ? '#FFE600' : isTarget ? 'rgba(255, 230, 0, 0.8)' : 'rgba(120, 120, 120, 0.9)';
        ctx.beginPath();
        
        const dotPoints = 20;
        for (let i = 0; i <= dotPoints; i++) {
          const angle = (i / dotPoints) * Math.PI * 2;
          const noise = Math.sin(angle * 6 + time * 0.003 + modal.x * 100) * (radius * 0.15);
          const r = radius + noise;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [modals, revealedModals, dimensions, targetModal, onRevealModal, checkTargetReached]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />

      {/* Revealed modal labels with become buttons */}
      {modals.filter(m => revealedModals.includes(m.id)).map(modal => (
        <div
          key={modal.id}
          className="absolute flex flex-col items-center animate-fade-in"
          style={{
            left: `${modal.x * 100}%`,
            top: `${modal.y * 100}%`,
            transform: 'translate(-50%, -180%)',
            zIndex: 10,
          }}
        >
          <span className="text-sm font-mono text-gray-400 border border-gray-600 bg-black bg-opacity-90 px-3 py-1 rounded mb-2">
            {modal.name}
          </span>
          <button
            onClick={() => onBecomeClick(modal.id)}
            className="btn-become"
          >
            become
          </button>
        </div>
      ))}
    </>
  );
}
