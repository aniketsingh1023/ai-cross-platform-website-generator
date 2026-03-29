import { create } from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileAttachments?: string[];
}

type ChatMode = "chat" | "review" | "fix" | "optimize";

interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  chatMode: ChatMode;

  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  setChatMode: (mode: ChatMode) => void;
  clearMessages: () => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [],
  isLoading: false,
  chatMode: "chat",

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setChatMode: (mode) => set({ chatMode: mode }),

  clearMessages: () => set({ messages: [] }),
}));
