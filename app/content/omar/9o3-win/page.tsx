"use client";

import OmarProximityTracker from "@/components/omar/OmarProximityTracker";

export default function Win() {
  const dialogue = ["Oh man, ok, ok", "you win, I give up"];

  return <OmarProximityTracker dialogue={dialogue} />;
}
