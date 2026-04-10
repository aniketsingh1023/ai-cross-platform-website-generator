"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Loader2,
  Rocket,
  Code2,
  Globe,
  Smartphone,
  RefreshCw,
  Copy,
  CheckCheck,
} from "lucide-react";
import DeployModal from "./deploy-modal";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Framework = "html" | "nextjs" | "vue";

const FRAMEWORK_INFO: Record<Framework, { label: string; icon: string; language: string; badge: string }> = {
  html: {
    label: "HTML + Tailwind",
    icon: "🌐",
    language: "html",
    badge: "Renders instantly",
  },
  nextjs: {
    label: "Next.js",
    icon: "▲",
    language: "typescript",
    badge: "React framework",
  },
  vue: {
    label: "Vue 3",
    icon: "💚",
    language: "html",
    badge: "Progressive framework",
  },
};

const EXAMPLE_PROMPTS = [
  "A SaaS landing page for an AI writing tool with pricing section",
  "A portfolio for a UX designer with dark theme and project gallery",
  "A restaurant website with menu, reservations, and contact form",
  "An e-commerce homepage for sustainable fashion brand",
];

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<Framework>("html");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    setGeneratedCode("");
    setPreviewHtml("");

    try {
      const res = await fetch("/api/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), framework }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setGeneratedCode(data.code || "");
      setPreviewHtml(data.previewHtml || data.code || "");
      setHasGenerated(true);
    } catch (err: any) {
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, framework, isGenerating]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fwInfo = FRAMEWORK_INFO[framework];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AI Website Generator</h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Multi-Framework
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Web</span>
            <span className="mx-1">+</span>
            <Smartphone className="h-4 w-4" />
            <span>Mobile</span>
          </div>
          {hasGenerated && (
            <Button
              onClick={() => setIsDeployOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Rocket className="h-4 w-4" />
              Deploy
            </Button>
          )}
        </div>
      </header>

      {/* Prompt bar */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex gap-3 flex-col sm:flex-row">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your website… e.g., A modern SaaS landing page for a project management tool with pricing, features, and a CTA"
              className="flex-1 min-h-[60px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
            <div className="flex gap-2 sm:flex-col">
              <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
                <SelectTrigger className="w-[160px] sm:w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FRAMEWORK_INFO) as [Framework, typeof FRAMEWORK_INFO[Framework]][]).map(
                    ([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="mr-2">{info.icon}</span>
                        {info.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="gap-2 sm:w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example prompts */}
          {!hasGenerated && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">Try:</span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs px-2 py-1 rounded-full border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* Framework badge */}
          {hasGenerated && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" />
              <span>Generated as</span>
              <Badge variant="outline" className="text-xs">
                {fwInfo.icon} {fwInfo.label}
              </Badge>
              <span>·</span>
              <span>{fwInfo.badge}</span>
              <button
                onClick={handleGenerate}
                className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm text-destructive max-w-5xl mx-auto">{error}</p>
        </div>
      )}

      {/* Main: Split view */}
      <div className="flex-1 flex overflow-hidden">
        {!hasGenerated && !isGenerating ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm px-6">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Wand2 className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-semibold">Ready to generate</h2>
              <p className="text-sm text-muted-foreground">
                Describe your website above, choose a framework, and click Generate. Your code
                and live preview will appear here instantly.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(["html", "nextjs", "vue"] as Framework[]).map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      framework === fw
                        ? "border-primary bg-primary/5"
                        : "hover:border-foreground/30"
                    }`}
                  >
                    <div className="text-2xl mb-1">{FRAMEWORK_INFO[fw].icon}</div>
                    <div className="text-xs font-medium">{FRAMEWORK_INFO[fw].label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isGenerating ? (
          /* Loading state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
              <p className="text-sm font-medium">
                Generating {fwInfo.label} website…
              </p>
              <p className="text-xs text-muted-foreground">
                {framework !== "html"
                  ? "Creating framework code + HTML preview"
                  : "Building responsive HTML with Tailwind"}
              </p>
            </div>
          </div>
        ) : (
          /* Split view: Code | Preview */
          <div className="flex-1 flex overflow-hidden">
            {/* Code editor panel */}
            <div className="w-1/2 flex flex-col border-r overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4" />
                  <span>{fwInfo.icon} {fwInfo.label} Code</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MonacoEditor
                  value={generatedCode}
                  language={fwInfo.language}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    padding: { top: 12 },
                  }}
                  onChange={(val) => setGeneratedCode(val || "")}
                />
              </div>
            </div>

            {/* Live preview panel */}
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Live Preview</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  iframe
                </Badge>
              </div>
              <div className="flex-1 overflow-hidden bg-white">
                <iframe
                  srcDoc={previewHtml}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0"
                  title="Website Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <DeployModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
    </div>
  );
}
