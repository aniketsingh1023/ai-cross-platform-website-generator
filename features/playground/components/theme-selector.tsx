"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

interface ThemeOption {
  id: string;
  label: string;
  background: string;
  category: "builtin" | "custom";
}

const BUILTIN_THEMES: ThemeOption[] = [
  { id: "vs", label: "Light", background: "#ffffff", category: "builtin" },
  { id: "vs-dark", label: "Dark", background: "#1e1e1e", category: "builtin" },
  {
    id: "hc-black",
    label: "High Contrast Dark",
    background: "#000000",
    category: "builtin",
  },
  {
    id: "hc-light",
    label: "High Contrast Light",
    background: "#ffffff",
    category: "builtin",
  },
];

const CUSTOM_THEMES: ThemeOption[] = [
  {
    id: "github-dark",
    label: "GitHub Dark",
    background: "#24292e",
    category: "custom",
  },
  {
    id: "monokai",
    label: "Monokai",
    background: "#272822",
    category: "custom",
  },
  {
    id: "dracula",
    label: "Dracula",
    background: "#282a36",
    category: "custom",
  },
  {
    id: "one-dark-pro",
    label: "One Dark Pro",
    background: "#282c34",
    category: "custom",
  },
  { id: "nord", label: "Nord", background: "#2e3440", category: "custom" },
];

export function registerCustomThemes(monaco: any) {
  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "f97583" },
      { token: "string", foreground: "9ecbff" },
      { token: "number", foreground: "79b8ff" },
      { token: "type", foreground: "b392f0" },
      { token: "variable", foreground: "e1e4e8" },
      { token: "function", foreground: "b392f0" },
      { token: "operator", foreground: "f97583" },
      { token: "constant", foreground: "79b8ff" },
    ],
    colors: {
      "editor.background": "#24292e",
      "editor.foreground": "#e1e4e8",
      "editor.lineHighlightBackground": "#2b3036",
      "editorLineNumber.foreground": "#444d56",
      "editorLineNumber.activeForeground": "#e1e4e8",
      "editor.selectionBackground": "#3392ff44",
      "editor.inactiveSelectionBackground": "#3392ff22",
      "editorCursor.foreground": "#c8e1ff",
      "editorWhitespace.foreground": "#444d56",
      "editorIndentGuide.background": "#444d56",
      "editorIndentGuide.activeBackground": "#e1e4e8",
    },
  });

  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e", fontStyle: "italic" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "function", foreground: "a6e22e" },
      { token: "operator", foreground: "f92672" },
      { token: "constant", foreground: "ae81ff" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorLineNumber.foreground": "#90908a",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editor.selectionBackground": "#49483e",
      "editor.inactiveSelectionBackground": "#49483e88",
      "editorCursor.foreground": "#f8f8f0",
      "editorWhitespace.foreground": "#464741",
      "editorIndentGuide.background": "#464741",
      "editorIndentGuide.activeBackground": "#767771",
    },
  });

  monaco.editor.defineTheme("dracula", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
      { token: "keyword", foreground: "ff79c6" },
      { token: "string", foreground: "f1fa8c" },
      { token: "number", foreground: "bd93f9" },
      { token: "type", foreground: "8be9fd", fontStyle: "italic" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "function", foreground: "50fa7b" },
      { token: "operator", foreground: "ff79c6" },
      { token: "constant", foreground: "bd93f9" },
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#44475a",
      "editorLineNumber.foreground": "#6272a4",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editor.selectionBackground": "#44475a",
      "editor.inactiveSelectionBackground": "#44475a88",
      "editorCursor.foreground": "#f8f8f2",
      "editorWhitespace.foreground": "#44475a",
      "editorIndentGuide.background": "#44475a",
      "editorIndentGuide.activeBackground": "#6272a4",
    },
  });

  monaco.editor.defineTheme("one-dark-pro", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "keyword", foreground: "c678dd" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" },
      { token: "type", foreground: "e5c07b" },
      { token: "variable", foreground: "e06c75" },
      { token: "function", foreground: "61afef" },
      { token: "operator", foreground: "56b6c2" },
      { token: "constant", foreground: "d19a66" },
    ],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "editor.lineHighlightBackground": "#2c313c",
      "editorLineNumber.foreground": "#4b5263",
      "editorLineNumber.activeForeground": "#abb2bf",
      "editor.selectionBackground": "#3e4451",
      "editor.inactiveSelectionBackground": "#3e445188",
      "editorCursor.foreground": "#528bff",
      "editorWhitespace.foreground": "#3b4048",
      "editorIndentGuide.background": "#3b4048",
      "editorIndentGuide.activeBackground": "#4b5263",
    },
  });

  monaco.editor.defineTheme("nord", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "616e88", fontStyle: "italic" },
      { token: "keyword", foreground: "81a1c1" },
      { token: "string", foreground: "a3be8c" },
      { token: "number", foreground: "b48ead" },
      { token: "type", foreground: "8fbcbb" },
      { token: "variable", foreground: "d8dee9" },
      { token: "function", foreground: "88c0d0" },
      { token: "operator", foreground: "81a1c1" },
      { token: "constant", foreground: "b48ead" },
    ],
    colors: {
      "editor.background": "#2e3440",
      "editor.foreground": "#d8dee9",
      "editor.lineHighlightBackground": "#3b4252",
      "editorLineNumber.foreground": "#4c566a",
      "editorLineNumber.activeForeground": "#d8dee9",
      "editor.selectionBackground": "#434c5e",
      "editor.inactiveSelectionBackground": "#434c5e88",
      "editorCursor.foreground": "#d8dee9",
      "editorWhitespace.foreground": "#434c5e",
      "editorIndentGuide.background": "#434c5e",
      "editorIndentGuide.activeBackground": "#4c566a",
    },
  });
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const isLightTheme =
    currentTheme === "vs" || currentTheme === "hc-light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {isLightTheme ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Built-in Themes</DropdownMenuLabel>
        {BUILTIN_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className="h-4 w-4 rounded-full border border-border flex-shrink-0"
              style={{ backgroundColor: theme.background }}
            />
            <span className="flex-1">{theme.label}</span>
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Custom Themes</DropdownMenuLabel>
        {CUSTOM_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className="h-4 w-4 rounded-full border border-border flex-shrink-0"
              style={{ backgroundColor: theme.background }}
            />
            <span className="flex-1">{theme.label}</span>
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
