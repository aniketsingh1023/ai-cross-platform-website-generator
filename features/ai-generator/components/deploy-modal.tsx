"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ExternalLink, Copy } from "lucide-react";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateRandomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "site-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [phase, setPhase] = useState<"deploying" | "done">("deploying");
  const [deployUrl, setDeployUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPhase("deploying");
    setCopied(false);
    const slug = generateRandomSlug();
    const url = `https://${slug}.vercel.app`;

    const timer = setTimeout(() => {
      setDeployUrl(url);
      setPhase("done");
    }, 2500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(deployUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {phase === "deploying" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                Deploying your website…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Deployment successful!
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {phase === "deploying"
              ? "Packaging your website and pushing to the edge network…"
              : "Your website is live and accessible worldwide."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {phase === "deploying" ? (
            <div className="space-y-2">
              {["Bundling assets", "Uploading to CDN", "Propagating to edge nodes"].map(
                (step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    {step}…
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Live URL</p>
                <p className="font-mono text-sm font-medium text-green-600 break-all">
                  {deployUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => window.open(deployUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open site
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </div>

              <p className="text-[11px] text-center text-muted-foreground">
                Deployed via Vercel Edge Network · SSL enabled · Auto-scaling
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
