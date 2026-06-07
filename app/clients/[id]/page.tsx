import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClientStatusBadge } from '@/components/StatusBadge'
import { Breadcrumb, Field, Section, people } from '@/components/detail-ui'
import { getClientDetail } from '@/lib/queries'

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
        <Breadcrumb items={[{ label: 'Hub', href: '/' }, { label: client.name }]} />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{client.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Creado el {fmtDate(client.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
          >
            Editar
          </Link>
          <Link
            href={`/sub-accounts/new?clientId=${client.id}`}
            className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
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
            <p className="text-sm text-slate-500">Sin clientes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-200">
              {client.subAccounts.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sub-accounts/${s.id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:bg-slate-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-800">
                        {s.name}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        T{s.tier} · {s.agentCount} agentes
                        {s.vendedor ? ` · vendió ${s.vendedor.name}` : ''}
                      </span>
                    </span>
                    <ClientStatusBadge status={s.status} />
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
