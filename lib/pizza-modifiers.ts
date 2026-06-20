import { supabase } from "@/lib/supabase/client";
import type { BasePricingRow, SizeLabel } from "@/lib/pricing";

export interface ToppingOption {
  id: string;
  name_he: string;
  is_special: boolean;
  sort_order: number;
}

export interface BaseOption {
  id: string;
  name_he: string;
  image_url: string | null;
  sort_order: number;
}

export async function fetchToppings(): Promise<ToppingOption[]> {
  const { data: group, error: gErr } = await supabase
    .from("modifier_groups")
    .select("id")
    .eq("name_he", "תוספות")
    .single();
  if (gErr) throw gErr;

  const { data: opts, error: oErr } = await supabase
    .from("modifier_options")
    .select("id, name_he, is_special, sort_order")
    .eq("group_id", group.id)
    .order("sort_order");
  if (oErr) throw oErr;

  return (opts ?? []).map((o) => ({
    id:         o.id         as string,
    name_he:    o.name_he    as string,
    is_special: o.is_special as boolean,
    sort_order: o.sort_order as number,
  }));
}

export async function fetchBases(): Promise<BaseOption[]> {
  const { data: group, error: gErr } = await supabase
    .from("modifier_groups")
    .select("id")
    .eq("name_he", "בסיס")
    .single();
  if (gErr) throw gErr;

  const { data: opts, error: oErr } = await supabase
    .from("modifier_options")
    .select("id, name_he, image_url, sort_order")
    .eq("group_id", group.id)
    .order("sort_order");
  if (oErr) throw oErr;

  return (opts ?? []).map((o) => ({
    id:         o.id         as string,
    name_he:    o.name_he    as string,
    image_url:  o.image_url  as string | null,
    sort_order: o.sort_order as number,
  }));
}

export async function fetchBasePricing(): Promise<BasePricingRow[]> {
  const { data, error } = await supabase
    .from("base_pricing")
    .select("base_name, size_label, price");
  if (error) throw error;

  return (data ?? []).map((r) => ({
    base_name:  r.base_name  as string,
    size_label: r.size_label as SizeLabel,
    price:      r.price      as number,
  }));
}
