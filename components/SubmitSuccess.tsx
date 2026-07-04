"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2Icon, PrinterIcon } from "lucide-react";

interface SubmitSuccessProps {
  name: string;
  onReset: () => void;
}

export function SubmitSuccess({ name, onReset }: SubmitSuccessProps) {
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
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Thanks, <span className="font-semibold text-foreground">{name}</span>!
            Your print job has been received. We&apos;ll contact you once it&apos;s
            ready for pickup.
          </p>
        </div>

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
          Reference your name and contact number when you pick up.
        </p>
      </CardContent>
    </Card>
  );
}
