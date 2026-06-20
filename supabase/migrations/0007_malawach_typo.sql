-- ============================================================
-- Migration : 0007_malawach_typo
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Fix: products.name_he "מלאווח תחינה" → "מלאווח טחינה"
-- The ת was wrong; the correct letter is ט (as already used
-- correctly in the same row's description field).
-- Targets the row by its stable UUID to avoid ambiguity.
-- ============================================================

update products
set    name_he = 'מלאווח טחינה'
where  id = '7c0320ec-2c75-4bec-bb89-f10496be99c3';
