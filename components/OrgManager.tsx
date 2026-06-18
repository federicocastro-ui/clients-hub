'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AgentStageBadge, ClientStatusBadge } from './StatusBadge'
import { AgentFormFields, SubAccountFormFields } from './entity-forms'
import { FieldLabel, SubmitButton, inputCls } from './form'
import { updateAgent_, updateClient_, updateSubAccount_ } from '@/lib/actions'
import type { ManageAgent, ManageClient, OrgManageData, PersonRef } from '@/lib/view-model'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function OrgManager({
  org,
  countries,
  members,
  managePath: managePathProp,
}: {
  org: OrgManageData
  countries: PersonRef[]
  members: PersonRef[]
  managePath?: string
}) {
  // Dónde redirige cada guardado (para quedarse en el lugar correcto).
  const managePath = managePathProp ?? `/clients/${org.id}/edit`
  const [openClients, setOpenClients] = useState<Set<string>>(new Set())
  const toggleClient = (id: string) =>
    setOpenClients((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="flex flex-col gap-4">
      {/* Organización */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Organización</h2>
        <form action={updateClient_.bind(null, org.id)} className="flex items-end gap-2">
          <input type="hidden" name="__redirect" value={managePath} />
          <div className="flex-1">
            <FieldLabel label="Nombre">
              <input name="name" required defaultValue={org.name} className={inputCls} />
            </FieldLabel>
          </div>
          <SubmitButton />
        </form>
      </section>

      {/* Clientes + agentes */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-slate-800">
            Clientes <span className="text-slate-500">({org.clients.length})</span>
          </h2>
          <Link
            href={`/sub-accounts/new?clientId=${org.id}`}
            className="rounded-xl bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-hover"
          >
            + Nuevo cliente
          </Link>
        </div>

        {org.clients.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-500">Sin clientes todavía.</p>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {org.clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                open={openClients.has(client.id)}
                onToggle={() => toggleClient(client.id)}
                managePath={managePath}
                countries={countries}
                members={members}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ClientCard({
  client,
  open,
  onToggle,
  managePath,
  countries,
  members,
}: {
  client: ManageClient
  open: boolean
  onToggle: () => void
  managePath: string
  countries: PersonRef[]
  members: PersonRef[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex w-full items-center gap-2 px-3 py-2">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          <Chevron open={open} />
          <span className="text-sm font-medium text-slate-900">{client.name}</span>
          <ClientStatusBadge status={client.status} />
          <span className="text-xs text-slate-500">
            T{client.tier} · {client.agents.length} agentes
          </span>
        </button>
        <Link
          href={`/sub-accounts/${client.id}`}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Abrir ↗
        </Link>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          {/* Editar cliente */}
          <form action={updateSubAccount_.bind(null, client.id)} className="flex flex-col gap-3">
            <input type="hidden" name="__redirect" value={managePath} />
            <SubAccountFormFields
              members={members}
              defaults={{
                name: client.name,
                tier: client.tier,
                status: client.status,
                vendedorId: client.vendedorId,
              }}
            />
            <SubmitButton label="Guardar cliente" />
          </form>

          {/* Agentes del cliente */}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Agentes ({client.agents.length})
              </h3>
              <Link
                href={`/agents/new?subAccountId=${client.id}`}
                className="rounded-xl border border-slate-300 px-2 py-1 text-xs text-slate-800 hover:bg-slate-100"
              >
                + Nuevo agente
              </Link>
            </div>
            {client.agents.length === 0 ? (
              <p className="text-xs text-slate-500">Sin agentes.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    managePath={managePath}
                    countries={countries}
                    members={members}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AgentCard({
  agent,
  managePath,
  countries,
  members,
}: {
  agent: ManageAgent
  managePath: string
  countries: PersonRef[]
  members: PersonRef[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex w-full items-center gap-2 px-3 py-2">
        <button onClick={() => setOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left">
          <Chevron open={open} />
          <span className="truncate text-sm text-slate-800">{agent.label}</span>
          <AgentStageBadge stage={agent.currentStage} />
        </button>
        <Link href={`/agents/${agent.id}`} className="text-xs text-slate-500 hover:text-slate-900">
          Abrir ↗
        </Link>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          <form action={updateAgent_.bind(null, agent.id)} className="flex flex-col gap-3">
            <input type="hidden" name="__redirect" value={managePath} />
            <AgentFormFields
              countries={countries}
              members={members}
              showStage={false}
              defaults={agent}
            />
            <div>
              <SubmitButton label="Guardar agente" />
            </div>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            La etapa, notas y documentos se editan desde el detalle del agente (Abrir ↗).
          </p>
        </div>
      )}
    </div>
  )
}
