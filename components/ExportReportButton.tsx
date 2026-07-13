"use client";

import { useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate a range of years (5 years back to current)
function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 4; y--) {
    years.push(String(y));
  }
  return years;
}

export function ExportReportButton() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [isDownloading, setIsDownloading] = useState(false);

  const years = getYearOptions();
  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? "";

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const url = `/api/export?month=${month}&year=${year}`;
      const response = await fetch(url);

      if (!response.ok) {
        toast.error("Failed to export report. Please try again.");
        return;
      }

      // Trigger browser download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `HapsayPrint_Report_${monthLabel}_${year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Report for ${monthLabel} ${year} downloaded!`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Month */}
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="h-8 w-[130px] text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-none focus:ring-0">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value} className="text-xs">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="h-8 w-[90px] text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-none focus:ring-0">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y} className="text-xs">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Download */}
      <Button
        id="export-report-btn"
        onClick={handleDownload}
        disabled={isDownloading}
        size="sm"
        className="h-8 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all gap-1.5"
      >
        {isDownloading ? (
          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <DownloadIcon className="w-3.5 h-3.5" />
        )}
        {isDownloading ? "Exporting..." : "Download CSV"}
      </Button>
    </div>
  );
}
