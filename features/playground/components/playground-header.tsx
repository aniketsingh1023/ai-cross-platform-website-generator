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
}: PlaygroundHeaderProps) {
  const { title, isSaving, isDirty, activeFile } = usePlaygroundStore();

  return (
    <header className="h-14 border-b flex items-center px-4 justify-between bg-background">
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

      <div className="flex items-center gap-2">
        {activeFile && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onSaveAll}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All
            </Button>
          </>
        )}

        <Button size="sm" variant="outline" onClick={onSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        <Button size="sm" variant="outline" onClick={onGitHub}>
          <Github className="h-4 w-4 mr-2" />
          GitHub
        </Button>

        <Button size="sm" variant="outline" onClick={onGenerateWebsite}>
          <Wand2 className="h-4 w-4 mr-2" />
          Generate
        </Button>

        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button
          size="sm"
          variant={isChatOpen ? "default" : "outline"}
          onClick={onToggleChat}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRun}>
              Run Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
