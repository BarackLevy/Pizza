-- ============================================================
-- Migration : 0008_sambusak
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0007_malawach_typo.sql.
--
-- What this migration does:
--   1. Renames product "מסבוסה" → "סמבוסק" (price stays 32).
--   2. Creates "מילוי סמבוסק" — single-select, required,
--      allow_quantity=false — with 4 filling options at 0₪ each.
--   3. Creates "תוספות סמבוסק" — multi, allow_quantity=true —
--      with the 16 regular pizza toppings at flat 4₪ each.
--      Goat cheese and anchovy (special tier) are excluded.
--   4. Links both groups to the סמבוסק product.
-- ============================================================

do $$
declare
  prod_sambusak uuid;
  grp_filling   uuid;
  grp_toppings  uuid;
begin

  -- ── 1. Rename ─────────────────────────────────────────────
  update products
  set    name_he = 'סמבוסק'
  where  name_he = 'מסבוסה';

  select id into prod_sambusak
  from   products
  where  name_he = 'סמבוסק';

  -- ── 2. Filling group (single, required, allow_quantity=false)
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('מילוי סמבוסק', 'single', true, false)
  returning id into grp_filling;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_filling, 'תפוח אדמה ביצה וגבינה', 0, 1, false, null),
    (grp_filling, 'סמבוסק פיצה',           0, 2, false, null),
    (grp_filling, 'סמבוסק 4 גבינות',       0, 3, false, null),
    (grp_filling, 'סמבוסק אלפרדו פטריות',  0, 4, false, null);

  insert into product_modifier_groups (product_id, group_id)
  values (prod_sambusak, grp_filling);

  -- ── 3. Toppings group (multi, allow_quantity=true) ────────
  --   16 regular toppings only — goat cheese and anchovy excluded.
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות סמבוסק', 'multi', false, true)
  returning id into grp_toppings;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_toppings, 'זיתים ירוקים',    4,  1, false, null),
    (grp_toppings, 'זיתים שחורים',    4,  2, false, null),
    (grp_toppings, 'בצל',             4,  3, false, null),
    (grp_toppings, 'פלפל אדום',       4,  4, false, null),
    (grp_toppings, 'גבינה בולגרית',   4,  5, false, null),
    (grp_toppings, 'טונה',            4,  6, false, null),
    (grp_toppings, 'ביצה',            4,  7, false, null),
    (grp_toppings, 'חצילים',          4,  8, false, null),
    (grp_toppings, 'פטריות טריות',    4,  9, false, null),
    (grp_toppings, 'פטריות שימורים',  4, 10, false, null),
    (grp_toppings, 'תירס',            4, 11, false, null),
    (grp_toppings, 'אננס',            4, 12, false, null),
    (grp_toppings, 'גבינה כפולה',     4, 13, false, null),
    (grp_toppings, 'עגבניות',         4, 14, false, null),
    (grp_toppings, 'שיפקה',           4, 15, false, null),
    (grp_toppings, 'פלפל ירוק חריף',  4, 16, false, null);

  insert into product_modifier_groups (product_id, group_id)
  values (prod_sambusak, grp_toppings);

end $$;
