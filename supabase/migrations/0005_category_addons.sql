-- ============================================================
-- Migration : 0005_category_addons
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0004_pizza_bases.sql.
--
-- What this migration does:
--   1. Adds allow_quantity BOOLEAN (default false) to
--      modifier_groups. Existing rows (size / base / pizza
--      toppings) are unaffected — they default to false.
--      New add-on groups set it to true so the UI renders
--      a per-option +/- quantity stepper instead of a toggle.
--
--   2. Creates 4 new flat-priced add-on modifier groups and
--      their options. Price is stored directly in price_delta
--      (whole shekels) — no separate lookup table needed
--      because these prices do not vary by size.
--
--   3. Links each group to its target products via
--      product_modifier_groups. Existing pizza toppings,
--      topping_pricing, and base_pricing are not touched.
--
-- Groups created:
--   "תוספות זיווה"   — 21 options — linked to 5 ziwa products
--   "תוספות מלאווח"  — 18 options — linked to 8 malawach products
--   "תוספות סלט"    — 3 options  — linked to 6 salad products
--   "תוספות פסטה"   — 2 options  — linked to 3 pasta products
--
-- Totals: 4 groups | 44 options | 22 product links
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Add allow_quantity to modifier_groups
--    Default false: existing groups (גודל, בסיס, תוספות)
--    render as simple selectors and are not affected.
-- ────────────────────────────────────────────────────────────
alter table modifier_groups
  add column if not exists allow_quantity boolean not null default false;


-- ────────────────────────────────────────────────────────────
-- 2 & 3. Create groups, options, and product links
-- ────────────────────────────────────────────────────────────
do $$
declare
  -- group IDs
  grp_ziwa     uuid;
  grp_malawach uuid;
  grp_salad    uuid;
  grp_pasta    uuid;

  -- ziwa product IDs (5)
  p_ziwa_regular   uuid;
  p_ziwa_olives    uuid;
  p_ziwa_mushrooms uuid;
  p_ziwa_mixed     uuid;
  p_ziwa_greek     uuid;

  -- malawach product IDs (8)
  p_mal_regular  uuid;
  p_mal_tahini   uuid;
  p_mal_tunisian uuid;
  p_mal_greek    uuid;
  p_mal_house    uuid;
  p_mal_pizza    uuid;
  p_mal_open     uuid;
  p_jahnun       uuid;

  -- salad product IDs (6)
  p_sal_greek_s uuid;
  p_sal_greek_l uuid;
  p_sal_tuna_s  uuid;
  p_sal_tuna_l  uuid;
  p_sal_veg_s   uuid;
  p_sal_veg_l   uuid;

  -- pasta product IDs (3)
  p_pasta_1 uuid;
  p_pasta_2 uuid;
  p_pasta_3 uuid;

