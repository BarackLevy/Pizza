-- ============================================================
-- Migration : 0002_seed_menu
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-13
--
-- Seeds the full menu as it exists in app/menu/page.tsx.
-- Run AFTER 0001_initial_schema.sql.
--
-- All prices are whole shekels (INTEGER).
-- No UUIDs are hardcoded — FKs are resolved by name using
-- DECLARE variables inside a DO block so inserts are safe to
-- re-run in a clean database without UUID collisions.
-- ============================================================

DO $$
DECLARE
  -- ── Category IDs ──────────────────────────────────────────
  cat_pizza    uuid;
  cat_ziva     uuid;
  cat_italiana uuid;
  cat_pasta    uuid;
  cat_malawach uuid;
  cat_salads   uuid;
  cat_desserts uuid;
  cat_bread    uuid;

  -- ── Pizza product IDs (needed to wire the modifier group) ─
  prod_s  uuid;
  prod_m  uuid;
  prod_l  uuid;
  prod_xl uuid;

  -- ── Modifier group ID ─────────────────────────────────────
  grp_size uuid;

BEGIN

  -- ────────────────────────────────────────────────────────
  -- 1. CATEGORIES
  --    Inserted in the order they appear in the menu object.
  -- ────────────────────────────────────────────────────────
  INSERT INTO categories (name_he, sort_order) VALUES ('פיצות',       1) RETURNING id INTO cat_pizza;
  INSERT INTO categories (name_he, sort_order) VALUES ('זיווה',        2) RETURNING id INTO cat_ziva;
  INSERT INTO categories (name_he, sort_order) VALUES ('האיטלקיה',    3) RETURNING id INTO cat_italiana;
  INSERT INTO categories (name_he, sort_order) VALUES ('פסטות',       4) RETURNING id INTO cat_pasta;
  INSERT INTO categories (name_he, sort_order) VALUES ('מלאווח',      5) RETURNING id INTO cat_malawach;
  INSERT INTO categories (name_he, sort_order) VALUES ('סלטים',       6) RETURNING id INTO cat_salads;
  INSERT INTO categories (name_he, sort_order) VALUES ('קינוחים',     7) RETURNING id INTO cat_desserts;
  INSERT INTO categories (name_he, sort_order) VALUES ('לחם ומסבוסה', 8) RETURNING id INTO cat_bread;


  -- ────────────────────────────────────────────────────────
  -- 2. PRODUCTS — פיצות
  --    Four separate inserts so each UUID can be captured
  --    for the modifier group junction below.
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_pizza, 'מגש אישי S', 'מושלם לאחד', 25, '/images/פיצה S.png', true, false, 1)
  RETURNING id INTO prod_s;

  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_pizza, 'מגש זוגי M', 'לשניים', 35, '/images/פיצה.png', true, false, 2)
  RETURNING id INTO prod_m;

  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_pizza, 'מגש משפחתי L', 'לכל המשפחה', 45, '/images/פיצה עם תוספות.png', true, false, 3)
  RETURNING id INTO prod_l;

  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_pizza, 'מגש ענק XL', 'לרעבים האמיתיים', 55, '/images/פיצה אלפרדו.png', true, false, 4)
  RETURNING id INTO prod_xl;


  -- ────────────────────────────────────────────────────────
  -- 3. PRODUCTS — זיווה
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_ziva, 'זיווה רגילה',   'גבינת מוצרלה',                        42, '/images/זיווה.png',              true, false, 1),
    (cat_ziva, 'זיווה זיתים',   'מוצרלה וזיתים',                       42, '/images/זיווה.png',              true, false, 2),
    (cat_ziva, 'זיווה פטריות',  'מוצרלה ופטריות',                      42, '/images/זיווה.png',              true, false, 3),
    (cat_ziva, 'זיווה מעורבת',  'מוצרלה ובולגרית',                     42, '/images/זיווה.png',              true, false, 4),
    (cat_ziva, 'זיווה יוונית',  'בולגרית, זיתים שחורים ובצל',          42, '/images/זיווה עם ג''חנון.png',  true, false, 5);


  -- ────────────────────────────────────────────────────────
  -- 4. PRODUCTS — האיטלקיה
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_italiana, 'רביולי תרד',     'ריקוטה ותרד',                      45, '/images/מוקרם.png', true, false, 1),
    (cat_italiana, 'רביולי ארטישוק', 'ארטישוק וגבינה',                   45, '/images/מוקרם.png', true, false, 2),
    (cat_italiana, 'רביולי ריקוטה',  'גבינת ריקוטה',                     45, '/images/מוקרם.png', true, false, 3),
    (cat_italiana, 'רביולי גבינות',  '4 גבינות ברוטב אלפרדו',            45, '/images/מוקרם.png', true, false, 4),
    (cat_italiana, 'רביולי בטטה',    'גבינה ובטטה ברוטב אלפרדו',         45, '/images/מוקרם.png', true, false, 5),
    (cat_italiana, 'רביולי פטריות',  'פטריות וגבינה ברוטב אלפרדו',       45, '/images/מוקרם.png', true, false, 6);


  -- ────────────────────────────────────────────────────────
  -- 5. PRODUCTS — פסטות
  --    The "/" in some names is part of the original menu text
  --    (multiple pasta shapes offered at one price).
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_pasta, 'פטוצ''יני / ספגטי / פנה',       'ברוטב עגבניות',                 30, '/images/מוקרם.png', true, false, 1),
    (cat_pasta, 'רוטב שמנת פטריות / רוזה מיקס',  'מומלץ!',                        40, '/images/מוקרם.png', true, false, 2),
    (cat_pasta, 'ניוקי מעורב',                    'תפוח אדמה, תרד ובטטה',          35, '/images/מוקרם.png', true, false, 3);


  -- ────────────────────────────────────────────────────────
  -- 6. PRODUCTS — מלאווח
  --    "⭐ מלאווח פיצה" in the source code: star stripped from
  --    name_he, is_featured=true flags it as the hero item.
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_malawach, 'מלאווח רגיל',   'עגבניות מגורדות וביצה',             25, '/images/מלאווח מגולגל.png', true, false, 1),
    (cat_malawach, 'מלאווח תחינה',  'טחינה, עגבניות וביצה',              25, '/images/מלאווח מגולגל.png', true, false, 2),
    (cat_malawach, 'מלאווח סוניסאי','ביצה, זיתים, טונה ועגבניות',        30, '/images/מלאווח מגולגל.png', true, false, 3),
    (cat_malawach, 'מלאווח יווני',  'ביצה, בולגרית, זיתים שחורים',       30, '/images/מלאווח מגולגל.png', true, false, 4),
    (cat_malawach, 'מלאווח הבית',   'ביצה, בולגרית, טונה, פטריות',       30, '/images/מלאווח מגולגל.png', true, false, 5),
    (cat_malawach, 'מלאווח פיצה',   'תוספת אחת חינם',                    35, '/images/מלאווח פתוח.png',  true, true,  6),
    (cat_malawach, 'מלאווח פתוח',   'רסק, ביצה ואריסה',                  30, '/images/מלאווח פתוח.png',  true, false, 7),
    (cat_malawach, 'ג''חנון',       'עגבניות מגורדות, ביצה וחריף',       25, '/images/זיווה עם ג''חנון.png', true, false, 8);


  -- ────────────────────────────────────────────────────────
  -- 7. PRODUCTS — סלטים
  --    Small (40 ₪) and large (50 ₪) are separate products,
  --    matching how they appear in the current menu.
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_salads, 'סלט יווני קטן',   'חסה, מלפפון, עגבניה, זיתים, תירס, בולגרית',        40, '/images/סלט יווני עם בייגל הבית.png', true, false, 1),
    (cat_salads, 'סלט יווני גדול',  'חסה, מלפפון, עגבניה, זיתים, תירס, בולגרית',        50, '/images/סלט יווני עם בייגל הבית.png', true, false, 2),
    (cat_salads, 'סלט טונה קטן',    'חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה',    40, '/images/סלט טונה עם בייגל הבית.png',  true, false, 3),
    (cat_salads, 'סלט טונה גדול',   'חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה',    50, '/images/סלט טונה עם בייגל הבית.png',  true, false, 4),
    (cat_salads, 'סלט ירקות קטן',   'חסה, מלפפון, עגבניה ובצל',                          40, '/images/סלט עם בייגל הבית.png',        true, false, 5),
    (cat_salads, 'סלט ירקות גדול',  'חסה, מלפפון, עגבניה ובצל',                          50, '/images/סלט עם בייגל הבית.png',        true, false, 6);


  -- ────────────────────────────────────────────────────────
  -- 8. PRODUCTS — קינוחים
  --    Several items have no description or image in the
  --    original code; those columns are left NULL.
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_desserts, 'מאפה זיווה',          'נוטלה / שוקולד השחר',            35, '/images/זיווה.png',     true, false, 1),
    (cat_desserts, 'בלינצ''ס',            '2 יח׳, גבינה / שוקולד / נוטלה', 20, '/images/בלינצ''ס.png', true, false, 2),
    (cat_desserts, 'סופלה שוקולד חם',    'טרי מהתנור',                     25, '/images/בלינצ''ס.png', true, false, 3),
    (cat_desserts, 'מלבי',                'קינוח חלבי קלאסי',               12, null,                    true, false, 4),
    (cat_desserts, 'עוגת גבינה פרורים',  null,                              12, null,                    true, false, 5),
    (cat_desserts, 'פנקוטה',              null,                              12, null,                    true, false, 6),
    (cat_desserts, 'סברינה',              null,                              15, null,                    true, false, 7),
    (cat_desserts, 'מוס שוקולד',          null,                              12, null,                    true, false, 8);


  -- ────────────────────────────────────────────────────────
  -- 9. PRODUCTS — לחם ומסבוסה
  -- ────────────────────────────────────────────────────────
  INSERT INTO products
    (category_id, name_he, description, base_price, image_url, available, is_featured, sort_order)
  VALUES
    (cat_bread, 'לחם שום S', 'עם מיקס גבינות',                                                 25, '/images/טוסט הבית.png',    true, false, 1),
    (cat_bread, 'לחם שום M', 'עם מיקס גבינות',                                                 35, '/images/טוסט הבית.png',    true, false, 2),
    (cat_bread, 'מסבוסה',    'תפו״א ביצה וגבינה / רוטב פיצה / ארבע גבינות / אלפרדו',          32, '/images/טוסט מגולגל.png', true, false, 3);


  -- ────────────────────────────────────────────────────────
  -- 10. MODIFIER GROUP — גודל (pizza topping surcharge)
  --
  --     The original menu encodes an "extra" topping surcharge
  --     on each pizza size (S +4 ₪, M +8 ₪, L +10 ₪, XL +12 ₪).
  --     This is modelled as a single required 'single'-select
  --     modifier group named גודל, with one option per size
  --     carrying the topping price_delta for that size.
  --
  --     All four pizza products link to this group so the UI
  --     can display the relevant topping surcharge when the
  --     customer adds a pizza to the cart.
  -- ────────────────────────────────────────────────────────
  INSERT INTO modifier_groups (name_he, selection_type, required)
  VALUES ('גודל', 'single', true)
  RETURNING id INTO grp_size;

  INSERT INTO modifier_options (group_id, name_he, price_delta, sort_order)
  VALUES
    (grp_size, 'S',   4,  1),
    (grp_size, 'M',   8,  2),
    (grp_size, 'L',  10,  3),
    (grp_size, 'XL', 12,  4);

  -- ────────────────────────────────────────────────────────
  -- 11. JUNCTION — link each pizza product to גודל group
  -- ────────────────────────────────────────────────────────
  INSERT INTO product_modifier_groups (product_id, group_id)
  VALUES
    (prod_s,  grp_size),
    (prod_m,  grp_size),
    (prod_l,  grp_size),
    (prod_xl, grp_size);

END $$;
