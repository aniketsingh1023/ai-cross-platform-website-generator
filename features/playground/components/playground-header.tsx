"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Loader2,
  Settings,
  Wand2,
  Download,
  MessageSquare,
  Github,
  Search,
  Play,
  Eye,
  EyeOff,
  Terminal,
  ExternalLink,
  Copy,
  Link,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import { AISettingsDropdown } from "./ai-settings-dropdown";
import { useState } from "react";

interface PlaygroundHeaderProps {
  onSave: () => void;
  onSaveAll: () => void;
  onRun: () => void;
  onExport: () => void;
  onToggleChat: () => void;
  onGenerateWebsite: () => void;
  onTogglePreview: () => void;
  onToggleTerminal: () => void;
  onGitHub: () => void;
  onSearch: () => void;
  isPreviewVisible: boolean;
  isTerminalVisible: boolean;
  isChatOpen: boolean;
  hasUnsavedChanges: boolean;
  selectedFileName: string | null;
  previewUrl?: string | null;
  isRunning?: boolean;
}

export default function PlaygroundHeader({
  onSave,
  onSaveAll,
  onRun,
  onExport,
  onToggleChat,
  onGenerateWebsite,
  onTogglePreview,
  onToggleTerminal,
  onGitHub,
  onSearch,
  isPreviewVisible,
  isTerminalVisible,
  isChatOpen,
  hasUnsavedChanges,
  selectedFileName,
  previewUrl,
  isRunning,
}: PlaygroundHeaderProps) {
  const { title, isSaving, isDirty, activeFile } = usePlaygroundStore();
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  return (
    <header className="h-14 border-b flex items-center px-4 justify-between bg-background">
      {/* Left: Sidebar trigger, title, filename */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="mr-1" />
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-lg font-semibold ml-2">{title || "Code Editor"}</h1>
        {selectedFileName && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <span className="text-sm text-muted-foreground">
              {selectedFileName}
            </span>
          </>
        )}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Run button - prominent green */}
        <Button
          size="sm"
          onClick={onRun}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? "Running..." : "Run"}
        </Button>

        {/* Preview toggle */}
        <Button
          size="sm"
          variant={isPreviewVisible ? "default" : "outline"}
          onClick={onTogglePreview}
          title={isPreviewVisible ? "Hide Preview" : "Show Preview"}
        >
          {isPreviewVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>

        {/* Terminal toggle */}
        <Button
          size="sm"
          variant={isTerminalVisible ? "default" : "outline"}
          onClick={onToggleTerminal}
          title={isTerminalVisible ? "Hide Terminal" : "Show Terminal"}
        >
          <Terminal className="h-4 w-4" />
        </Button>

        {/* Preview URL */}
        {previewUrl && (
          <>
            <Separator orientation="vertical" className="h-6 mx-0.5" />
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded hover:bg-accent max-w-45 truncate"
              title={previewUrl}
            >
              <Link className="h-3 w-3 shrink-0" />
              <span className="truncate">{previewUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleCopyUrl}
              title="Copy URL"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {urlCopied && (
              <span className="text-[10px] text-green-600">Copied!</span>
            )}
          </>
        )}

        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Save / Save All */}
        {activeFile && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Save
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onSaveAll}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save All
            </Button>
          </>
        )}

        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* Search, GitHub, Generate, Export */}
        <Button size="sm" variant="outline" onClick={onSearch}>
          <Search className="h-4 w-4 mr-1.5" />
          Search
        </Button>

        <Button size="sm" variant="outline" onClick={onGitHub}>
          <Github className="h-4 w-4 mr-1.5" />
          GitHub
        </Button>

        <Button size="sm" variant="outline" onClick={onGenerateWebsite}>
          <Wand2 className="h-4 w-4 mr-1.5" />
          Generate
        </Button>

        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </Button>

        <Separator orientation="vertical" className="h-6 mx-0.5" />

        {/* AI Chat, AI Settings, Settings */}
        <Button
          size="sm"
          variant={isChatOpen ? "default" : "outline"}
          onClick={onToggleChat}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          AI Chat
        </Button>

        <AISettingsDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onTogglePreview}>
              {isPreviewVisible ? "Hide" : "Show"} Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleTerminal}>
              {isTerminalVisible ? "Hide" : "Show"} Terminal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
