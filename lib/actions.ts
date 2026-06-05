'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { AgentStage, SubAccountStatus, TipoDeMora } from './database.types'
import {
  MOCK_AGENT_DOCS,
  MOCK_AGENT_NOTES,
  MOCK_CLIENTS,
  MOCK_COUNTRIES,
  MOCK_STAGE_LOGS,
  MOCK_TEAM_MEMBERS,
  type MockStageLog,
} from './mock-data'
import type { RawAgent, RawClient, RawSubAccount } from './queries'

// ─────────────────────────────────────────────────────────────
// Server Actions de creación / edición. Ramifican entre Supabase
// (cuando hay credenciales) y el store mock en memoria (dev).
// ─────────────────────────────────────────────────────────────

function usingMock(): boolean {
  return !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Cliente sin genérico de tipos: la capa de actions arma los payloads a mano.
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? ''
}
function strOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key)
  return v === '' ? null : v
}
function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on'
}

// ── Helpers mock ─────────────────────────────────────────────

function mockPerson(id: string | null) {
  if (!id) return null
  return MOCK_TEAM_MEMBERS.find((p) => p.id === id) ?? null
}
function mockCountry(id: string | null) {
  if (!id) return null
  return MOCK_COUNTRIES.find((c) => c.id === id) ?? null
}
function mockFindSub(id: string): { client: RawClient; sub: RawSubAccount } | null {
  for (const client of MOCK_CLIENTS) {
    const sub = client.sub_accounts.find((s) => s.id === id)
    if (sub) return { client, sub }
  }
  return null
}
function mockFindAgent(id: string): RawAgent | null {
  for (const c of MOCK_CLIENTS)
    for (const s of c.sub_accounts) {
      const a = s.agents.find((ag) => ag.id === id)
      if (a) return a
    }
  return null
}

function revalidateAll() {
  revalidatePath('/', 'layout')
}

// ── Cliente ──────────────────────────────────────────────────

export async function createClient_(fd: FormData) {
  const name = str(fd, 'name')
  if (!name) throw new Error('El nombre es obligatorio')
  let id: string
  if (usingMock()) {
    id = crypto.randomUUID()
    MOCK_CLIENTS.push({ id, name, created_at: new Date().toISOString(), sub_accounts: [] })
  } else {
    const { data, error } = await db().from('clients').insert({ name }).select('id').single()
    if (error) throw new Error(error.message)
    id = (data as { id: string }).id
  }
  revalidateAll()
  redirect(`/clients/${id}`)
}

