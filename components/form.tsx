'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

export const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5] focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]'

export function FieldLabel({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function SubmitButton({ label = 'Guardar' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)] disabled:opacity-60"
    >
      {pending ? 'Guardando…' : label}
    </button>
  )
}

export function CancelLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
    >
      Cancelar
    </Link>
  )
}
