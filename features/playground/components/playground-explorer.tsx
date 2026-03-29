"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Trash2,
  FileEdit,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
  path: string;
}

interface PlaygroundExplorerProps {
  tree: FileTreeNode[];
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  onDeleteFile?: (path: string) => void;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    js: "text-yellow-400",
    jsx: "text-blue-400",
    ts: "text-blue-500",
    tsx: "text-blue-500",
    css: "text-purple-400",
    html: "text-orange-400",
    json: "text-yellow-300",
    md: "text-gray-400",
    vue: "text-green-400",
  };
  return colors[ext || ""] || "text-gray-400";
}

function FileNode({
  node,
  level,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}: {
  node: FileTreeNode;
  level: number;
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  onDeleteFile?: (path: string) => void;
}) {
  const [dialogType, setDialogType] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (dialogType === "file") {
      onCreateFile?.(node.path, newName.trim());
    } else {
      onCreateFolder?.(node.path, newName.trim());
    }
    setDialogType(null);
    setNewName("");
  };

  if (node.type === "file") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={node.path === activeFile}
          onClick={() => onFileSelect(node.path)}
          className="group/file"
        >
          <File className={cn("h-4 w-4", getFileIcon(node.name))} />
          <span className="truncate">{node.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-auto opacity-0 group-hover/file:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem
                onClick={() => onDeleteFile?.(node.path)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const sorted = [...(node.children || [])].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "directory" ? -1 : 1;
  });

  return (
    <>
      <SidebarMenuItem>
        <Collapsible defaultOpen={level < 2} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="group/folder">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              <Folder className="h-4 w-4 text-blue-400 group-data-[state=open]/collapsible:hidden" />
              <FolderOpen className="h-4 w-4 text-blue-400 hidden group-data-[state=open]/collapsible:block" />
              <span className="truncate">{node.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-auto opacity-0 group-hover/folder:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem onClick={() => { setDialogType("file"); setNewName(""); }}>
                    <FilePlus className="h-4 w-4 mr-2" />
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setDialogType("folder"); setNewName(""); }}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteFile?.(node.path)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {sorted.map((child) => (
                <FileNode
                  key={child.path}
                  node={child}
                  level={level + 1}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                  onCreateFile={onCreateFile}
                  onCreateFolder={onCreateFolder}
                  onDeleteFile={onDeleteFile}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "file" ? "New File" : "New Folder"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={dialogType === "file" ? "filename.js" : "folder-name"}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PlaygroundExplorer({
  tree,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}: PlaygroundExplorerProps) {
  const [dialogType, setDialogType] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");

  const handleRootCreate = () => {
    if (!newName.trim()) return;
    if (dialogType === "file") {
      onCreateFile?.("", newName.trim());
    } else {
      onCreateFolder?.("", newName.trim());
    }
    setDialogType(null);
    setNewName("");
  };

  const sorted = [...tree].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "directory" ? -1 : 1;
  });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files Explorer</SidebarGroupLabel>
          <SidebarGroupAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent">
                  <Plus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem onClick={() => { setDialogType("file"); setNewName(""); }}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDialogType("folder"); setNewName(""); }}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupAction>
          <SidebarMenu>
            {sorted.map((node) => (
              <FileNode
                key={node.path}
                node={node}
                level={0}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onDeleteFile={onDeleteFile}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "file" ? "New File" : "New Folder"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={dialogType === "file" ? "filename.js" : "folder-name"}
            onKeyDown={(e) => e.key === "Enter" && handleRootCreate()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleRootCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
