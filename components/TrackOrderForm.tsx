"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function TrackOrderForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a tracking code");
      return;
    }
    setLoading(true);
    router.push(`/track/${code.trim().toUpperCase()}`);
  }

  return (
    <div className="mt-8 pt-8 border-t border-zinc-800/50">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Track an existing order</h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm">
        <Input 
          type="text" 
          placeholder="e.g. HP-X7K2Q9" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-10 bg-zinc-900/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500 uppercase"
        />
        <Button type="submit" size="sm" className="h-10 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100" disabled={loading}>
          {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4 mr-2" />}
          {loading ? "" : "Track"}
        </Button>
      </form>
    </div>
  );
}
