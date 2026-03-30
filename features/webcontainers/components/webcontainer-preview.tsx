"use client";

import { useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  Globe,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WebContainerPreviewProps {
  url: string | null;
  isLoading: boolean;
}

export default function WebContainerPreview({
  url,
  isLoading,
}: WebContainerPreviewProps) {
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const handleRefresh = () => {
    setIframeError(false);
    setKey((k) => k + 1);
  };

  const copyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Preview URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium">Starting dev server...</p>
          <p className="text-xs mt-1">Installing dependencies and building</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <Globe className="h-12 w-12 opacity-30" />
        <div className="text-center">
          <p className="text-sm font-medium">No preview available</p>
          <p className="text-xs mt-1">
            Click the green <strong>Run</strong> button to start the dev server
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* URL bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b bg-muted/30 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
        <div className="flex-1 flex items-center gap-1.5 bg-background border rounded px-2 py-0.5 text-xs min-w-0">
          <Globe className="h-3 w-3 text-green-500 shrink-0" />
          <span className="text-muted-foreground truncate">{url}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={copyUrl}
          title="Copy URL"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => window.open(url, "_blank")}
          title="Open in new tab"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 relative">
        {iframeError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 z-10">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <p className="text-sm text-muted-foreground">Preview failed to load</p>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry
            </Button>
          </div>
        )}
        <iframe
          key={key}
          src={url}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          allow="cross-origin-isolated"
          title="Preview"
          onError={() => setIframeError(true)}
        />
      </div>
    </div>
  );
}
