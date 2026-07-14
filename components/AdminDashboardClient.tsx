"use client";

import { useState, useMemo, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchIcon,
  FileTextIcon,
  ExternalLinkIcon,
  InboxIcon,
  ListFilterIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  CheckIcon,
  StickyNoteIcon,
} from "lucide-react";
import { toast } from "sonner";
import { updateJobStatus, toggleArchiveJob } from "@/app/actions";
import { cn } from "@/lib/utils";
import { JobNotesModal } from "./JobNotesModal";

type FileUpload = {
  id: string;
  url: string;
  originalName: string;
  fileType: string;
};

type Customer = {
  id: string;
  name: string;
  contact: string;
  email: string | null;
};

type Job = {
  id: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "READY_FOR_PICKUP" | "DELIVERED";
  createdAt: Date;
  updatedAt: Date;
  paperSize: string | null;
  quantity: number | null;
  printType: string | null;
  finishing: string | null;
  estimatedPrice: number | null;
  isRush: boolean;
  customer: Customer;
  files: FileUpload[];
  notes: {
    id: string;
    content: string;
    createdAt: Date;
    admin: { name: string | null; email: string };
  }[];
};

type Props = {
  jobs: Job[];
  isArchiveView?: boolean;
};

const STATUS_LABELS: Record<Job["status"], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready",
  DELIVERED: "Delivered",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "All Jobs", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Ready", value: "READY_FOR_PICKUP" },
  { label: "Delivered", value: "DELIVERED" },
];

const STATUS_STYLES: Record<Job["status"], string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  READY_FOR_PICKUP:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  DELIVERED:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/** A small button that copies text to clipboard and shows a ✓ tick for 2s */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success(`Copied ${label}!`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover/customer:opacity-100"
    >
      {copied ? (
        <CheckIcon className="w-3 h-3 text-emerald-500" />
      ) : (
        <CopyIcon className="w-3 h-3" />
      )}
    </button>
  );
}

