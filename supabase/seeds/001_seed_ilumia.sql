-- ============================================================
-- Seed inicial — Cliente Ilumia
-- ============================================================

-- País
INSERT INTO countries (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Argentina');

-- Team members de ejemplo
INSERT INTO team_members (id, name, email) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Valentina Ríos',    'valentina@kleva.co'),
  ('10000000-0000-0000-0000-000000000002', 'Martín Sosa',       'martin@kleva.co'),
  ('10000000-0000-0000-0000-000000000003', 'Lucía Mendez',      'lucia@kleva.co'),
  ('10000000-0000-0000-0000-000000000004', 'Diego Fernández',   'diego@kleva.co');

-- Cliente (sin status: el status vive a nivel sub cuenta)
INSERT INTO clients (id, name) VALUES
  ('20000000-0000-0000-0000-000000000001', 'ilumia');

-- Sub cuenta
INSERT INTO sub_accounts (id, client_id, name, tier, status) VALUES
  ('30000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Directv', 2, 'success');

-- Agentes (el trigger insertará el log inicial automáticamente)
INSERT INTO agents (
  id, sub_account_id, tipo_de_mora, country_id, current_stage,
  onb_id, cs_id, ie_id, is_live, is_active,
  linear_url, notion_url
) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'B0',
    '00000000-0000-0000-0000-000000000001',
    'en_produccion',
    '10000000-0000-0000-0000-000000000001',  -- Valentina (Onb)
    '10000000-0000-0000-0000-000000000002',  -- Martín (CS)
    '10000000-0000-0000-0000-000000000003',  -- Lucía (IE)
    true,  -- is_live
    true,  -- is_active
    'https://linear.app/kleva/issue/DEMO-1',
    'https://notion.so/kleva/demo-b0'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    'B1',
    '00000000-0000-0000-0000-000000000001',
    'iterando_qa',
    '10000000-0000-0000-0000-000000000001',  -- Valentina (Onb)
    '10000000-0000-0000-0000-000000000002',  -- Martín (CS)
    '10000000-0000-0000-0000-000000000004',  -- Diego (IE)
    false,  -- is_live
    true,   -- is_active
    'https://linear.app/kleva/issue/DEMO-2',
    'https://notion.so/kleva/demo-b1'
  );

-- Logs de etapa adicionales para el agente B0
-- (el log inicial 'backlog' ya fue insertado por el trigger al crear el agente)
-- Simulamos la progresión: backlog → nuevo → en_construccion → entregado_qa → listo_para_mostrar → en_produccion
INSERT INTO agent_stage_logs (agent_id, from_stage, to_stage, changed_at, changed_by) VALUES
  ('40000000-0000-0000-0000-000000000001', 'backlog',            'nuevo',              now() - interval '20 days', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000001', 'nuevo',              'en_construccion',    now() - interval '18 days', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000001', 'en_construccion',    'entregado_qa',       now() - interval '12 days', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000001', 'entregado_qa',       'iterando_qa',        now() - interval '10 days', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000001', 'iterando_qa',        'listo_para_mostrar', now() - interval '5 days',  '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000001', 'listo_para_mostrar', 'en_produccion',      now() - interval '2 days',  '10000000-0000-0000-0000-000000000001');

-- Logs de etapa adicionales para el agente B1
INSERT INTO agent_stage_logs (agent_id, from_stage, to_stage, changed_at, changed_by) VALUES
  ('40000000-0000-0000-0000-000000000002', 'backlog',         'nuevo',           now() - interval '15 days', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'nuevo',           'en_construccion', now() - interval '13 days', '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000002', 'en_construccion', 'entregado_qa',    now() - interval '7 days',  '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000002', 'entregado_qa',    'iterando_qa',     now() - interval '4 days',  '10000000-0000-0000-0000-000000000002');
