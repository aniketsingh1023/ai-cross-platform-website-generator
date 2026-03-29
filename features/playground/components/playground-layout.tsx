"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { X, FileText, Circle, XCircle } from "lucide-react";
import { usePlaygroundStore } from "@/lib/stores/playground-store";
import { useWebContainer } from "@/features/webcontainers/hooks/use-webcontainer";
import PlaygroundExplorer from "./playground-explorer";
import PlaygroundHeader from "./playground-header";
import { getLanguageFromFilename } from "./code-editor";
import { getTemplateFiles } from "@/lib/templates";
import type { Terminal as XTerminal } from "@xterm/xterm";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("./code-editor"), { ssr: false });
const TerminalComponent = dynamic(
  () => import("@/features/webcontainers/components/terminal"),
  { ssr: false }
);
const TerminalPanel = dynamic(
  () => import("@/features/webcontainers/components/terminal-panel"),
  { ssr: false }
);
const StatusBar = dynamic(
  () => import("./status-bar"),
  { ssr: false }
);
const Breadcrumbs = dynamic(
  () => import("./breadcrumbs"),
  { ssr: false }
);
const WebContainerPreview = dynamic(
  () => import("@/features/webcontainers/components/webcontainer-preview"),
  { ssr: false }
);
const AIChatSidePanel = dynamic(
  () => import("@/features/ai-chat/components/ai-chat-sidepanel"),
  { ssr: false }
);
const WebsiteGeneratorModal = dynamic(
  () => import("@/features/website-generator/components/website-generator-modal"),
  { ssr: false }
);
const GitHubModal = dynamic(
  () => import("./github-modal"),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("./command-palette").then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false }
);
const FileSearchDialog = dynamic(
  () => import("./file-search").then((mod) => ({ default: mod.FileSearch })),
  { ssr: false }
);

interface FileTreeNode {
  name: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
  path: string;
}

function convertToFileTree(
  files: Record<string, any>,
  parentPath = ""
): FileTreeNode[] {
  const nodes: FileTreeNode[] = [];
  for (const [name, value] of Object.entries(files)) {
    const path = parentPath ? `${parentPath}/${name}` : name;
    if (value.directory) {
      nodes.push({
        name,
        type: "directory",
        path,
        children: convertToFileTree(value.directory, path),
      });
    } else if (value.file) {
      nodes.push({ name, type: "file", path });
    }
  }
  return nodes;
}

function getFileContent(files: Record<string, any>, path: string): string {
  const parts = path.split("/");
  let current: any = files;
  for (const part of parts) {
    if (current[part]?.directory) {
      current = current[part].directory;
    } else if (current[part]?.file) {
      return current[part].file.contents || "";
    } else {
      return "";
    }
  }
  return "";
}

function setFileContent(
  files: Record<string, any>,
  path: string,
  content: string
): Record<string, any> {
  const newFiles = JSON.parse(JSON.stringify(files));
  const parts = path.split("/");
  let current = newFiles;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]]?.directory) {
      current = current[parts[i]].directory;
    }
  }
  const fileName = parts[parts.length - 1];
  if (current[fileName]?.file) {
    current[fileName].file.contents = content;
  }
  return newFiles;
}

interface PlaygroundLayoutProps {
  playgroundId: string;
  initialTitle: string;
  initialTemplate: string;
  initialFiles: Record<string, any> | null;
}