function FileLinks({ files }: { files: FileUpload[] }) {
  if (files.length === 0)
    return <span className="text-xs text-zinc-400 font-medium">—</span>;

  return (
    <div className="flex flex-col gap-1.5">
      {files.map((f) => (
        <a
          key={f.id}
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-primary transition-colors truncate max-w-[160px] group"
        >
          <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <FileTextIcon className="w-3 h-3 shrink-0" />
          </div>
          <span className="truncate">{f.originalName}</span>
          <ExternalLinkIcon className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

function StatusSelect({ job }: { job: Job }) {
  const [optimisticStatus, setOptimisticStatus] = useState<Job["status"]>(job.status);
  const [isPending, startTransition] = useTransition();

  async function handleChange(newStatus: string) {
    const previous = optimisticStatus;
    setOptimisticStatus(newStatus as Job["status"]);

    startTransition(async () => {
      const result = await updateJobStatus(job.id, newStatus);
      if (!result.success) {
        setOptimisticStatus(previous);
        toast.error(result.error ?? "Failed to update status.");
      } else {
        if (result.notified) {
          toast.success("Status updated and customer notified via email");
        } else {
          toast.success(`Job marked as ${STATUS_LABELS[newStatus as Job["status"]]}`);
        }
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={optimisticStatus} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          className={cn(
            "h-7 text-xs w-[130px] rounded-full border font-semibold shadow-none focus:ring-0",
            STATUS_STYLES[optimisticStatus],
            isPending && "opacity-50 cursor-wait"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value} className="text-xs font-medium rounded-lg cursor-pointer">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] font-medium text-zinc-400 pl-2">
        {formatDate(job.updatedAt)}
      </p>
    </div>
  );
}

/** Icon-only archive button with tooltip */
function ArchiveIconButton({ jobId, isArchiveView }: { jobId: string; isArchiveView: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleArchiveJob(jobId, !isArchiveView);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update job.");
      } else {
        toast.success(isArchiveView ? "Job restored to dashboard" : "Job archived");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isArchiveView ? "Restore to dashboard" : "Archive this job"}
      className={cn(
        "relative inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-wait",
        isArchiveView
          ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
          : "border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400"
      )}
    >
      {isPending ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isArchiveView ? (
        <ArchiveRestoreIcon className="w-3.5 h-3.5" />
      ) : (
        <ArchiveIcon className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export function AdminDashboardClient({ jobs, isArchiveView = false }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
      const matchesSearch =
        !q ||
        job.customer.name.toLowerCase().includes(q) ||
        job.customer.contact.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, search, statusFilter]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm overflow-hidden">
      
      {/* Unified Toolbar */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          <ListFilterIcon className="w-4 h-4 text-zinc-400 mr-1 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                statusFilter === f.value
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700"
              )}
            >
              {f.label}
              {f.value === "ALL" && (
                <span className="ml-1.5 opacity-60 font-medium">
                  {jobs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search jobs..."
            className="pl-9 h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
            <InboxIcon className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No jobs found</p>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            {search || statusFilter !== "ALL"
              ? "We couldn't find any jobs matching your current filters."
              : isArchiveView
              ? "No archived jobs yet. Archive a job from the main dashboard."
              : "When customers submit print jobs, they will appear here."}
          </p>
        </div>
      )}

      {/* Desktop Data Grid */}
      {filtered.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider pl-6 w-[200px]">Customer</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Job Details</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider w-[180px]">Specs</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider w-[160px]">Status</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider w-[140px]">Submitted</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider w-[160px]">Files</TableHead>
                <TableHead className="h-11 font-semibold text-zinc-500 text-xs uppercase tracking-wider w-[100px] pr-6 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow
                  key={job.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors border-zinc-100 dark:border-zinc-800/50 group"
                >
                  {/* Customer cell with copy buttons */}
                  <TableCell className="pl-6 align-top pt-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{job.customer.name}</p>
                      {job.isRush && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm">
                          RUSH
                        </span>
                      )}
                    </div>
                    <div className="group/customer flex items-center mt-0.5">
                      <p className="text-zinc-500 font-mono text-xs">{job.customer.contact}</p>
                      <CopyButton value={job.customer.contact} label="phone number" />
                    </div>
                    {job.customer.email && (
                      <div className="group/customer flex items-center mt-0.5">
                        <p className="text-zinc-400 text-xs truncate max-w-[130px]">{job.customer.email}</p>
                        <CopyButton value={job.customer.email} label="email" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="align-top pt-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2 pr-4">{job.description}</p>
                  </TableCell>

                  <TableCell className="align-top pt-4">
                    {job.paperSize ? (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        <p><span className="font-medium text-zinc-900 dark:text-zinc-100">{job.quantity}x</span> {job.paperSize} ({job.printType})</p>
                        {job.finishing && job.finishing !== "NONE" && <p>+ {job.finishing.replace("BINDING_", "")}</p>}
                        {job.estimatedPrice != null && <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1">₱{job.estimatedPrice.toFixed(2)}</p>}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 font-medium">—</span>
                    )}
                  </TableCell>

                  <TableCell className="align-top pt-3.5">
                    <StatusSelect job={job} />
                  </TableCell>

                  <TableCell className="align-top pt-4">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {formatDate(job.createdAt)}
                    </p>
                  </TableCell>

                  <TableCell className="align-top pt-4">
                    <FileLinks files={job.files} />
                  </TableCell>

                  {/* Compact actions column — icon only with tooltips */}
                  <TableCell className="pr-6 align-top pt-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <JobNotesModal jobId={job.id} initialNotes={job.notes} iconOnly />
                      <ArchiveIconButton jobId={job.id} isArchiveView={isArchiveView} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile Cards View */}
      {filtered.length > 0 && (
        <div className="flex flex-col md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
          {filtered.map((job) => (
            <div key={job.id} className="p-5 space-y-4 bg-white dark:bg-transparent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{job.customer.name}</p>
                    {job.isRush && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm">
                        RUSH
                      </span>
                    )}
                  </div>
                  {/* Mobile copy rows */}
                  <div className="group/customer flex items-center mt-0.5">
                    <p className="text-zinc-500 font-mono text-xs">{job.customer.contact}</p>
                    <CopyButton value={job.customer.contact} label="phone number" />
                  </div>
                  {job.customer.email && (
                    <div className="group/customer flex items-center mt-0.5">
                      <p className="text-zinc-400 text-xs truncate max-w-[160px]">{job.customer.email}</p>
                      <CopyButton value={job.customer.email} label="email" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusSelect job={job} />
                  <div className="flex gap-1.5">
                    <JobNotesModal jobId={job.id} initialNotes={job.notes} iconOnly />
                    <ArchiveIconButton jobId={job.id} isArchiveView={isArchiveView} />
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {job.description}
                </p>
                {job.paperSize && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    <p><span className="font-medium text-zinc-900 dark:text-zinc-100">{job.quantity}x</span> {job.paperSize} ({job.printType})</p>
                    {job.finishing && job.finishing !== "NONE" && <p>+ {job.finishing.replace("BINDING_", "")}</p>}
                    {job.estimatedPrice != null && <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1">₱{job.estimatedPrice.toFixed(2)}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between pt-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Submitted</p>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Files</p>
                  <FileLinks files={job.files} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
