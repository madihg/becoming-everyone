'use client';

import { useEffect, useRef, useState } from 'react';
import type { ModalConfig } from '@/types';

interface Props {
  modals: ModalConfig[];
  revealedModals: string[];
  onRevealModal: (modalId: string) => void;
  onBecomeClick: (modalId: string) => void;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
}

export default function PhysarumVisualization({
  modals,
  revealedModals,
  onRevealModal,
  onBecomeClick,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const blobsRef = useRef<Blob[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

      // Update and draw blobs
      const blobs = blobsRef.current;
      blobs.forEach(blob => {
        blob.phase += 0.02;
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

        // Unique pulse phase per dot
        const pulse = Math.sin(time * 0.002 + modal.x * 10 + modal.y * 10) * 0.15 + 0.85;
        const radius = 6 * pulse;

        // Draw dot glow
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, Math.max(1, radius * 3)
        );
        
        if (isRevealed) {
          gradient.addColorStop(0, 'rgba(255, 230, 0, 0.6)');
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
        ctx.fillStyle = isRevealed ? '#FFE600' : 'rgba(150, 150, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between blobs
      if (blobs.length > 1) {
        const centerBlob = blobs[0];
        
        blobs.slice(1).forEach(blob => {
          const dist = Math.sqrt(
            Math.pow(blob.x - centerBlob.x, 2) + 
            Math.pow(blob.y - centerBlob.y, 2)
          );
          
          if (dist > 30) {
            // Control point for bezier curve
            const midX = (centerBlob.x + blob.x) / 2;
            const midY = (centerBlob.y + blob.y) / 2;
            const offset = Math.sin(time * 0.001) * 30;

            const gradient = ctx.createLinearGradient(
              centerBlob.x, centerBlob.y,
              blob.x, blob.y
            );
            gradient.addColorStop(0, 'rgba(255, 230, 0, 0.7)');
            gradient.addColorStop(0.5, 'rgba(255, 230, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 230, 0, 0.7)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(centerBlob.x, centerBlob.y);
            ctx.quadraticCurveTo(midX + offset, midY + offset, blob.x, blob.y);
            ctx.stroke();
          }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [modals, revealedModals, dimensions]);

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

