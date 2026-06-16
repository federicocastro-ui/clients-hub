import { redirect } from 'next/navigation'

// La edición del agente ahora vive como modo dentro del detalle (?edit=1).
export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/agents/${id}?edit=1`)
}
