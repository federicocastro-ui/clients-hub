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
          <h1 className="text-lg font-semibold text-zinc-100">Client Hub</h1>
          <p className="text-sm text-zinc-500">
            Single Source of Truth de organizaciones, clientes y agentes de Kleva.
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
