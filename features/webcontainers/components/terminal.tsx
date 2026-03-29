"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  onData?: (data: string) => void;
  terminalRef?: React.MutableRefObject<XTerminal | null>;
}

export default function TerminalComponent({ onData, terminalRef }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localTermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new XTerminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      theme: {
        background: "#1a1b26",
        foreground: "#c0caf5",
        cursor: "#c0caf5",
        selectionBackground: "#33467c",
        black: "#15161e",
        red: "#f7768e",
        green: "#9ece6a",
        yellow: "#e0af68",
        blue: "#7aa2f7",
        magenta: "#bb9af7",
        cyan: "#7dcfff",
        white: "#a9b1d6",
      },
      convertEol: true,
      scrollback: 1000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    localTermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    if (terminalRef) terminalRef.current = terminal;

    terminal.onData((data) => {
      onData?.(data);
    });

    terminal.writeln("\x1b[1;34m Welcome to VibeCode Terminal \x1b[0m");
    terminal.writeln("\x1b[90m Powered by WebContainers \x1b[0m");
    terminal.writeln("");

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ minHeight: "100px" }}
    />
  );
}
