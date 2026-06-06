import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { Breadcrumb, Field, Section } from '@/components/detail-ui'
import { getAgentDetail, getAgentDocuments } from '@/lib/queries'
import {
  addAgentFile_,
  addAgentLink_,
  changeAgentStage_,
  removeAgentDocument_,
} from '@/lib/actions'
import { FieldLabel, SubmitButton, inputCls } from '@/components/form'
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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await getAgentDetail(id)
  if (!agent) notFound()
  const documents = await getAgentDocuments(id)

  const now = new Date()
  const timeline = buildTimeline(agent.stageLogs, now)
  const stages = stageDurations(timeline)
  const teams = teamDurations(stages)
  const total = totalDuration(stages)

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
          <h1 className="text-lg font-semibold text-zinc-100">{agent.derivedName}</h1>
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
        <Link
          href={`/agents/${agent.id}/edit`}
          className="shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          Editar
        </Link>
      </header>

      {/* Cambiar etapa (dispara un log) */}
      <form
        action={changeAgentStage_.bind(null, agent.id)}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            Cambiar etapa
          </span>
          <select
            name="current_stage"
            defaultValue={agent.currentStage}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
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
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Aplicar
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {/* Información básica */}
        <Section title="Información">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Organización">
              <Link
                href={`/clients/${agent.clientId}`}
                className="text-zinc-200 hover:text-white hover:underline"
              >
                {agent.clientName}
              </Link>
            </Field>
            <Field label="Cliente">
              <Link
                href={`/sub-accounts/${agent.subAccountId}`}
                className="text-zinc-200 hover:text-white hover:underline"
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

        {/* Links fijos */}
        <Section title="Links">
          {agent.links.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin links cargados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {agent.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/40 px-2.5 py-1 text-xs text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
                >
                  {link.label} <span aria-hidden className="text-zinc-500">↗</span>
                </a>
              ))}
            </div>
          )}
        </Section>

        {/* Documentos extra (links sueltos + archivos) */}
        <Section
          title="Documentos"
          note="Links sueltos y archivos adjuntos, además de los 5 links fijos."
        >
          {documents.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin documentos.</p>
          ) : (
            <ul className="mb-4 flex flex-col divide-y divide-zinc-800/60">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] tracking-wide text-zinc-400 uppercase">
                      {doc.kind === 'file' ? 'Archivo' : 'Link'}
                    </span>
                    <a
                      href={doc.url}
                      target={doc.kind === 'link' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      download={doc.kind === 'file' ? doc.label : undefined}
                      className="truncate text-sm text-zinc-200 hover:text-white hover:underline"
                    >
                      {doc.label}
                    </a>
                  </span>
                  <form action={removeAgentDocument_.bind(null, agent.id, doc.id)}>
                    <button
                      type="submit"
                      className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-rose-500/40 hover:text-rose-300"
                    >
                      Quitar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-4 border-t border-zinc-800 pt-4 sm:grid-cols-2">
            {/* Agregar link */}
            <form
              action={addAgentLink_.bind(null, agent.id)}
              className="flex flex-col gap-2"
            >
              <p className="text-xs font-medium text-zinc-400">Agregar link</p>
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

            {/* Subir archivo */}
            <form
              action={addAgentFile_.bind(null, agent.id)}
              encType="multipart/form-data"
              className="flex flex-col gap-2"
            >
              <p className="text-xs font-medium text-zinc-400">Subir archivo</p>
              <FieldLabel label="Label" hint="Opcional; por defecto usa el nombre del archivo.">
                <input name="label" className={inputCls} />
              </FieldLabel>
              <FieldLabel label="Archivo">
                <input
                  name="file"
                  type="file"
                  required
                  className="text-sm text-zinc-300 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-zinc-100"
                />
              </FieldLabel>
              <div>
                <SubmitButton label="Subir archivo" />
              </div>
            </form>
          </div>
        </Section>

        {/* Métricas de tiempo */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Tiempo por etapa" note={`Tiempo total del agente: ${formatDuration(total)}`}>
            <div className="flex flex-col gap-1.5">
              {stages.map((s) => (
                <div key={s.stage} className="flex items-center justify-between gap-2">
                  <AgentStageBadge stage={s.stage} />
                  <span className="text-sm text-zinc-300">{formatDuration(s.totalMs)}</span>
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
                  <span className="text-sm text-zinc-200">{t.team}</span>
                  <span className="text-sm text-zinc-300">{formatDuration(t.totalMs)}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Timeline cronológico */}
        <Section title="Timeline de etapas">
          <ol className="flex flex-col gap-3">
            {timeline.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <span
                    className={`h-2 w-2 rounded-full ${e.isCurrent ? 'bg-emerald-400' : 'bg-zinc-600'}`}
                  />
                  {i < timeline.length - 1 && <span className="mt-1 h-6 w-px bg-zinc-700" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AgentStageBadge stage={e.toStage} />
                    <span className="text-xs text-zinc-500">{fmtDate(e.changedAt)}</span>
                    {e.isCurrent && (
                      <span className="text-xs text-emerald-400">etapa actual</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {formatDuration(e.durationMs)} en esta etapa
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </main>
  )
}
