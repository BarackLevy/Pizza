import { supabase } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/menu";

export interface CategoryWithProducts extends Category {
  products: Product[];
}

const TIMEOUT_MS = 10_000;

// Races a PromiseLike against a 10-second timeout.
// If the network request hangs (no resolve, no reject), we bail out with an error
// so callers can surface a proper UI state instead of spinning forever.
function withTimeout<T>(p: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Menu fetch timed out")), TIMEOUT_MS),
    ),
  ]);
}

export async function fetchMenu(): Promise<CategoryWithProducts[]> {
  const { data: categories, error: catError } = await withTimeout(
    supabase.from("categories").select("*").order("sort_order"),
  );

  if (catError) throw catError;
  if (!categories?.length) return [];

  const { data: products, error: prodError } = await withTimeout(
    supabase.from("products").select("*").eq("available", true).order("sort_order"),
  );

  if (prodError) throw prodError;

  return categories.map((cat) => ({
    ...cat,
    products: (products ?? []).filter((p) => p.category_id === cat.id),
  }));
}
