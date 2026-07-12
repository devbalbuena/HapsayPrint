import { prisma } from "@/src/db";
import { PricingConfig } from "@/src/generated/prisma";

export const PAPER_SIZES = [
  { value: "SHORT", label: "Short (8.5x11)" },
  { value: "LONG", label: "Long (8.5x13)" },
  { value: "A4", label: "A4" },
  { value: "LEGAL", label: "Legal" },
] as const;

export const PRINT_TYPES = [
  { value: "BW", label: "Black & White" },
  { value: "COLORED", label: "Colored" },
] as const;

export const FINISHING_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "LAMINATION", label: "Lamination" },
  { value: "BINDING_COMB", label: "Binding (Comb)" },
  { value: "BINDING_SPIRAL", label: "Binding (Spiral)" },
] as const;

export async function getPricingConfig() {
  let config = await prisma.pricingConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    config = await prisma.pricingConfig.create({
      data: { id: "default" },
    });
  }

  return config;
}

export function calculateEstimate(
  pricingConfig: PricingConfig,
  paperSize: string | null,
  printType: string | null,
  finishing: string | null,
  quantity: number
): number {
  if (!paperSize || !printType || quantity < 1) return 0;

  let basePrice = 0;
  
  if (paperSize === "SHORT") {
    basePrice = printType === "BW" ? pricingConfig.shortBw : pricingConfig.shortCol;
  } else if (paperSize === "LONG") {
    basePrice = printType === "BW" ? pricingConfig.longBw : pricingConfig.longCol;
  } else if (paperSize === "A4") {
    basePrice = printType === "BW" ? pricingConfig.a4Bw : pricingConfig.a4Col;
  } else if (paperSize === "LEGAL") {
    basePrice = printType === "BW" ? pricingConfig.legalBw : pricingConfig.legalCol;
  }

  let finishingPrice = 0;
  if (finishing === "LAMINATION") {
    finishingPrice = pricingConfig.lamination;
  } else if (finishing === "BINDING_COMB") {
    finishingPrice = pricingConfig.bindingComb;
  } else if (finishing === "BINDING_SPIRAL") {
    finishingPrice = pricingConfig.bindingSpiral;
  }

  return (basePrice * quantity) + (finishingPrice * quantity);
}
