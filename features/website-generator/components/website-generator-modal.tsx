"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wand2, Sparkles, Layout, Palette, Code2 } from "lucide-react";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import { Badge } from "@/components/ui/badge";

interface WebsiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (files: Record<string, any>) => void;
  currentTemplate: string;
}

const STYLE_PRESETS = [
  { id: "modern", label: "Modern & Clean", desc: "Minimalist with subtle animations" },
  { id: "bold", label: "Bold & Vibrant", desc: "Eye-catching colors and large text" },
  { id: "elegant", label: "Elegant & Professional", desc: "Sophisticated with serif fonts" },
  { id: "playful", label: "Playful & Creative", desc: "Fun colors and rounded shapes" },
  { id: "dark", label: "Dark & Moody", desc: "Dark theme with neon accents" },
];

const PAGE_TYPES = [
  "Landing Page",
  "Portfolio",
  "Blog",
  "E-commerce",
  "Dashboard",
  "Documentation",
  "SaaS Product",
  "Restaurant",
  "Agency",
];

const TEMPLATE_FILE_CONFIG: Record<string, { files: string[]; prompt: string }> = {
  REACT: {
    files: ["src/App.jsx", "src/App.css", "src/index.css"],
    prompt:
      "Generate a React app with components for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: src/App.jsx (main component with all sections using modern React with hooks), src/App.css (all component styles), src/index.css (global styles with @import for Google Fonts). Include responsive design, animations, and clean structure.",
  },
  NEXTJS: {
    files: ["pages/index.js", "styles/globals.css"],
    prompt:
      "Generate a Next.js page for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: pages/index.js (a Next.js page component with Head, using React hooks), styles/globals.css (all styles with @import for Google Fonts). Include responsive design and animations.",
  },
  VUE: {
    files: ["src/App.vue", "src/main.js", "src/App.css"],
    prompt:
      "Generate a Vue 3 app for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: src/App.vue (single-file component with template, script setup, and scoped styles), src/main.js (createApp mount), src/App.css (global styles with @import for Google Fonts). Include responsive design and animations.",
  },
  EXPRESS: {
    files: ["index.js", "public/index.html", "public/style.css"],
    prompt:
      "Generate an Express.js app for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: index.js (Express server with routes that serve static files from public/), public/index.html (full HTML page linking style.css), public/style.css (all styles with Google Fonts). Include responsive design and animations.",
  },
  HONO: {
    files: ["index.js", "public/index.html", "public/style.css"],
    prompt:
      "Generate a Hono web app for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: index.js (Hono server with serveStatic for public/ and API routes), public/index.html (full HTML page linking style.css), public/style.css (all styles with Google Fonts). Include responsive design and animations.",
  },
  ANGULAR: {
    files: ["src/app.js", "src/style.css", "index.html"],
    prompt:
      "Generate an Angular-style app for: {description}. Style: {style}. Return files in this exact format: ===FILE: path=== then contents. Files to generate: src/app.js (main application logic), src/style.css (all styles with Google Fonts), index.html (main HTML entry point). Include responsive design and animations.",
  },
};

