"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Key, Plus, Trash2, Shield } from "lucide-react";

interface EnvEditorProps {
  isOpen: boolean;
  onClose: () => void;
  envContent: string;
  onSave: (content: string) => void;
}

interface EnvRow {
  key: string;
  value: string;
}

function parseEnvContent(content: string): EnvRow[] {
  if (!content.trim()) return [{ key: "", value: "" }];
  const rows: EnvRow[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      rows.push({ key: trimmed, value: "" });
    } else {
      rows.push({
        key: trimmed.slice(0, eqIdx),
        value: trimmed.slice(eqIdx + 1),
      });
    }
  }
  if (rows.length === 0) rows.push({ key: "", value: "" });
  return rows;
}

function serializeEnvRows(rows: EnvRow[]): string {
  return rows
    .filter((r) => r.key.trim())
    .map((r) => `${r.key}=${r.value}`)
    .join("\n");
}

export default function EnvEditor({
  isOpen,
  onClose,
  envContent,
  onSave,
}: EnvEditorProps) {
  const [rows, setRows] = useState<EnvRow[]>(() => parseEnvContent(envContent));

  useEffect(() => {
    if (isOpen) {
      setRows(parseEnvContent(envContent));
    }
  }, [isOpen, envContent]);

  const updateRow = useCallback(
    (index: number, field: "key" | "value", val: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: val };
        return next;
      });
    },
    []
  );

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ key: "", value: "" }] : next;
    });
  }, []);

  const handleSave = () => {
    onSave(serializeEnvRows(rows));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </DialogTitle>
          <DialogDescription>
            Manage environment variables for your playground.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
          <Shield className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Environment variables are stored in your playground.
          </p>
        </div>

        <Separator />

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="sr-only">Key</Label>
                <Input
                  placeholder="KEY"
                  value={row.key}
                  onChange={(e) => updateRow(index, "key", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <span className="text-muted-foreground">=</span>
              <div className="flex-1">
                <Label className="sr-only">Value</Label>
                <Input
                  placeholder="value"
                  value={row.value}
                  onChange={(e) => updateRow(index, "value", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => removeRow(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addRow} className="w-full">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Variable
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
