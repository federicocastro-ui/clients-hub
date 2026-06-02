import { ClientHubList } from '@/components/ClientHubList'
import { getClientHubData, isUsingMockData } from '@/lib/queries'

// Herramienta interna de datos: siempre fresca, sin cache.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const groups = await getClientHubData()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-zinc-100">Client Hub</h1>
        <p className="text-sm text-zinc-500">
          Single Source of Truth de clientes, sub cuentas y agentes de Kleva.
        </p>
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
