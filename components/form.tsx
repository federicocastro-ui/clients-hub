'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

export const inputCls =
  'w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-accent'

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
      <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  )
}

export function SubmitButton({ label = 'Guardar' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? 'Guardando…' : label}
    </button>
  )
}

export function CancelLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
    >
      Cancelar
    </Link>
  )
}
