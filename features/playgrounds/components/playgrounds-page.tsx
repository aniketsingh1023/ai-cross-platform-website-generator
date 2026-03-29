"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Search,
  Grid3x3,
  List,
  Plus,
  Star,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Edit3,
  Github,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";

import { createPlayground } from "@/features/dashboard/actions";
import { MarkedToggleButton } from "@/features/dashboard/components/toggle-star";

interface Playground {
  id: string;
  title: string;
  description: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  Starmark: { isMarked: boolean }[];
}

interface PlaygroundsPageProps {
  playgrounds: Playground[];
}

const TEMPLATES = [
  { id: "REACT", name: "React", color: "#61DAFB", icon: "⚛️" },
  { id: "NEXTJS", name: "Next.js", color: "#000000", icon: "▲" },
  { id: "EXPRESS", name: "Express", color: "#000000", icon: "🚀" },
  { id: "VUE", name: "Vue", color: "#42B883", icon: "💚" },
  { id: "ANGULAR", name: "Angular", color: "#DD0031", icon: "🅰️" },
  { id: "HONO", name: "Hono", color: "#FF6600", icon: "🔥" },
];

const TEMPLATE_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "REACT", label: "React" },
  { value: "NEXTJS", label: "Next.js" },
  { value: "EXPRESS", label: "Express" },
  { value: "VUE", label: "Vue" },
  { value: "ANGULAR", label: "Angular" },
  { value: "HONO", label: "Hono" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
];

function getTemplateDisplay(template: string) {
  return TEMPLATES.find((t) => t.id === template) || { id: template, name: template, color: "#888", icon: "📁" };
}

export default function PlaygroundsPage({ playgrounds }: PlaygroundsPageProps) {
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [starredOnly, setStarredOnly] = useState(false);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);

  // Create form state
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createTemplate, setCreateTemplate] = useState("REACT");
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtered and sorted playgrounds
  const filteredPlaygrounds = useMemo(() => {
    let result = [...playgrounds];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Template filter
    if (templateFilter !== "ALL") {
      result = result.filter((p) => p.template === templateFilter);
    }

    // Starred only
    if (starredOnly) {
      result = result.filter((p) => p.Starmark?.[0]?.isMarked);
    }

    // Sort
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [playgrounds, searchQuery, templateFilter, sortOption, starredOnly]);

  // Handlers
  const handleCreate = async () => {
    if (!createTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    setIsCreating(true);
    try {
      const playground = await createPlayground({
        title: createTitle.trim(),
        template: createTemplate as any,
        description: createDescription.trim(),
        userId: "",
      });
      if (playground) {
        toast.success("Playground created!");
        setCreateDialogOpen(false);
        setCreateTitle("");
        setCreateDescription("");
        router.push(`/playground/${playground.id}`);
      } else {
        toast.error("Failed to create playground");
      }
    } catch {
      toast.error("Failed to create playground");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (playground: Playground) => {
    setSelectedPlayground(playground);
    setEditTitle(playground.title);
    setEditDescription(playground.description || "");
    setEditDialogOpen(true);
  };

  const handleUpdatePlayground = async () => {
    if (!selectedPlayground) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/playground/${selectedPlayground.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (res.ok) {
        toast.success("Playground updated successfully");
        setEditDialogOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update playground");
      }
    } catch {
      toast.error("Failed to update playground");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (playground: Playground) => {
    setSelectedPlayground(playground);
    setDeleteDialogOpen(true);
  };

  const handleDeletePlayground = async () => {
    if (!selectedPlayground) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/playground/${selectedPlayground.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Playground deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedPlayground(null);
        router.refresh();
      } else {
        toast.error("Failed to delete playground");
      }
    } catch {
      toast.error("Failed to delete playground");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPlaygroundUrl = (id: string) => {
    const url = `${window.location.origin}/playground/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="flex flex-col min-h-screen mx-auto max-w-7xl px-4 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Playgrounds</h1>
          <p className="text-muted-foreground mt-1">
            {playgrounds.length} playground{playgrounds.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Playground
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playgrounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={starredOnly ? "default" : "outline"}
          onClick={() => setStarredOnly(!starredOnly)}
          className="gap-2"
        >
          <Star className={`h-4 w-4 ${starredOnly ? "fill-current" : ""}`} />
          Starred Only
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Empty State */}
      {filteredPlaygrounds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No playgrounds found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            {playgrounds.length === 0
              ? "Create your first playground to get started."
              : "Try adjusting your search or filter criteria."}
          </p>
          {playgrounds.length === 0 && (
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Playground
            </Button>
          )}
        </div>
      )}

      {/* Grid View */}
      {filteredPlaygrounds.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaygrounds.map((playground) => {
            const tpl = getTemplateDisplay(playground.template);
            const isStarred = playground.Starmark?.[0]?.isMarked || false;

            return (
              <Card
                key={playground.id}
                className="group flex flex-col transition-all duration-200 hover:shadow-md hover:border-[#E93F3F]/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="bg-[#E93F3F15] text-[#E93F3F] border-[#E93F3F]"
                    >
                      <span className="mr-1">{tpl.icon}</span>
                      {tpl.name}
                    </Badge>
                    <MarkedToggleButton
                      markedForRevision={isStarred}
                      id={playground.id}
                    />
                  </div>
                  <h3 className="font-bold text-lg mt-2 truncate">
                    {playground.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {playground.description || "No description"}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 pb-3 flex-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(playground.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between">
                  <Button asChild size="sm">
                    <Link href={`/playground/${playground.id}`}>Open</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditClick(playground)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyPlaygroundUrl(playground.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/playground/${playground.id}`}
                          target="_blank"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Github className="h-4 w-4 mr-2" />
                        Push to GitHub
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(playground)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {filteredPlaygrounds.length > 0 && viewMode === "list" && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaygrounds.map((playground) => (
                <TableRow key={playground.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/playground/${playground.id}`}
                        className="hover:underline"
                      >
                        <span className="font-semibold">{playground.title}</span>
                      </Link>
                      <span className="text-sm text-gray-500 line-clamp-1">
                        {playground.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-[#E93F3F15] text-[#E93F3F] border-[#E93F3F]"
                    >
                      {playground.template}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(playground.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={playground.user.image || "/placeholder.svg"}
                          alt={playground.user.name || "User"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm">{playground.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <MarkedToggleButton
                            markedForRevision={playground.Starmark[0]?.isMarked}
                            id={playground.id}
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/playground/${playground.id}`}
                            className="flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(playground)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyPlaygroundUrl(playground.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Github className="h-4 w-4 mr-2" />
                          Push to GitHub
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(playground)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Playground Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Playground</DialogTitle>
            <DialogDescription>
              Choose a template and give your project a name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="My Awesome Project"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="A brief description of your project"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((tpl) => (
                  <Button
                    key={tpl.id}
                    variant={createTemplate === tpl.id ? "default" : "outline"}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setCreateTemplate(tpl.id)}
                  >
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="text-xs">{tpl.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !createTitle.trim()}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playground
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Playground Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Playground</DialogTitle>
            <DialogDescription>
              Make changes to your playground details here. Click save when you are
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdatePlayground}
              disabled={isLoading || !editTitle.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playground</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPlayground?.title}&quot;? This
              action cannot be undone. All files and data associated with this
              playground will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayground}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Playground"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
