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
