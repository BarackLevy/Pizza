-- ============================================================
-- Migration : 0009_italian_menu
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0008_sambusak.sql.
--
-- What this migration does:
--   1. Creates italian_pricing(type_name, sauce_name, price)
--      lookup table with RLS — 16 rows.
--   2. Deletes modifier links, the old "תוספות פסטה" group
--      (migration 0005), the 9 old products (6 ravioli +
--      3 pasta), and the now-empty "פסטות" category.
--   3. Inserts one unified "האיטלקיה" product.
--   4. Creates 4 modifier groups and links them:
--        סוג          — single, required       (6 types)
--        רוטב         — single, required       (3 sauces)
--        מילוי רביולי — single, NOT required   (7 fillings)
--        תוספות פסטה  — multi,  NOT required,
--                        allow_quantity=false   (2 add-ons)
-- ============================================================

-- ── 1. Pricing lookup table ────────────────────────────────────

create table italian_pricing (
  type_name  text    not null,
  sauce_name text    not null,
  price      integer not null check (price >= 0),
  primary key (type_name, sauce_name)
);

alter table italian_pricing enable row level security;

create policy "anon: read italian_pricing"
  on italian_pricing for select to anon using (true);

-- ── 2. Cleanup ─────────────────────────────────────────────────

-- Remove junction rows for all האיטלקיה + פסטות products.
-- Explicit for safety; the cascade on products would also handle
-- the pasta links, but being explicit avoids order-of-ops surprises.
delete from product_modifier_groups
where product_id in (
  select id from products
  where  category_id in (
    '7cf5119d-519f-4496-bffe-4f73858a414e',   -- האיטלקיה
    '4d045ddd-6523-47a8-9a20-11b4fce9cf3c'    -- פסטות
  )
);

-- Delete old "תוספות פסטה" group from migration 0005.
-- Cascades to delete its 2 modifier_options rows.
delete from modifier_groups
where id = 'e2fcec65-6f6e-42f1-91ab-463116099d1e';

-- Delete the 9 old products.
delete from products
where category_id in (
  '7cf5119d-519f-4496-bffe-4f73858a414e',
  '4d045ddd-6523-47a8-9a20-11b4fce9cf3c'
);

-- Delete the now-empty "פסטות" category.
delete from categories
where id = '4d045ddd-6523-47a8-9a20-11b4fce9cf3c';

-- ── 3. New product + modifier groups ─────────────────────────

do $$
declare
  prod_italian  uuid;
  grp_type      uuid;
  grp_sauce     uuid;
  grp_filling   uuid;
  grp_addons    uuid;
begin

  -- Single unified product in the existing האיטלקיה category
  insert into products
    (category_id, name_he, description, base_price, available, is_featured, sort_order)
  values
    ('7cf5119d-519f-4496-bffe-4f73858a414e',
     'האיטלקיה',
     'פסטה, ניוקי ורביולי — רוטב לבחירה',
     30,
     true,
     false,
     1)
  returning id into prod_italian;

  -- ── Group 1: סוג (pasta / dough type) ──────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('סוג', 'single', true, false)
  returning id into grp_type;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_type, 'ספגטי',       0, 1, false, null),
    (grp_type, 'פטוצ''יני',   0, 2, false, null),
    (grp_type, 'פנה',         0, 3, false, null),
    (grp_type, 'ניוקי',       0, 4, false, null),
    (grp_type, 'תפוח אדמה',  0, 5, false, null),
    (grp_type, 'רביולי',      0, 6, false, null);

  -- ── Group 2: רוטב (sauce) ──────────────────────────────────
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('רוטב', 'single', true, false)
  returning id into grp_sauce;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_sauce, 'רוטב עגבניות',       0, 1, false, null),
    (grp_sauce, 'אלפרדו שמנת פטריות', 0, 2, false, null),
    (grp_sauce, 'רוזה מיקס',          0, 3, false, null);

  -- ── Group 3: מילוי רביולי (filling — UI shows only when type=רביולי)
  -- required=false here; the ItalianCustomizer enforces it conditionally.
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('מילוי רביולי', 'single', false, false)
  returning id into grp_filling;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_filling, 'תרד',      0, 1, false, null),
    (grp_filling, 'ארטישוק',  0, 2, false, null),
    (grp_filling, 'ריקוטה',   0, 3, false, null),
    (grp_filling, 'פרמזן',    0, 4, false, null),
    (grp_filling, 'גבינות',   0, 5, false, null),
    (grp_filling, 'בטטה',     0, 6, false, null),
    (grp_filling, 'פטריות',   0, 7, false, null);

  -- ── Group 4: תוספות פסטה (multi-select checkboxes, NOT steppers)
  -- allow_quantity=false distinguishes this from sambusak-style steppers.
  insert into modifier_groups (name_he, selection_type, required, allow_quantity)
  values ('תוספות פסטה', 'multi', false, false)
  returning id into grp_addons;

  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_addons, 'הקרמת מוצרלה', 6, 1, false, null),
    (grp_addons, 'פרמז''ן',       4, 2, false, null);

  -- Link all 4 groups to the product
  insert into product_modifier_groups (product_id, group_id)
  values
    (prod_italian, grp_type),
    (prod_italian, grp_sauce),
    (prod_italian, grp_filling),
    (prod_italian, grp_addons);

end $$;

-- ── 4. Pricing data ────────────────────────────────────────────
-- type_name / sauce_name must match modifier_options.name_he exactly
-- so the app can look up SELECT price FROM italian_pricing
-- WHERE type_name = $selectedType AND sauce_name = $selectedSauce.
-- תפוח אדמה has exactly 1 row → the sauce selector automatically
-- shows only אלפרדו שמנת פטריות when that type is chosen.

insert into italian_pricing (type_name, sauce_name, price) values
  -- ספגטי
  ('ספגטי',      'רוטב עגבניות',       30),
  ('ספגטי',      'אלפרדו שמנת פטריות', 40),
  ('ספגטי',      'רוזה מיקס',          40),
  -- פטוצ'יני
  ('פטוצ''יני',  'רוטב עגבניות',       30),
  ('פטוצ''יני',  'אלפרדו שמנת פטריות', 40),
  ('פטוצ''יני',  'רוזה מיקס',          40),
  -- פנה
  ('פנה',        'רוטב עגבניות',       30),
  ('פנה',        'אלפרדו שמנת פטריות', 40),
  ('פנה',        'רוזה מיקס',          40),
  -- ניוקי
  ('ניוקי',      'רוטב עגבניות',       35),
  ('ניוקי',      'אלפרדו שמנת פטריות', 35),
  ('ניוקי',      'רוזה מיקס',          35),
  -- תפוח אדמה — alfredo only; 1 row forces the UI to a single sauce choice
  ('תפוח אדמה', 'אלפרדו שמנת פטריות', 35),
  -- רביולי
  ('רביולי',     'רוטב עגבניות',       45),
  ('רביולי',     'אלפרדו שמנת פטריות', 45),
  ('רביולי',     'רוזה מיקס',          45);
