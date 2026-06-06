import Link from 'next/link'
import type { ReactNode } from 'react'
import type { PersonRef } from '@/lib/view-model'

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  )
}

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-zinc-500"
    >
      {items.map((item, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <span className="text-zinc-700">›</span>}
          {item.href ? (
            <Link href={item.href} className="max-w-[16rem] truncate hover:text-zinc-200">
              {item.label}
            </Link>
          ) : (
            <span className="max-w-[16rem] truncate text-zinc-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function Section({
  title,
  children,
  note,
  action,
}: {
  title: string
  children: ReactNode
  note?: string
  action?: ReactNode
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800 px-4 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
          {note && <p className="mt-0.5 text-xs text-zinc-500">{note}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-zinc-200">{children}</div>
    </div>
  )
}

export function people(set: PersonRef[]): string {
  if (set.length === 0) return '—'
  return set.map((p) => p.name).join(', ')
}
