-- ============================================================
-- Kleva Client Hub — Migración inicial
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

-- Nota: el cliente NO tiene status. El status vive a nivel sub cuenta
-- (sub_account_status) y es el agrupador más alto de la lista. A nivel
-- agente hay dos flags independientes: is_live e is_active.

CREATE TYPE sub_account_status AS ENUM (
  'onboarding',
  'adoption',
  'success',
  'renewal',
  'churn_risk',
  'churned'
);

CREATE TYPE tipo_de_mora AS ENUM (
  'B0', 'B1', 'B2', 'B3', 'B4', 'Judicial'
);

CREATE TYPE agent_stage AS ENUM (
  'backlog',
  'nuevo',
  'en_construccion',
  'entregado_qa',
  'iterando_qa',
  'listo_para_mostrar',
  'en_produccion',
  'iterando_cliente'
);

CREATE TYPE document_kind AS ENUM (
  'link',
  'file'
);

-- ── Tablas ───────────────────────────────────────────────────

CREATE TABLE team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sub_accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         text NOT NULL,
  tier         int NOT NULL CHECK (tier BETWEEN 1 AND 4),
  status       sub_account_status NOT NULL DEFAULT 'onboarding',
  vendedor_id  uuid REFERENCES team_members(id),  -- vendedor que vendió la sub cuenta
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE countries (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name  text NOT NULL UNIQUE
);

CREATE TABLE agents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id   uuid NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  tipo_de_mora     tipo_de_mora NOT NULL,
  country_id       uuid NOT NULL REFERENCES countries(id),
  current_stage    agent_stage NOT NULL DEFAULT 'backlog',
  onb_id           uuid REFERENCES team_members(id),
  cs_id            uuid REFERENCES team_members(id),
  ie_id            uuid REFERENCES team_members(id),
  is_live          boolean NOT NULL DEFAULT false,  -- agente en vivo (manual, independiente del stage)
  is_active        boolean NOT NULL DEFAULT true,   -- vigente (true) vs dado de baja (false)
  linear_url       text,
  notion_url       text,
  figma_url        text,
  qa_form_url      text,
  manual_url       text,
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agent_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  kind        document_kind NOT NULL,
  label       text NOT NULL,
  url         text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agent_stage_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  from_stage   agent_stage,
  to_stage     agent_stage NOT NULL,
  changed_at   timestamptz NOT NULL DEFAULT now(),
  changed_by   uuid REFERENCES team_members(id)
);

-- ── Índices ──────────────────────────────────────────────────

CREATE INDEX idx_sub_accounts_client_id    ON sub_accounts(client_id);
CREATE INDEX idx_sub_accounts_vendedor_id  ON sub_accounts(vendedor_id);
CREATE INDEX idx_agents_sub_account_id     ON agents(sub_account_id);
CREATE INDEX idx_agents_country_id         ON agents(country_id);
CREATE INDEX idx_agents_onb_id             ON agents(onb_id);
CREATE INDEX idx_agents_cs_id              ON agents(cs_id);
CREATE INDEX idx_agents_ie_id              ON agents(ie_id);
CREATE INDEX idx_agent_documents_agent_id  ON agent_documents(agent_id);
CREATE INDEX idx_agent_stage_logs_agent_id ON agent_stage_logs(agent_id);
CREATE INDEX idx_agent_stage_logs_changed_at ON agent_stage_logs(changed_at);

-- ── Trigger: log automático al cambiar current_stage ─────────

CREATE OR REPLACE FUNCTION fn_log_agent_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Solo disparar si current_stage cambió
  IF (TG_OP = 'INSERT') OR (OLD.current_stage IS DISTINCT FROM NEW.current_stage) THEN
    INSERT INTO agent_stage_logs (agent_id, from_stage, to_stage, changed_at)
    VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.current_stage END,
      NEW.current_stage,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_agent_stage_change
AFTER INSERT OR UPDATE OF current_stage ON agents
FOR EACH ROW EXECUTE FUNCTION fn_log_agent_stage_change();

-- ── Configuración de Supabase Storage ────────────────────────
-- Crear el bucket 'agent-documents' (público para lectura, autenticado para escritura)
-- Ejecutar esto en el Dashboard de Supabase > Storage, o via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agent-documents', 'agent-documents', true);
