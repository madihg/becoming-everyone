"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import PartySocket from "partysocket";

interface CursorData {
  x: number;
  y: number;
}

interface MultiplayerContextValue {
  cursors: Record<string, CursorData>;
  sharedText: string;
  updateText: (text: string) => void;
  connected: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextValue>({
  cursors: {},
  sharedText: "",
  updateText: () => {},
  connected: false,
});

export function useMultiplayer() {
  return useContext(MultiplayerContext);
}

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ??
  "becoming-everyone.halim.partykit.dev";

export default function MultiplayerProvider({
  children,
  room = "auth",
}: {
  children: React.ReactNode;
  room?: string;
}) {
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const [sharedText, setSharedText] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<PartySocket | null>(null);
  const throttleRef = useRef(0);

  useEffect(() => {
    const ws = new PartySocket({
      host: PARTYKIT_HOST,
      room,
    });
    wsRef.current = ws;

    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));

    ws.addEventListener("message", (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type === "sync") {
        setCursors(data.cursors ?? {});
        if (data.text) setSharedText(data.text);
      }

      if (data.type === "cursor_move") {
        setCursors((prev) => ({
          ...prev,
          [data.id]: { x: data.x, y: data.y },
        }));
      }

      if (data.type === "cursor_leave") {
        setCursors((prev) => {
          const next = { ...prev };
          delete next[data.id];
          return next;
        });
      }

      if (data.type === "text_update") {
        setSharedText(data.text);
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttleRef.current < 60) return;
      throttleRef.current = now;

      ws.send(
        JSON.stringify({
          type: "cursor_move",
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        }),
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ws.close();
      wsRef.current = null;
    };
  }, [room]);

  const updateText = useCallback((text: string) => {
    setSharedText(text);
    wsRef.current?.send(JSON.stringify({ type: "text_update", text }));
  }, []);

  return (
    <MultiplayerContext.Provider
      value={{ cursors, sharedText, updateText, connected }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}
