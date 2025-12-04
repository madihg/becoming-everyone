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
  vx: number;
  vy: number;
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
  const trailPointsRef = useRef<{x: number; y: number; opacity: number}[]>([]);
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
      vx: 0,
      vy: 0,
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

  // Handle target modal changes - start moving toward target
  useEffect(() => {
    if (targetModal && targetModal !== previousTargetRef.current) {
      const modal = modals.find(m => m.id === targetModal);
      if (modal && blobsRef.current.length > 0) {
        // Reset the reached flag
        hasReachedTargetRef.current = false;
        previousTargetRef.current = targetModal;
        
        // Create a new blob that will move toward the target
        const centerBlob = blobsRef.current[0];
        const targetX = modal.x * dimensions.width;
        const targetY = modal.y * dimensions.height;
        
        // Add moving blob
        const movingBlob: Blob = {
          x: centerBlob.x,
          y: centerBlob.y,
          radius: 40,
          vx: 0,
          vy: 0,
          phase: Math.random() * Math.PI * 2,
          isMoving: true,
          targetX,
          targetY,
        };
        
        blobsRef.current.push(movingBlob);
        
        // Clear trail points for new movement
        trailPointsRef.current = [];
      }
    }
  }, [targetModal, modals, dimensions]);

  // Check if blob has reached target
  const checkTargetReached = useCallback((blob: Blob) => {
    if (!blob.isMoving || blob.targetX === undefined || blob.targetY === undefined) return false;
    
    const dist = Math.sqrt(
      Math.pow(blob.x - blob.targetX, 2) + 
      Math.pow(blob.y - blob.targetY, 2)
    );
    
    return dist < 30; // Within 30px of target
  }, []);

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
      blobs.forEach((blob, index) => {
        if (blob.isMoving && blob.targetX !== undefined && blob.targetY !== undefined) {
          // Calculate direction to target
          const dx = blob.targetX - blob.x;
          const dy = blob.targetY - blob.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 5) {
            // Move toward target with organic wobble
            const speed = 2.5;
            const wobbleX = Math.sin(time * 0.003 + blob.phase) * 2;
            const wobbleY = Math.cos(time * 0.003 + blob.phase * 1.3) * 2;
            
            blob.x += (dx / dist) * speed + wobbleX * 0.3;
            blob.y += (dy / dist) * speed + wobbleY * 0.3;
            
            // Add trail point
            if (time % 50 < 16) {
              trailPointsRef.current.push({
                x: blob.x,
                y: blob.y,
                opacity: 0.6,
              });
              // Keep trail limited
              if (trailPointsRef.current.length > 100) {
                trailPointsRef.current.shift();
              }
            }
          }
          
          // Check if reached target
          if (checkTargetReached(blob) && !hasReachedTargetRef.current && targetModal) {
            hasReachedTargetRef.current = true;
            blob.isMoving = false;
            // Reveal the modal
            setTimeout(() => {
              onRevealModal(targetModal);
            }, 500);
          }
        }
        
        blob.phase += 0.02;
      });

      // Fade trail points
      trailPointsRef.current.forEach(point => {
        point.opacity *= 0.995;
      });
      trailPointsRef.current = trailPointsRef.current.filter(p => p.opacity > 0.05);

      // Draw trail
      trailPointsRef.current.forEach(point => {
        ctx.fillStyle = `rgba(255, 230, 0, ${point.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw organic connection from center to moving blobs
      blobs.slice(1).forEach(blob => {
        const dist = Math.sqrt(
          Math.pow(blob.x - centerBlob.x, 2) + 
          Math.pow(blob.y - centerBlob.y, 2)
        );
        
        if (dist > 30) {
          // Multiple bezier curves for organic feel
          const numCurves = 3;
          for (let i = 0; i < numCurves; i++) {
            const offset = (i - 1) * 15;
            const timeOffset = time * 0.001 + i * 0.5;
            
            const midX = (centerBlob.x + blob.x) / 2;
            const midY = (centerBlob.y + blob.y) / 2;
            const perpX = -(blob.y - centerBlob.y) / dist;
            const perpY = (blob.x - centerBlob.x) / dist;
            const wobble = Math.sin(timeOffset) * 20 + offset;
            
            const ctrlX = midX + perpX * wobble;
            const ctrlY = midY + perpY * wobble;

            const alpha = 0.4 - i * 0.1;
            ctx.strokeStyle = `rgba(255, 230, 0, ${alpha})`;
            ctx.lineWidth = 6 - i * 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(centerBlob.x, centerBlob.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, blob.x, blob.y);
            ctx.stroke();
          }
        }
      });

      // Draw blobs
      blobs.forEach(blob => {
        const pulse = Math.sin(blob.phase) * 0.1 + 1;
        const displayRadius = Math.max(1, blob.radius * pulse);

        // Draw blob glow
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, Math.max(1, displayRadius * 2)
        );
        gradient.addColorStop(0, 'rgba(255, 230, 0, 0.9)');
        gradient.addColorStop(0.4, 'rgba(255, 230, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, Math.max(1, displayRadius * 2), 0, Math.PI * 2);
        ctx.fill();

        // Draw blob core
        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, Math.max(1, displayRadius * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw modal dots (grey pulsating)
      modals.forEach(modal => {
        const x = modal.x * canvas.width;
        const y = modal.y * canvas.height;
        const isRevealed = revealedModals.includes(modal.id);
        const isTarget = modal.id === targetModal;

        // Unique pulse phase per dot
        const basePulse = Math.sin(time * 0.002 + modal.x * 10 + modal.y * 10) * 0.15 + 0.85;
        const pulse = isTarget ? basePulse * 1.3 : basePulse;
        const radius = 6 * pulse;

        // Draw dot glow
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, Math.max(1, radius * 3)
        );
        
        if (isRevealed) {
          gradient.addColorStop(0, 'rgba(255, 230, 0, 0.6)');
          gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
        } else if (isTarget) {
          gradient.addColorStop(0, 'rgba(255, 230, 0, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(150, 150, 150, 0.5)');
          gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, radius * 3), 0, Math.PI * 2);
        ctx.fill();

        // Draw dot core
        if (isRevealed) {
          ctx.fillStyle = '#FFE600';
        } else if (isTarget) {
          ctx.fillStyle = 'rgba(255, 230, 0, 0.7)';
        } else {
          ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
        }
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
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
