import Link from 'next/link'
import { getOrganizationsForAdmin, isUsingMockData } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const GRID =
  'grid grid-cols-[minmax(8rem,1.8fr)_5rem_5rem_minmax(6rem,1fr)_5rem] items-center gap-2'

export default async function OrganizationsPage() {
  const orgs = await getOrganizationsForAdmin()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Organizaciones</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orgs.length} {orgs.length === 1 ? 'organización' : 'organizaciones'}. Entrá a cada
            una para gestionar sus clientes y agentes.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
        >
          + Nueva organización
        </Link>
      </header>

      {usingMock && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Datos de ejemplo (mock local). Las acciones se reinician al reiniciar el server.
        </div>
      )}

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center text-sm text-slate-500">
          No hay organizaciones. Creá la primera.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div
            className={`${GRID} border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase`}
          >
            <span>Organización</span>
            <span>Clientes</span>
            <span>Agentes</span>
            <span>Creada</span>
            <span className="text-right">Acciones</span>
          </div>

          <div className="divide-y divide-slate-200">
            {orgs.map((org) => (
              <div key={org.id} className={`${GRID} px-3 py-2 text-sm`}>
                <Link
                  href={`/clients/${org.id}`}
                  className="truncate font-medium text-slate-900 hover:text-slate-900 hover:underline"
                  title={org.name}
                >
                  {org.name}
                </Link>
                <span className="text-slate-500">{org.subAccountCount}</span>
                <span className="text-slate-500">{org.agentCount}</span>
                <span className="text-slate-500">{fmtDate(org.createdAt)}</span>
                <span className="flex items-center justify-end">
                  <Link
                    href={`/clients/${org.id}/edit`}
                    className="rounded-xl border border-slate-300 px-2 py-1 text-xs text-slate-800 hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
