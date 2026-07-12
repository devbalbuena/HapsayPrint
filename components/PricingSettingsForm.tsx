"use client";

import { useState, useTransition } from "react";
import { PricingConfig } from "@/src/generated/prisma";
import { updatePricingConfig } from "@/app/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SaveIcon } from "lucide-react";

export function PricingSettingsForm({ config }: { config: PricingConfig }) {
  const [isPending, startTransition] = useTransition();

  // We only want to manage the numeric values
  const [formData, setFormData] = useState<Record<string, number>>({
    shortBw: config.shortBw,
    shortCol: config.shortCol,
    longBw: config.longBw,
    longCol: config.longCol,
    a4Bw: config.a4Bw,
    a4Col: config.a4Col,
    legalBw: config.legalBw,
    legalCol: config.legalCol,
    lamination: config.lamination,
    bindingComb: config.bindingComb,
    bindingSpiral: config.bindingSpiral,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updatePricingConfig(formData);
      if (result.success) {
        toast.success("Pricing updated successfully!");
      } else {
        toast.error(result.error || "Failed to update pricing");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Base Prices Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Base Prices (per page)</h3>
            <p className="text-sm text-zinc-500">Set the price for each paper size and print type.</p>
          </div>

          <div className="space-y-4 pt-2">
            <PriceInputRow label="Short (8.5x11)" nameBw="shortBw" nameCol="shortCol" values={formData} onChange={handleChange} />
            <PriceInputRow label="Long (8.5x13)" nameBw="longBw" nameCol="longCol" values={formData} onChange={handleChange} />
            <PriceInputRow label="A4" nameBw="a4Bw" nameCol="a4Col" values={formData} onChange={handleChange} />
            <PriceInputRow label="Legal" nameBw="legalBw" nameCol="legalCol" values={formData} onChange={handleChange} />
          </div>
        </div>

        {/* Finishing Prices Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Finishing Options (per document)</h3>
            <p className="text-sm text-zinc-500">Set the add-on prices for document finishings.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-[1fr_100px] items-center gap-4">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lamination</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₱</span>
                <Input type="number" step="0.01" min="0" name="lamination" value={formData.lamination} onChange={handleChange} className="pl-7" />
              </div>
            </div>
            
            <div className="grid grid-cols-[1fr_100px] items-center gap-4">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Comb Binding</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₱</span>
                <Input type="number" step="0.01" min="0" name="bindingComb" value={formData.bindingComb} onChange={handleChange} className="pl-7" />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_100px] items-center gap-4">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Spiral Binding</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₱</span>
                <Input type="number" step="0.01" min="0" name="bindingSpiral" value={formData.bindingSpiral} onChange={handleChange} className="pl-7" />
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
          {isPending ? (
            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <SaveIcon className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function PriceInputRow({ label, nameBw, nameCol, values, onChange }: { label: string, nameBw: string, nameCol: string, values: Record<string, number>, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] items-center gap-4">
      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</Label>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-1">B&W</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₱</span>
          <Input type="number" step="0.01" min="0" name={nameBw} value={values[nameBw]} onChange={onChange} className="pl-7 h-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-1">Colored</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₱</span>
          <Input type="number" step="0.01" min="0" name={nameCol} value={values[nameCol]} onChange={onChange} className="pl-7 h-9" />
        </div>
      </div>
    </div>
  );
}
