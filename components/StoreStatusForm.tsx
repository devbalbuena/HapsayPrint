"use client";

import { useState, useTransition } from "react";
import { StoreSettings } from "@/src/generated/prisma";
import { updateStoreSettings } from "@/app/actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2Icon, SaveIcon, StoreIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

export function StoreStatusForm({ settings }: { settings: StoreSettings }) {
  const [isPending, startTransition] = useTransition();

  const [isAcceptingOrders, setIsAcceptingOrders] = useState(
    settings.isAcceptingOrders
  );
  const [closedMessage, setClosedMessage] = useState(settings.closedMessage);
  const [scheduleEnabled, setScheduleEnabled] = useState(
    settings.scheduleEnabled
  );
  const [openTime, setOpenTime] = useState(settings.openTime);
  const [closeTime, setCloseTime] = useState(settings.closeTime);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    settings.openDays.split(",").map((d) => d.trim())
  );

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDays.length === 0 && scheduleEnabled) {
      toast.error("Please select at least one open day.");
      return;
    }
    startTransition(async () => {
      const result = await updateStoreSettings({
        isAcceptingOrders,
        closedMessage,
        scheduleEnabled,
        openTime,
        closeTime,
        openDays: selectedDays.join(","),
      });
      if (result.success) {
        toast.success("Store settings updated!");
      } else {
        toast.error(result.error || "Failed to save settings.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Manual Toggle ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <StoreIcon className="w-4 h-4 text-zinc-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Store Status
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Accepting Orders
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              When off, the submission form is hidden and your message is shown instead.
            </p>
          </div>
          {/* Custom toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isAcceptingOrders}
            onClick={() => setIsAcceptingOrders((p) => !p)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:ring-offset-2",
              isAcceptingOrders ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                isAcceptingOrders ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Status badge */}
        <div className={cn(
          "flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 w-fit",
          isAcceptingOrders
            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            isAcceptingOrders ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
          )} />
          {isAcceptingOrders ? "Currently accepting orders" : "Store is closed — orders paused"}
        </div>

        {/* Closed message */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Closed Message
          </Label>
          <Textarea
            rows={3}
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            placeholder="Message customers will see when the store is closed..."
            className="resize-none text-sm bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800"
          />
          <p className="text-xs text-zinc-400">
            Shown on the public form when orders are paused (manual or by schedule).
          </p>
        </div>
      </div>

      {/* ── Automatic Schedule ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <ClockIcon className="w-4 h-4 text-zinc-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Automatic Schedule
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Enable Automatic Hours
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automatically close the store outside your set hours. Uses Philippine time (PHT).
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={scheduleEnabled}
            onClick={() => setScheduleEnabled((p) => !p)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:ring-offset-2",
              scheduleEnabled ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                scheduleEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {scheduleEnabled && (
          <div className="space-y-4 pl-1">
            {/* Open / Close Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Opens At
                </Label>
                <Input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="h-10 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Closes At
                </Label>
                <Input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="h-10 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
            </div>

            {/* Open Days */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Open Days
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100"
                          : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      )}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-400">
                On non-selected days, the store will be closed automatically (if this schedule is on).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Save ── */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isPending ? (
            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <SaveIcon className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}