export async function updateClient_(id: string, fd: FormData) {
  const name = str(fd, 'name')
  if (!name) throw new Error('El nombre es obligatorio')
  if (usingMock()) {
    const c = MOCK_CLIENTS.find((c) => c.id === id)
    if (c) c.name = name
  } else {
    const { error } = await db().from('clients').update({ name }).eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
  redirect(`/clients/${id}`)
}

// ── Sub cuenta ───────────────────────────────────────────────

export async function createSubAccount_(fd: FormData) {
  const clientId = str(fd, 'client_id')
  const name = str(fd, 'name')
  const tier = parseInt(str(fd, 'tier'), 10)
  const status = str(fd, 'status') as SubAccountStatus
  const vendedorId = strOrNull(fd, 'vendedor_id')
  if (!clientId || !name || !tier) throw new Error('Faltan campos obligatorios')

  let id: string
  if (usingMock()) {
    id = crypto.randomUUID()
    const client = MOCK_CLIENTS.find((c) => c.id === clientId)
    if (!client) throw new Error('Cliente no encontrado')
    client.sub_accounts.push({
      id,
      name,
      tier,
      status,
      vendedor: mockPerson(vendedorId),
      agents: [],
    })
  } else {
    const { data, error } = await db()
      .from('sub_accounts')
      .insert({ client_id: clientId, name, tier, status, vendedor_id: vendedorId })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    id = (data as { id: string }).id
  }
  revalidateAll()
  redirect(`/sub-accounts/${id}`)
}

export async function updateSubAccount_(id: string, fd: FormData) {
  const name = str(fd, 'name')
  const tier = parseInt(str(fd, 'tier'), 10)
  const status = str(fd, 'status') as SubAccountStatus
  const vendedorId = strOrNull(fd, 'vendedor_id')
  if (usingMock()) {
    const found = mockFindSub(id)
    if (found) {
      found.sub.name = name
      found.sub.tier = tier
      found.sub.status = status
      found.sub.vendedor = mockPerson(vendedorId)
    }
  } else {
    const { error } = await db()
      .from('sub_accounts')
      .update({ name, tier, status, vendedor_id: vendedorId })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
  redirect(`/sub-accounts/${id}`)
}

export async function markChurned_(id: string) {
  if (usingMock()) {
    const found = mockFindSub(id)
    if (found) found.sub.status = 'churned'
  } else {
    const { error } = await db()
      .from('sub_accounts')
      .update({ status: 'churned' })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

// ── País ─────────────────────────────────────────────────────

async function resolveCountryId(countryId: string | null, newCountry: string): Promise<string> {
  if (newCountry) {
    if (usingMock()) {
      const id = crypto.randomUUID()
      MOCK_COUNTRIES.push({ id, name: newCountry })
      return id
    }
    const { data, error } = await db()
      .from('countries')
      .insert({ name: newCountry })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return (data as { id: string }).id
  }
  if (!countryId) throw new Error('Falta el país')
  return countryId
}

// ── Agente ───────────────────────────────────────────────────

export async function createAgent_(fd: FormData) {
  const subAccountId = str(fd, 'sub_account_id')
  const tipoDeMora = str(fd, 'tipo_de_mora') as TipoDeMora
  const currentStage = str(fd, 'current_stage') as AgentStage
  const countryId = await resolveCountryId(strOrNull(fd, 'country_id'), str(fd, 'new_country'))
  const onbId = strOrNull(fd, 'onb_id')
  const csId = strOrNull(fd, 'cs_id')
  const ieId = strOrNull(fd, 'ie_id')
  const isLive = bool(fd, 'is_live')
  const isActive = fd.get('is_active') === null ? true : bool(fd, 'is_active')
  if (!subAccountId || !tipoDeMora || !currentStage) throw new Error('Faltan campos obligatorios')

  let id: string
  if (usingMock()) {
    id = crypto.randomUUID()
    const found = mockFindSub(subAccountId)
    if (!found) throw new Error('Sub cuenta no encontrada')
    found.sub.agents.push({
      id,
      tipo_de_mora: tipoDeMora,
      current_stage: currentStage,
      is_live: isLive,
      is_active: isActive,
      country: mockCountry(countryId),
      onb: mockPerson(onbId),
      cs: mockPerson(csId),
      ie: mockPerson(ieId),
      linear_url: strOrNull(fd, 'linear_url'),
      notion_url: strOrNull(fd, 'notion_url'),
      figma_url: strOrNull(fd, 'figma_url'),
      qa_form_url: strOrNull(fd, 'qa_form_url'),
      manual_url: strOrNull(fd, 'manual_url'),
    })
    // log inicial (en Supabase lo hace el trigger)
    MOCK_STAGE_LOGS[id] = [
      { from_stage: null, to_stage: currentStage, changed_at: new Date().toISOString() },
    ]
  } else {
    const { data, error } = await db()
      .from('agents')
      .insert({
        sub_account_id: subAccountId,
        tipo_de_mora: tipoDeMora,
        current_stage: currentStage,
        country_id: countryId,
        onb_id: onbId,
        cs_id: csId,
        ie_id: ieId,
        is_live: isLive,
        is_active: isActive,
        linear_url: strOrNull(fd, 'linear_url'),
        notion_url: strOrNull(fd, 'notion_url'),
        figma_url: strOrNull(fd, 'figma_url'),
        qa_form_url: strOrNull(fd, 'qa_form_url'),
        manual_url: strOrNull(fd, 'manual_url'),
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    id = (data as { id: string }).id
  }
  revalidateAll()
  redirect(`/agents/${id}`)
}

export async function updateAgent_(id: string, fd: FormData) {
  const tipoDeMora = str(fd, 'tipo_de_mora') as TipoDeMora
  const countryId = await resolveCountryId(strOrNull(fd, 'country_id'), str(fd, 'new_country'))
  const onbId = strOrNull(fd, 'onb_id')
  const csId = strOrNull(fd, 'cs_id')
  const ieId = strOrNull(fd, 'ie_id')
  const isLive = bool(fd, 'is_live')
  const isActive = bool(fd, 'is_active')

  if (usingMock()) {
    const a = mockFindAgent(id)
    if (a) {
      a.tipo_de_mora = tipoDeMora
      a.country = mockCountry(countryId)
      a.onb = mockPerson(onbId)
      a.cs = mockPerson(csId)
      a.ie = mockPerson(ieId)
      a.is_live = isLive
      a.is_active = isActive
      a.linear_url = strOrNull(fd, 'linear_url')
      a.notion_url = strOrNull(fd, 'notion_url')
      a.figma_url = strOrNull(fd, 'figma_url')
      a.qa_form_url = strOrNull(fd, 'qa_form_url')
      a.manual_url = strOrNull(fd, 'manual_url')
    }
  } else {
    const { error } = await db()
      .from('agents')
      .update({
        tipo_de_mora: tipoDeMora,
        country_id: countryId,
        onb_id: onbId,
        cs_id: csId,
        ie_id: ieId,
        is_live: isLive,
        is_active: isActive,
        linear_url: strOrNull(fd, 'linear_url'),
        notion_url: strOrNull(fd, 'notion_url'),
        figma_url: strOrNull(fd, 'figma_url'),
        qa_form_url: strOrNull(fd, 'qa_form_url'),
        manual_url: strOrNull(fd, 'manual_url'),
      })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
  redirect(`/agents/${id}`)
}

// ── Documentos del agente ────────────────────────────────────

const DOCS_BUCKET = 'agent-documents'

export async function addAgentLink_(agentId: string, fd: FormData) {
  const label = str(fd, 'label')
  const url = str(fd, 'url')
  if (!label || !url) throw new Error('Faltan label o URL')
  if (usingMock()) {
    const list = MOCK_AGENT_DOCS[agentId] ?? (MOCK_AGENT_DOCS[agentId] = [])
    list.push({ id: crypto.randomUUID(), kind: 'link', label, url })
  } else {
    const { error } = await db()
      .from('agent_documents')
      .insert({ agent_id: agentId, kind: 'link', label, url })
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

export async function addAgentFile_(agentId: string, fd: FormData) {
  const file = fd.get('file') as File | null
  const label = str(fd, 'label') || (file?.name ?? 'Archivo')
  if (!file || file.size === 0) throw new Error('Falta el archivo')

  if (usingMock()) {
    // Dev: guardamos el archivo como data URL en memoria (descargable).
    const buf = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${buf.toString('base64')}`
    const list = MOCK_AGENT_DOCS[agentId] ?? (MOCK_AGENT_DOCS[agentId] = [])
    list.push({ id: crypto.randomUUID(), kind: 'file', label, url: dataUrl })
  } else {
    const supabase = db()
    const path = `${agentId}/${crypto.randomUUID()}-${file.name}`
    const { error: upErr } = await supabase.storage
      .from(DOCS_BUCKET)
      .upload(path, file, { upsert: false })
    if (upErr) throw new Error(upErr.message)
    const { data: pub } = supabase.storage.from(DOCS_BUCKET).getPublicUrl(path)
    const { error } = await supabase
      .from('agent_documents')
      .insert({ agent_id: agentId, kind: 'file', label, url: pub.publicUrl })
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

export async function removeAgentDocument_(agentId: string, docId: string) {
  if (usingMock()) {
    const list = MOCK_AGENT_DOCS[agentId]
    if (list) MOCK_AGENT_DOCS[agentId] = list.filter((d) => d.id !== docId)
  } else {
    const { error } = await db().from('agent_documents').delete().eq('id', docId)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

// ── Notas internas del agente ────────────────────────────────

export async function addAgentNote_(agentId: string, fd: FormData) {
  const body = str(fd, 'body')
  const author = strOrNull(fd, 'author')
  if (!body) throw new Error('La nota no puede estar vacía')
  if (usingMock()) {
    const list = MOCK_AGENT_NOTES[agentId] ?? (MOCK_AGENT_NOTES[agentId] = [])
    list.push({ id: crypto.randomUUID(), body, author, created_at: new Date().toISOString() })
  } else {
    const { error } = await db()
      .from('agent_notes')
      .insert({ agent_id: agentId, body, author })
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

export async function removeAgentNote_(agentId: string, noteId: string) {
  if (usingMock()) {
    const list = MOCK_AGENT_NOTES[agentId]
    if (list) MOCK_AGENT_NOTES[agentId] = list.filter((n) => n.id !== noteId)
  } else {
    const { error } = await db().from('agent_notes').delete().eq('id', noteId)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}

export async function changeAgentStage_(id: string, fd: FormData) {
  const newStage = str(fd, 'current_stage') as AgentStage
  if (usingMock()) {
    const a = mockFindAgent(id)
    if (a && a.current_stage !== newStage) {
      const log: MockStageLog = {
        from_stage: a.current_stage,
        to_stage: newStage,
        changed_at: new Date().toISOString(),
      }
      MOCK_STAGE_LOGS[id] = [...(MOCK_STAGE_LOGS[id] ?? []), log]
      a.current_stage = newStage
    }
  } else {
    // El trigger de Postgres inserta el log al cambiar current_stage.
    const { error } = await db()
      .from('agents')
      .update({ current_stage: newStage })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidateAll()
}
