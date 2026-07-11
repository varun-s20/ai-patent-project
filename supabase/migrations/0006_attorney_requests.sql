-- Records the customer's answer to "Would you like us to recommend a patent
-- attorney?" on the status page. Null = never asked/answered; a timestamp is
-- both the flag and the audit trail. Referrals are handled manually by the
-- admin for now, so no attorney directory tables.
alter table submissions add column attorney_requested_at timestamptz;
