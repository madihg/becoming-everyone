import { routePartykitRequest, Server } from "partyserver";
import type { Connection, ConnectionContext, WSMessage } from "partyserver";

// Shared cursors and text for the audience. Runs as a PartyServer Durable Object
// on Cloudflare (moved off hosted PartyKit, which shut down in October 2026).
// State lives in memory only, as it did on PartyKit: it resets when the room empties.

interface CursorData {
  x: number;
  y: number;
}

interface ServerState {
  cursors: Record<string, CursorData>;
  text: string;
}

type Env = {
  Main: DurableObjectNamespace<CursorRoom>;
};

export class CursorRoom extends Server<Env> {
  state: ServerState = { cursors: {}, text: "" };

  onConnect(conn: Connection, _ctx: ConnectionContext) {
    conn.send(
      JSON.stringify({
        type: "sync",
        cursors: this.state.cursors,
        text: this.state.text,
      }),
    );
  }

  onMessage(sender: Connection, message: WSMessage) {
    if (typeof message !== "string") return;
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    if (data.type === "cursor_move") {
      this.state.cursors[sender.id] = { x: data.x, y: data.y };
      this.broadcast(
        JSON.stringify({
          type: "cursor_move",
          id: sender.id,
          x: data.x,
          y: data.y,
        }),
        [sender.id],
      );
    }

    if (data.type === "text_update") {
      this.state.text = data.text;
      this.broadcast(
        JSON.stringify({ type: "text_update", text: data.text }),
        [sender.id],
      );
    }

    if (data.type === "open_folder") {
      this.broadcast(
        JSON.stringify({ type: "open_folder", folderId: data.folderId }),
        [sender.id],
      );
    }
  }

  onClose(conn: Connection) {
    delete this.state.cursors[conn.id];
    this.broadcast(JSON.stringify({ type: "cursor_leave", id: conn.id }));
  }
}

// Routes /parties/main/:room to the CursorRoom Durable Object (binding "Main").
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
