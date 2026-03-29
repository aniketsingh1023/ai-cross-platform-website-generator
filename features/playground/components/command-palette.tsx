"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import {
  FileIcon,
  SaveIcon,
  SaveAllIcon,
  PlayIcon,
  EyeIcon,
  TerminalIcon,
  MessageSquareIcon,
  SparklesIcon,
  DownloadIcon,
  GitBranchIcon,
  CodeIcon,
  MoveVerticalIcon,
  WrapTextIcon,
  MapIcon,
  PlusIcon,
  MinusIcon,
} from "lucide-react"

interface CommandPaletteProps {
  files: Array<{ name: string; path: string }>
  onFileOpen: (path: string) => void
  onAction: (action: string) => void
}

export function CommandPalette({
  files,
  onFileOpen,
  onAction,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleFileSelect = (path: string) => {
    onFileOpen(path)
    setOpen(false)
  }

  const handleAction = (action: string) => {
    onAction(action)
    setOpen(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search for files and actions..."
      showCloseButton={false}
      className="sm:max-w-[540px]"
    >
      <CommandInput placeholder="Type a command or search files..." />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {files.length > 0 && (
          <CommandGroup heading="Files">
            {files.map((file) => (
              <CommandItem
                key={file.path}
                value={`file:${file.name} ${file.path}`}
                onSelect={() => handleFileSelect(file.path)}
              >
                <FileIcon className="text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground max-w-[200px]">
                  {file.path}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="Save File"
            onSelect={() => handleAction("save-file")}
          >
            <SaveIcon className="text-muted-foreground" />
            <span>Save File</span>
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Save All"
            onSelect={() => handleAction("save-all")}
          >
            <SaveAllIcon className="text-muted-foreground" />
            <span>Save All</span>
          </CommandItem>
          <CommandItem
            value="Run Project"
            onSelect={() => handleAction("run-project")}
          >
            <PlayIcon className="text-muted-foreground" />
            <span>Run Project</span>
          </CommandItem>
          <CommandItem
            value="Toggle Preview"
            onSelect={() => handleAction("toggle-preview")}
          >
            <EyeIcon className="text-muted-foreground" />
            <span>Toggle Preview</span>
          </CommandItem>
          <CommandItem
            value="Toggle Terminal"
            onSelect={() => handleAction("toggle-terminal")}
          >
            <TerminalIcon className="text-muted-foreground" />
            <span>Toggle Terminal</span>
          </CommandItem>
          <CommandItem
            value="Toggle AI Chat"
            onSelect={() => handleAction("toggle-ai-chat")}
          >
            <MessageSquareIcon className="text-muted-foreground" />
            <span>Toggle AI Chat</span>
          </CommandItem>
          <CommandItem
            value="Generate Website"
            onSelect={() => handleAction("generate-website")}
          >
            <SparklesIcon className="text-muted-foreground" />
            <span>Generate Website</span>
          </CommandItem>
          <CommandItem
            value="Export Project"
            onSelect={() => handleAction("export-project")}
          >
            <DownloadIcon className="text-muted-foreground" />
            <span>Export Project</span>
          </CommandItem>
          <CommandItem
            value="Push to GitHub"
            onSelect={() => handleAction("push-to-github")}
          >
            <GitBranchIcon className="text-muted-foreground" />
            <span>Push to GitHub</span>
          </CommandItem>
          <CommandItem
            value="Format Code"
            onSelect={() => handleAction("format-code")}
          >
            <CodeIcon className="text-muted-foreground" />
            <span>Format Code</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Editor">
          <CommandItem
            value="Go to Line"
            onSelect={() => handleAction("go-to-line")}
          >
            <MoveVerticalIcon className="text-muted-foreground" />
            <span>Go to Line...</span>
          </CommandItem>
          <CommandItem
            value="Toggle Word Wrap"
            onSelect={() => handleAction("toggle-word-wrap")}
          >
            <WrapTextIcon className="text-muted-foreground" />
            <span>Toggle Word Wrap</span>
          </CommandItem>
          <CommandItem
            value="Toggle Minimap"
            onSelect={() => handleAction("toggle-minimap")}
          >
            <MapIcon className="text-muted-foreground" />
            <span>Toggle Minimap</span>
          </CommandItem>
          <CommandItem
            value="Increase Font Size"
            onSelect={() => handleAction("increase-font-size")}
          >
            <PlusIcon className="text-muted-foreground" />
            <span>Increase Font Size</span>
            <CommandShortcut>Ctrl+=</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Decrease Font Size"
            onSelect={() => handleAction("decrease-font-size")}
          >
            <MinusIcon className="text-muted-foreground" />
            <span>Decrease Font Size</span>
            <CommandShortcut>Ctrl+-</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
