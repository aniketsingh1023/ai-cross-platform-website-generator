"use client";

import { ChevronRight, FileText } from "lucide-react";

interface BreadcrumbsProps {
  filePath: string | null;
  onNavigate?: (path: string) => void;
}

export default function Breadcrumbs({ filePath, onNavigate }: BreadcrumbsProps) {
  if (!filePath) return null;

  const segments = filePath.split("/");

  return (
    <div className="h-7 text-xs border-b px-3 flex items-center gap-1 bg-muted/20 shrink-0 select-none overflow-x-auto">
      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const partialPath = segments.slice(0, index + 1).join("/");

        return (
          <span key={partialPath} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <button
              className={`hover:text-foreground hover:underline transition-colors ${
                isLast
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => onNavigate?.(partialPath)}
            >
              {segment}
            </button>
          </span>
        );
      })}
    </div>
  );
}
