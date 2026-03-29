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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wand2, Sparkles, Layout, Palette } from "lucide-react";
import { usePlaygroundStore } from "@/lib/stores/playground-store";

interface WebsiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (files: Record<string, any>) => void;
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

export default function WebsiteGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
}: WebsiteGeneratorModalProps) {
  const { selectedModel } = usePlaygroundStore();
  const [prompt, setPrompt] = useState("");
  const [pageType, setPageType] = useState("Landing Page");
  const [stylePreset, setStylePreset] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const generateWebsite = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress("Analyzing your description...");

    try {
      const selectedStyle = STYLE_PRESETS.find((s) => s.id === stylePreset);

      const systemPrompt = `You are an expert web developer. Generate a complete single-page website as ONE HTML file with inline CSS and JS. Style: ${selectedStyle?.label}. Page type: ${pageType}. Return ONLY the HTML code starting with <!DOCTYPE html>. No markdown fences, no explanation. Include: responsive design, CSS Grid/Flexbox, animations, navigation, hero section, Google Fonts, placeholder images from picsum.photos, smooth scroll JS. Pure HTML/CSS/JS only.`;

      setProgress("Generating website with AI... This may take up to 30 seconds.");

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
      setProgress("Processing generated code...");

      // Extract HTML from response (strip markdown fences if any)
      let html = (data.response || "")
        .replace(/^```html?\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();

      // If it doesn't start with <!DOCTYPE or <html, wrap it
      if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
        html = `<!DOCTYPE html><html><head><title>Generated</title></head><body>${html}</body></html>`;
      }

      const files: Record<string, string> = {
        "index.html": html,
      };

      // Convert to WebContainer file tree format
      const fileTree: Record<string, any> = {
        "package.json": {
          file: {
            contents: JSON.stringify(
              {
                name: "generated-website",
                version: "1.0.0",
                scripts: {
                  dev: "npx serve .",
                },
                dependencies: {
                  serve: "^14.0.0",
                },
              },
              null,
              2
            ),
          },
        },
      };

      for (const [fileName, content] of Object.entries(files)) {
        fileTree[fileName] = {
          file: {
            contents: typeof content === "string" ? content : JSON.stringify(content),
          },
        };
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
            Describe the website you want and AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                Generate Website
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
