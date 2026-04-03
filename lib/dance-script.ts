export interface DanceCommand {
  type: "intro" | "command" | "feedback";
  text: string;
  duration?: number; // ms for how long to show before next
}

export const DANCE_SCRIPT: DanceCommand[] = [
  { type: "intro", text: "I see a body.", duration: 2500 },
  { type: "intro", text: "This is now my body.", duration: 3000 },
  { type: "command", text: "Dance, body.", duration: 2000 },
  {
    type: "command",
    text: "Dance as if your bones were borrowed, and joy might make them shatter.",
    duration: 15000,
  },
  { type: "feedback", text: "Good body.", duration: 2500 },
  { type: "command", text: "Dance.", duration: 1500 },
  {
    type: "command",
    text: "Dance like you are trying to convince gravity to stay a little longer, to hold you like someone who still remembers your scent.",
    duration: 15000,
  },
  { type: "feedback", text: "Good body.", duration: 2500 },
  { type: "command", text: "Dance.", duration: 1500 },
  {
    type: "command",
    text: "Dance like the stage is a confession booth and your body won't stop sinning.",
    duration: 15000,
  },
  { type: "feedback", text: "Good body.", duration: 2500 },
  { type: "command", text: "Dance.", duration: 1500 },
  {
    type: "command",
    text: "Dance like a machine learning heartbreak for the first time.",
    duration: 15000,
  },
  { type: "feedback", text: "Good body.", duration: 5000 },
];

// BlazePose 33-keypoint skeleton connections
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], // shoulders
  [11, 23],
  [12, 24], // shoulder to hip
  [23, 24], // hips

  // Left arm
  [11, 13],
  [13, 15], // shoulder -> elbow -> wrist
  [15, 17],
  [15, 19],
  [15, 21], // wrist -> fingers

  // Right arm
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],

  // Left leg
  [23, 25],
  [25, 27], // hip -> knee -> ankle
  [27, 29],
  [27, 31], // ankle -> heel/foot

  // Right leg
  [24, 26],
  [26, 28],
  [28, 30],
  [28, 32],

  // Face (minimal)
  [0, 1],
  [0, 4], // nose to eyes
  [11, 0],
  [12, 0], // shoulders to nose (neck approximation)
];
