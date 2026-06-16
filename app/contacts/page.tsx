import Link from 'next/link'
import { getAllContacts, isUsingMockData } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const GRID =
  'grid grid-cols-[minmax(8rem,1.4fr)_minmax(7rem,1fr)_minmax(7rem,1fr)_minmax(8rem,1.3fr)_minmax(8rem,1.4fr)] items-center gap-3'

export default async function ContactsPage() {
  const contacts = await getAllContacts()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Contactos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {contacts.length} {contacts.length === 1 ? 'contacto' : 'contactos'}. Personas que
            forman parte de cada organización.
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
        >
          + Nuevo contacto
        </Link>
      </header>

      {usingMock && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Datos de ejemplo (mock local). Las acciones se reinician al reiniciar el server.
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center text-sm text-slate-500">
          No hay contactos todavía. Creá el primero.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div
            className={`${GRID} border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase`}
          >
            <span>Nombre</span>
            <span>Cargo</span>
            <span>Organización</span>
            <span>Clientes vinculados</span>
            <span>Contacto</span>
          </div>

          <div className="divide-y divide-slate-200">
            {contacts.map((ct) => (
              <div key={ct.id} className={`${GRID} px-3 py-2 text-sm`}>
                <Link
                  href={`/contacts/${ct.id}`}
                  className="truncate font-medium text-slate-900 hover:underline"
                  title={ct.name}
                >
                  {ct.name}
                </Link>
                <span className="truncate text-slate-600" title={ct.role ?? '—'}>
                  {ct.role ?? '—'}
                </span>
                <Link
                  href={`/clients/${ct.clientId}`}
                  className="truncate text-slate-600 hover:underline"
                  title={ct.clientName}
                >
                  {ct.clientName}
                </Link>
                <span
                  className="truncate text-slate-500"
                  title={ct.linkedClients.map((c) => c.name).join(', ') || '—'}
                >
                  {ct.linkedClients.length === 0
                    ? '—'
                    : ct.linkedClients.map((c) => c.name).join(', ')}
                </span>
                <span className="min-w-0 truncate text-slate-500" title={ct.email ?? ct.phone ?? '—'}>
                  {ct.email ? (
                    <a href={`mailto:${ct.email}`} className="hover:underline">
                      {ct.email}
                    </a>
                  ) : (
                    ct.phone ?? '—'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
