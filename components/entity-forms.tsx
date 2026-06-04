import { FieldLabel, inputCls } from './form'
import {
  AGENT_STAGE_LABELS,
  AGENT_STAGE_ORDER,
  SUB_ACCOUNT_STATUS_LABELS,
  SUB_ACCOUNT_STATUS_ORDER,
  TIPO_DE_MORA_ORDER,
} from '@/lib/display'
import type { AgentEditData } from '@/lib/queries'
import type { PersonRef } from '@/lib/view-model'
import type { AgentStage, SubAccountStatus, TipoDeMora } from '@/lib/database.types'

function PersonSelect({
  name,
  label,
  members,
  defaultValue,
}: {
  name: string
  label: string
  members: PersonRef[]
  defaultValue?: string | null
}) {
  return (
    <FieldLabel label={label}>
      <select name={name} defaultValue={defaultValue ?? ''} className={inputCls}>
        <option value="">— sin asignar —</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </FieldLabel>
  )
}

export function SubAccountFormFields({
  members,
  defaults,
}: {
  members: PersonRef[]
  defaults?: {
    name: string
    tier: number
    status: SubAccountStatus
    vendedorId: string | null
  }
}) {
  return (
    <>
      <FieldLabel label="Nombre">
        <input name="name" required defaultValue={defaults?.name ?? ''} className={inputCls} />
      </FieldLabel>
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tier">
          <select name="tier" defaultValue={defaults?.tier ?? 1} className={inputCls}>
            {[1, 2, 3, 4].map((t) => (
              <option key={t} value={t}>
                T{t}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Status">
          <select
            name="status"
            defaultValue={defaults?.status ?? 'onboarding'}
            className={inputCls}
          >
            {SUB_ACCOUNT_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {SUB_ACCOUNT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </FieldLabel>
      </div>
      <PersonSelect
        name="vendedor_id"
        label="Vendedor"
        members={members}
        defaultValue={defaults?.vendedorId}
      />
    </>
  )
}

export function AgentFormFields({
  countries,
  members,
  showStage,
  defaults,
}: {
  countries: PersonRef[]
  members: PersonRef[]
  showStage: boolean
  defaults?: AgentEditData
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tipo de mora">
          <select
            name="tipo_de_mora"
            defaultValue={defaults?.tipoDeMora ?? ('B0' as TipoDeMora)}
            className={inputCls}
          >
            {TIPO_DE_MORA_ORDER.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FieldLabel>
        {showStage && (
          <FieldLabel label="Etapa inicial">
            <select
              name="current_stage"
              defaultValue={'backlog' as AgentStage}
              className={inputCls}
            >
              {AGENT_STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {AGENT_STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </FieldLabel>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="País">
          <select name="country_id" defaultValue={defaults?.countryId ?? ''} className={inputCls}>
            <option value="">— elegir —</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="…o crear país nuevo" hint="Si lo completás, se crea y se usa este.">
          <input name="new_country" placeholder="Nuevo país" className={inputCls} />
        </FieldLabel>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PersonSelect name="onb_id" label="Onb" members={members} defaultValue={defaults?.onbId} />
        <PersonSelect name="cs_id" label="CS" members={members} defaultValue={defaults?.csId} />
        <PersonSelect name="ie_id" label="IE" members={members} defaultValue={defaults?.ieId} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="is_live" defaultChecked={defaults?.isLive ?? false} />
          En vivo (live)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaults ? defaults.isActive : true}
          />
          Activo (vigente)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Linear">
          <input name="linear_url" defaultValue={defaults?.linearUrl ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Notion">
          <input name="notion_url" defaultValue={defaults?.notionUrl ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Figma">
          <input name="figma_url" defaultValue={defaults?.figmaUrl ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Formulario QA">
          <input name="qa_form_url" defaultValue={defaults?.qaFormUrl ?? ''} className={inputCls} />
        </FieldLabel>
        <FieldLabel label="Manual">
          <input name="manual_url" defaultValue={defaults?.manualUrl ?? ''} className={inputCls} />
        </FieldLabel>
      </div>
    </>
  )
}
