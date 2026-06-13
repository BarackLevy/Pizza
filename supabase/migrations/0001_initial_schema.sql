-- ============================================================
-- Migration : 0001_initial_schema
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-13
--
-- All monetary values are stored as INTEGER (whole shekels).
--   52  →  52 ₪
--   42  →  42 ₪
--   25  →  25 ₪
-- No conversion needed — store and display the value as-is.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. CATEGORIES
--    Top-level menu groupings (פיצות, זיווה, מלאווח, …).
--    sort_order controls display sequence.
-- ────────────────────────────────────────────────────────────
create table categories (
  id          uuid        primary key default gen_random_uuid(),
  name_he     text        not null,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 2. PRODUCTS
--    Individual menu items that belong to one category.
--    base_price is the price before any modifier_options are
--    applied. image_url points to a Supabase Storage path or
--    a relative /images/ path from the existing public folder.
-- ────────────────────────────────────────────────────────────
create table products (
  id           uuid        primary key default gen_random_uuid(),
  category_id  uuid        not null references categories (id) on delete cascade,
  name_he      text        not null,
  description  text,
  base_price   int         not null,          -- ₪
  image_url    text,
  available    bool        not null default true,
  is_featured  bool        not null default false,
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 3. MODIFIER GROUPS
--    Named groups of choices that can be attached to products.
--    Examples:
--      "גודל פיצה"   selection_type='single'  required=true
--      "תוספות"      selection_type='multi'   required=false
--    selection_type must be 'single' (radio) or 'multi' (checkbox).
-- ────────────────────────────────────────────────────────────
create table modifier_groups (
  id             uuid        primary key default gen_random_uuid(),
  name_he        text        not null,
  selection_type text        not null check (selection_type in ('single', 'multi')),
  required       bool        not null default false,
  created_at     timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 4. MODIFIER OPTIONS
--    Individual choices inside a modifier group.
--    price_delta is added to the product base_price.
--    It may be 0 (no charge), positive (surcharge), or
--    negative (discount). Stored in whole shekels.
--    Example: תוספת פיצה S → price_delta = 4 (+4 ₪)
-- ────────────────────────────────────────────────────────────
create table modifier_options (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references modifier_groups (id) on delete cascade,
  name_he      text not null,
  price_delta  int  not null default 0,       -- ₪; can be 0 or negative
  sort_order   int  not null default 0
);


-- ────────────────────────────────────────────────────────────
-- 5. PRODUCT ↔ MODIFIER GROUPS  (junction)
--    Declares which modifier groups apply to which product.
--    A group can be reused across many products (e.g. a shared
--    "תוספות" group attached to multiple pizza sizes).
-- ────────────────────────────────────────────────────────────
create table product_modifier_groups (
  product_id  uuid not null references products        (id) on delete cascade,
  group_id    uuid not null references modifier_groups (id) on delete cascade,
  primary key (product_id, group_id)
);


-- ────────────────────────────────────────────────────────────
-- 6. ORDERS
--    One row per customer order.
--    order_type controls which fields are expected:
--      'dine_in'  → table_number (optional)
--      'pickup'   → customer_name + phone
--      'delivery' → customer_name + phone + delivery_details
--    delivery_details shape (jsonb):
--      { "address": "...", "notes": "..." }
--    total is stored in whole shekels and should be recomputed
--    from order_items before inserting (not a DB trigger yet).
--    Status flow: received → preparing → ready → delivered/completed
-- ────────────────────────────────────────────────────────────
create table orders (
  id               uuid        primary key default gen_random_uuid(),
  order_type       text        not null check (order_type in ('dine_in', 'pickup', 'delivery')),
  table_number     text,
  customer_name    text,
  phone            text,
  delivery_details jsonb,
  status           text        not null default 'received'
                               check (status in ('received', 'preparing', 'ready', 'delivered', 'completed')),
  total            int         not null default 0,   -- ₪
  created_at       timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 7. ORDER ITEMS
--    One row per product line in an order.
--    product_id is nullable so that order history survives
--    even if a product is later deleted from the catalog.
--    product_name_he and unit_price are snapshots captured at
--    order time — they never change even if the catalog does.
--
--    selected_modifiers shape (jsonb array):
--    [
--      {
--        "group_id":    "<uuid>",
--        "group_name":  "תוספות",
--        "option_id":   "<uuid>",
--        "option_name": "זיתים",
--        "price_delta": 4
--      },
--      ...
--    ]
-- ────────────────────────────────────────────────────────────
create table order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders   (id) on delete cascade,
  product_id         uuid          references products  (id),   -- nullable; see note above
  product_name_he    text,
  quantity           int  not null default 1,
  unit_price         int  not null,                             -- ₪; snapshot
  selected_modifiers jsonb,
  notes              text
);


-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
create index idx_products_category_id      on products         (category_id);
create index idx_modifier_options_group_id on modifier_options (group_id);
create index idx_order_items_order_id      on order_items      (order_id);


-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
--
-- RLS is enabled on every table. With RLS on, a table returns
-- zero rows and rejects all writes unless a policy explicitly
-- permits the operation. This is the safe default.
-- ────────────────────────────────────────────────────────────
alter table categories              enable row level security;
alter table products                enable row level security;
alter table modifier_groups         enable row level security;
alter table modifier_options        enable row level security;
alter table product_modifier_groups enable row level security;
alter table orders                  enable row level security;
alter table order_items             enable row level security;


-- ────────────────────────────────────────────────────────────
-- PUBLIC READ POLICIES  (catalog tables only)
--
-- The menu must be readable by unauthenticated visitors using
-- the anon key, so we add SELECT policies for the five catalog
-- tables. Only rows where available = true are exposed for
-- products; all other catalog rows are fully public.
--
-- INTENTIONALLY OMITTED:
--   • INSERT / UPDATE / DELETE on any table
--   • Any policy on orders or order_items
--
-- Order creation will be handled in a later migration via
-- either (a) a Postgres function called with SECURITY DEFINER,
-- or (b) a Supabase Edge Function using the service-role key —
-- never via a naked anon INSERT policy. Admin access to orders
-- requires an authenticated role with a separate policy set.
-- ────────────────────────────────────────────────────────────

create policy "anon: read categories"
  on categories
  for select
  to anon
  using (true);

create policy "anon: read available products"
  on products
  for select
  to anon
  using (available = true);

create policy "anon: read modifier_groups"
  on modifier_groups
  for select
  to anon
  using (true);

create policy "anon: read modifier_options"
  on modifier_options
  for select
  to anon
  using (true);

create policy "anon: read product_modifier_groups"
  on product_modifier_groups
  for select
  to anon
  using (true);

-- orders        → no policies (zero access until next migration)
-- order_items   → no policies (zero access until next migration)
