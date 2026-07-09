"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon, PrinterIcon } from "lucide-react";

interface SubmitSuccessProps {
  name: string;
  trackingCode?: string;
  onReset: () => void;
}

export function SubmitSuccess({ name, trackingCode, onReset }: SubmitSuccessProps) {
  return (
    <Card className="w-full shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center text-center py-10 px-6 gap-5">
        {/* Animated check icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-green-500/10 animate-ping" />
          <div className="relative p-4 rounded-full bg-green-500/15">
            <CheckCircle2Icon className="w-12 h-12 text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Job Submitted! 🎉
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Thanks, <span className="font-semibold text-foreground">{name}</span>!
            Your print job has been received.
          </p>
        </div>

        {trackingCode && (
          <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Tracking Code</p>
            <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-widest bg-white dark:bg-zinc-950 py-2 rounded-lg border shadow-sm">
              {trackingCode}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Save this code or bookmark your tracking link to check your order status.
            </p>
            <a
              href={`/track/${trackingCode}`}
              className="inline-flex items-center justify-center w-full mt-2 h-8 px-3 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              View Tracking Page
            </a>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full pt-2">
          <Button
            onClick={onReset}
            className="w-full h-11 font-semibold"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Submit Another Job
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Reference your name and tracking code when you pick up.
        </p>
      </CardContent>
    </Card>
  );
}
