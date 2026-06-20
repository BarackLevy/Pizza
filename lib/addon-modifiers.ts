import { supabase } from "@/lib/supabase/client";

export interface AddonOption {
  id:          string;
  name_he:     string;
  price_delta: number;
  sort_order:  number;
  image_url:   string | null;
}

export interface AddonGroup {
  id: string;
  name_he: string;
  selection_type: "single" | "multi";
  required: boolean;
  allow_quantity: boolean;
  options: AddonOption[];
}

// Pizza-specific group names that must never appear in AddonCustomizer.
// These are handled exclusively by PizzaCustomizer.
const PIZZA_GROUP_NAMES = new Set(["גודל", "בסיס", "תוספות"]);

/**
 * Fetch ALL modifier groups linked to a product, excluding the three
 * pizza-specific groups (size / base / pizza toppings).
 * Returns single-select required groups first, then quantity add-on groups.
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

  // 2. Fetch all those groups (selection_type, required, allow_quantity)
  const { data: groups, error: gErr } = await supabase
    .from("modifier_groups")
    .select("id, name_he, selection_type, required, allow_quantity")
    .in("id", groupIds);
  if (gErr) throw gErr;
  if (!groups?.length) return [];

  // Exclude pizza-specific groups; sort single-select required first
  const addonGroups = (groups as Array<{
    id: string;
    name_he: string;
    selection_type: string;
    required: boolean;
    allow_quantity: boolean;
  }>)
    .filter((g) => !PIZZA_GROUP_NAMES.has(g.name_he))
    .sort((a, b) => {
      const score = (g: typeof a) =>
        g.selection_type === "single" && g.required ? 0 : 1;
      return score(a) - score(b);
    });

  if (!addonGroups.length) return [];

  const addonGroupIds = addonGroups.map((g) => g.id);

  // 3. Fetch all options for those groups in one query
  const { data: opts, error: oErr } = await supabase
    .from("modifier_options")
    .select("id, group_id, name_he, price_delta, sort_order, image_url")
    .in("group_id", addonGroupIds)
    .order("sort_order");
  if (oErr) throw oErr;

  return addonGroups.map((g) => ({
    id:             g.id             as string,
    name_he:        g.name_he        as string,
    selection_type: g.selection_type as "single" | "multi",
    required:       g.required       as boolean,
    allow_quantity: g.allow_quantity as boolean,
    options: (opts ?? [])
      .filter((o) => o.group_id === g.id)
      .map((o) => ({
        id:          o.id          as string,
        name_he:     o.name_he     as string,
        price_delta: o.price_delta as number,
        sort_order:  o.sort_order  as number,
        image_url:   (o.image_url  as string | null) ?? null,
      })),
  }));
}

/**
 * Returns the set of product IDs that have at least one modifier group.
 * Used by the menu page to decide whether to open AddonCustomizer or
 * do a one-tap add-to-cart, without making per-product queries.
 */
export async function fetchProductsWithModifiers(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("product_modifier_groups")
    .select("product_id");
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.product_id as string));
}
