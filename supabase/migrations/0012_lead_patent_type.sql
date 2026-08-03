-- The lead form's qualifier is now "what kind of patent are you after?", which
-- is what the sales conversation actually opens on. Category (industry) moves
-- off the form to keep it short, so the column has to stop being required —
-- rows written before this migration keep the category they were captured with.

create type patent_type as enum
  ('Utility patent', 'Design patent', 'Provisional application', 'Plant patent', 'Not sure yet');

alter table leads add column patent_type patent_type;
alter table leads alter column industry drop not null;
