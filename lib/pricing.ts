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

// Base prices per page
export const BASE_PRICES: Record<string, Record<string, number>> = {
  SHORT: { BW: 3, COLORED: 8 },
  LONG: { BW: 4, COLORED: 10 },
  A4: { BW: 4, COLORED: 10 },
  LEGAL: { BW: 5, COLORED: 12 },
};

// Add-on prices per document (assumes finishing applies per document, but for simplicity here we multiply by quantity)
export const FINISHING_PRICES: Record<string, number> = {
  NONE: 0,
  LAMINATION: 15,
  BINDING_COMB: 50,
  BINDING_SPIRAL: 80,
};

export function calculateEstimate(
  paperSize: string | null,
  printType: string | null,
  finishing: string | null,
  quantity: number
): number {
  if (!paperSize || !printType || quantity < 1) return 0;

  const basePrice = BASE_PRICES[paperSize]?.[printType] || 0;
  const finishingPrice = finishing ? FINISHING_PRICES[finishing] || 0 : 0;

  // (Price per page * quantity) + (Finishing price * quantity)
  return (basePrice * quantity) + (finishingPrice * quantity);
}
