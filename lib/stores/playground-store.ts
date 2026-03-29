import { create } from "zustand";

interface FileNode {
  type: "file" | "directory";
  name: string;
  content?: string;
  children?: FileNode[];
  path: string;
}

interface PlaygroundState {
  // Current playground data
  playgroundId: string | null;
  title: string;
  template: string;

  // File system
  files: Record<string, any>; // WebContainer file tree
  activeFile: string | null;
  openFiles: string[];
  fileContents: Record<string, string>;

  // Editor state
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;

  // AI state
  aiSuggestionsEnabled: boolean;
  selectedModel: string;

  // WebContainer
  webContainerReady: boolean;
  previewUrl: string | null;

  // Editor preferences
  editorTheme: string;
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;

  // Actions
  setPlayground: (id: string, title: string, template: string) => void;
  setFiles: (files: Record<string, any>) => void;
  setActiveFile: (path: string) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  loadFileContent: (path: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setAiSuggestionsEnabled: (enabled: boolean) => void;
  setSelectedModel: (model: string) => void;
  setWebContainerReady: (ready: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  setEditorTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: boolean) => void;
  setMinimap: (minimap: boolean) => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  // Initial state
  playgroundId: null,
  title: "",
  template: "",

  files: {},
  activeFile: null,
  openFiles: [],
  fileContents: {},

  isLoading: false,
  isSaving: false,
  isDirty: false,

  aiSuggestionsEnabled: true,
  selectedModel: "codellama:latest",

  webContainerReady: false,
  previewUrl: null,

  editorTheme: "vs-dark",
  fontSize: 14,
  wordWrap: true,
  minimap: true,

  // Actions
  setPlayground: (id, title, template) =>
    set({ playgroundId: id, title, template }),

  setFiles: (files) => set({ files }),

  setActiveFile: (path) => set({ activeFile: path }),

  openFile: (path) =>
    set((state) => {
      const openFiles = state.openFiles.includes(path)
        ? state.openFiles
        : [...state.openFiles, path];
      return { openFiles, activeFile: path };
    }),

  closeFile: (path) =>
    set((state) => {
      const openFiles = state.openFiles.filter((f) => f !== path);
      const activeFile =
        state.activeFile === path
          ? openFiles[openFiles.length - 1] ?? null
          : state.activeFile;
      return { openFiles, activeFile };
    }),

  updateFileContent: (path, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
      isDirty: true,
    })),

  loadFileContent: (path, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setSaving: (saving) => set({ isSaving: saving }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  setAiSuggestionsEnabled: (enabled) =>
    set({ aiSuggestionsEnabled: enabled }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  setWebContainerReady: (ready) => set({ webContainerReady: ready }),

  setPreviewUrl: (url) => set({ previewUrl: url }),

  setEditorTheme: (theme) => set({ editorTheme: theme }),
  setFontSize: (size) => set({ fontSize: size }),
  setWordWrap: (wrap) => set({ wordWrap: wrap }),
  setMinimap: (minimap) => set({ minimap }),
}));
