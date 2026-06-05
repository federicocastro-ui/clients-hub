import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { BackLink, Field, Section, people } from '@/components/detail-ui'
import { getClientDetail } from '@/lib/queries'
import {
  SUB_ACCOUNT_STATUS_BADGE,
  SUB_ACCOUNT_STATUS_LABELS,
} from '@/lib/display'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientDetail(id)
  if (!client) notFound()

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver a la lista" />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">{client.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Creado el {fmtDate(client.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Editar
          </Link>
          <Link
            href={`/sub-accounts/new?clientId=${client.id}`}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            + Nuevo cliente
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <Section
          title="Equipo asignado"
          note="Derivado de los agentes de los clientes de la organización."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Onb">{people(client.onbSet)}</Field>
            <Field label="CS">{people(client.csSet)}</Field>
            <Field label="IE">{people(client.ieSet)}</Field>
          </div>
        </Section>

        <Section title="Clientes">
          {client.subAccounts.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin clientes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-800/60">
              {client.subAccounts.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sub-accounts/${s.id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:bg-zinc-800/30"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-200">
                        {s.name}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        T{s.tier} · {s.agentCount} agentes
                        {s.vendedor ? ` · vendió ${s.vendedor.name}` : ''}
                      </span>
                    </span>
                    <Badge
                      label={SUB_ACCOUNT_STATUS_LABELS[s.status]}
                      className={SUB_ACCOUNT_STATUS_BADGE[s.status]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  )
}
