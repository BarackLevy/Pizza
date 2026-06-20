-- ============================================================
-- Migration : 0006_ziwa_addon_fixes
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0005_category_addons.sql.
--
-- What this migration does:
--   Reorders and reprices the existing ziwa add-on options.
--   No new rows are created; no rows are deleted.
--   Only sort_order and price_delta are updated.
--
-- Final ziwa add-on order:
--   sort 1   ביצה בפנים      4₪  (ziwa-specific, top)
--   sort 2   ביצה בחוץ       4₪  (ziwa-specific, top)
--   sort 3   טחינת הבית      4₪  (ziwa-specific, top)
--   sort 4–19  regular pizza toppings  4₪ each
--   sort 20  גבינת עזים      8₪  (premium, bottom)
--   sort 21  אנשובי          8₪  (premium, bottom)
-- ============================================================

do $$
declare
  grp_ziwa uuid;
begin

  select id into grp_ziwa
  from   modifier_groups
  where  name_he = 'תוספות זיווה';

  -- ── Ziwa-specific options → TOP (sort_order 1–3) ─────────
  update modifier_options set sort_order = 1  where group_id = grp_ziwa and name_he = 'ביצה בפנים';
  update modifier_options set sort_order = 2  where group_id = grp_ziwa and name_he = 'ביצה בחוץ';
  update modifier_options set sort_order = 3  where group_id = grp_ziwa and name_he = 'טחינת הבית';

  -- ── Regular pizza toppings → middle (sort_order 4–19) ────
  update modifier_options set sort_order = 4  where group_id = grp_ziwa and name_he = 'זיתים ירוקים';
  update modifier_options set sort_order = 5  where group_id = grp_ziwa and name_he = 'זיתים שחורים';
  update modifier_options set sort_order = 6  where group_id = grp_ziwa and name_he = 'בצל';
  update modifier_options set sort_order = 7  where group_id = grp_ziwa and name_he = 'פלפל אדום';
  update modifier_options set sort_order = 8  where group_id = grp_ziwa and name_he = 'גבינה בולגרית';
  update modifier_options set sort_order = 9  where group_id = grp_ziwa and name_he = 'טונה';
  update modifier_options set sort_order = 10 where group_id = grp_ziwa and name_he = 'ביצה';
  update modifier_options set sort_order = 11 where group_id = grp_ziwa and name_he = 'חצילים';
  update modifier_options set sort_order = 12 where group_id = grp_ziwa and name_he = 'פטריות טריות';
  update modifier_options set sort_order = 13 where group_id = grp_ziwa and name_he = 'פטריות שימורים';
  update modifier_options set sort_order = 14 where group_id = grp_ziwa and name_he = 'תירס';
  update modifier_options set sort_order = 15 where group_id = grp_ziwa and name_he = 'אננס';
  update modifier_options set sort_order = 16 where group_id = grp_ziwa and name_he = 'גבינה כפולה';
  update modifier_options set sort_order = 17 where group_id = grp_ziwa and name_he = 'עגבניות';
  update modifier_options set sort_order = 18 where group_id = grp_ziwa and name_he = 'שיפקה';
  update modifier_options set sort_order = 19 where group_id = grp_ziwa and name_he = 'פלפל ירוק חריף';

  -- ── Premium toppings → BOTTOM, price bumped 4 → 8 ────────
  update modifier_options set sort_order = 20, price_delta = 8 where group_id = grp_ziwa and name_he = 'גבינת עזים';
  update modifier_options set sort_order = 21, price_delta = 8 where group_id = grp_ziwa and name_he = 'אנשובי';

end $$;
