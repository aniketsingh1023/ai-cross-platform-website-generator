"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createPlayground } from "@/features/dashboard/actions";

const TEMPLATES = [
  { id: "REACT", name: "React", color: "#61DAFB", icon: "⚛️" },
  { id: "NEXTJS", name: "Next.js", color: "#000000", icon: "▲" },
  { id: "EXPRESS", name: "Express", color: "#000000", icon: "🚀" },
  { id: "VUE", name: "Vue", color: "#42B883", icon: "💚" },
  { id: "ANGULAR", name: "Angular", color: "#DD0031", icon: "🅰️" },
  { id: "HONO", name: "Hono", color: "#FF6600", icon: "🔥" },
];

function AddNewButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("REACT");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsCreating(true);
    try {
      const playground = await createPlayground({
        title: title.trim(),
        template: selectedTemplate as any,
        description: description.trim(),
        userId: "",
      });

      if (playground) {
        toast.success("Playground created!");
        setOpen(false);
        setTitle("");
        setDescription("");
        router.push(`/playground/${playground.id}`);
      } else {
        toast.error("Failed to create playground");
      }
    } catch (error) {
      toast.error("Failed to create playground");
    } finally {
      setIsCreating(false);
    }
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
            <Plus
              size={30}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#e93f3f]">Add New</h1>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              Create a new playground
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <Image
            src="/add-new.svg"
            alt="Create New Playground"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Project"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                    variant={
                      selectedTemplate === tpl.id ? "default" : "outline"
                    }
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setSelectedTemplate(tpl.id)}
                  >
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="text-xs">{tpl.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={isCreating || !title.trim()}
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
    </>
  );
}

export default AddNewButton;
