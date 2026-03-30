"use client";

import { useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, ExternalLink, Check, Link } from "lucide-react";

interface PreviewShareProps {
  previewUrl: string | null;
  playgroundId: string;
}

export default function PreviewShare({
  previewUrl,
  playgroundId,
}: PreviewShareProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/playground/${playgroundId}`
      : "";

  const copyToClipboard = useCallback(
    async (text: string, field: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } catch {
        console.error("Failed to copy to clipboard");
      }
    },
    []
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-3.5 w-3.5 mr-1" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Share Playground</h4>
            <p className="text-xs text-muted-foreground">
              Share the playground URL or the live preview link.
            </p>
          </div>

          {/* Playground URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Link className="h-3 w-3" />
              Playground URL
            </label>
            <div className="flex gap-1.5">
              <Input
                readOnly
                value={shareUrl}
                className="text-xs h-8 font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 shrink-0"
                onClick={() => copyToClipboard(shareUrl, "share")}
              >
                {copiedField === "share" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" />
              Preview URL
            </label>
            {previewUrl ? (
              <div className="flex gap-1.5">
                <Input
                  readOnly
                  value={previewUrl}
                  className="text-xs h-8 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0"
                  onClick={() => copyToClipboard(previewUrl, "preview")}
                >
                  {copiedField === "preview" ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-1">
                No preview available. Run the project first.
              </p>
            )}
          </div>

          {/* Open in new tab */}
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Open in New Tab
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
