"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  HEARTBEAT_PATTERNS,
  generatePatternCode,
  classifySignal,
} from "@/lib/heartbeat-patterns";
import type { BpmPoint } from "@/lib/heartbeat-patterns";

interface DataRow {
  timestamp: string;
  bpm: number;
  delta: number;
  pattern: string;
  signal: string;
}

export default function LiftPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [dataLog, setDataLog] = useState<DataRow[]>([]);
  const [analysisText, setAnalysisText] = useState(
    "INITIALIZING CARDIAC LEXICON ANALYZER...",
  );
  const bpmRef = useRef(72);
  const bpmHistoryRef = useRef<number[]>([]);
  const tableEndRef = useRef<HTMLDivElement>(null);

  // BPM pattern sequencer
  useEffect(() => {
    let patternIdx = 0;
    let pointIdx = 0;
    let startTime = Date.now();
    let startBpm = 72;

    const tick = () => {
      const pattern = HEARTBEAT_PATTERNS[patternIdx];
      const point = pattern[pointIdx];
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / point.duration);

      // Smooth interpolation with slight noise
      const noise = (Math.random() - 0.5) * 2;
      const interpolated =
        startBpm + (point.target - startBpm) * progress + noise;
      const clamped = Math.max(38, Math.min(122, interpolated));

      bpmRef.current = clamped;
      setCurrentBpm(Math.round(clamped));
      bpmHistoryRef.current.push(clamped);
      if (bpmHistoryRef.current.length > 300) bpmHistoryRef.current.shift();

      if (progress >= 1) {
        startBpm = point.target;
        pointIdx++;
        startTime = Date.now();

        if (pointIdx >= pattern.length) {
          pointIdx = 0;
          patternIdx = (patternIdx + 1) % HEARTBEAT_PATTERNS.length;
        }
      }
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, []);

  // Data log updater
  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const bpm = Math.round(bpmRef.current);
      const prevBpm =
        dataLog.length > 0 ? dataLog[dataLog.length - 1].bpm : bpm;
      const delta = bpm - prevBpm;

      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${Math.floor(now.getMilliseconds() / 100)}`;

      const row: DataRow = {
        timestamp: ts,
        bpm,
        delta,
        pattern: generatePatternCode(bpm, counter),
        signal: classifySignal(bpm, delta),
      };

      setDataLog((prev) => [...prev.slice(-50), row]);

      // Update analysis text
      const analyses = [
        `ANALYZING CARDIAC LEXICON... PATTERN MATCH: ${(Math.random() * 40 + 10).toFixed(1)}%`,
        `DECODING SEQUENCE ${counter}... SIGNAL INTEGRITY: ${(Math.random() * 30 + 60).toFixed(1)}%`,
        `PROCESSING SOMATIC OUTPUT... ENTROPY: ${(Math.random() * 0.8 + 0.1).toFixed(3)}`,
        `MAPPING BPM TOPOLOGY... PHASE: ${(Math.floor(counter / 5) % 8) + 1}/8`,
        `LEXICAL EXTRACTION IN PROGRESS... TOKENS: ${counter * 3}`,
      ];
      setAnalysisText(analyses[counter % analyses.length]);
    }, 2500);

    return () => clearInterval(interval);
  }, [dataLog]);

  // Auto-scroll table
  useEffect(() => {
    tableEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dataLog]);

  // ECG canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Normal range markers (60-100)
      const yFor = (bpm: number) => h - ((bpm - 30) / 100) * h;
      ctx.strokeStyle = "rgba(255,230,0,0.15)";
      ctx.setLineDash([4, 4]);
      [60, 100].forEach((bpm) => {
        ctx.beginPath();
        ctx.moveTo(0, yFor(bpm));
        ctx.lineTo(w, yFor(bpm));
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Range labels
      ctx.fillStyle = "rgba(255,230,0,0.3)";
      ctx.font = "10px monospace";
      ctx.fillText("100", 4, yFor(100) - 4);
      ctx.fillText("60", 4, yFor(60) - 4);
      ctx.fillText("40", 4, yFor(40) - 4);
      ctx.fillText("120", 4, yFor(120) - 4);

      // BPM line
      const history = bpmHistoryRef.current;
      if (history.length >= 2) {
        ctx.strokeStyle = "#FFE600";
        ctx.lineWidth = 2;
        ctx.beginPath();

        const step = w / 300;
        const startIdx = Math.max(0, history.length - 300);
        history.slice(startIdx).forEach((bpm, i) => {
          const x = i * step;
          const y = yFor(bpm);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw current position dot
        const lastBpm = history[history.length - 1];
        const dotX = Math.min(history.length - startIdx - 1, 299) * step;
        ctx.fillStyle = "#FFE600";
        ctx.beginPath();
        ctx.arc(dotX, yFor(lastBpm), 4, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const bpmColor =
    currentBpm < 60 || currentBpm > 100 ? "text-yellow" : "text-white";

  return (
    <div className="h-screen w-screen bg-black flex font-mono text-text-muted">
      {/* Left: Graph */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-baseline gap-4 mb-4">
          <span className={`text-6xl font-bold ${bpmColor} tabular-nums`}>
            {currentBpm}
          </span>
          <span className="text-sm">BPM</span>
          <span className="text-xs text-text-muted/50 ml-auto">40 / 120</span>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full flex-1 rounded border border-folder-border"
        />
      </div>

      {/* Right: Data table */}
      <div className="w-[380px] flex flex-col border-l border-folder-border">
        <div className="px-3 py-2 border-b border-folder-border text-[10px] text-text-muted/60">
          CARDIAC LEXICON DECODER v0.4.1
        </div>

        {/* Table header */}
        <div className="grid grid-cols-5 gap-0 px-3 py-1 border-b border-folder-border text-[9px] text-text-muted/40">
          <span>TIME</span>
          <span>BPM</span>
          <span>DELTA</span>
          <span>PATTERN</span>
          <span>SIGNAL</span>
        </div>

        {/* Table body */}
        <div className="flex-1 overflow-auto">
          {dataLog.map((row, idx) => {
            const age = dataLog.length - 1 - idx;
            const opacity = Math.max(0.3, 1 - age * 0.015);
            return (
              <div
                key={idx}
                className="grid grid-cols-5 gap-0 px-3 py-0.5 text-[10px] border-b border-folder-border/30"
                style={{ opacity }}
              >
                <span>{row.timestamp}</span>
                <span
                  className={row.bpm < 60 || row.bpm > 100 ? "text-yellow" : ""}
                >
                  {row.bpm}
                </span>
                <span
                  className={
                    row.delta > 0
                      ? "text-green-600"
                      : row.delta < 0
                        ? "text-red-600"
                        : ""
                  }
                >
                  {row.delta > 0 ? "+" : ""}
                  {row.delta}
                </span>
                <span className="text-text-muted/70">{row.pattern}</span>
                <span
                  className={
                    row.signal === "ENCODE" || row.signal === "DEEP_ENCODE"
                      ? "text-yellow/70"
                      : row.signal === "TRANSMIT"
                        ? "text-white/70"
                        : ""
                  }
                >
                  {row.signal}
                </span>
              </div>
            );
          })}
          <div ref={tableEndRef} />
        </div>

        {/* Processing bar */}
        <div className="px-3 py-2 border-t border-folder-border text-[9px] text-yellow/50 truncate">
          {analysisText}
        </div>
      </div>
    </div>
  );
}
