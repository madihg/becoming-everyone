import type * as Party from "partykit/server";

interface CursorData {
  x: number;
  y: number;
}

interface ServerState {
  cursors: Record<string, CursorData>;
  text: string;
}

export default class CursorRoom implements Party.Server {
  state: ServerState = { cursors: {}, text: "" };

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(
      JSON.stringify({
        type: "sync",
        cursors: this.state.cursors,
        text: this.state.text,
      }),
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    if (data.type === "cursor_move") {
      this.state.cursors[sender.id] = { x: data.x, y: data.y };
      this.room.broadcast(
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
      this.room.broadcast(
        JSON.stringify({ type: "text_update", text: data.text }),
        [sender.id],
      );
    }
  }

  onClose(conn: Party.Connection) {
    delete this.state.cursors[conn.id];
    this.room.broadcast(JSON.stringify({ type: "cursor_leave", id: conn.id }));
  }
}

CursorRoom satisfies Party.Worker;
