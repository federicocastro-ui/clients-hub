import Link from 'next/link'
import { BackLink } from '@/components/detail-ui'
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

export default async function AdminPage() {
  const orgs = await getOrganizationsForAdmin()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver al hub" />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Administración de organizaciones</h1>
          <p className="text-sm text-zinc-500">
            {orgs.length} {orgs.length === 1 ? 'organización' : 'organizaciones'}. Editá cada
            una para gestionar sus clientes y agentes.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Nueva organización
        </Link>
      </header>

      {usingMock && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Datos de ejemplo (mock local). Las acciones se reinician al reiniciar el server.
        </div>
      )}

      {orgs.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
          No hay organizaciones. Creá la primera.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div
            className={`${GRID} border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase`}
          >
            <span>Organización</span>
            <span>Clientes</span>
            <span>Agentes</span>
            <span>Creada</span>
            <span className="text-right">Acciones</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {orgs.map((org) => (
              <div key={org.id} className={`${GRID} px-3 py-2 text-sm`}>
                <Link
                  href={`/clients/${org.id}`}
                  className="truncate font-medium text-zinc-100 hover:text-white hover:underline"
                  title={org.name}
                >
                  {org.name}
                </Link>
                <span className="text-zinc-400">{org.subAccountCount}</span>
                <span className="text-zinc-400">{org.agentCount}</span>
                <span className="text-zinc-400">{fmtDate(org.createdAt)}</span>
                <span className="flex items-center justify-end">
                  <Link
                    href={`/clients/${org.id}/edit`}
                    className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
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
