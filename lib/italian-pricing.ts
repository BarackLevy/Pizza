import { supabase } from "@/lib/supabase/client";

export interface ItalianPricingRow {
  type_name:  string;
  sauce_name: string;
  price:      number;
}

export async function fetchItalianPricing(): Promise<ItalianPricingRow[]> {
  const { data, error } = await supabase
    .from("italian_pricing")
    .select("type_name, sauce_name, price");
  if (error) throw error;
  return (data ?? []) as ItalianPricingRow[];
}

/** Returns sauce names available for a given type (ordered as stored). */
export function getAvailableSauces(
  typeName: string,
  rows: ItalianPricingRow[]
): string[] {
  return rows
    .filter((r) => r.type_name === typeName)
    .map((r) => r.sauce_name);
}

/** Looks up the base price for a type+sauce combination. Returns 0 if not found. */
export function getItalianPrice(
  typeName:  string,
  sauceName: string,
  rows: ItalianPricingRow[]
): number {
  return (
    rows.find((r) => r.type_name === typeName && r.sauce_name === sauceName)
      ?.price ?? 0
  );
}
