/** Marca Kleva: dos ondas opuestas (aprox. del logo). */
export function Logo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4.5 12.5 C 7 12.5, 7.6 6.5, 10.3 6.5 C 13 6.5, 13.6 12.5, 16 12.5" />
      <path d="M8 11.5 C 11 11.5, 11.4 17.5, 14.2 17.5 C 16.9 17.5, 17.5 11.5, 19.5 11.5" />
    </svg>
  )
}

/** Logo en un cuadrado oscuro estilo app-icon (marca blanca sobre fondo oscuro). */
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white ${className}`}
    >
      <Logo className="h-4 w-4" />
    </span>
  )
}
