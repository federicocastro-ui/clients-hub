import { redirect } from 'next/navigation'

// La gestión de la organización ahora vive como modo dentro del detalle (?edit=1).
export default async function ManageOrgPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/clients/${id}?edit=1`)
}
