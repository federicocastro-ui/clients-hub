'use client'

import { useState } from 'react'
import { CancelLink, FieldLabel, SubmitButton, inputCls } from './form'
import type { OrgWithClients } from '@/lib/view-model'

interface ContactDefaults {
  name?: string
  email?: string | null
  phone?: string | null
  role?: string | null
  notes?: string | null
  clientId?: string
  subAccountIds?: string[]
}

export function ContactForm({
  action,
  orgs,
  defaultValues,
  submitLabel = 'Guardar',
  cancelHref = '/contacts',
}: {
  action: (fd: FormData) => void | Promise<void>
  orgs: OrgWithClients[]
  defaultValues?: ContactDefaults
  submitLabel?: string
  cancelHref?: string
}) {
  const [orgId, setOrgId] = useState(defaultValues?.clientId ?? orgs[0]?.id ?? '')
  const selectedOrg = orgs.find((o) => o.id === orgId)
  const linkedSet = new Set(defaultValues?.subAccountIds ?? [])

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Nombre">
          <input name="name" required defaultValue={defaultValues?.name ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Cargo / puesto">
          <input name="role" defaultValue={defaultValues?.role ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Email">
          <input name="email" type="email" defaultValue={defaultValues?.email ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Teléfono">
          <input name="phone" defaultValue={defaultValues?.phone ?? ''} className={inputCls} />
        </FieldLabel>
      </div>

      <FieldLabel label="Organización">
        <select
          name="client_id"
          required
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          className={inputCls}
        >
          {orgs.length === 0 && <option value="">— sin organizaciones —</option>}
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </FieldLabel>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
          Clientes vinculados
        </span>
        {selectedOrg && selectedOrg.clients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOrg.clients.map((c) => (
              <label
                key={c.id}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  name="sub_account_ids"
                  value={c.id}
                  defaultChecked={linkedSet.has(c.id)}
                  className="accent-[#2563eb]"
                />
                {c.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Esta organización no tiene clientes.</p>
        )}
      </div>

      <FieldLabel label="Notas">
        <textarea name="notes" rows={3} defaultValue={defaultValues?.notes ?? ''} className={inputCls} />
      </FieldLabel>

      <div className="flex items-center gap-2">
        <SubmitButton label={submitLabel} />
        <CancelLink href={cancelHref} />
      </div>
    </form>
  )
}
