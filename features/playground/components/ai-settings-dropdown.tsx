"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Settings, Brain, Cpu, Zap } from "lucide-react";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import { useEffect, useState } from "react";

const POPULAR_MODELS = [
  { id: "codellama:latest", name: "CodeLlama", icon: Cpu, desc: "Code completion" },
  { id: "llama3.2:latest", name: "Llama 3.2", icon: Brain, desc: "General purpose" },
  { id: "deepseek-coder:latest", name: "DeepSeek Coder", icon: Zap, desc: "Code focused" },
  { id: "mistral:latest", name: "Mistral", icon: Brain, desc: "Fast & capable" },
  { id: "qwen2.5-coder:latest", name: "Qwen 2.5 Coder", icon: Cpu, desc: "Code generation" },
];

export function AISettingsDropdown() {
  const { aiSuggestionsEnabled, setAiSuggestionsEnabled, selectedModel, setSelectedModel } =
    usePlaygroundStore();
  const [ollamaStatus, setOllamaStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    setOllamaStatus("checking");
    try {
      const res = await fetch("/api/ollama");
      const data = await res.json();
      if (data.status === "connected") {
        setAvailableModels(data.models || []);
        setOllamaStatus("connected");
      } else {
        setOllamaStatus("disconnected");
      }
    } catch {
      setOllamaStatus("disconnected");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ollamaStatus === "connected"
                ? "bg-green-400"
                : ollamaStatus === "disconnected"
                ? "bg-red-400"
                : "bg-yellow-400"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>AI Settings</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              ollamaStatus === "connected"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {ollamaStatus === "connected" ? "Ollama Connected" : "Ollama Offline"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-sm">Inline Suggestions</span>
          <Switch
            checked={aiSuggestionsEnabled}
            onCheckedChange={setAiSuggestionsEnabled}
          />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Model
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {POPULAR_MODELS.map((model) => {
            const isAvailable = availableModels.some((m) =>
              m.startsWith(model.id.split(":")[0])
            );
            return (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <model.icon className="h-3.5 w-3.5" />
                  <div>
                    <span className="text-sm">{model.name}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {model.desc}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedModel === model.id && (
                    <span className="text-xs text-primary">Active</span>
                  )}
                  {isAvailable && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        {availableModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Installed Models
            </DropdownMenuLabel>
            {availableModels
              .filter(
                (m) => !POPULAR_MODELS.some((p) => m.startsWith(p.id.split(":")[0]))
              )
              .slice(0, 5)
              .map((model) => (
                <DropdownMenuItem
                  key={model}
                  onClick={() => setSelectedModel(model)}
                >
                  <Cpu className="h-3.5 w-3.5 mr-2" />
                  <span className="text-sm">{model}</span>
                  {selectedModel === model && (
                    <span className="ml-auto text-xs text-primary">Active</span>
                  )}
                </DropdownMenuItem>
              ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={checkOllamaStatus}>
          Refresh Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
