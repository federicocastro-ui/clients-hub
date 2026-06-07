import Link from 'next/link'
import { ClientHubList } from '@/components/ClientHubList'
import { getClientHubData, isUsingMockData } from '@/lib/queries'

// Herramienta interna de datos: siempre fresca, sin cache.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const groups = await getClientHubData()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Client Hub</h1>
          <p className="text-sm text-slate-500">
            Single Source of Truth de organizaciones, clientes y agentes de Kleva.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
          >
            Admin
          </Link>
          <Link
            href="/clients/new"
            className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
          >
            + Nueva organización
          </Link>
        </div>
      </header>

      {usingMock && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Mostrando datos de ejemplo (mock local). Configurá{' '}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{' '}
          <code className="font-mono">.env.local</code> para leer de Supabase.
        </div>
      )}

      <ClientHubList groups={groups} />
    </main>
  )
}
