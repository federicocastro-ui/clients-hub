'use client'

import { useRouter } from 'next/navigation'

/**
 * Volver a la página anterior real (historial del navegador). Si no hay
 * historial dentro de la app (entraste directo por URL), va al `fallback`.
 */
export function BackButton({
  fallback = '/',
  label = 'Volver',
}: {
  fallback?: string
  label?: string
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push(fallback)
        }
      }}
      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
    >
      <span aria-hidden>←</span> {label}
    </button>
  )
}
