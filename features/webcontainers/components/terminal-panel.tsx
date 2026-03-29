"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, X, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Terminal as XTerminal } from "@xterm/xterm";

interface TerminalTab {
  id: string;
  label: string;
}

interface TerminalPanelProps {
  onData?: (data: string) => void;
  terminalRef?: React.MutableRefObject<XTerminal | null>;
  TerminalComponent: React.ComponentType<{
    onData?: (data: string) => void;
    terminalRef?: React.MutableRefObject<XTerminal | null>;
  }>;
  onReady?: (terminal: XTerminal) => void;
}

let tabIdCounter = 1;

export default function TerminalPanel({
  onData,
  terminalRef,
  TerminalComponent,
  onReady,
}: TerminalPanelProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "term-0", label: "bash" },
  ]);
  const [activeTab, setActiveTab] = useState("term-0");
  const terminalRefs = useRef<Record<string, React.MutableRefObject<XTerminal | null>>>({});

  // Ensure the primary terminal ref is tracked
  if (!terminalRefs.current["term-0"]) {
    terminalRefs.current["term-0"] = terminalRef || { current: null };
  }

  const addTab = useCallback(() => {
    const id = `term-${tabIdCounter++}`;
    const label = `bash ${tabIdCounter}`;
    setTabs((prev) => [...prev, { id, label }]);
    terminalRefs.current[id] = { current: null };
    setActiveTab(id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) return prev; // Don't close last tab
        if (activeTab === id) {
          setActiveTab(next[next.length - 1].id);
        }
        return next;
      });
      delete terminalRefs.current[id];
    },
    [activeTab]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center bg-muted/50 border-b shrink-0">
        <div className="flex items-center overflow-x-auto flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r transition-colors group/tab",
                activeTab === tab.id
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <TerminalIcon className="h-3 w-3 shrink-0" />
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  className="h-4 w-4 flex items-center justify-center rounded opacity-0 group-hover/tab:opacity-100 hover:bg-accent shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded shrink-0 mx-1"
          onClick={addTab}
          title="New Terminal"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Terminal instances */}
      <div className="flex-1 overflow-hidden relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0",
              activeTab === tab.id ? "z-10 visible" : "z-0 invisible"
            )}
          >
            <TerminalComponent
              onData={tab.id === "term-0" ? onData : undefined}
              terminalRef={
                tab.id === "term-0"
                  ? terminalRef
                  : terminalRefs.current[tab.id]
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
