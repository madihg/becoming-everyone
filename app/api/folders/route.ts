import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { FolderState } from "@/types";

const CONFIG_PATH = path.join(process.cwd(), "config", "folders.json");

function readState(): FolderState {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeState(state: FolderState): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export async function GET() {
  try {
    const state = readState();
    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      { error: "Failed to read folder state" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: FolderState = await request.json();
    writeState(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update folder state" },
      { status: 500 },
    );
  }
}
