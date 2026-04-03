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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const state = readState();
    const folder = state.folders.find((f) => f.id === params.id);

    if (!folder) {
      return NextResponse.json(
        { error: `Folder ${params.id} not found` },
        { status: 404 },
      );
    }

    const body = await request.json();
    folder.isOpen = body.isOpen ?? !folder.isOpen;
    writeState(state);

    return NextResponse.json({ ok: true, isOpen: folder.isOpen });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle folder state" },
      { status: 500 },
    );
  }
}
