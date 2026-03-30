"use client";

import Editor, { BeforeMount, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";
import { registerCustomThemes } from "./theme-selector";
import { usePlaygroundStore } from "@/lib/stores/playground-store";

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
  less: "less",
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
  env: "plaintext",
  gitignore: "plaintext",
  dockerignore: "plaintext",
  Dockerfile: "dockerfile",
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
  const { fontSize, wordWrap, minimap } = usePlaygroundStore();

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerCustomThemes(monaco);

    // Enable JSX/TSX support
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      moduleResolution:
        monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
    });

    // Add common React type hints
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module 'react' { export default any; export const useState: any; export const useEffect: any; export const useCallback: any; export const useRef: any; export const useMemo: any; }`,
      "react.d.ts"
    );
  }, []);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      editor.onDidChangeCursorPosition((e: any) => {
        onCursorChange?.(e.position.lineNumber, e.position.column);
      });

      // Keyboard shortcuts
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {} // Save handled by parent
      );

      // Format document shortcut
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
        () => {
          editor.getAction("editor.action.formatDocument")?.run();
        }
      );

      // Multi-cursor: Alt+Click is default in Monaco
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
      loading={
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading editor...
        </div>
      }
      options={{
        readOnly,
        minimap: { enabled: minimap },
        fontSize,
        lineNumbers: "on",
        wordWrap: wordWrap ? "on" : "off",
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        padding: { top: 8 },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        acceptSuggestionOnCommitCharacter: true,
        // Bracket matching
        matchBrackets: "always",
        // Auto closing
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoIndent: "full",
        // Folding
        folding: true,
        foldingStrategy: "indentation",
        showFoldingControls: "mouseover",
        // Find widget
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: "multiline",
          seedSearchStringFromSelection: "always",
        },
        // Linked editing (auto rename tags)
        linkedEditing: true,
        // Render whitespace on selection
        renderWhitespace: "selection",
        // Sticky scroll (shows parent scope at top)
        stickyScroll: { enabled: true },
        // Inline hints
        inlayHints: { enabled: "on" },
        // Diff editor glyph margin
        glyphMargin: true,
        // Drag and drop text
        dragAndDrop: true,
        // Multi cursor
        multiCursorModifier: "alt",
      }}
    />
  );
}
