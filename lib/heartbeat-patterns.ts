// Pre-scripted BPM sequences that give the impression of intentional communication
// Each pattern is an array of target BPMs with transition speeds

export interface BpmPoint {
  target: number;
  duration: number; // ms to reach this target
}

// Patterns loop - each represents a "phrase" in the body's language
export const HEARTBEAT_PATTERNS: BpmPoint[][] = [
  // Pattern 1: Slow descent into deep control
  [
    { target: 72, duration: 3000 },
    { target: 68, duration: 2000 },
    { target: 55, duration: 4000 },
    { target: 42, duration: 5000 },
    { target: 48, duration: 2000 },
    { target: 44, duration: 3000 },
  ],
  // Pattern 2: Sharp spike - the body speaks
  [
    { target: 65, duration: 2000 },
    { target: 88, duration: 1000 },
    { target: 112, duration: 800 },
    { target: 118, duration: 500 },
    { target: 95, duration: 2000 },
    { target: 78, duration: 3000 },
  ],
  // Pattern 3: Staccato - counting
  [
    { target: 60, duration: 1500 },
    { target: 80, duration: 800 },
    { target: 60, duration: 1500 },
    { target: 80, duration: 800 },
    { target: 60, duration: 1500 },
    { target: 100, duration: 600 },
    { target: 60, duration: 2000 },
  ],
  // Pattern 4: Prayer - long sustained control
  [
    { target: 50, duration: 4000 },
    { target: 48, duration: 3000 },
    { target: 46, duration: 3000 },
    { target: 44, duration: 4000 },
    { target: 42, duration: 5000 },
    { target: 40, duration: 6000 },
    { target: 55, duration: 2000 },
  ],
  // Pattern 5: The body's argument
  [
    { target: 70, duration: 2000 },
    { target: 90, duration: 1500 },
    { target: 110, duration: 1000 },
    { target: 120, duration: 800 },
    { target: 105, duration: 1500 },
    { target: 85, duration: 2000 },
    { target: 70, duration: 2500 },
    { target: 60, duration: 3000 },
  ],
];

// Generate cryptic pattern codes from BPM values
export function generatePatternCode(bpm: number, timestamp: number): string {
  const hex = ((bpm * 7 + timestamp) % 4095)
    .toString(16)
    .toUpperCase()
    .padStart(3, "0");
  const prefixes = ["SYN", "ACK", "RESP", "EMIT", "RECV", "PROC"];
  const prefix = prefixes[Math.floor((bpm + timestamp) % prefixes.length)];
  return `${prefix}-0x${hex}`;
}

// Generate signal classification from BPM
export function classifySignal(bpm: number, delta: number): string {
  if (bpm < 45) return "DEEP_ENCODE";
  if (bpm < 55) return "ENCODE";
  if (bpm >= 55 && bpm <= 65 && Math.abs(delta) < 3) return "REST";
  if (bpm > 100) return "TRANSMIT";
  if (Math.abs(delta) > 15) return "SHIFT";
  if (bpm >= 60 && bpm <= 100) return "BASELINE";
  return "UNKNOWN";
}
