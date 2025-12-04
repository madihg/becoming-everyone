'use client';

import { useEffect, useRef } from 'react';

export default function EffectsDemo() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <h1 className="text-2xl font-mono text-[#FFE600] mb-8 text-center">
        Organic Slime Effects — Choose Your Style
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Effect A: Metaball/Gooey */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">A: Metaball / Gooey</h2>
            <p className="text-gray-500 text-xs mt-1">CSS + SVG filter magic</p>
          </div>
          <MetaballEffect />
        </div>

        {/* Effect B: Perlin Noise Flow */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">B: Perlin Flow Field</h2>
            <p className="text-gray-500 text-xs mt-1">Organic flowing particles</p>
          </div>
          <PerlinFlowEffect />
        </div>

        {/* Effect C: 3D Shader Look */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">C: Volumetric Glow</h2>
            <p className="text-gray-500 text-xs mt-1">3D-like depth effect</p>
          </div>
          <VolumetricEffect />
        </div>

        {/* Effect D: Branching Veins */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">D: Branching Veins</h2>
            <p className="text-gray-500 text-xs mt-1">Fractal network growth</p>
          </div>
          <BranchingEffect />
        </div>

        {/* Effect E: Hybrid */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">E: Hybrid Organic</h2>
            <p className="text-gray-500 text-xs mt-1">Metaball + flowing particles</p>
          </div>
          <HybridEffect />
        </div>

        {/* Current Effect */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-gray-400 font-mono text-sm">Current: Simple Lines</h2>
            <p className="text-gray-500 text-xs mt-1">What you have now</p>
          </div>
          <CurrentEffect />
        </div>
      </div>

      <div className="text-center mt-8 text-gray-500 text-sm font-mono">
        <a href="/" className="text-[#FFE600] hover:underline">← Back to main</a>
      </div>
    </main>
  );
}

// Effect A: Metaball/Gooey with SVG filter
function MetaballEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const blobs = [
      { x: 150, y: 150, r: 50, vx: 0.5, vy: 0.3 },
      { x: 200, y: 200, r: 35, vx: -0.4, vy: 0.5 },
      { x: 100, y: 180, r: 40, vx: 0.3, vy: -0.4 },
    ];

    const animate = () => {
      time++;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      // Move blobs
      blobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < blob.r || blob.x > 300 - blob.r) blob.vx *= -1;
        if (blob.y < blob.r || blob.y > 300 - blob.r) blob.vy *= -1;
      });

      // Draw with gooey effect (simulated with overlapping gradients)
      blobs.forEach(blob => {
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * 1.5);
        gradient.addColorStop(0, 'rgba(255, 230, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 230, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div style={{ filter: 'url(#gooey)', background: '#0A0A0A' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="gooey" />
          </filter>
        </defs>
      </svg>
      <canvas ref={canvasRef} width={300} height={300} />
    </div>
  );
}

// Effect B: Perlin Noise Flow Field
function PerlinFlowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple noise function
    const noise = (x: number, y: number, t: number) => {
      return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) + 
             Math.sin((x + y) * 0.01 + t * 0.5) * 0.5;
    };

    const particles: { x: number; y: number; life: number }[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({ x: Math.random() * 300, y: Math.random() * 300, life: Math.random() * 100 });
    }

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, 300, 300);

      // Draw center blob
      const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 60);
      gradient.addColorStop(0, 'rgba(255, 230, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(150, 150, 60, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles
      particles.forEach(p => {
        const angle = noise(p.x, p.y, time) * Math.PI * 2;
        p.x += Math.cos(angle) * 1.5;
        p.y += Math.sin(angle) * 1.5;
        p.life--;

        if (p.life <= 0 || p.x < 0 || p.x > 300 || p.y < 0 || p.y > 300) {
          p.x = 150 + (Math.random() - 0.5) * 40;
          p.y = 150 + (Math.random() - 0.5) * 40;
          p.life = 50 + Math.random() * 50;
        }

        ctx.fillStyle = `rgba(255, 230, 0, ${p.life / 100})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// Effect C: Volumetric/3D Glow
function VolumetricEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      const centerX = 100;
      const centerY = 150;
      const targetX = 220;
      const targetY = 150;

      // Draw volumetric connection
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = centerX + (targetX - centerX) * t;
        const y = centerY + (targetY - centerY) * t + Math.sin(t * Math.PI * 3 + time * 2) * 20;
        const size = 30 - Math.abs(t - 0.5) * 40;
        
        // Multiple layers for depth
        for (let layer = 3; layer >= 0; layer--) {
          const layerSize = size + layer * 10;
          const alpha = 0.3 - layer * 0.07;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
          gradient.addColorStop(0, `rgba(255, 230, 0, ${alpha})`);
          gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw blobs
      [{ x: centerX, y: centerY, r: 40 }, { x: targetX, y: targetY, r: 30 }].forEach(blob => {
        for (let layer = 2; layer >= 0; layer--) {
          const layerSize = blob.r + layer * 15;
          const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, layerSize);
          gradient.addColorStop(0, `rgba(255, 230, 0, ${0.9 - layer * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// Effect D: Branching Veins
function BranchingEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    
    const drawBranch = (x1: number, y1: number, x2: number, y2: number, depth: number, t: number) => {
      if (depth <= 0) return;

      const midX = (x1 + x2) / 2 + Math.sin(t + depth) * 15;
      const midY = (y1 + y2) / 2 + Math.cos(t + depth) * 15;

      ctx.strokeStyle = `rgba(255, 230, 0, ${0.3 + depth * 0.1})`;
      ctx.lineWidth = depth * 0.8;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(midX, midY, x2, y2);
      ctx.stroke();

      // Sub-branches
      if (depth > 2) {
        const branchX = midX + (Math.random() - 0.5) * 40;
        const branchY = midY + (Math.random() - 0.5) * 40;
        drawBranch(midX, midY, branchX, branchY, depth - 2, t);
      }
    };

    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      // Draw multiple branching paths
      drawBranch(80, 150, 220, 100, 5, time);
      drawBranch(80, 150, 230, 180, 5, time + 1);
      drawBranch(80, 150, 200, 250, 4, time + 2);

      // Draw nodes
      [{ x: 80, y: 150 }, { x: 220, y: 100 }, { x: 230, y: 180 }, { x: 200, y: 250 }].forEach((node, i) => {
        const pulse = Math.sin(time * 2 + i) * 0.2 + 1;
        const r = (i === 0 ? 25 : 15) * pulse;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 1.5);
        gradient.addColorStop(0, 'rgba(255, 230, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// Effect E: Hybrid (Metaball + Particles)
function HybridEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: { x: number; y: number; t: number; speed: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({ x: 0, y: 0, t: Math.random(), speed: 0.005 + Math.random() * 0.01 });
    }

    let time = 0;
    const centerX = 80, centerY = 150;
    const targetX = 220, targetY = 150;

    const animate = () => {
      time += 0.016;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      // Draw connection path (thick, organic)
      ctx.lineCap = 'round';
      for (let w = 30; w > 0; w -= 5) {
        ctx.strokeStyle = `rgba(255, 230, 0, ${0.1 + (30 - w) * 0.02})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const ctrlX = 150 + Math.sin(time) * 20;
        const ctrlY = 150 + Math.cos(time * 1.3) * 30;
        ctx.quadraticCurveTo(ctrlX, ctrlY, targetX, targetY);
        ctx.stroke();
      }

      // Draw flowing particles along path
      particles.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;

        const t = p.t;
        const ctrlX = 150 + Math.sin(time) * 20;
        const ctrlY = 150 + Math.cos(time * 1.3) * 30;
        
        // Quadratic bezier position
        const mt = 1 - t;
        p.x = mt * mt * centerX + 2 * mt * t * ctrlX + t * t * targetX;
        p.y = mt * mt * centerY + 2 * mt * t * ctrlY + t * t * targetY;

        ctx.fillStyle = `rgba(255, 255, 200, ${0.8 - Math.abs(t - 0.5)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw blobs with glow
      [{ x: centerX, y: centerY, r: 35 }, { x: targetX, y: targetY, r: 25 }].forEach(blob => {
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * 2);
        gradient.addColorStop(0, 'rgba(255, 230, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 230, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// Current effect (simple lines)
function CurrentEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      const centerX = 80, centerY = 150;
      const targetX = 220, targetY = 150;

      // Simple bezier line
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.quadraticCurveTo(150, 150 + Math.sin(time) * 20, targetX, targetY);
      ctx.stroke();

      // Simple blobs
      [{ x: centerX, y: centerY, r: 30 }, { x: targetX, y: targetY, r: 20 }].forEach(blob => {
        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

