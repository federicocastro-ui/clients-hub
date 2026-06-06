import Link from 'next/link'
import { Badge } from '@/components/Badge'
import { BackLink } from '@/components/detail-ui'
import { getOrganizationsForAdmin, isUsingMockData } from '@/lib/queries'
import { setOrganizationActive_ } from '@/lib/actions'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const GRID =
  'grid grid-cols-[minmax(8rem,1.6fr)_5rem_5rem_minmax(6rem,1fr)_6rem_minmax(11rem,auto)] items-center gap-2'

export default async function AdminPage() {
  const orgs = await getOrganizationsForAdmin()
  const usingMock = isUsingMockData()
  const activeCount = orgs.filter((o) => o.isActive).length

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver al hub" />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Administración de organizaciones</h1>
          <p className="text-sm text-zinc-500">
            {orgs.length} organizaciones · {activeCount} activas. Las inactivas se
            ocultan del hub.
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
            <span>Estado</span>
            <span className="text-right">Acciones</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {orgs.map((org) => (
              <div
                key={org.id}
                className={`${GRID} px-3 py-2 text-sm ${org.isActive ? '' : 'opacity-60'}`}
              >
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
                <span>
                  {org.isActive ? (
                    <Badge
                      label="Activa"
                      className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    />
                  ) : (
                    <Badge
                      label="Inactiva"
                      className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                    />
                  )}
                </span>
                <span className="flex items-center justify-end gap-2">
                  <Link
                    href={`/clients/${org.id}/edit`}
                    className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  >
                    Editar
                  </Link>
                  <form action={setOrganizationActive_.bind(null, org.id, !org.isActive)}>
                    {org.isActive ? (
                      <button
                        type="submit"
                        className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent-hover"
                      >
                        Activar
                      </button>
                    )}
                  </form>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
