"use client";

import Editor, { BeforeMount, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";
import { registerCustomThemes } from "./theme-selector";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  onCursorChange?: (line: number, column: number) => void;
  editorTheme?: string;
  onEditorMount?: (editor: any, monaco: any) => void;
}

const FILE_EXTENSION_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  html: "html",
  css: "css",
  scss: "scss",
  md: "markdown",
  py: "python",
  vue: "html",
  svg: "xml",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  bash: "shell",
  mjs: "javascript",
  cjs: "javascript",
};

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_EXTENSION_MAP[ext] || "plaintext";
}

export default function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  onCursorChange,
  editorTheme,
  onEditorMount,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerCustomThemes(monaco);
  }, []);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      editor.onDidChangeCursorPosition((e: any) => {
        onCursorChange?.(e.position.lineNumber, e.position.column);
      });

      // Add keyboard shortcuts
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          // Save handled by parent
        }
      );

      onEditorMount?.(editor, monaco);
    },
    [onCursorChange, onEditorMount]
  );

  const theme =
    editorTheme ?? (resolvedTheme === "dark" ? "vs-dark" : "vs-light");

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={(val) => onChange(val || "")}
      beforeMount={handleBeforeMount}
      onMount={handleEditorMount}
      options={{
        readOnly,
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: "on",
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        padding: { top: 8 },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
      }}
    />
  );
}
