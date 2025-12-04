// Modal configuration
export interface ModalConfig {
  id: string;
  name: string;
  x: number; // Normalized 0-1 position
  y: number; // Normalized 0-1 position
}

// Module state
export interface ModuleState {
  id: 1 | 2 | 3;
  visible: boolean;
  expanded: boolean;
  content: string;
}

// App state
export interface AppState {
  activeModal: string | null;
  revealedModals: string[];
  currentModule: 1 | 2 | 3 | null;
}

// Module 1 result - hand detection
export interface Module1Result {
  handCount: number;
  targetModalId: string;
}

