import { supabase } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/menu";

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export async function fetchMenu(): Promise<CategoryWithProducts[]> {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (catError) throw catError;
  if (!categories?.length) return [];

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("available", true)
    .order("sort_order");

  if (prodError) throw prodError;

  return categories.map((cat) => ({
    ...cat,
    products: (products ?? []).filter((p) => p.category_id === cat.id),
  }));
}
