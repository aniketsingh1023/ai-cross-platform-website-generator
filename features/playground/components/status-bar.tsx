"use client";

import { GitBranch, AlertCircle, AlertTriangle, Circle } from "lucide-react";
import ThemeSelector from "./theme-selector";

interface StatusBarProps {
  activeFile: string | null;
  cursorLine: number;
  cursorColumn: number;
  language: string;
  encoding?: string;
  isDirty: boolean;
  isConnected: boolean;
  editorTheme: string;
  onThemeChange: (theme: string) => void;
}

export default function StatusBar({
  activeFile,
  cursorLine,
  cursorColumn,
  language,
  encoding = "UTF-8",
  isDirty,
  isConnected,
  editorTheme,
  onThemeChange,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-2 border-t border-blue-700 shrink-0 select-none">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <GitBranch className="h-3.5 w-3.5" />
          <span>main</span>
          {isDirty && (
            <span className="ml-0.5 font-bold text-yellow-200">M</span>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-blue-500 pl-3">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="border-r border-blue-500 pr-3">
          Ln {cursorLine}, Col {cursorColumn}
        </span>

        <span className="border-r border-blue-500 pr-3 cursor-pointer hover:text-blue-200">
          {language || "Plain Text"}
        </span>

        <span className="border-r border-blue-500 pr-3">{encoding}</span>

        <span className="border-r border-blue-500 pr-3">LF</span>

        <span className="border-r border-blue-500 pr-3">Spaces: 2</span>

        <div className="flex items-center gap-1 border-r border-blue-500 pr-3">
          <Circle
            className={`h-2 w-2 ${
              isConnected
                ? "fill-green-400 text-green-400"
                : "fill-red-400 text-red-400"
            }`}
          />
          <span>Ollama</span>
        </div>

        <div className="[&_button]:h-5 [&_button]:text-white [&_button]:text-xs [&_button]:px-1.5 [&_button]:py-0">
          <ThemeSelector
            currentTheme={editorTheme}
            onThemeChange={onThemeChange}
          />
        </div>
      </div>
    </div>
  );
}
