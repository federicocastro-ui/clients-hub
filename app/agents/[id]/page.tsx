import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { BackLink, Field, Section } from '@/components/detail-ui'
import { getAgentDetail } from '@/lib/queries'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_LIVE_BADGE,
  AGENT_STAGE_BADGE,
  AGENT_STAGE_LABELS,
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

  const now = new Date()
  const timeline = buildTimeline(agent.stageLogs, now)
  const stages = stageDurations(timeline)
  const teams = teamDurations(stages)
  const total = totalDuration(stages)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver a la lista" />
      </div>

      <header className="mb-5">
        <h1 className="text-lg font-semibold text-zinc-100">{agent.derivedName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            label={AGENT_STAGE_LABELS[agent.currentStage]}
            className={AGENT_STAGE_BADGE[agent.currentStage]}
          />
          {agent.isLive && <Badge label="Live" className={AGENT_LIVE_BADGE} />}
          {!agent.isActive && <Badge label="Baja" className={AGENT_INACTIVE_BADGE} />}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {/* Información básica */}
        <Section title="Información">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Cliente">
              <Link
                href={`/clients/${agent.clientId}`}
                className="text-zinc-200 hover:text-white hover:underline"
              >
                {agent.clientName}
              </Link>
            </Field>
            <Field label="Sub cuenta">
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

        {/* Métricas de tiempo */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Tiempo por etapa" note={`Tiempo total del agente: ${formatDuration(total)}`}>
            <div className="flex flex-col gap-1.5">
              {stages.map((s) => (
                <div key={s.stage} className="flex items-center justify-between gap-2">
                  <Badge
                    label={AGENT_STAGE_LABELS[s.stage]}
                    className={AGENT_STAGE_BADGE[s.stage]}
                  />
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
                    <Badge
                      label={AGENT_STAGE_LABELS[e.toStage]}
                      className={AGENT_STAGE_BADGE[e.toStage]}
                    />
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
