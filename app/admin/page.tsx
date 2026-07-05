import { prisma } from "@/src/db";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { SignOutButton } from "@/components/SignOutButton";
import { ClipboardListIcon, PrinterIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | HapsayPrint",
  description: "View and manage all submitted print jobs.",
};

// Revalidate every 30 seconds to keep data fresh without full SSR cost
export const revalidate = 30;

export default async function AdminPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      files: true,
    },
  });

  const counts = {
    PENDING: jobs.filter((j) => j.status === "PENDING").length,
    IN_PROGRESS: jobs.filter((j) => j.status === "IN_PROGRESS").length,
    READY_FOR_PICKUP: jobs.filter((j) => j.status === "READY_FOR_PICKUP").length,
    DELIVERED: jobs.filter((j) => j.status === "DELIVERED").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PrinterIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">HapsayPrint</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Submit Form
            </a>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardListIcon className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">All Jobs</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {jobs.length} total submission{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Pending" count={counts.PENDING} color="amber" />
          <StatCard label="In Progress" count={counts.IN_PROGRESS} color="blue" />
          <StatCard label="Ready for Pickup" count={counts.READY_FOR_PICKUP} color="emerald" />
          <StatCard label="Delivered" count={counts.DELIVERED} color="zinc" />
        </div>

        {/* Jobs Table */}
        <AdminDashboardClient jobs={jobs} />
      </main>
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "amber" | "blue" | "emerald" | "zinc";
}) {
  const colorStyles = {
    amber: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
    blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    zinc: "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${colorStyles[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}
