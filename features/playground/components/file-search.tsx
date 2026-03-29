"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  SearchIcon,
  FileTextIcon,
  ReplaceIcon,
  CaseSensitiveIcon,
  HashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchMatch {
  line: number
  lineContent: string
  matchStart: number
  matchEnd: number
}

interface FileSearchResult {
  path: string
  matches: SearchMatch[]
}

interface FileSearchProps {
  files: Record<string, string>
  onFileOpen: (path: string) => void
  onResultClick: (path: string, line: number) => void
}

export function FileSearch({ files, onFileOpen, onResultClick }: FileSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [replaceText, setReplaceText] = React.useState("")
  const [showReplace, setShowReplace] = React.useState(false)
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [collapsedFiles, setCollapsedFiles] = React.useState<Set<string>>(
    new Set()
  )

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const results = React.useMemo<FileSearchResult[]>(() => {
    if (!query.trim()) return []

    const searchResults: FileSearchResult[] = []
    const flags = caseSensitive ? "g" : "gi"

    let regex: RegExp
    try {
      regex = new RegExp(escapeRegExp(query), flags)
    } catch {
      return []
    }

    for (const [path, content] of Object.entries(files)) {
      const lines = content.split("\n")
      const matches: SearchMatch[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        regex.lastIndex = 0
        let match: RegExpExecArray | null

        while ((match = regex.exec(line)) !== null) {
          matches.push({
            line: i + 1,
            lineContent: line,
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
          })
          if (match[0].length === 0) break
        }
      }

      if (matches.length > 0) {
        searchResults.push({ path, matches })
      }
    }

    return searchResults
  }, [query, files, caseSensitive])

  const totalMatchCount = React.useMemo(
    () => results.reduce((sum, r) => sum + r.matches.length, 0),
    [results]
  )

  const toggleCollapse = (path: string) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleResultClick = (path: string, line: number) => {
    onResultClick(path, line)
    setOpen(false)
  }

  const handleReplace = (path: string, match: SearchMatch) => {
    // Emits action via onResultClick so the parent can handle the actual replacement
    onResultClick(path, match.line)
  }

  const handleReplaceAll = () => {
    // Signal the parent for each match so they can perform replacements
    for (const result of results) {
      for (const match of result.matches) {
        onResultClick(result.path, match.line)
      }
    }
  }

  const fileName = (path: string) => {
    const parts = path.split("/")
    return parts[parts.length - 1]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search in Files</DialogTitle>
          <DialogDescription>
            Search across all project files
          </DialogDescription>
        </DialogHeader>

        {/* Search inputs */}
        <div className="border-b p-3 space-y-2">
          <div className="flex items-center gap-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in files..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setCaseSensitive((prev) => !prev)}
              className={cn(
                "shrink-0 rounded p-1 transition-colors",
                caseSensitive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle case sensitivity"
            >
              <CaseSensitiveIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowReplace((prev) => !prev)}
              className={cn(
                "shrink-0 rounded p-1 transition-colors",
                showReplace
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle replace"
            >
              <ReplaceIcon className="size-4" />
            </button>
          </div>

          {showReplace && (
            <div className="flex items-center gap-2">
              <ReplaceIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleReplaceAll}
                disabled={!query.trim() || totalMatchCount === 0}
                className="shrink-0 rounded bg-accent px-2 py-1 text-xs text-accent-foreground hover:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none"
              >
                Replace All
              </button>
            </div>
          )}

          {/* Match count */}
          {query.trim() && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HashIcon className="size-3" />
              <span>
                {totalMatchCount} match{totalMatchCount !== 1 ? "es" : ""} in{" "}
                {results.length} file{results.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[50vh]">
          {query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}

          {results.map((result) => {
            const isCollapsed = collapsedFiles.has(result.path)

            return (
              <div key={result.path} className="border-b border-border/50">
                {/* File header */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(result.path)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium truncate">
                    {fileName(result.path)}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground truncate">
                    {result.path}
                  </span>
                  <span className="ml-auto shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                    {result.matches.length}
                  </span>
                </button>

                {/* Matches within file */}
                {!isCollapsed && (
                  <div className="pb-1">
                    {result.matches.map((match, idx) => (
                      <button
                        key={`${match.line}-${match.matchStart}-${idx}`}
                        type="button"
                        onClick={() =>
                          handleResultClick(result.path, match.line)
                        }
                        className="flex w-full items-start gap-2 px-3 py-1 pl-10 text-xs hover:bg-accent/30 transition-colors text-left"
                      >
                        <span className="shrink-0 w-8 text-right text-muted-foreground tabular-nums">
                          {match.line}
                        </span>
                        <span className="truncate font-mono">
                          <HighlightedLine
                            text={match.lineContent}
                            matchStart={match.matchStart}
                            matchEnd={match.matchEnd}
                          />
                        </span>
                        {showReplace && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReplace(result.path, match)
                            }}
                            className="ml-auto shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground hover:bg-accent/80"
                          >
                            Replace
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HighlightedLine({
  text,
  matchStart,
  matchEnd,
}: {
  text: string
  matchStart: number
  matchEnd: number
}) {
  const before = text.slice(0, matchStart)
  const matched = text.slice(matchStart, matchEnd)
  const after = text.slice(matchEnd)

  return (
    <>
      <span className="text-muted-foreground">{before}</span>
      <span className="bg-yellow-500/30 text-yellow-200 rounded-sm px-0.5">
        {matched}
      </span>
      <span className="text-muted-foreground">{after}</span>
    </>
  )
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
