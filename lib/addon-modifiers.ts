import { supabase } from "@/lib/supabase/client";

export interface AddonOption {
  id: string;
  name_he: string;
  price_delta: number;   // flat shekel price; no size dependency
  sort_order: number;
}

export interface AddonGroup {
  id: string;
  name_he: string;
  options: AddonOption[];
}

/**
 * Fetch modifier groups with allow_quantity=true that are linked to a product.
 * Returns each group with its options, ordered by sort_order.
 * Groups with allow_quantity=false (size, base, pizza toppings) are excluded.
 */
export async function fetchAddonGroups(productId: string): Promise<AddonGroup[]> {
  // 1. Get all group IDs linked to this product
  const { data: links, error: lErr } = await supabase
    .from("product_modifier_groups")
    .select("group_id")
    .eq("product_id", productId);
  if (lErr) throw lErr;

  const groupIds = (links ?? []).map((l) => l.group_id as string);
  if (!groupIds.length) return [];

  // 2. Keep only groups with allow_quantity=true
  const { data: groups, error: gErr } = await supabase
    .from("modifier_groups")
    .select("id, name_he")
    .in("id", groupIds)
    .eq("allow_quantity", true);
  if (gErr) throw gErr;
  if (!groups?.length) return [];

  const addonGroupIds = groups.map((g) => g.id as string);

  // 3. Fetch all options for those groups in one query
  const { data: opts, error: oErr } = await supabase
    .from("modifier_options")
    .select("id, group_id, name_he, price_delta, sort_order")
    .in("group_id", addonGroupIds)
    .order("sort_order");
  if (oErr) throw oErr;

  return groups.map((g) => ({
    id:      g.id      as string,
    name_he: g.name_he as string,
    options: (opts ?? [])
      .filter((o) => o.group_id === g.id)
      .map((o) => ({
        id:          o.id          as string,
        name_he:     o.name_he     as string,
        price_delta: o.price_delta as number,
        sort_order:  o.sort_order  as number,
      })),
  }));
}
