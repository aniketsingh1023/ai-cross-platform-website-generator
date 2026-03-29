"use client";

import { useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WebContainerPreviewProps {
  url: string | null;
  isLoading: boolean;
}

export default function WebContainerPreview({
  url,
  isLoading,
}: WebContainerPreviewProps) {
  const [key, setKey] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(url || "");

  const handleRefresh = () => setKey((k) => k + 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium">Starting dev server...</p>
          <p className="text-xs mt-1">Installing dependencies and building</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Globe className="h-8 w-8" />
        <div className="text-center">
          <p className="text-sm font-medium">No preview available</p>
          <p className="text-xs mt-1">
            Click &quot;Run&quot; to start the dev server
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-1.5 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
        <div className="flex-1 flex items-center gap-1.5 bg-background rounded px-2 py-0.5 text-xs">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{url}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => window.open(url, "_blank")}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex-1">
        <iframe
          key={key}
          src={url}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="Preview"
        />
      </div>
    </div>
  );
}
