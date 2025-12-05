'use client';

import { useEffect, useRef } from 'react';

export default function EffectsDemo() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <h1 className="text-2xl font-mono text-[#FFE600] mb-2 text-center">
        Organic Slime Effects
      </h1>
      <p className="text-gray-500 text-sm text-center mb-8">Exploring crisp, defined slime mold aesthetics</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        
        {/* F: Crisp Edge Slime */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">F: Crisp Edge</h2>
            <p className="text-gray-500 text-xs mt-1">Sharp borders, organic shape</p>
          </div>
          <CrispEdgeEffect />
        </div>

        {/* G: Veiny Network */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">G: Veiny Network</h2>
            <p className="text-gray-500 text-xs mt-1">Thin defined veins</p>
          </div>
          <VeinyNetworkEffect />
        </div>

        {/* H: Cellular Tubes */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">H: Cellular Tubes</h2>
            <p className="text-gray-500 text-xs mt-1">Cells + connecting tubes</p>
          </div>
          <CellularTubesEffect />
        </div>

        {/* I: Outlined Blob */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">I: Outlined Blob</h2>
            <p className="text-gray-500 text-xs mt-1">Filled with crisp outline</p>
          </div>
          <OutlinedBlobEffect />
        </div>

        {/* J: Branching Tendrils */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">J: Branching Tendrils</h2>
            <p className="text-gray-500 text-xs mt-1">Slow growing branches</p>
          </div>
          <BranchingTendrilsEffect />
        </div>

        {/* K: Real Physarum Style */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">K: Physarum Style</h2>
            <p className="text-gray-500 text-xs mt-1">Most realistic</p>
          </div>
          <PhysarumStyleEffect />
        </div>

        {/* L: Membrane Effect */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">L: Membrane</h2>
            <p className="text-gray-500 text-xs mt-1">Translucent with edge</p>
          </div>
          <MembraneEffect />
        </div>

        {/* M: Ink Drop */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700">
            <h2 className="text-[#FFE600] font-mono text-sm">M: Ink Drop</h2>
            <p className="text-gray-500 text-xs mt-1">Spreading ink aesthetic</p>
          </div>
          <InkDropEffect />
        </div>
        
      </div>

      <div className="text-center mt-8 text-gray-500 text-sm font-mono">
        <a href="/" className="text-[#FFE600] hover:underline">← Back to main</a>
      </div>
    </main>
  );
}

// F: Crisp Edge - Sharp defined borders
function CrispEdgeEffect() {
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

      // Draw organic blob with crisp edges
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      
      const centerX = 100, centerY = 150;
      const targetX = 220, targetY = 140;
      
      // Main blob with wobbly edge
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 3 + time) * 8 + Math.sin(angle * 5 + time * 1.5) * 4;
        const r = 35 + wobble;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Target blob
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 4 + time * 1.2) * 5;
        const r = 25 + wobble;
        const x = targetX + Math.cos(angle) * r;
        const y = targetY + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Connecting tendril with crisp edge
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#FFE600';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX + 30, centerY);
      const ctrlY = centerY + Math.sin(time) * 25;
      ctx.quadraticCurveTo(160, ctrlY, targetX - 20, targetY);
      ctx.stroke();

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// G: Veiny Network - Thin defined veins
function VeinyNetworkEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const nodes = [
      { x: 80, y: 150 },
      { x: 220, y: 120 },
      { x: 200, y: 200 },
      { x: 140, y: 80 },
      { x: 160, y: 220 },
    ];

    const animate = () => {
      time += 0.015;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      // Draw veins between nodes
      ctx.strokeStyle = '#FFE600';
      ctx.lineCap = 'round';

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i], n2 = nodes[j];
          const dist = Math.sqrt((n2.x - n1.x) ** 2 + (n2.y - n1.y) ** 2);
          if (dist < 150) {
            // Varying thickness based on distance
            ctx.lineWidth = Math.max(1, 6 - dist * 0.03);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            const midX = (n1.x + n2.x) / 2 + Math.sin(time + i + j) * 10;
            const midY = (n1.y + n2.y) / 2 + Math.cos(time + i + j) * 10;
            ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes as solid circles
      ctx.fillStyle = '#FFE600';
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time * 2 + i) * 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12 + pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// H: Cellular Tubes - Cells connected by thin tubes
function CellularTubesEffect() {
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

      const centerX = 90, centerY = 150;
      const targetX = 210, targetY = 150;

      // Draw tube first (behind cells)
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      
      // Multiple segments for organic tube
      const segments = 8;
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const x = centerX + (targetX - centerX) * t;
        const y = centerY + Math.sin(t * Math.PI * 2 + time) * 15;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw cells (on top)
      ctx.fillStyle = '#FFE600';
      
      // Main cell
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Target cell
      ctx.beginPath();
      ctx.arc(targetX, targetY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Inner darker circle for depth
      ctx.fillStyle = '#D4C200';
      ctx.beginPath();
      ctx.arc(centerX - 5, centerY - 5, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(targetX - 3, targetY - 3, 10, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// I: Outlined Blob - Filled with visible outline
function OutlinedBlobEffect() {
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

      const centerX = 100, centerY = 150;
      const targetX = 210, targetY = 145;

      // Connection
      ctx.fillStyle = '#FFE600';
      ctx.strokeStyle = '#B8A800';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX + 25, centerY - 8);
      ctx.quadraticCurveTo(155, centerY - 20 + Math.sin(time) * 10, targetX - 18, targetY - 6);
      ctx.lineTo(targetX - 18, targetY + 6);
      ctx.quadraticCurveTo(155, centerY + 20 + Math.sin(time) * 10, centerX + 25, centerY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main blob with outline
      const drawOutlinedBlob = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const wobble = Math.sin(angle * 4 + time) * (r * 0.15);
          const radius = r + wobble;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = '#FFE600';
        ctx.fill();
        ctx.strokeStyle = '#B8A800';
        ctx.lineWidth = 3;
        ctx.stroke();
      };

      drawOutlinedBlob(centerX, centerY, 32);
      drawOutlinedBlob(targetX, targetY, 24);

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// J: Branching Tendrils - Slow growing branches
function BranchingTendrilsEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const drawTendril = (x1: number, y1: number, x2: number, y2: number, thickness: number, depth: number) => {
      if (depth <= 0 || thickness < 1) return;

      const midX = (x1 + x2) / 2 + Math.sin(time + depth) * 8;
      const midY = (y1 + y2) / 2 + Math.cos(time * 0.8 + depth) * 8;

      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(midX, midY, x2, y2);
      ctx.stroke();

      // Branch off
      if (depth > 1) {
        const branchAngle = Math.atan2(y2 - y1, x2 - x1);
        const branchLen = 30;
        const bx = midX + Math.cos(branchAngle + 0.8) * branchLen;
        const by = midY + Math.sin(branchAngle + 0.8) * branchLen;
        drawTendril(midX, midY, bx, by, thickness * 0.6, depth - 1);
        
        const bx2 = midX + Math.cos(branchAngle - 0.8) * branchLen;
        const by2 = midY + Math.sin(branchAngle - 0.8) * branchLen;
        drawTendril(midX, midY, bx2, by2, thickness * 0.6, depth - 1);
      }
    };

    const animate = () => {
      time += 0.015;
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 300, 300);

      // Main tendril
      drawTendril(80, 150, 230, 140, 10, 4);

      // Source blob
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.arc(80, 150, 28, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// K: Physarum Style - Most realistic slime mold
function PhysarumStyleEffect() {
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

      const centerX = 85, centerY = 150;
      const targetX = 215, targetY = 145;

      // Draw main vein structure (multiple thin lines bundled)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * 3;
        const thickness = i === 2 ? 6 : 3;
        ctx.strokeStyle = i === 2 ? '#FFE600' : '#D4C200';
        ctx.lineWidth = thickness;
        
        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY + offset);
        
        // Organic path
        const ctrl1X = 130 + Math.sin(time + i) * 8;
        const ctrl1Y = centerY - 15 + offset + Math.sin(time * 1.3) * 10;
        const ctrl2X = 170 + Math.cos(time + i) * 8;
        const ctrl2Y = centerY + 10 + offset + Math.cos(time * 0.9) * 10;
        
        ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, targetX - 15, targetY + offset * 0.5);
        ctx.stroke();
      }

      // Draw plasmodium masses (the blob parts)
      const drawPlasmodium = (cx: number, cy: number, size: number) => {
        // Outer irregular shape
        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
          const noise = Math.sin(angle * 5 + time) * 4 + Math.sin(angle * 3 - time * 0.7) * 3;
          const r = size + noise;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Inner texture
        ctx.fillStyle = '#E6D000';
        ctx.beginPath();
        ctx.arc(cx - size * 0.2, cy - size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      };

      drawPlasmodium(centerX, centerY, 28);
      drawPlasmodium(targetX, targetY, 20);

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// L: Membrane - Translucent with defined edge
function MembraneEffect() {
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

      const centerX = 95, centerY = 150;
      const targetX = 210, targetY = 148;

      // Connection membrane
      ctx.beginPath();
      ctx.moveTo(centerX + 25, centerY - 12);
      ctx.quadraticCurveTo(150, centerY - 25 + Math.sin(time) * 12, targetX - 18, targetY - 8);
      ctx.lineTo(targetX - 18, targetY + 8);
      ctx.quadraticCurveTo(150, centerY + 25 + Math.sin(time) * 12, centerX + 25, centerY + 12);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(255, 230, 0, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Blobs with membrane look
      const drawMembrane = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const wobble = Math.sin(angle * 4 + time) * (r * 0.12);
          const radius = r + wobble;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 230, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 3;
        ctx.stroke();
      };

      drawMembrane(centerX, centerY, 30);
      drawMembrane(targetX, targetY, 22);

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}

// M: Ink Drop - Spreading ink aesthetic
function InkDropEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = [];

    const animate = () => {
      time += 0.02;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, 300, 300);

      const centerX = 90, centerY = 150;
      const targetX = 210, targetY = 150;

      // Spawn particles along the path
      if (Math.random() < 0.3) {
        const t = Math.random();
        const px = centerX + (targetX - centerX) * t;
        const py = centerY + Math.sin(t * Math.PI + time) * 20;
        particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 2 + Math.random() * 4,
          life: 1
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 230, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main blobs
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Core connection
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.quadraticCurveTo(150, centerY + Math.sin(time * 2) * 15, targetX, targetY);
      ctx.stroke();

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={300} height={300} style={{ background: '#0A0A0A' }} />;
}
