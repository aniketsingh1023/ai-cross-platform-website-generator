"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Plus, Trash2, Loader2 } from "lucide-react";

interface PackageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: (packageName: string) => void;
  onUninstall: (packageName: string) => void;
  installedPackages: Record<string, string>;
}

interface NpmPackageResult {
  name: string;
  version: string;
  description: string;
}

export default function PackageManager({
  isOpen,
  onClose,
  onInstall,
  onUninstall,
  installedPackages,
}: PackageManagerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NpmPackageResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingPkg, setInstallingPkg] = useState<string | null>(null);

  const searchPackages = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=5`
      );
      const data = await res.json();
      const packages: NpmPackageResult[] = (data.objects || []).map(
        (obj: any) => ({
          name: obj.package.name,
          version: obj.package.version,
          description: obj.package.description || "",
        })
      );
      setResults(packages);
    } catch (err) {
      console.error("Failed to search npm packages:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPackages(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchPackages]);

  const handleInstall = async (pkgName: string) => {
    setInstallingPkg(pkgName);
    try {
      onInstall(pkgName);
    } finally {
      setInstallingPkg(null);
    }
  };

  const installedList = Object.entries(installedPackages);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Manager
          </DialogTitle>
          <DialogDescription>
            Search and manage npm packages for your playground.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search npm packages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {(results.length > 0 || isSearching) && (
            <div>
              <h4 className="text-sm font-medium mb-2">Search Results</h4>
              <ScrollArea className="h-48">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((pkg) => {
                      const isInstalled = pkg.name in installedPackages;
                      return (
                        <div
                          key={pkg.name}
                          className="flex items-start justify-between gap-2 p-2 rounded-md border"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {pkg.name}
                              </span>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {pkg.version}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {pkg.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={isInstalled ? "secondary" : "default"}
                            disabled={isInstalled || installingPkg === pkg.name}
                            onClick={() => handleInstall(pkg.name)}
                            className="shrink-0"
                          >
                            {installingPkg === pkg.name ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isInstalled ? (
                              "Installed"
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Installed Packages */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Installed Packages ({installedList.length})
            </h4>
            <ScrollArea className="h-48">
              {installedList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No packages installed yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {installedList.map(([name, version]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-2 p-2 rounded-md border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {version}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => onUninstall(name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
