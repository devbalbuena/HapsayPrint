"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { addJobNote } from "@/app/actions";

type Note = {
  id: string;
  content: string;
  createdAt: Date;
  admin: { name: string | null; email: string };
};

export function JobNotesModal({
  jobId,
  initialNotes,
  iconOnly = false,
}: {
  jobId: string;
  initialNotes: Note[];
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    const content = newNote.trim();
    setNewNote(""); // clear input optimistically

    startTransition(async () => {
      const result = await addJobNote(jobId, content);

      if (result.success && result.note) {
        setNotes((prev) => [result.note as Note, ...prev]);
        toast.success("Note added");
      } else {
        toast.error(result.error || "Failed to add note");
        setNewNote(content); // revert input on error
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        title="View notes"
        className={iconOnly
          ? "relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors"
          : "relative inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
        }
      >
        <MessageSquarePlusIcon className="w-3.5 h-3.5" />
        {!iconOnly && "Notes"}
        {notes.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Internal Notes
          </DialogTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Staff notes for this job. Hidden from customers.
          </p>
        </DialogHeader>

        {/* Note List (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-sm text-zinc-400 italic">
              No notes yet. Be the first to leave one!
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {note.admin.name || note.admin.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Note Form */}
        <form
          onSubmit={handleSubmit}
          className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto"
        >
          <Textarea
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="resize-none h-20 mb-3 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !newNote.trim()}
            className="w-full h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2Icon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Note"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
