'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from './Logo'

// Las 4 vistas de nivel superior (jerarquía Kleva).
const TABS = [
  { key: 'orgs', label: 'Organizaciones', href: '/organizations' },
  { key: 'clients', label: 'Clientes', href: '/' },
  { key: 'agents', label: 'Agentes', href: '/agents' },
  { key: 'contacts', label: 'Contactos', href: '/contacts' },
] as const

// Mapea la ruta actual a la pestaña activa (incluye las páginas de detalle).
function activeKey(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/sub-accounts')) return 'clients'
  if (pathname.startsWith('/organizations') || pathname.startsWith('/clients') || pathname.startsWith('/admin'))
    return 'orgs'
  if (pathname.startsWith('/agents')) return 'agents'
  if (pathname.startsWith('/contacts')) return 'contacts'
  return ''
}

export function TopNav() {
  const pathname = usePathname()
  const active = activeKey(pathname)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 py-3">
          <LogoMark />
          <span className="text-sm font-semibold text-slate-900">Client Hub</span>
        </Link>
        <nav className="-mb-px flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = active === t.key
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
