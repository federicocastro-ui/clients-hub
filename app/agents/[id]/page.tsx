import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { Breadcrumb, Field, Section } from '@/components/detail-ui'
import { AgentFormFields } from '@/components/entity-forms'
import { CancelLink, FieldLabel, SubmitButton, inputCls } from '@/components/form'
import {
  getAgentDetail,
  getAgentDocuments,
  getAgentForEdit,
  getAgentStageLogs,
  getCountries,
  getTeamMembers,
} from '@/lib/queries'
import {
  addAgentFile_,
  addAgentLink_,
  changeAgentStage_,
  removeAgentDocument_,
  updateAgent_,
  updateStageLogDates_,
} from '@/lib/actions'
import { AgentStageBadge } from '@/components/StatusBadge'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_INACTIVE_DESC,
  AGENT_LIVE_BADGE,
  AGENT_LIVE_DESC,
  AGENT_STAGE_LABELS,
  AGENT_STAGE_ORDER,
} from '@/lib/display'
import {
  buildTimeline,
  formatDuration,
  stageDurations,
  teamDurations,
  totalDuration,
} from '@/lib/stage-metrics'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams
  const isEdit = edit === '1'

  const agent = await getAgentDetail(id)
  if (!agent) notFound()
  const documents = await getAgentDocuments(id)

  const now = new Date()
  const timeline = buildTimeline(agent.stageLogs, now)
  const stages = stageDurations(timeline)
  const teams = teamDurations(stages)
  const total = totalDuration(stages)

  // Datos extra solo necesarios en modo edición.
  const editData = isEdit ? await getAgentForEdit(id) : null
  const countries = isEdit ? await getCountries() : []
  const members = isEdit ? await getTeamMembers() : []
  const stageLogRows = isEdit ? await getAgentStageLogs(id) : []

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Hub', href: '/' },
            { label: agent.clientName, href: `/clients/${agent.clientId}` },
            { label: agent.subAccountName, href: `/sub-accounts/${agent.subAccountId}` },
            { label: agent.derivedName },
          ]}
        />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{agent.derivedName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AgentStageBadge stage={agent.currentStage} />
            {agent.isLive && (
              <Badge label="Live" className={AGENT_LIVE_BADGE} title={AGENT_LIVE_DESC} />
            )}
            {!agent.isActive && (
              <Badge label="Baja" className={AGENT_INACTIVE_BADGE} title={AGENT_INACTIVE_DESC} />
            )}
          </div>
        </div>
        {isEdit ? (
          <Link
            href={`/agents/${agent.id}`}
            className="shrink-0 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
          >
            ← Listo
          </Link>
        ) : (
          <Link
            href={`/agents/${agent.id}?edit=1`}
            className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
          >
            Editar
          </Link>
        )}
      </header>

      {isEdit ? (
        // ───────────────────────── Modo edición ─────────────────────────
        <div className="flex flex-col gap-4">
          {/* Cambiar etapa (dispara un log) */}
          <Section title="Etapa" note="Cambiarla registra un log en el timeline.">
            <form
              action={changeAgentStage_.bind(null, agent.id)}
              className="flex flex-wrap items-end gap-2"
            >
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Cambiar etapa
                </span>
                <select
                  name="current_stage"
                  defaultValue={agent.currentStage}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-300"
                >
                  {AGENT_STAGE_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {AGENT_STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
              >
                Aplicar
              </button>
            </form>
          </Section>

          {/* Editar campos del agente */}
          <Section title="Información del agente">
            {editData && (
              <form action={updateAgent_.bind(null, agent.id)} className="flex flex-col gap-4">
                <AgentFormFields
                  countries={countries}
                  members={members}
                  showStage={false}
                  defaults={editData}
                />
                <div className="flex gap-2">
                  <SubmitButton />
                  <CancelLink href={`/agents/${agent.id}`} />
                </div>
              </form>
            )}
          </Section>

          {/* Documentos: gestión (links sueltos + archivos) */}
          <Section
            title="Documentos"
            note="Links sueltos y archivos adjuntos, además de los 5 links fijos."
          >
            {documents.length === 0 ? (
              <p className="mb-4 text-sm text-slate-500">Sin documentos.</p>
            ) : (
              <ul className="mb-4 flex flex-col divide-y divide-slate-200">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-500 uppercase">
                        {doc.kind === 'file' ? 'Archivo' : 'Link'}
                      </span>
                      <a
                        href={doc.url}
                        target={doc.kind === 'link' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        download={doc.kind === 'file' ? doc.label : undefined}
                        className="truncate text-sm text-slate-800 hover:text-slate-900 hover:underline"
                      >
                        {doc.label}
                      </a>
                    </span>
                    <form action={removeAgentDocument_.bind(null, agent.id, doc.id)}>
                      <button
                        type="submit"
                        className="shrink-0 rounded-xl border border-slate-300 px-2 py-1 text-xs text-slate-500 hover:border-rose-300 hover:text-rose-600"
                      >
                        Quitar
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <form action={addAgentLink_.bind(null, agent.id)} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-500">Agregar link</p>
                <FieldLabel label="Label">
                  <input name="label" required className={inputCls} />
                </FieldLabel>
                <FieldLabel label="URL">
                  <input name="url" type="url" required placeholder="https://…" className={inputCls} />
                </FieldLabel>
                <div>
                  <SubmitButton label="Agregar link" />
                </div>
              </form>

              <form action={addAgentFile_.bind(null, agent.id)} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-500">Subir archivo</p>
                <FieldLabel label="Label" hint="Opcional; por defecto usa el nombre del archivo.">
                  <input name="label" className={inputCls} />
                </FieldLabel>
                <FieldLabel label="Archivo">
                  <input
                    name="file"
                    type="file"
                    required
                    className="text-sm text-slate-700 file:mr-2 file:rounded-xl file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-slate-900"
                  />
                </FieldLabel>
                <div>
                  <SubmitButton label="Subir archivo" />
                </div>
              </form>
            </div>
          </Section>

          {/* Editar fechas del timeline */}
          <Section
            title="Timeline de etapas"
            note="Ajustá la fecha de cada cambio de etapa (útil para registrar cambios pasados)."
          >
            {stageLogRows.length === 0 ? (
              <p className="text-sm text-slate-500">Sin cambios de etapa registrados.</p>
            ) : (
              <form
                action={updateStageLogDates_.bind(null, agent.id)}
                className="flex flex-col gap-3"
              >
                {stageLogRows.map((log) => (
                  <div key={log.id} className="flex flex-wrap items-center gap-3">
                    <input type="hidden" name="log_id" value={log.id} />
                    <span className="w-44 shrink-0">
                      <AgentStageBadge stage={log.toStage} />
                    </span>
                    <input
                      type="date"
                      name="changed_at"
                      defaultValue={log.changedAt.slice(0, 10)}
                      className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5] focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
                    />
                  </div>
                ))}
                <div>
                  <SubmitButton label="Guardar fechas" />
                </div>
              </form>
            )}
          </Section>
        </div>
      ) : (
        // ───────────────────────── Modo visión ─────────────────────────
        <div className="flex flex-col gap-4">
          <Section title="Información">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Organización">
                <Link
                  href={`/clients/${agent.clientId}`}
                  className="text-slate-800 hover:text-slate-900 hover:underline"
                >
                  {agent.clientName}
                </Link>
              </Field>
              <Field label="Cliente">
                <Link
                  href={`/sub-accounts/${agent.subAccountId}`}
                  className="text-slate-800 hover:text-slate-900 hover:underline"
                >
                  {agent.subAccountName}
                </Link>
              </Field>
              <Field label="Tipo de mora">{agent.tipoDeMora}</Field>
              <Field label="País">{agent.countryName}</Field>
              <Field label="Onb">{agent.onb?.name ?? '—'}</Field>
              <Field label="CS">{agent.cs?.name ?? '—'}</Field>
              <Field label="IE">{agent.ie?.name ?? '—'}</Field>
            </div>
          </Section>

          <Section title="Links">
            {agent.links.length === 0 ? (
              <p className="text-sm text-slate-500">Sin links cargados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {agent.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                  >
                    {link.label} <span aria-hidden className="text-slate-500">↗</span>
                  </a>
                ))}
              </div>
            )}
          </Section>

          <Section title="Documentos">
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">Sin documentos.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-slate-200">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 py-2">
                    <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] tracking-wide text-slate-500 uppercase">
                      {doc.kind === 'file' ? 'Archivo' : 'Link'}
                    </span>
                    <a
                      href={doc.url}
                      target={doc.kind === 'link' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      download={doc.kind === 'file' ? doc.label : undefined}
                      className="truncate text-sm text-slate-800 hover:text-slate-900 hover:underline"
                    >
                      {doc.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Section title="Tiempo por etapa" note={`Tiempo total del agente: ${formatDuration(total)}`}>
              <div className="flex flex-col gap-1.5">
                {stages.map((s) => (
                  <div key={s.stage} className="flex items-center justify-between gap-2">
                    <AgentStageBadge stage={s.stage} />
                    <span className="text-sm text-slate-700">{formatDuration(s.totalMs)}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Tiempo por equipo"
              note="Las etapas multi-equipo suman a ambos, por eso los totales pueden solaparse."
            >
              <div className="flex flex-col gap-1.5">
                {teams.map((t) => (
                  <div key={t.team} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-800">{t.team}</span>
                    <span className="text-sm text-slate-700">{formatDuration(t.totalMs)}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <Section title="Timeline de etapas">
            <ol className="flex flex-col gap-3">
              {timeline.map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <span
                      className={`h-2 w-2 rounded-full ${e.isCurrent ? 'bg-emerald-400' : 'bg-slate-300'}`}
                    />
                    {i < timeline.length - 1 && <span className="mt-1 h-6 w-px bg-slate-200" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AgentStageBadge stage={e.toStage} />
                      <span className="text-xs text-slate-500">{fmtDate(e.changedAt)}</span>
                      {e.isCurrent && <span className="text-xs text-emerald-600">etapa actual</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {formatDuration(e.durationMs)} en esta etapa
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </main>
  )
}
