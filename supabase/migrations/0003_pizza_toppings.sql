-- ============================================================
-- Migration : 0003_pizza_toppings
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-13
--
-- Run AFTER 0002_seed_menu.sql.
--
-- What this migration does:
--   1. Adds is_special BOOLEAN to modifier_options so each
--      topping row knows whether it is regular or special-tier.
--   2. Creates topping_pricing — a 16-row lookup table that
--      maps (tier, size_label, is_half) → price (whole shekels).
--      This is the single source of truth for topping costs.
--   3. Fixes the existing "גודל" modifier_options: their
--      price_delta values were wrongly carrying the per-topping
--      surcharge (4/8/10/12). Set them all to 0 — the size
--      price is already the product base_price.
--   4. Creates a "תוספות" modifier_group (multi, optional) with
--      16 regular toppings and 2 special toppings.
--   5. Links the toppings group to all 4 pizza products.
--
-- Pricing model:
--   Regular topping, whole pizza:  S=4  M=8  L=10  XL=12
--   Regular topping, half pizza:   S=4  M=8  L=5   XL=6
--   Special topping, whole pizza:  S=8  M=16 L=20  XL=24
--   Special topping, half pizza:   S=8  M=16 L=10  XL=12
--   (S and M: half == whole;  L and XL: half == 50%)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Add is_special column to modifier_options
--    Existing rows default to false (no backfill needed).
-- ────────────────────────────────────────────────────────────
alter table modifier_options
  add column if not exists is_special boolean not null default false;


-- ────────────────────────────────────────────────────────────
-- 2. Topping pricing lookup table
--    (tier, size_label, is_half) is the composite PK — each
--    combination is unique and maps to exactly one price.
-- ────────────────────────────────────────────────────────────
create table topping_pricing (
  tier        text    not null check (tier in ('regular', 'special')),
  size_label  text    not null check (size_label in ('S', 'M', 'L', 'XL')),
  is_half     boolean not null,
  price       integer not null check (price >= 0),   -- whole shekels
  primary key (tier, size_label, is_half)
);

alter table topping_pricing enable row level security;

create policy "anon: read topping_pricing"
  on topping_pricing
  for select
  to anon
  using (true);

insert into topping_pricing (tier, size_label, is_half, price) values
  -- regular, whole
  ('regular', 'S',  false,  4),
  ('regular', 'M',  false,  8),
  ('regular', 'L',  false, 10),
  ('regular', 'XL', false, 12),
  -- regular, half  (S+M same as whole; L+XL at 50%)
  ('regular', 'S',  true,   4),
  ('regular', 'M',  true,   8),
  ('regular', 'L',  true,   5),
  ('regular', 'XL', true,   6),
  -- special, whole
  ('special', 'S',  false,  8),
  ('special', 'M',  false, 16),
  ('special', 'L',  false, 20),
  ('special', 'XL', false, 24),
  -- special, half  (S+M same as whole; L+XL at 50%)
  ('special', 'S',  true,   8),
  ('special', 'M',  true,  16),
  ('special', 'L',  true,  10),
  ('special', 'XL', true,  12);


-- ────────────────────────────────────────────────────────────
-- 3. Fix size modifier_options price_delta
--    The seed wrongly stored per-topping surcharges here.
--    Zero them out — size price = product base_price.
--    The option name_he ('S'/'M'/'L'/'XL') remains and is used
--    as the size_label key when looking up topping_pricing.
-- ────────────────────────────────────────────────────────────
update modifier_options
set    price_delta = 0
where  group_id = (
  select id from modifier_groups where name_he = 'גודל'
);


-- ────────────────────────────────────────────────────────────
-- 4. Toppings modifier group + options
--    price_delta = 0 for every topping because the actual
--    charge is resolved at runtime via topping_pricing.
--    is_special = false → regular tier
--    is_special = true  → special tier (2× price)
-- ────────────────────────────────────────────────────────────
do $$
declare
  grp_toppings uuid;
  prod_s       uuid;
  prod_m       uuid;
  prod_l       uuid;
  prod_xl      uuid;
begin

  insert into modifier_groups (name_he, selection_type, required)
  values ('תוספות', 'multi', false)
  returning id into grp_toppings;

  -- Regular toppings (16)
  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special)
  values
    (grp_toppings, 'זיתים ירוקים',    0,  1, false),
    (grp_toppings, 'זיתים שחורים',    0,  2, false),
    (grp_toppings, 'בצל',             0,  3, false),
    (grp_toppings, 'פלפל אדום',       0,  4, false),
    (grp_toppings, 'גבינה בולגרית',   0,  5, false),
    (grp_toppings, 'טונה',            0,  6, false),
    (grp_toppings, 'ביצה',            0,  7, false),
    (grp_toppings, 'חצילים',          0,  8, false),
    (grp_toppings, 'פטריות טריות',    0,  9, false),
    (grp_toppings, 'פטריות שימורים',  0, 10, false),
    (grp_toppings, 'תירס',            0, 11, false),
    (grp_toppings, 'אננס',            0, 12, false),
    (grp_toppings, 'גבינה כפולה',     0, 13, false),
    (grp_toppings, 'עגבניות',         0, 14, false),
    (grp_toppings, 'שיפקה',           0, 15, false),
    (grp_toppings, 'פלפל ירוק חריף',  0, 16, false);

  -- Special toppings (2)
  insert into modifier_options
    (group_id, name_he, price_delta, sort_order, is_special)
  values
    (grp_toppings, 'גבינת עזים', 0, 17, true),
    (grp_toppings, 'אנשובי',     0, 18, true);

  -- Resolve pizza product IDs by name
  select id into prod_s  from products where name_he = 'מגש אישי S';
  select id into prod_m  from products where name_he = 'מגש זוגי M';
  select id into prod_l  from products where name_he = 'מגש משפחתי L';
  select id into prod_xl from products where name_he = 'מגש ענק XL';

  -- Link toppings group to all 4 pizza products
  insert into product_modifier_groups (product_id, group_id) values
    (prod_s,  grp_toppings),
    (prod_m,  grp_toppings),
    (prod_l,  grp_toppings),
    (prod_xl, grp_toppings);

end $$;