function parseGeneratedFiles(response: string): Record<string, string> {
  const files: Record<string, string> = {};

  // Strip markdown fences if present
  let cleaned = response
    .replace(/^```[\w]*\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();

  // Split on ===FILE: ...=== markers
  const fileRegex = /===FILE:\s*(.+?)\s*===/g;
  const parts: Array<{ path: string; startIndex: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(cleaned)) !== null) {
    parts.push({ path: match[1].trim(), startIndex: match.index + match[0].length });
  }

  for (let i = 0; i < parts.length; i++) {
    const endIndex = i + 1 < parts.length
      ? cleaned.lastIndexOf("===FILE:", parts[i + 1].startIndex)
      : cleaned.indexOf("===END===", parts[i].startIndex) !== -1
        ? cleaned.indexOf("===END===", parts[i].startIndex)
        : cleaned.length;

    const content = cleaned.slice(parts[i].startIndex, endIndex).trim();
    files[parts[i].path] = content;
  }

  return files;
}

function buildFileTreeEntry(path: string, content: string): { key: string[]; value: any } {
  const parts = path.split("/");
  return { key: parts, value: content };
}

function mergeIntoFileTree(
  existingTree: Record<string, any>,
  generatedFiles: Record<string, string>
): Record<string, any> {
  const merged = JSON.parse(JSON.stringify(existingTree));

  for (const [filePath, content] of Object.entries(generatedFiles)) {
    const parts = filePath.split("/");
    let current = merged;

    // Navigate/create directories for all but the last part
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      if (!current[dirName]) {
        current[dirName] = { directory: {} };
      } else if (!current[dirName].directory) {
        current[dirName] = { directory: {} };
      }
      current = current[dirName].directory;
    }

    // Set the file
    const fileName = parts[parts.length - 1];
    current[fileName] = { file: { contents: content } };
  }

  return merged;
}

export default function WebsiteGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  currentTemplate,
}: WebsiteGeneratorModalProps) {
  const { selectedModel } = usePlaygroundStore();
  const [prompt, setPrompt] = useState("");
  const [pageType, setPageType] = useState("Landing Page");
  const [stylePreset, setStylePreset] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const templateKey = currentTemplate?.toUpperCase() || "REACT";
  const templateConfig = TEMPLATE_FILE_CONFIG[templateKey] || TEMPLATE_FILE_CONFIG.REACT;

  const generateWebsite = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress("Analyzing your description...");

    try {
      const selectedStyle = STYLE_PRESETS.find((s) => s.id === stylePreset);

      const frameworkPrompt = templateConfig.prompt
        .replace("{description}", prompt)
        .replace("{style}", selectedStyle?.label || "Modern & Clean");

      const systemPrompt = `You are an expert web developer. Generate code for a ${pageType.toLowerCase()} website. ${frameworkPrompt}

IMPORTANT: Return ONLY the files in this exact delimiter format, nothing else:
===FILE: path/to/file===
file contents here
===FILE: another/file===
file contents here
===END===

Do not include any explanation, markdown fences, or text outside the file delimiters. Use placeholder images from picsum.photos. Include smooth animations and transitions.`;

      setProgress(`Generating ${templateKey} website with AI... This may take up to 30 seconds.`);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Create a ${pageType.toLowerCase()} website: ${prompt}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.response || errData.error || "AI request failed");
      }

      const data = await res.json();
      setProgress("Parsing generated files...");

      const rawResponse = data.response || "";
      const generatedFiles = parseGeneratedFiles(rawResponse);

      if (Object.keys(generatedFiles).length === 0) {
        throw new Error("Failed to parse generated files. The AI response did not contain the expected file format.");
      }

      setProgress(`Generated ${Object.keys(generatedFiles).length} files. Merging with template...`);

      // The onGenerate callback receives only the generated files;
      // the layout will handle merging with the existing template tree.
      const fileTree: Record<string, any> = {};
      for (const [filePath, content] of Object.entries(generatedFiles)) {
        const parts = filePath.split("/");
        let current = fileTree;
        for (let i = 0; i < parts.length - 1; i++) {
          const dirName = parts[i];
          if (!current[dirName]) {
            current[dirName] = { directory: {} };
          }
          current = current[dirName].directory;
        }
        current[parts[parts.length - 1]] = { file: { contents: content } };
      }

      setProgress("Website generated successfully!");
      onGenerate(fileTree);
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
      setProgress(`Failed to generate: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Website Generator
          </DialogTitle>
          <DialogDescription>
            Describe the website you want and AI will generate it for your{" "}
            <Badge variant="secondary" className="ml-1">
              <Code2 className="h-3 w-3 mr-1" />
              {templateKey}
            </Badge>{" "}
            project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template Info */}
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <span className="font-medium">Target framework:</span>{" "}
            <span className="text-muted-foreground">{templateKey}</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span className="font-medium">Files:</span>{" "}
            <span className="text-muted-foreground">{templateConfig.files.join(", ")}</span>
          </div>

          {/* Page Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5" />
              Page Type
            </Label>
            <Select value={pageType} onValueChange={setPageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style Preset */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Style Preset
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLE_PRESETS.map((style) => (
                <Button
                  key={style.id}
                  variant={stylePreset === style.id ? "secondary" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-start text-left"
                  onClick={() => setStylePreset(style.id)}
                >
                  <span className="text-xs font-medium">{style.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {style.desc}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Describe your website
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A portfolio website for a photographer with a gallery grid, about section, and contact form. Use dark theme with golden accents."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Progress */}
          {progress && (
            <p
              className={`text-xs ${
                progress.includes("Failed") ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {progress}
            </p>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateWebsite}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate {templateKey} Website
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
