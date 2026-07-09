import { prisma } from "@/src/db";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 6); // last 7 days including today
  return startOfDay(d);
}

export type DailyVolume = { date: string; jobs: number };
export type AnalyticsData = {
  todayCount: number;
  weekCount: number;
  statusCounts: { PENDING: number; IN_PROGRESS: number; READY_FOR_PICKUP: number; DELIVERED: number };
  weekRevenue: number;
  dailyVolume: DailyVolume[];
  topPrintType: string | null;
  topFinishing: string | null;
};

export async function getAnalytics(): Promise<AnalyticsData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  const [
    todayCount,
    weekCount,
    statusGroups,
    weekRevenueAgg,
    jobsLast7Days,
    printTypeGroups,
    finishingGroups,
  ] = await Promise.all([
    // Total jobs today
    prisma.job.count({ where: { createdAt: { gte: todayStart } } }),

    // Total jobs this week (last 7 days)
    prisma.job.count({ where: { createdAt: { gte: weekStart } } }),

    // Jobs by status
    prisma.job.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Total estimated revenue this week
    prisma.job.aggregate({
      where: { createdAt: { gte: weekStart }, estimatedPrice: { not: null } },
      _sum: { estimatedPrice: true },
    }),

    // Raw jobs for last 7 days (to compute daily buckets)
    prisma.job.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true },
    }),

    // Most common print type (only non-null)
    prisma.job.groupBy({
      by: ["printType"],
      where: { printType: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),

    // Most common finishing (only non-null, exclude NONE)
    prisma.job.groupBy({
      by: ["finishing"],
      where: { finishing: { not: null }, AND: { finishing: { not: "NONE" } } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ]);

  // Build status counts map
  const statusCounts = { PENDING: 0, IN_PROGRESS: 0, READY_FOR_PICKUP: 0, DELIVERED: 0 };
  for (const g of statusGroups) {
    statusCounts[g.status as keyof typeof statusCounts] = g._count.id;
  }

  // Build daily volume buckets for the last 7 days
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    dailyMap[key] = 0;
  }
  for (const job of jobsLast7Days) {
    const key = job.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyVolume: DailyVolume[] = Object.entries(dailyMap).map(([date, jobs]) => ({ date, jobs }));

  return {
    todayCount,
    weekCount,
    statusCounts,
    weekRevenue: weekRevenueAgg._sum.estimatedPrice ?? 0,
    dailyVolume,
    topPrintType: printTypeGroups[0]?.printType ?? null,
    topFinishing: finishingGroups[0]?.finishing ?? null,
  };
}
