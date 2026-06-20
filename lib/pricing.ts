// Topping price rules — mirrors migration 0003 topping_pricing table exactly.
// Update here whenever that table is updated.

export type SizeLabel      = "S" | "M" | "L" | "XL";
export type ToppingTier    = "regular" | "special";
export type ToppingCoverage = "none" | "whole" | "right" | "left";

const PRICES: Record<ToppingTier, Record<SizeLabel, { whole: number; half: number }>> = {
  regular: {
    S:  { whole: 4,  half: 4  },
    M:  { whole: 8,  half: 8  },
    L:  { whole: 10, half: 5  },
    XL: { whole: 12, half: 6  },
  },
  special: {
    S:  { whole: 8,  half: 8  },
    M:  { whole: 16, half: 16 },
    L:  { whole: 20, half: 10 },
    XL: { whole: 24, half: 12 },
  },
};

export function toppingPrice(
  tier: ToppingTier,
  size: SizeLabel,
  coverage: ToppingCoverage,
): number {
  if (coverage === "none") return 0;
  const row = PRICES[tier][size];
  return coverage === "whole" ? row.whole : row.half;
}

export function pizzaUnitPrice(
  basePrice: number,
  size: SizeLabel,
  selections: ReadonlyArray<{ tier: ToppingTier; coverage: ToppingCoverage }>,
): number {
  return (
    basePrice +
    selections.reduce((sum, s) => sum + toppingPrice(s.tier, size, s.coverage), 0)
  );
}

// XL must appear before L in the alternation so "XL" doesn't match as "L"
export function extractSizeLabel(productNameHe: string): SizeLabel {
  const m = productNameHe.match(/\b(XL|L|M|S)\b/);
  return (m?.[1] ?? "S") as SizeLabel;
}

// ── Base pricing helpers — mirror the base_pricing table (migration 0004) ─────

export interface BasePricingRow {
  base_name:  string;
  size_label: SizeLabel;
  price:      number;
}

const SIZE_ORDER: SizeLabel[] = ["S", "M", "L", "XL"];

/** Returns the sizes available for a given base, in display order. */
export function getAvailableSizes(rows: BasePricingRow[], baseName: string): SizeLabel[] {
  const avail = new Set(
    rows.filter((r) => r.base_name === baseName).map((r) => r.size_label),
  );
  return SIZE_ORDER.filter((s) => avail.has(s));
}

/** Returns the base price for a given base + size combo, or 0 if not found. */
export function getBasePrice(rows: BasePricingRow[], baseName: string, size: SizeLabel): number {
  return rows.find((r) => r.base_name === baseName && r.size_label === size)?.price ?? 0;
}
