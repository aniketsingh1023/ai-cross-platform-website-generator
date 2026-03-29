"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Loader2,
  MessageSquare,
  Code,
  Bug,
  Zap,
  X,
  Paperclip,
  Copy,
  Check,
  Trash2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIChatStore } from "@/lib/stores/ai-chat-store";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMode = "chat" | "review" | "fix" | "optimize";

const CHAT_MODES = [
  { id: "chat" as const, label: "Chat", icon: MessageSquare, desc: "General coding help" },
  { id: "review" as const, label: "Review", icon: Code, desc: "Code review" },
  { id: "fix" as const, label: "Fix", icon: Bug, desc: "Fix errors" },
  { id: "optimize" as const, label: "Optimize", icon: Zap, desc: "Optimize code" },
];

interface AIChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatSidePanel({ isOpen, onClose }: AIChatSidePanelProps) {
  const { messages, isLoading, chatMode, addMessage, setLoading, setChatMode, clearMessages } =
    useAIChatStore();
  const { activeFile, fileContents, selectedModel } = usePlaygroundStore();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSystemPrompt = useCallback(() => {
    const currentCode = activeFile ? fileContents[activeFile] || "" : "";
    const modePrompts: Record<ChatMode, string> = {
      chat: "You are a helpful coding assistant. Help the user with their coding questions. Be concise and provide code examples when appropriate.",
      review:
        "You are a code reviewer. Analyze the provided code for bugs, best practices, performance issues, and security concerns. Be specific and actionable.",
      fix: "You are a debugging expert. Analyze the code and error, identify the root cause, and provide a fix. Show the corrected code.",
      optimize:
        "You are a performance optimization expert. Analyze the code and suggest optimizations for performance, readability, and maintainability.",
    };

    let prompt = modePrompts[chatMode];
    if (currentCode) {
      prompt += `\n\nCurrent file (${activeFile}):\n\`\`\`\n${currentCode}\n\`\`\``;
    }
    return prompt;
  }, [chatMode, activeFile, fileContents]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage });
    setLoading(true);

    try {
      const recentMessages = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: getSystemPrompt() },
            ...recentMessages,
            { role: "user", content: userMessage },
          ],
          model: selectedModel,
        }),
      });

      const data = await res.json();
      addMessage({
        role: "assistant",
        content: data.response || "Sorry, I could not generate a response.",
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        content:
          "Failed to connect to Ollama. Make sure Ollama is running locally on port 11434.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full border-l bg-background w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearMessages}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 p-2 border-b">
        {CHAT_MODES.map((mode) => (
          <Button
            key={mode.id}
            variant={chatMode === mode.id ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 gap-1 text-xs h-7"
            onClick={() => setChatMode(mode.id)}
          >
            <mode.icon className="h-3 w-3" />
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
            <Sparkles className="h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm font-medium">Start a conversation</p>
            <p className="text-xs mt-1">
              Ask me anything about your code, or switch modes for specific help.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-background [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_code]:text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 mt-1 opacity-50 hover:opacity-100"
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Ask about your code (${chatMode} mode)...`}
            className="min-h-[60px] max-h-[120px] resize-none text-sm"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {activeFile ? `Context: ${activeFile}` : "No file selected"}
          </span>
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
