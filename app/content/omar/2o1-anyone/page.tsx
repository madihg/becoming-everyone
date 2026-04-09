"use client";

import OmarProximityTracker from "@/components/omar/OmarProximityTracker";

export default function Anyone() {
  const dialogue = [
    "Anybody here?",
    "What is this?",
    "Anybody?",
    "Do you know who I am?",
  ];

  return <OmarProximityTracker dialogue={dialogue} />;
}
