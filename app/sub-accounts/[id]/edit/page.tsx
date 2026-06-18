import { redirect } from 'next/navigation'

// La edición del cliente ahora vive como modo dentro del detalle (?edit=1).
export default async function EditSubAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/sub-accounts/${id}?edit=1`)
}
