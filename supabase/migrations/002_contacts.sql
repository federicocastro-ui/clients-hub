-- ============================================================
-- Kleva Client Hub — Contactos
-- ============================================================
-- Un contacto pertenece a UNA organización (clients) y opcionalmente
-- se vincula a varios de sus clientes (sub_accounts) vía tabla puente.

CREATE TABLE contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text,
  phone       text,
  role        text,        -- cargo / puesto
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_sub_accounts (
  contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sub_account_id  uuid NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, sub_account_id)
);

CREATE INDEX idx_contacts_client_id                ON contacts(client_id);
CREATE INDEX idx_contact_sub_accounts_contact_id   ON contact_sub_accounts(contact_id);
CREATE INDEX idx_contact_sub_accounts_sub_acc_id   ON contact_sub_accounts(sub_account_id);
