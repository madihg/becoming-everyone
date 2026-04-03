export type FileType =
  | "image"
  | "video"
  | "pdf"
  | "document"
  | "audio"
  | "executable"
  | "html"
  | "presentation";

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  path: string;
}

export interface Folder {
  id: string;
  name: string;
  tabId: string;
  position: { x: number; y: number };
  isOpen: boolean;
  contents: FileItem[];
}

export interface Tab {
  id: string;
  name: string;
}

export interface FolderState {
  tabs: Tab[];
  folders: Folder[];
}
