-- Phone is now mandatory on the lead form, paired with a country select so we
-- capture which region the lead is actually in — not just a number. Required
-- at the application layer (leadSchema), same as patent_type in 0012: rows
-- written before this migration may have neither, so the column stays
-- nullable here rather than risk a NOT NULL failing against existing data.

alter table leads add column country text;