begin

  -- ────────────────────────────────────────────────────────
  -- GROUP 1: ziwa add-ons
  --   18 shared pizza toppings (flat 4₪ each)
  --   + 3 ziwa-specific options (ביצה בפנים, ביצה בחוץ, טחינת הבית)
  --   Total: 21 options
  -- ────────────────────────────────────────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות זיווה', 'multi', false, true)
  returning id into grp_ziwa;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_ziwa, 'זיתים ירוקים',    4,  1, false, null),
    (grp_ziwa, 'זיתים שחורים',    4,  2, false, null),
    (grp_ziwa, 'בצל',             4,  3, false, null),
    (grp_ziwa, 'פלפל אדום',       4,  4, false, null),
    (grp_ziwa, 'גבינה בולגרית',   4,  5, false, null),
    (grp_ziwa, 'טונה',            4,  6, false, null),
    (grp_ziwa, 'ביצה',            4,  7, false, null),
    (grp_ziwa, 'חצילים',          4,  8, false, null),
    (grp_ziwa, 'פטריות טריות',    4,  9, false, null),
    (grp_ziwa, 'פטריות שימורים',  4, 10, false, null),
    (grp_ziwa, 'תירס',            4, 11, false, null),
    (grp_ziwa, 'אננס',            4, 12, false, null),
    (grp_ziwa, 'גבינה כפולה',     4, 13, false, null),
    (grp_ziwa, 'עגבניות',         4, 14, false, null),
    (grp_ziwa, 'שיפקה',           4, 15, false, null),
    (grp_ziwa, 'פלפל ירוק חריף',  4, 16, false, null),
    (grp_ziwa, 'גבינת עזים',      4, 17, false, null),
    (grp_ziwa, 'אנשובי',          4, 18, false, null),
    (grp_ziwa, 'ביצה בפנים',      4, 19, false, null),
    (grp_ziwa, 'ביצה בחוץ',       4, 20, false, null),
    (grp_ziwa, 'טחינת הבית',      4, 21, false, null);

  select id into p_ziwa_regular   from products where name_he = 'זיווה רגילה';
  select id into p_ziwa_olives    from products where name_he = 'זיווה זיתים';
  select id into p_ziwa_mushrooms from products where name_he = 'זיווה פטריות';
  select id into p_ziwa_mixed     from products where name_he = 'זיווה מעורבת';
  select id into p_ziwa_greek     from products where name_he = 'זיווה יוונית';

  insert into product_modifier_groups (product_id, group_id) values
    (p_ziwa_regular,   grp_ziwa),
    (p_ziwa_olives,    grp_ziwa),
    (p_ziwa_mushrooms, grp_ziwa),
    (p_ziwa_mixed,     grp_ziwa),
    (p_ziwa_greek,     grp_ziwa);


  -- ────────────────────────────────────────────────────────
  -- GROUP 2: malawach add-ons
  --   Same 18 shared pizza toppings, flat 4₪ each.
  --   These are NEW rows — the pizza toppings group is untouched.
  -- ────────────────────────────────────────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות מלאווח', 'multi', false, true)
  returning id into grp_malawach;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_malawach, 'זיתים ירוקים',    4,  1, false, null),
    (grp_malawach, 'זיתים שחורים',    4,  2, false, null),
    (grp_malawach, 'בצל',             4,  3, false, null),
    (grp_malawach, 'פלפל אדום',       4,  4, false, null),
    (grp_malawach, 'גבינה בולגרית',   4,  5, false, null),
    (grp_malawach, 'טונה',            4,  6, false, null),
    (grp_malawach, 'ביצה',            4,  7, false, null),
    (grp_malawach, 'חצילים',          4,  8, false, null),
    (grp_malawach, 'פטריות טריות',    4,  9, false, null),
    (grp_malawach, 'פטריות שימורים',  4, 10, false, null),
    (grp_malawach, 'תירס',            4, 11, false, null),
    (grp_malawach, 'אננס',            4, 12, false, null),
    (grp_malawach, 'גבינה כפולה',     4, 13, false, null),
    (grp_malawach, 'עגבניות',         4, 14, false, null),
    (grp_malawach, 'שיפקה',           4, 15, false, null),
    (grp_malawach, 'פלפל ירוק חריף',  4, 16, false, null),
    (grp_malawach, 'גבינת עזים',      4, 17, false, null),
    (grp_malawach, 'אנשובי',          4, 18, false, null);

  select id into p_mal_regular  from products where name_he = 'מלאווח רגיל';
  select id into p_mal_tahini   from products where name_he = 'מלאווח תחינה';
  select id into p_mal_tunisian from products where name_he = 'מלאווח סוניסאי';
  select id into p_mal_greek    from products where name_he = 'מלאווח יווני';
  select id into p_mal_house    from products where name_he = 'מלאווח הבית';
  select id into p_mal_pizza    from products where name_he = 'מלאווח פיצה';
  select id into p_mal_open     from products where name_he = 'מלאווח פתוח';
  select id into p_jahnun       from products where name_he = 'ג''חנון';

  insert into product_modifier_groups (product_id, group_id) values
    (p_mal_regular,  grp_malawach),
    (p_mal_tahini,   grp_malawach),
    (p_mal_tunisian, grp_malawach),
    (p_mal_greek,    grp_malawach),
    (p_mal_house,    grp_malawach),
    (p_mal_pizza,    grp_malawach),
    (p_mal_open,     grp_malawach),
    (p_jahnun,       grp_malawach);


  -- ────────────────────────────────────────────────────────
  -- GROUP 3: salad add-ons
  --   3 options: egg (4₪), house bagel (5₪), house tahini (4₪)
  -- ────────────────────────────────────────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות סלט', 'multi', false, true)
  returning id into grp_salad;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_salad, 'ביצה',        4, 1, false, null),
    (grp_salad, 'בייגל הבית',  5, 2, false, null),
    (grp_salad, 'טחינת הבית',  4, 3, false, null);

  select id into p_sal_greek_s from products where name_he = 'סלט יווני קטן';
  select id into p_sal_greek_l from products where name_he = 'סלט יווני גדול';
  select id into p_sal_tuna_s  from products where name_he = 'סלט טונה קטן';
  select id into p_sal_tuna_l  from products where name_he = 'סלט טונה גדול';
  select id into p_sal_veg_s   from products where name_he = 'סלט ירקות קטן';
  select id into p_sal_veg_l   from products where name_he = 'סלט ירקות גדול';

  insert into product_modifier_groups (product_id, group_id) values
    (p_sal_greek_s, grp_salad),
    (p_sal_greek_l, grp_salad),
    (p_sal_tuna_s,  grp_salad),
    (p_sal_tuna_l,  grp_salad),
    (p_sal_veg_s,   grp_salad),
    (p_sal_veg_l,   grp_salad);


  -- ────────────────────────────────────────────────────────
  -- GROUP 4: pasta add-ons
  --   2 options: mozzarella gratin (6₪), parmesan (4₪)
  -- ────────────────────────────────────────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות פסטה', 'multi', false, true)
  returning id into grp_pasta;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_pasta, 'הקרמת מוצרלה', 6, 1, false, null),
    (grp_pasta, 'פרמז''ן',       4, 2, false, null);

  select id into p_pasta_1 from products where name_he = 'פטוצ''יני / ספגטי / פנה';
  select id into p_pasta_2 from products where name_he = 'רוטב שמנת פטריות / רוזה מיקס';
  select id into p_pasta_3 from products where name_he = 'ניוקי מעורב';

  insert into product_modifier_groups (product_id, group_id) values
    (p_pasta_1, grp_pasta),
    (p_pasta_2, grp_pasta),
    (p_pasta_3, grp_pasta);

end $$;
