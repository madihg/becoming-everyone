"use client";

import { useMultiplayer } from "./MultiplayerProvider";

export default function RemoteCursors() {
  const { cursors } = useMultiplayer();

  return (
    <>
      {Object.entries(cursors).map(([id, pos]) => (
        <div
          key={id}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: `${pos.x * 100}%`,
            top: `${pos.y * 100}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 0.1s linear, top 0.1s linear",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: 12,
              height: 12,
              background: "#FFE600",
              boxShadow: "0 0 10px 3px rgba(255, 230, 0, 0.5)",
            }}
          />
        </div>
      ))}
    </>
  );
}
