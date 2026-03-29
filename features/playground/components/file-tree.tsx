"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface FileTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
  path: string;
}

interface FileTreeProps {
  tree: FileTreeNode[];
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newName: string) => void;
}

function FileTreeItem({
  node,
  depth,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}: {
  node: FileTreeNode;
  depth: number;
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  onDeleteFile?: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const [isCreating, setIsCreating] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");
  const isActive = node.path === activeFile;
  const isDirectory = node.type === "directory";

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  const handleCreate = (type: "file" | "folder") => {
    setIsCreating(type);
    setIsOpen(true);
    setNewName("");
  };

  const submitCreate = () => {
    if (newName.trim()) {
      if (isCreating === "file") {
        onCreateFile?.(node.path, newName.trim());
      } else {
        onCreateFolder?.(node.path, newName.trim());
      }
    }
    setIsCreating(null);
    setNewName("");
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const iconColors: Record<string, string> = {
      js: "text-yellow-400",
      jsx: "text-blue-400",
      ts: "text-blue-500",
      tsx: "text-blue-500",
      css: "text-purple-400",
      html: "text-orange-400",
      json: "text-yellow-300",
      md: "text-gray-400",
      vue: "text-green-400",
      py: "text-green-500",
    };
    return iconColors[ext || ""] || "text-gray-400";
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 cursor-pointer text-sm hover:bg-accent/50 rounded-sm transition-colors",
              isActive && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={handleClick}
          >
            {isDirectory ? (
              <>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                {isOpen ? (
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                ) : (
                  <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                )}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <File
                  className={cn("h-3.5 w-3.5 shrink-0", getFileIcon(node.name))}
                />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isDirectory && (
            <>
              <ContextMenuItem onClick={() => handleCreate("file")}>
                <Plus className="h-4 w-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCreate("folder")}>
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem
            onClick={() => onDeleteFile?.(node.path)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isDirectory && isOpen && (
        <div>
          {isCreating && (
            <div
              className="flex items-center gap-1 px-2 py-1"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              {isCreating === "folder" ? (
                <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              ) : (
                <File className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              )}
              <input
                type="text"
                className="bg-transparent border border-primary/50 rounded px-1 text-sm w-full outline-none"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitCreate();
                  if (e.key === "Escape") setIsCreating(null);
                }}
                onBlur={submitCreate}
                autoFocus
              />
            </div>
          )}
          {node.children
            ?.sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "directory" ? -1 : 1;
            })
            .map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onDeleteFile={onDeleteFile}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  tree,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}: FileTreeProps) {
  return (
    <div className="py-1">
      {tree
        .sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === "directory" ? -1 : 1;
        })
        .map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDeleteFile={onDeleteFile}
          />
        ))}
    </div>
  );
}
