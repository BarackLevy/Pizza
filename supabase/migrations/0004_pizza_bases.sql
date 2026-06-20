-- ============================================================
-- Migration : 0004_pizza_bases
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0003_pizza_toppings.sql.
--
-- What this migration does:
--   1. Adds image_url TEXT (nullable) to modifier_options so
--      base choices can carry a per-base image in the future.
--   2. Creates base_pricing — a lookup table that maps
--      (base_name, size_label) → price (whole shekels).
--      Only valid base+size combos have rows, so querying
--      base_pricing for a given base returns exactly the sizes
--      that are available for that base.
--   3. Inserts 10 rows covering all valid combos:
--        רגילה    → S / M / L / XL  (4 rows)
--        אלפרדו   → S / M            (2 rows)
--        רוזה מיקס → S / M            (2 rows)
--        לחם שום  → S / M            (2 rows)
--   4. Creates a "בסיס" modifier_group (single, required) with
--      4 options: רגילה, אלפרדו, רוזה מיקס, לחם שום.
--      price_delta = 0 on every option — price is resolved at
--      runtime from base_pricing, not from price_delta.
--   5. Links the "בסיס" group to all 4 pizza products.
--
-- Pricing model for pizzas:
--   total = base_pricing[base_name][size_label]
--         + SUM(topping_pricing[tier][size_label][is_half])
--            for each selected topping
--
-- How the app should use base_pricing:
--   Step 1 — determine available sizes for the chosen base:
--     SELECT size_label
--     FROM   base_pricing
--     WHERE  base_name = :selectedBase
--     ORDER  BY CASE size_label
--                 WHEN 'S'  THEN 1
--                 WHEN 'M'  THEN 2
--                 WHEN 'L'  THEN 3
--                 WHEN 'XL' THEN 4
--               END;
--     Render only those size buttons as selectable. If the user
--     has already picked a size that is absent from the new base,
--     reset the size selection.
--
--   Step 2 — compute the pizza price:
--     SELECT price
--     FROM   base_pricing
--     WHERE  base_name  = :selectedBase
--       AND  size_label = :selectedSize;
--     This replaces products.base_price for pizza items — ignore
--     base_price on the four pizza product rows going forward.
--     Add per-topping charges on top using topping_pricing as
--     established in migration 0003.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Add image_url to modifier_options
--    Nullable so existing rows (size, toppings) are unaffected.
-- ────────────────────────────────────────────────────────────
alter table modifier_options
  add column if not exists image_url text;


-- ────────────────────────────────────────────────────────────
-- 2. Base pricing lookup table
--    (base_name, size_label) is the composite PK — each combo
--    is unique and maps to exactly one price.
--    Only valid combos exist as rows; the absence of a row
--    means that size is not offered for that base.
-- ────────────────────────────────────────────────────────────
create table base_pricing (
  base_name   text    not null,
  size_label  text    not null check (size_label in ('S', 'M', 'L', 'XL')),
  price       integer not null check (price >= 0),   -- whole shekels
  primary key (base_name, size_label)
);

alter table base_pricing enable row level security;

create policy "anon: read base_pricing"
  on base_pricing
  for select
  to anon
  using (true);


-- ────────────────────────────────────────────────────────────
-- 3. Seed base_pricing rows
-- ────────────────────────────────────────────────────────────
insert into base_pricing (base_name, size_label, price) values
  -- רגילה (regular / tomato sauce) — all four sizes
  ('רגילה',     'S',  25),
  ('רגילה',     'M',  35),
  ('רגילה',     'L',  45),
  ('רגילה',     'XL', 55),
  -- אלפרדו (alfredo / cream & mushroom) — S and M only
  ('אלפרדו',    'S',  30),
  ('אלפרדו',    'M',  45),
  -- רוזה מיקס (rosa) — S and M only
  ('רוזה מיקס', 'S',  30),
  ('רוזה מיקס', 'M',  45),
  -- לחם שום (garlic bread) — S and M only
  ('לחם שום',   'S',  25),
  ('לחם שום',   'M',  35);


-- ────────────────────────────────────────────────────────────
-- 4. "בסיס" modifier group + options
-- 5. Link to all 4 pizza products
-- ────────────────────────────────────────────────────────────
do $$
declare
  grp_base uuid;
  prod_s   uuid;
  prod_m   uuid;
  prod_l   uuid;
  prod_xl  uuid;
begin

  insert into modifier_groups (name_he, selection_type, required)
  values ('בסיס', 'single', true)
  returning id into grp_base;

  -- 4 base options in display order.
  -- price_delta = 0 on all: runtime price comes from base_pricing.
  -- image_url = null: populated later via the admin UI or a future migration.
  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special, image_url)
  values
    (grp_base, 'רגילה',     0, 1, false, null),
    (grp_base, 'אלפרדו',    0, 2, false, null),
    (grp_base, 'רוזה מיקס', 0, 3, false, null),
    (grp_base, 'לחם שום',   0, 4, false, null);

  -- Resolve pizza product IDs by name (set in 0002_seed_menu.sql)
  select id into prod_s  from products where name_he = 'מגש אישי S';
  select id into prod_m  from products where name_he = 'מגש זוגי M';
  select id into prod_l  from products where name_he = 'מגש משפחתי L';
  select id into prod_xl from products where name_he = 'מגש ענק XL';

  -- Link "בסיס" group to all 4 pizza products
  insert into product_modifier_groups (product_id, group_id) values
    (prod_s,  grp_base),
    (prod_m,  grp_base),
    (prod_l,  grp_base),
    (prod_xl, grp_base);

end $$;
