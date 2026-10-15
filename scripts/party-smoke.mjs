// Smoke test for the multiplayer server (party/main.ts).
// Usage: node scripts/party-smoke.mjs [host]   default host: localhost:1999 (npm run party)
//        node scripts/party-smoke.mjs becoming-everyone.<account>.workers.dev
// Connects through partysocket exactly like components/multiplayer/MultiplayerProvider.tsx,
// in a throwaway room so a live show is never touched. Exits 1 on any failure.
import PartySocket from "partysocket";

const host = process.argv[2] || "localhost:1999";
const room = `smoke-${Date.now()}`;
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};

function client() {
  const ws = new PartySocket({ host, room, WebSocket });
  const inbox = [];
  const waiters = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    inbox.push(msg);
    for (const w of [...waiters]) if (w.match(msg)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg); }
  });
  const next = (match, ms = 5000) => {
    const hit = inbox.find(match);
    if (hit) { inbox.splice(inbox.indexOf(hit), 1); return Promise.resolve(hit); }
    return new Promise((resolve, reject) => {
      const w = { match, resolve };
      waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); reject(new Error("timeout")); } }, ms);
    });
  };
  const open = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    setTimeout(() => reject(new Error("connect timeout")), 10000);
  });
  return { ws, next, open, inbox };
}

const silent = (c, type, ms = 800) =>
  new Promise((resolve) => setTimeout(() => resolve(!c.inbox.some((m) => m.type === type)), ms));

try {
  console.log(`host ${host}, room ${room}`);
  const a = client();
  await a.open;
  const syncA = await a.next((m) => m.type === "sync");
  check("first client gets an empty sync", JSON.stringify(syncA.cursors) === "{}" && !syncA.text);

  const b = client();
  await b.open;
  await b.next((m) => m.type === "sync");
  check("second client connects and gets a sync", true);

  a.ws.send(JSON.stringify({ type: "cursor_move", x: 0.25, y: 0.75 }));
  const mv = await b.next((m) => m.type === "cursor_move");
  check("cursor_move reaches the other client", mv.x === 0.25 && mv.y === 0.75 && typeof mv.id === "string", `id=${mv.id}`);
  check("sender does not get its own cursor_move back", await silent(a, "cursor_move"));

  a.ws.send(JSON.stringify({ type: "text_update", text: "hungrier than the future" }));
  const tu = await b.next((m) => m.type === "text_update");
  check("text_update reaches the other client", tu.text === "hungrier than the future");

  b.ws.send(JSON.stringify({ type: "open_folder", folderId: "17P7-neural" }));
  const of = await a.next((m) => m.type === "open_folder");
  check("open_folder reaches the other client", of.folderId === "17P7-neural");

  a.ws.send("not json");
  a.ws.send(JSON.stringify({ type: "cursor_move", x: 0.5, y: 0.5 }));
  await b.next((m) => m.type === "cursor_move" && m.x === 0.5);
  check("a malformed message does not break the room", true);

  const c = client();
  await c.open;
  const syncC = await c.next((m) => m.type === "sync");
  check("a late joiner gets the current text and cursors",
    syncC.text === "hungrier than the future" && Object.keys(syncC.cursors).length >= 1,
    `text="${syncC.text}", cursors=${Object.keys(syncC.cursors).length}`);

  const aId = mv.id;
  a.ws.close();
  const leave = await b.next((m) => m.type === "cursor_leave");
  check("closing a client sends cursor_leave", leave.id === aId);

  b.ws.close(); c.ws.close();
} catch (e) {
  check("run completed", false, String(e && e.message || e));
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
