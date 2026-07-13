import { PrinterIcon, ClockIcon } from "lucide-react";

interface StoreClosedMessageProps {
  message: string;
  openTime?: string;
  closeTime?: string;
  openDays?: string;
  scheduleEnabled?: boolean;
}

function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${String(min).padStart(2, "0")} ${ampm}`;
}

function formatDays(openDays: string): string {
  const labels: Record<string, string> = {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
    SUN: "Sun",
  };
  return openDays
    .split(",")
    .map((d) => labels[d.trim().toUpperCase()] ?? d)
    .join(", ");
}

export function StoreClosedMessage({
  message,
  openTime,
  closeTime,
  openDays,
  scheduleEnabled,
}: StoreClosedMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 max-w-md mx-auto space-y-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shadow-lg">
          <PrinterIcon className="w-9 h-9 text-zinc-400" />
        </div>
        {/* Closed badge */}
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow">
          Closed
        </span>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          We&apos;re currently closed
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
          {message}
        </p>
      </div>

      {/* Schedule info (shown only if schedule is enabled) */}
      {scheduleEnabled && openTime && closeTime && openDays && (
        <div className="flex items-start gap-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 text-left w-full max-w-xs">
          <ClockIcon className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-zinc-300">
              We are open:
            </p>
            <p className="text-xs text-zinc-400">
              {formatDays(openDays)}
            </p>
            <p className="text-xs text-zinc-400">
              {formatTime(openTime)} &ndash; {formatTime(closeTime)}
            </p>
          </div>
        </div>
      )}

      {/* Footer hint */}
      <p className="text-xs text-zinc-600 font-medium">HapsayPrint</p>
    </div>
  );
}