export default function PlaygroundLayout({
  playgroundId,
  initialTitle,
  initialTemplate,
  initialFiles,
}: PlaygroundLayoutProps) {
  const store = usePlaygroundStore();
  const webContainer = useWebContainer();
  const terminalRef = useRef<XTerminal | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track per-file dirty state
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

  // Track cursor position for status bar
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Initialize playground
  useEffect(() => {
    // Validate initialFiles has proper structure, otherwise fallback to template
    let files: Record<string, any>;
    try {
      if (initialFiles && Object.keys(initialFiles).length > 0) {
        // Check if it has the expected WebContainer format
        const firstKey = Object.keys(initialFiles)[0];
        const firstVal = initialFiles[firstKey];
        if (firstVal?.file || firstVal?.directory) {
          files = initialFiles;
        } else {
          // DB data might be wrapped differently, try to use template
          files = getTemplateFiles(initialTemplate);
        }
      } else {
        files = getTemplateFiles(initialTemplate);
      }
    } catch {
      files = getTemplateFiles("REACT"); // ultimate fallback
    }

    store.setPlayground(playgroundId, initialTitle, initialTemplate);
    store.setFiles(files);

    // Load all file contents into the store (without marking dirty)
    const loadContents = (fileObj: Record<string, any>, prefix = "") => {
      for (const [name, value] of Object.entries(fileObj)) {
        const path = prefix ? `${prefix}/${name}` : name;
        if (value.file) {
          store.loadFileContent(path, value.file.contents || "");
        } else if (value.directory) {
          loadContents(value.directory, path);
        }
      }
    };
    loadContents(files);

    // Open default file based on template
    const defaultFilesByTemplate: Record<string, string[]> = {
      REACT: ["src/App.jsx", "src/main.jsx", "index.html"],
      NEXTJS: ["pages/index.js", "pages/_app.js"],
      EXPRESS: ["index.js"],
      VUE: ["src/App.vue", "src/main.js", "index.html"],
      ANGULAR: ["src/app.js", "index.html"],
      HONO: ["index.js"],
    };
    const defaults = defaultFilesByTemplate[initialTemplate] || [
      "src/App.jsx", "index.js", "index.html",
    ];
    for (const df of defaults) {
      const content = getFileContent(files, df);
      if (content) {
        store.openFile(df);
        break;
      }
    }

    // Reset dirty state since we just loaded
    store.setDirty(false);
    setIsInitialized(true);
  }, [playgroundId]);

  // Boot WebContainer
  useEffect(() => {
    if (!isInitialized) return;
    const init = async () => {
      const instance = await webContainer.boot();
      if (instance) {
        store.setWebContainerReady(true);
        await webContainer.mountFiles(store.files);
      }
    };
    init();
  }, [isInitialized]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [store.files, store.fileContents]);

  const handleFileSelect = useCallback(
    (path: string) => {
      store.openFile(path);
      if (!store.fileContents[path]) {
        const content = getFileContent(store.files, path);
        store.updateFileContent(path, content);
      }
    },
    [store]
  );

  const handleFileChange = useCallback(
    (content: string) => {
      if (!store.activeFile) return;
      store.updateFileContent(store.activeFile, content);
      store.setDirty(true);
      setDirtyFiles((prev) => new Set(prev).add(store.activeFile!));

      if (webContainer.instance) {
        webContainer.writeFile(store.activeFile, content);
      }
    },
    [store, webContainer]
  );

  const handleSave = useCallback(async () => {
    store.setSaving(true);
    try {
      let updatedFiles = { ...store.files };
      for (const [path, content] of Object.entries(store.fileContents)) {
        updatedFiles = setFileContent(updatedFiles, path, content);
      }
      store.setFiles(updatedFiles);

      await fetch(`/api/template/${playgroundId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updatedFiles }),
      });

      store.setDirty(false);
      setDirtyFiles(new Set());
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      store.setSaving(false);
    }
  }, [store, playgroundId]);

  const handleRun = useCallback(async () => {
    if (!webContainer.instance) {
      const instance = await webContainer.boot();
      if (instance) {
        await webContainer.mountFiles(store.files);
        store.setWebContainerReady(true);
      }
    }
    setIsTerminalVisible(true);
    setIsPreviewVisible(true);
    await webContainer.installAndRun(terminalRef.current || undefined);
  }, [webContainer, store]);

  const handleExport = useCallback(() => {
    const exportData: Record<string, string> = {};
    const extractFiles = (obj: Record<string, any>, prefix = "") => {
      for (const [name, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}/${name}` : name;
        if (value.file) {
          exportData[path] = value.file.contents || "";
        } else if (value.directory) {
          extractFiles(value.directory, path);
        }
      }
    };
    extractFiles(store.files);

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${store.title || "project"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [store]);

  const handleCreateFile = useCallback(
    (parentPath: string, name: string) => {
      const newFiles = JSON.parse(JSON.stringify(store.files));
      let current = newFiles;

      if (parentPath) {
        const parts = parentPath.split("/");
        for (const part of parts) {
          if (current[part]?.directory) {
            current = current[part].directory;
          }
        }
      }

      current[name] = { file: { contents: "" } };
      store.setFiles(newFiles);
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      store.updateFileContent(fullPath, "");
      store.setDirty(true);

      if (webContainer.instance) {
        webContainer.writeFile(fullPath, "");
      }
    },
    [store, webContainer]
  );

  const handleCreateFolder = useCallback(
    (parentPath: string, name: string) => {
      const newFiles = JSON.parse(JSON.stringify(store.files));
      let current = newFiles;

      if (parentPath) {
        const parts = parentPath.split("/");
        for (const part of parts) {
          if (current[part]?.directory) {
            current = current[part].directory;
          }
        }
      }

      current[name] = { directory: {} };
      store.setFiles(newFiles);
      store.setDirty(true);

      if (webContainer.instance) {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        webContainer.mkdir(fullPath);
      }
    },
    [store, webContainer]
  );

  const handleDeleteFile = useCallback(
    (path: string) => {
      const newFiles = JSON.parse(JSON.stringify(store.files));
      const parts = path.split("/");
      let current = newFiles;
      for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]]?.directory) {
          current = current[parts[i]].directory;
        }
      }
      delete current[parts[parts.length - 1]];
      store.setFiles(newFiles);
      store.closeFile(path);
      store.setDirty(true);

      if (webContainer.instance) {
        webContainer.deleteFile(path);
      }
    },
    [store, webContainer]
  );

  const handleCloseAll = useCallback(() => {
    for (const f of store.openFiles) {
      store.closeFile(f);
    }
  }, [store]);

  const handleGenerateWebsite = useCallback(
    async (files: Record<string, any>) => {
      store.setFiles(files);
      store.setDirty(true);

      const loadContents = (fileObj: Record<string, any>, prefix = "") => {
        for (const [name, value] of Object.entries(fileObj)) {
          const path = prefix ? `${prefix}/${name}` : name;
          if (value.file) {
            store.updateFileContent(path, value.file.contents || "");
          } else if (value.directory) {
            loadContents(value.directory, path);
          }
        }
      };
      loadContents(files);

      if (files["index.html"]) {
        store.openFile("index.html");
      }

      if (webContainer.instance) {
        await webContainer.mountFiles(files);
        await webContainer.installAndRun(terminalRef.current || undefined);
        setIsPreviewVisible(true);
      }
    },
    [store, webContainer]
  );

  // Helper: get flat file list for command palette
  const getFlatFileList = useCallback(() => {
    const result: Array<{ name: string; path: string }> = [];
    const walk = (obj: Record<string, any>, prefix = "") => {
      for (const [name, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}/${name}` : name;
        if (value.file) result.push({ name, path });
        else if (value.directory) walk(value.directory, path);
      }
    };
    walk(store.files);
    return result;
  }, [store.files]);

  // Helper: get flat file contents for search
  const getFlatFileContents = useCallback(() => {
    const result: Record<string, string> = {};
    const walk = (obj: Record<string, any>, prefix = "") => {
      for (const [name, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}/${name}` : name;
        if (value.file) result[path] = store.fileContents[path] || value.file.contents || "";
        else if (value.directory) walk(value.directory, path);
      }
    };
    walk(store.files);
    return result;
  }, [store.files, store.fileContents]);

  // Command palette action handler
  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "save": handleSave(); break;
        case "run": handleRun(); break;
        case "toggle-preview": setIsPreviewVisible((v) => !v); break;
        case "toggle-terminal": setIsTerminalVisible((v) => !v); break;
        case "toggle-chat": setIsChatOpen((v) => !v); break;
        case "generate": setIsGenModalOpen(true); break;
        case "export": handleExport(); break;
        case "github": setIsGitHubModalOpen(true); break;
        case "search": setIsSearchOpen(true); break;
        case "format":
          if (store.activeFile) {
            import("./code-formatter").then(({ formatCode, canFormat }) => {
              const lang = getLanguageFromFilename(store.activeFile!);
              if (canFormat(lang)) {
                const code = store.fileContents[store.activeFile!] || "";
                formatCode(code, lang).then((formatted) => {
                  store.updateFileContent(store.activeFile!, formatted);
                  setDirtyFiles((prev) => new Set(prev).add(store.activeFile!));
                });
              }
            });
          }
          break;
      }
    },
    [handleSave, handleRun, handleExport, store]
  );

  const fileTree = convertToFileTree(store.files);
  const activeFileName = store.activeFile?.split("/").pop() || null;

  return (
    <SidebarProvider>
      <PlaygroundExplorer
        tree={fileTree}
        activeFile={store.activeFile}
        onFileSelect={handleFileSelect}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onDeleteFile={handleDeleteFile}
      />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <PlaygroundHeader
          onSave={handleSave}
          onSaveAll={handleSave}
          onRun={handleRun}
          onExport={handleExport}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onGenerateWebsite={() => setIsGenModalOpen(true)}
          onTogglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
          onToggleTerminal={() => setIsTerminalVisible(!isTerminalVisible)}
          onGitHub={() => setIsGitHubModalOpen(true)}
          onSearch={() => setIsSearchOpen(true)}
          isPreviewVisible={isPreviewVisible}
          isTerminalVisible={isTerminalVisible}
          isChatOpen={isChatOpen}
          hasUnsavedChanges={dirtyFiles.size > 0}
          selectedFileName={activeFileName}
        />

        <div className="flex-1 overflow-hidden">
          {store.openFiles.length > 0 ? (
            <div className="flex flex-col h-full">
              {/* File Tabs */}
              <div className="flex items-center border-b bg-muted/30 shrink-0">
                <div className="flex items-center overflow-x-auto flex-1">
                  {store.openFiles.map((filePath) => {
                    const fileName = filePath.split("/").pop() || filePath;
                    const isActive = store.activeFile === filePath;
                    const isUnsaved = dirtyFiles.has(filePath);

                    return (
                      <div
                        key={filePath}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer border-r transition-colors group/tab",
                          isActive
                            ? "bg-background border-b-2 border-b-primary"
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => store.setActiveFile(filePath)}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-32">{fileName}</span>
                        {isUnsaved && (
                          <Circle className="h-2 w-2 fill-orange-400 text-orange-400 shrink-0" />
                        )}
                        <button
                          className="h-4 w-4 flex items-center justify-center rounded opacity-0 group-hover/tab:opacity-100 hover:bg-accent shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            store.closeFile(filePath);
                            setDirtyFiles((prev) => {
                              const next = new Set(prev);
                              next.delete(filePath);
                              return next;
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {store.openFiles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mx-1 h-7 text-xs shrink-0"
                    onClick={handleCloseAll}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Close All
                  </Button>
                )}
              </div>

              {/* Main content area */}
              <div className="flex-1 overflow-hidden flex">
                {/* Editor + Preview horizontal */}
                <div className="flex-1 overflow-hidden">
                  <ResizablePanelGroup direction="vertical">
                    {/* Top: Editor + Preview side by side */}
                    <ResizablePanel defaultSize={isTerminalVisible ? 70 : 100}>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                          <div className="flex flex-col h-full">
                            <Breadcrumbs filePath={store.activeFile} />
                            <div className="flex-1 overflow-hidden">
                              <CodeEditor
                                value={
                                  store.fileContents[store.activeFile!] ||
                                  getFileContent(store.files, store.activeFile!)
                                }
                                language={getLanguageFromFilename(store.activeFile!)}
                                onChange={handleFileChange}
                                editorTheme={store.editorTheme}
                                onCursorChange={(line, col) => setCursorPos({ line, col })}
                              />
                            </div>
                          </div>
                        </ResizablePanel>

                        {isPreviewVisible && (
                          <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50}>
                              <WebContainerPreview
                                url={webContainer.previewUrl}
                                isLoading={webContainer.isRunning && !webContainer.previewUrl}
                              />
                            </ResizablePanel>
                          </>
                        )}
                      </ResizablePanelGroup>
                    </ResizablePanel>

                    {/* Bottom: Terminal */}
                    {isTerminalVisible && (
                      <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={15}>
                          <TerminalPanel
                            onData={() => {}}
                            terminalRef={terminalRef}
                            TerminalComponent={TerminalComponent}
                          />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </div>

                {/* AI Chat Panel */}
                {isChatOpen && (
                  <div className="w-96 border-l shrink-0">
                    <AIChatSidePanel
                      isOpen={isChatOpen}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h2 className="text-lg font-medium mb-1">No files open</h2>
                <p className="text-sm">
                  Select a file from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </div>

        <StatusBar
          activeFile={store.activeFile}
          cursorLine={cursorPos.line}
          cursorColumn={cursorPos.col}
          language={store.activeFile ? getLanguageFromFilename(store.activeFile) : ""}
          isDirty={dirtyFiles.size > 0}
          isConnected={store.webContainerReady}
          editorTheme={store.editorTheme}
          onThemeChange={store.setEditorTheme}
        />
      </SidebarInset>

      <WebsiteGeneratorModal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        onGenerate={handleGenerateWebsite}
      />

      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        files={getFlatFileContents()}
        projectTitle={store.title}
        onImport={(files: Record<string, any>) => {
          store.setFiles(files);
          const loadContents = (fileObj: Record<string, any>, prefix = "") => {
            for (const [name, value] of Object.entries(fileObj)) {
              const path = prefix ? `${prefix}/${name}` : name;
              if (value.file) store.loadFileContent(path, value.file.contents || "");
              else if (value.directory) loadContents(value.directory, path);
            }
          };
          loadContents(files);
          // Open first file
          const firstFile = Object.keys(files).find((k) => files[k]?.file);
          if (firstFile) store.openFile(firstFile);
          store.setDirty(true);
          if (webContainer.instance) {
            webContainer.mountFiles(files);
          }
          setIsGitHubModalOpen(false);
        }}
      />

      <CommandPalette
        files={getFlatFileList()}
        onFileOpen={handleFileSelect}
        onAction={handleAction}
      />

      <FileSearchDialog
        files={getFlatFileContents()}
        onFileOpen={handleFileSelect}
        onResultClick={(path, _line) => handleFileSelect(path)}
      />
    </SidebarProvider>
  );
}
