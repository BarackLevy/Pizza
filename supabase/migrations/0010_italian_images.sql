-- ============================================================
-- Migration : 0010_italian_images
-- Project   : קייטרינג פיצה אילת
-- Created   : 2026-06-20
--
-- Run AFTER 0009_italian_menu.sql.
--
-- Sets image_url on the 6 "סוג" modifier options so the
-- ItalianBuilder can display a per-type hero image.
-- Each UPDATE is scoped to the "סוג" group by subquery so
-- no other option with a clashing name_he is affected.
-- ============================================================

update modifier_options
set    image_url = '/italian/spaghetti.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'ספגטי';

update modifier_options
set    image_url = '/italian/fettuccine.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'פטוצ''יני';

update modifier_options
set    image_url = '/italian/penne.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'פנה';

update modifier_options
set    image_url = '/italian/gnocchi.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'ניוקי';

update modifier_options
set    image_url = '/italian/potato.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'תפוח אדמה';

update modifier_options
set    image_url = '/italian/ravioli.png'
where  group_id = (select id from modifier_groups where name_he = 'סוג')
  and  name_he  = 'רביולי';
