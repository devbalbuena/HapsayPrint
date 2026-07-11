import { prisma } from "@/src/db";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { ArchiveIcon, ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Archived Jobs | HapsayPrint",
  description: "Browse all archived print jobs.",
};

export const revalidate = 30;

export default async function ArchivePage() {
  const jobs = await prisma.job.findMany({
    where: { archived: true },
    orderBy: { updatedAt: "desc" },
    include: {
      customer: true,
      files: true,
      notes: {
        orderBy: { createdAt: "desc" },
        include: { admin: true },
      },
    },
  });

  return (
    <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArchiveIcon className="w-5 h-5 text-zinc-400" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Archived Jobs
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            {jobs.length} archived job{jobs.length !== 1 ? "s" : ""} — hidden from the main dashboard.
          </p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Archive Table */}
      <AdminDashboardClient jobs={jobs} isArchiveView />

    </main>
  );
}
