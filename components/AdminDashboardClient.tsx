"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchIcon, FileTextIcon, ExternalLinkIcon, InboxIcon } from "lucide-react";

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
  customer: Customer;
  files: FileUpload[];
};

type Props = {
  jobs: Job[];
};

const STATUS_LABELS: Record<Job["status"], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready for Pickup",
  DELIVERED: "Delivered",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
  { label: "Delivered", value: "DELIVERED" },
];

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles: Record<Job["status"], string> = {
    PENDING:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    IN_PROGRESS:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    READY_FOR_PICKUP:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    DELIVERED:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

function FileLinks({ files }: { files: FileUpload[] }) {
  if (files.length === 0)
    return <span className="text-xs text-muted-foreground">No file</span>;

  return (
    <div className="flex flex-col gap-1">
      {files.map((f) => (
        <a
          key={f.id}
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[160px]"
        >
          <FileTextIcon className="w-3 h-3 shrink-0" />
          <span className="truncate">{f.originalName}</span>
          <ExternalLinkIcon className="w-3 h-3 shrink-0" />
        </a>
      ))}
    </div>
  );
}

export function AdminDashboardClient({ jobs }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;
      const matchesSearch =
        !q ||
        job.customer.name.toLowerCase().includes(q) ||
        job.customer.contact.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, search, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="admin-search"
            placeholder="Search by name, contact, or description…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {f.label}
            {f.value === "ALL" && (
              <span className="ml-1.5 opacity-70">({jobs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
          <InboxIcon className="w-12 h-12 opacity-30" />
          <p className="font-medium">No jobs found</p>
          <p className="text-sm">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter."
              : "Jobs submitted by customers will appear here."}
          </p>
        </div>
      )}

      {/* Desktop Table */}
      {filtered.length > 0 && (
        <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground w-[180px]">Customer</TableHead>
                  <TableHead className="font-semibold text-foreground w-[130px]">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground w-[150px]">Status</TableHead>
                  <TableHead className="font-semibold text-foreground w-[190px]">Date Submitted</TableHead>
                  <TableHead className="font-semibold text-foreground w-[170px]">Files</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((job) => (
                  <TableRow
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{job.customer.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {job.customer.contact}
                    </TableCell>
                    <TableCell className="text-sm max-w-[280px]">
                      <p className="line-clamp-2">{job.description}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </TableCell>
                    <TableCell>
                      <FileLinks files={job.files} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.map((job) => (
            <Card key={job.id} className="border bg-card shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold">
                    {job.customer.name}
                  </CardTitle>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {job.customer.contact}
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <p className="text-sm leading-relaxed line-clamp-3">
                  {job.description}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(job.createdAt)}
                  </p>
                  <FileLinks files={job.files} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
