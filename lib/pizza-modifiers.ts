import { supabase } from "@/lib/supabase/client";

export interface ToppingOption {
  id: string;
  name_he: string;
  is_special: boolean;
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
