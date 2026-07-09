"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyVolume } from "@/lib/analytics";
import { TrendingUpIcon, PrinterIcon } from "lucide-react";

type Props = {
  dailyVolume: DailyVolume[];
  topPrintType: string | null;
  topFinishing: string | null;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="text-zinc-500 dark:text-zinc-400">
          <span className="font-bold text-zinc-900 dark:text-zinc-50">{payload[0].value}</span> job{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

function formatFinishing(raw: string | null) {
  if (!raw) return "—";
  return raw
    .replace("BINDING_COMB", "Comb Binding")
    .replace("BINDING_SPIRAL", "Spiral Binding")
    .replace("LAMINATION", "Lamination")
    .replace("NONE", "None");
}

function formatPrintType(raw: string | null) {
  if (!raw) return "—";
  return raw
    .replace("BW", "Black & White")
    .replace("COLORED", "Colored");
}

export function AnalyticsCharts({ dailyVolume, topPrintType, topFinishing }: Props) {
  const maxJobs = Math.max(...dailyVolume.map((d) => d.jobs), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart - 7-Day Volume */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Job Volume</p>
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Last 7 Days</p>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <TrendingUpIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyVolume} barSize={28} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113,113,122,0.12)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--axis-color, #71717a)", fontWeight: 500 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--axis-color, #71717a)" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(113,113,122,0.06)", radius: 8 }} />
            <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
              {dailyVolume.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.jobs === maxJobs && maxJobs > 0 ? "#18181b" : "#e4e4e7"}
                  className="dark:fill-zinc-600"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Options Panel */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-between gap-6">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Insights</p>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Most Requested</p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <PrinterIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Print Type</p>
              {topPrintType ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 text-sm font-semibold">
                    {formatPrintType(topPrintType)}
                  </span>
                  <span className="text-xs text-zinc-400">most common</span>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">Not enough data yet</p>
              )}
            </div>

            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Finishing</p>
              {topFinishing ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold border border-zinc-200 dark:border-zinc-700">
                    {formatFinishing(topFinishing)}
                  </span>
                  <span className="text-xs text-zinc-400">most common</span>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">Not enough data yet</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Based on all-time job history. Use this to anticipate supplies and staffing needs.
        </p>
      </div>
    </div>
  );
}
