"use client";

import OmarProximityTracker from "@/components/omar/OmarProximityTracker";

export default function What() {
  const dialogue = [
    "What is happening?",
    "[looks at his body] I want my body back",
    "Stop taking over my body.",
  ];

  return <OmarProximityTracker dialogue={dialogue} />;
}
