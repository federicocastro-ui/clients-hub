import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { OrgManager } from '@/components/OrgManager'
import { getCountries, getOrganizationManageData, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ManageOrgPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [org, countries, members] = await Promise.all([
    getOrganizationManageData(id),
    getCountries(),
    getTeamMembers(),
  ])
  if (!org) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <BackLink href="/admin" label="Volver al admin" />
        <span className="text-slate-300">·</span>
        <BackLink href={`/clients/${id}`} label="Ver organización" />
      </div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Gestionar {org.name}</h1>
      <p className="mb-5 text-sm text-slate-500">
        Editá la organización, sus clientes y agentes. Cada bloque se guarda por separado.
      </p>

      <OrgManager org={org} countries={countries} members={members} />
    </main>
  )
}
