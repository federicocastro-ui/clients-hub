import { redirect } from 'next/navigation'

// La administración de organizaciones se movió a la vista /organizations.
export default function AdminPage() {
  redirect('/organizations')
}
