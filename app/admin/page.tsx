import { prisma } from "@/src/db";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { SignOutButton } from "@/components/SignOutButton";
import { PrinterIcon, ClockIcon, Loader2Icon, PackageCheckIcon, CheckCircle2Icon } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | HapsayPrint",
  description: "View and manage all submitted print jobs.",
};

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
    <>
      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            label="Pending Review" 
            count={counts.PENDING} 
            color="amber" 
            icon={<ClockIcon className="w-5 h-5" />}
          />
          <StatCard 
            label="In Progress" 
            count={counts.IN_PROGRESS} 
            color="blue" 
            icon={<Loader2Icon className="w-5 h-5" />}
          />
          <StatCard 
            label="Ready for Pickup" 
            count={counts.READY_FOR_PICKUP} 
            color="emerald" 
            icon={<PackageCheckIcon className="w-5 h-5" />}
          />
          <StatCard 
            label="Delivered" 
            count={counts.DELIVERED} 
            color="zinc" 
            icon={<CheckCircle2Icon className="w-5 h-5" />}
          />
        </div>

        {/* Data Grid Toolbar & Table */}
        <AdminDashboardClient jobs={jobs} />

      </main>
    </>
  );
}

function StatCard({
  label,
  count,
  color,
  icon
}: {
  label: string;
  count: number;
  color: "amber" | "blue" | "emerald" | "zinc";
  icon: React.ReactNode;
}) {
  const styles = {
    amber: "from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-transparent border-amber-500/20 text-amber-700 dark:text-amber-400 icon-amber",
    blue: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-transparent border-blue-500/20 text-blue-700 dark:text-blue-400 icon-blue",
    emerald: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-transparent border-emerald-500/20 text-emerald-700 dark:text-emerald-400 icon-emerald",
    zinc: "from-zinc-500/10 to-zinc-500/5 dark:from-zinc-500/20 dark:to-transparent border-zinc-500/20 text-zinc-700 dark:text-zinc-400 icon-zinc",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900/50 shadow-sm transition-all hover:shadow-md group ${styles[color].split(' icon-')[0]}`}>
      {/* Subtle Glow Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles[color].split(' icon-')[0]} opacity-50`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{count}</p>
          </div>
          
          <div className={`p-2.5 rounded-xl bg-white dark:bg-zinc-800 border shadow-sm ${styles[color].split('icon-')[1] === 'amber' ? 'text-amber-500 border-amber-100 dark:border-amber-900/50' : styles[color].split('icon-')[1] === 'blue' ? 'text-blue-500 border-blue-100 dark:border-blue-900/50' : styles[color].split('icon-')[1] === 'emerald' ? 'text-emerald-500 border-emerald-100 dark:border-emerald-900/50' : 'text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
