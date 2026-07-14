import { prisma } from "@/src/db";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { getAnalytics } from "@/lib/analytics";
import {
  PrinterIcon,
  ClockIcon,
  Loader2Icon,
  PackageCheckIcon,
  CheckCircle2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  TrendingUpIcon,
  ArchiveIcon,
} from "lucide-react";
import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { ExportReportButton } from "@/components/ExportReportButton";

export const metadata: Metadata = {
  title: "Admin Dashboard | HapsayPrint",
  description: "View and manage all submitted print jobs.",
};

export const revalidate = 30;

export default async function AdminPage() {
  const [jobs, analytics] = await Promise.all([
    prisma.job.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        files: true,
        notes: {
          orderBy: { createdAt: "desc" },
          include: { admin: true },
        },
      },
    }),
    getAnalytics(),
  ]);

  return (
    <>
      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Section Header ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Overview</h2>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Today&apos;s Snapshot</p>
        </div>

        {/* ── Row 1: Period + Revenue Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            label="Jobs Today"
            value={analytics.todayCount}
            icon={<CalendarIcon className="w-5 h-5" />}
            color="violet"
            variant="solid"
          />
          <MetricCard
            label="Jobs This Week"
            value={analytics.weekCount}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            color="blue"
            variant="solid"
          />
          <MetricCard
            label="Est. Revenue (Week)"
            value={`₱${analytics.weekRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUpIcon className="w-5 h-5" />}
            color="emerald"
            large
            variant="solid"
          />
        </div>

        {/* ── Row 2: Status Breakdown ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Status Breakdown</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="Pending Review"
              count={analytics.statusCounts.PENDING}
              color="amber"
              icon={<ClockIcon className="w-5 h-5" />}
            />
            <StatCard
              label="In Progress"
              count={analytics.statusCounts.IN_PROGRESS}
              color="blue"
              icon={<Loader2Icon className="w-5 h-5" />}
            />
            <StatCard
              label="Ready for Pickup"
              count={analytics.statusCounts.READY_FOR_PICKUP}
              color="emerald"
              icon={<PackageCheckIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Delivered"
              count={analytics.statusCounts.DELIVERED}
              color="zinc"
              icon={<CheckCircle2Icon className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* ── Row 3: Chart + Insights ── */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Analytics</h2>
            <ExportReportButton />
          </div>
          <AnalyticsCharts
            dailyVolume={analytics.dailyVolume}
            topPrintType={analytics.topPrintType}
            topFinishing={analytics.topFinishing}
          />
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <PrinterIcon className="w-3.5 h-3.5" />
            Active Jobs
          </span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <Link
            href="/admin/archive"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
          >
            <ArchiveIcon className="w-3.5 h-3.5" />
            View Archive
          </Link>
        </div>

        {/* ── Jobs Table ── */}
        <AdminDashboardClient jobs={jobs} />

      </main>
    </>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

type Color = "amber" | "blue" | "emerald" | "zinc" | "violet";

const colorConfig: Record<Color, { card: string; icon: string; solidCard: string; solidIcon: string }> = {
  amber: {
    card: "from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-transparent border-amber-500/20",
    icon: "text-amber-500 border-amber-100 dark:border-amber-900/50 bg-white dark:bg-zinc-800",
    solidCard: "from-amber-500 to-orange-600 border-amber-400 text-white shadow-amber-500/30",
    solidIcon: "text-white border-white/20 bg-white/20",
  },
  blue: {
    card: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-transparent border-blue-500/20",
    icon: "text-blue-500 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-zinc-800",
    solidCard: "from-blue-500 to-indigo-600 border-blue-400 text-white shadow-blue-500/30",
    solidIcon: "text-white border-white/20 bg-white/20",
  },
  emerald: {
    card: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-transparent border-emerald-500/20",
    icon: "text-emerald-500 border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-zinc-800",
    solidCard: "from-emerald-400 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/30",
    solidIcon: "text-white border-white/20 bg-white/20",
  },
  zinc: {
    card: "from-zinc-500/10 to-zinc-500/5 dark:from-zinc-500/20 dark:to-transparent border-zinc-500/20",
    icon: "text-zinc-500 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800",
    solidCard: "from-zinc-500 to-zinc-700 border-zinc-400 text-white shadow-zinc-500/30",
    solidIcon: "text-white border-white/20 bg-white/20",
  },
  violet: {
    card: "from-violet-500/10 to-violet-500/5 dark:from-violet-500/20 dark:to-transparent border-violet-500/20",
    icon: "text-violet-500 border-violet-100 dark:border-violet-900/50 bg-white dark:bg-zinc-800",
    solidCard: "from-violet-500 to-fuchsia-600 border-violet-400 text-white shadow-violet-500/30",
    solidIcon: "text-white border-white/20 bg-white/20",
  },
};

function StatCard({ label, count, color, icon }: { label: string; count: number; color: Color; icon: React.ReactNode }) {
  const c = colorConfig[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900/50 shadow-sm transition-all hover:shadow-md ${c.card}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${c.card} opacity-50`} />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{count}</p>
          </div>
          <div className={`p-2.5 rounded-xl border shadow-sm shrink-0 ${c.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  large,
  variant = "subtle",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: Color;
  large?: boolean;
  variant?: "subtle" | "solid";
}) {
  const c = colorConfig[color];
  const isSolid = variant === "solid";

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md ${isSolid ? "bg-gradient-to-br " + c.solidCard : "bg-white dark:bg-zinc-900/50 " + c.card}`}>
      <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${isSolid ? "" : c.card}`} />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-semibold mb-1 ${isSolid ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"}`}>{label}</p>
            <p className={`font-bold tracking-tight ${large ? "text-2xl sm:text-3xl" : "text-4xl"} ${isSolid ? "text-white" : "text-zinc-900 dark:text-zinc-50"}`}>
              {value}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl border shadow-sm shrink-0 ${isSolid ? c.solidIcon : c.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
