"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Github,
  GitBranch,
  Upload,
  Download,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react";

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, string>;
  projectTitle: string;
  onImport?: (files: Record<string, any>, repoName: string) => void;
}

const STORAGE_KEY = "github_pat";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseRepoFullName(input: string): string | null {
  const trimmed = input.trim();
  // Handle owner/repo format
  if (/^[^/\s]+\/[^/\s]+$/.test(trimmed)) {
    return trimmed;
  }
  // Handle https://github.com/owner/repo or github.com/owner/repo
  const match = trimmed.match(
    /(?:https?:\/\/)?github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?(?:\/.*)?$/
  );
  if (match) {
    return match[1];
  }
  return null;
}

export default function GitHubModal({
  isOpen,
  onClose,
  files,
  projectTitle,
  onImport,
}: GitHubModalProps) {
  const [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Push tab state
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgress, setPushProgress] = useState("");

  // Existing repo state
  const [existingRepo, setExistingRepo] = useState("");

  // Import tab state
  const [importUrl, setImportUrl] = useState("");
  const [importBranch, setImportBranch] = useState("main");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
  }, []);

  // Pre-fill repo name from project title
  useEffect(() => {
    if (projectTitle) {
      setRepoName(slugify(projectTitle));
    }
  }, [projectTitle]);

  // Auto-verify saved token when modal opens
  useEffect(() => {
    if (isOpen && token && !isConnected) {
      verifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const verifyToken = useCallback(
    async (tokenToVerify: string) => {
      if (!tokenToVerify.trim()) return;
      setIsVerifying(true);
      try {
        const res = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check-token", token: tokenToVerify }),
        });
        const data = await res.json();
        if (data.valid) {
          setIsConnected(true);
          setUsername(data.username);
          localStorage.setItem(STORAGE_KEY, tokenToVerify);
          toast.success(`Connected as ${data.username}`);
        } else {
          setIsConnected(false);
          setUsername("");
          toast.error("Invalid GitHub token");
        }
      } catch {
        setIsConnected(false);
        toast.error("Failed to verify token");
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const handleCreateAndPush = async () => {
    if (!repoName.trim()) {
      toast.error("Repository name is required");
      return;
    }

    setIsPushing(true);
    setPushProgress("Creating repository...");

    try {
      // Create the repo
      const createRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-repo",
          token,
          repoName: repoName.trim(),
          description,
          isPrivate,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create repository");
      }

      setPushProgress(`Repository created. Pushing ${Object.keys(files).length} file(s)...`);

      // Push files
      const pushRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push",
          token,
          repoName: repoName.trim(),
          files,
        }),
      });

      const pushData = await pushRes.json();
      if (!pushRes.ok) {
        throw new Error(pushData.error || "Failed to push files");
      }

      setPushProgress("Done!");
      toast.success(
        <div className="flex items-center gap-2">
          <span>Pushed to GitHub successfully!</span>
          <a
            href={createData.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            View repo
          </a>
        </div>
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
    } finally {
      setIsPushing(false);
      setPushProgress("");
    }
  };

  const handlePushToExisting = async () => {
    if (!existingRepo.trim()) {
      toast.error("Repository name is required (format: owner/repo)");
      return;
    }

    const parts = existingRepo.trim().split("/");
    if (parts.length !== 2) {
      toast.error("Repository must be in owner/repo format");
      return;
    }

    const repoOnly = parts[1];

    setIsPushing(true);
    setPushProgress(`Pushing ${Object.keys(files).length} file(s) to ${existingRepo}...`);

    try {
      const pushRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push",
          token,
          repoName: repoOnly,
          files,
        }),
      });

      const pushData = await pushRes.json();
      if (!pushRes.ok) {
        throw new Error(pushData.error || "Failed to push files");
      }

      setPushProgress("Done!");
      toast.success("Files pushed to GitHub successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
    } finally {
      setIsPushing(false);
      setPushProgress("");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setIsConnected(false);
    setUsername("");
    toast.info("Disconnected from GitHub");
  };

  const handleImport = async () => {
    const repoFullName = parseRepoFullName(importUrl);
    if (!repoFullName) {
      toast.error(
        "Invalid repository URL. Use formats like: owner/repo, github.com/owner/repo, or https://github.com/owner/repo"
      );
      return;
    }

    if (!token || !isConnected) {
      toast.error("Please connect your GitHub token first (in the Push tab)");
      return;
    }

    setIsImporting(true);
    setImportProgress("Fetching repository tree...");

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          token,
          repoFullName,
          branch: importBranch || "main",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import repository");
      }

      setImportProgress("Done!");
      toast.success(`Imported ${repoFullName} successfully!`);

      if (onImport) {
        onImport(data.files, data.repoName);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
      setImportProgress("");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </DialogTitle>
          <DialogDescription>
            Push your project to GitHub or import from an existing repository.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="push" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="push" className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Push to GitHub
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Import from GitHub
            </TabsTrigger>
          </TabsList>

          {/* Push Tab */}
          <TabsContent value="push" className="space-y-4 mt-4">
            {/* Token Section */}
            <div className="space-y-2">
              <Label htmlFor="github-token" className="text-sm font-medium">
                Personal Access Token
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isConnected}
                    className="pr-8"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {isConnected ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    ) : token ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    ) : null}
                  </div>
                </div>
                {isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="shrink-0"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => verifyToken(token)}
                    disabled={!token.trim() || isVerifying}
                    className="shrink-0"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
              {isConnected && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  Connected as <span className="font-medium">{username}</span>
                </p>
              )}
            </div>

            {isConnected && (
              <>
                {/* Divider */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Create New Repository</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="repo-name" className="text-xs">
                        Repository Name
                      </Label>
                      <Input
                        id="repo-name"
                        placeholder="my-project"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        disabled={isPushing}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="repo-desc" className="text-xs">
                        Description (optional)
                      </Label>
                      <Input
                        id="repo-desc"
                        placeholder="A brief description of your project"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isPushing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="repo-private"
                        className="text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        {isPrivate ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : (
                          <Unlock className="h-3.5 w-3.5" />
                        )}
                        {isPrivate ? "Private" : "Public"} repository
                      </Label>
                      <Switch
                        id="repo-private"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                        disabled={isPushing}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateAndPush}
                      disabled={isPushing || !repoName.trim()}
                    >
                      {isPushing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Create Repo &amp; Push
                    </Button>
                  </div>
                </div>

                {/* Push to existing */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Push to Existing Repository</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="existing-repo" className="text-xs">
                        Repository (owner/repo)
                      </Label>
                      <Input
                        id="existing-repo"
                        placeholder="username/my-repo"
                        value={existingRepo}
                        onChange={(e) => setExistingRepo(e.target.value)}
                        disabled={isPushing}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handlePushToExisting}
                      disabled={isPushing || !existingRepo.trim()}
                    >
                      {isPushing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <GitBranch className="h-4 w-4 mr-2" />
                      )}
                      Push to Repo
                    </Button>
                  </div>
                </div>

                {/* Progress indicator */}
                {pushProgress && (
                  <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    {pushProgress === "Done!" ? (
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    )}
                    {pushProgress}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4 mt-4">
            {!isConnected && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Connect your GitHub token in the &quot;Push to GitHub&quot; tab first to import repositories.
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="import-url" className="text-sm font-medium">
                  Repository URL
                </Label>
                <Input
                  id="import-url"
                  placeholder="https://github.com/owner/repo or owner/repo"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="import-branch" className="text-xs">
                  Branch
                </Label>
                <Input
                  id="import-branch"
                  placeholder="main"
                  value={importBranch}
                  onChange={(e) => setImportBranch(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleImport}
                disabled={isImporting || !importUrl.trim() || !isConnected}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isImporting ? "Importing..." : "Import Repository"}
              </Button>
              {importProgress && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  {importProgress === "Done!" ? (
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  )}
                  {importProgress}
                </div>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Imports up to 100 text files. Binary files and files over 500KB are skipped.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
