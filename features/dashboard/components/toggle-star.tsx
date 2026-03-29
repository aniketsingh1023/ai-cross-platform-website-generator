"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MarkedToggleButtonProps {
  markedForRevision: boolean | undefined;
  id: string;
}

export function MarkedToggleButton({
  markedForRevision,
  id,
}: MarkedToggleButtonProps) {
  const [isMarked, setIsMarked] = useState(markedForRevision || false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStar = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/starmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playgroundId: id, isMarked: !isMarked }),
      });

      if (res.ok) {
        setIsMarked(!isMarked);
        toast.success(isMarked ? "Removed from favorites" : "Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStar}
      disabled={isLoading}
      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer"
    >
      <Star
        className={`h-4 w-4 ${
          isMarked ? "fill-yellow-400 text-yellow-400" : ""
        }`}
      />
      {isMarked ? "Unstar" : "Star"}
    </button>
  );
}
