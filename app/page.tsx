import Link from 'next/link'
import { ClientHubList } from '@/components/ClientHubList'
import { LogoMark } from '@/components/Logo'
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
          <h1 className="text-lg font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Clientes (sub-cuentas) agrupados por su estado en el ciclo de vida.
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
          Datos de ejemplo (mock local). Los cambios no se guardan en Supabase y se reinician al
          reiniciar el server.
        </div>
      )}

      <ClientHubList groups={groups} />
    </main>
  )
}
