"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2, Github, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPlaygroundFromGithub } from "@/features/dashboard/actions";

const STORAGE_KEY = "github_pat";

function parseRepoFullName(input: string): string | null {
  const trimmed = input.trim();
  if (/^[^/\s]+\/[^/\s]+$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:https?:\/\/)?github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?(?:\/.*)?$/
  );
  if (match) {
    return match[1];
  }
  return null;
}

function AddGithubButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (open && token && !isConnected) {
      verifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
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
  }, []);

  const handleImport = async () => {
    const repoFullName = parseRepoFullName(repoUrl);
    if (!repoFullName) {
      toast.error(
        "Invalid repository URL. Use: owner/repo, github.com/owner/repo, or https://github.com/owner/repo"
      );
      return;
    }

    if (!token || !isConnected) {
      toast.error("Please connect your GitHub token first");
      return;
    }

    setIsImporting(true);
    setImportProgress("Fetching repository...");

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          token,
          repoFullName,
          branch: branch || "main",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import repository");
      }

      setImportProgress("Creating playground...");

      const repoName = data.repoName || repoFullName.split("/").pop() || "github-import";
      const playground = await createPlaygroundFromGithub({
        title: repoName,
        description: `Imported from GitHub: ${repoFullName}`,
        userId: "",
        files: data.files,
      });

      if (playground) {
        toast.success(`Imported ${repoFullName} successfully!`);
        setOpen(false);
        router.push(`/playground/${playground.id}`);
      } else {
        toast.error("Failed to create playground from imported files");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setIsConnected(false);
    setUsername("");
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-[#E93F3F] hover:scale-[1.02]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        hover:shadow-[0_10px_30px_rgba(233,63,63,0.15)]"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant={"outline"}
            className="flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-[#E93F3F] group-hover:text-[#E93F3F] transition-colors duration-300"
            size={"icon"}
          >
            <ArrowDown
              size={30}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#e93f3f]">
              Open Github Repository
            </h1>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              to get started with our AI Based Web Editor
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="/github.svg"
            alt="Connect Github Repository"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Import from GitHub
            </DialogTitle>
            <DialogDescription>
              Import a GitHub repository into a new playground.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Token Section */}
            <div className="space-y-2">
              <Label htmlFor="gh-import-token" className="text-sm font-medium">
                Personal Access Token
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="gh-import-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isConnected || isImporting}
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
                    disabled={isImporting}
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

            {/* Repo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="gh-import-url" className="text-sm font-medium">
                Repository URL
              </Label>
              <Input
                id="gh-import-url"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isImporting}
              />
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <Label htmlFor="gh-import-branch" className="text-xs">
                Branch
              </Label>
              <Input
                id="gh-import-branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isImporting}
              />
            </div>

            {/* Import button */}
            <Button
              onClick={handleImport}
              disabled={isImporting || !repoUrl.trim() || !isConnected}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Import Repository
                </>
              )}
            </Button>

            {/* Progress */}
            {importProgress && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                {importProgress}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Imports up to 100 text files. Binary files and files over 500KB are skipped.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddGithubButton;
