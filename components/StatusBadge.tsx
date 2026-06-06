import { Badge } from './Badge'
import {
  AGENT_STAGE_BADGE,
  AGENT_STAGE_DESC,
  AGENT_STAGE_LABELS,
  SUB_ACCOUNT_STATUS_BADGE,
  SUB_ACCOUNT_STATUS_DESC,
  SUB_ACCOUNT_STATUS_LABELS,
} from '@/lib/display'
import type { AgentStage, SubAccountStatus } from '@/lib/database.types'

export function ClientStatusBadge({ status }: { status: SubAccountStatus }) {
  return (
    <Badge
      label={SUB_ACCOUNT_STATUS_LABELS[status]}
      className={SUB_ACCOUNT_STATUS_BADGE[status]}
      title={SUB_ACCOUNT_STATUS_DESC[status]}
    />
  )
}

export function AgentStageBadge({ stage }: { stage: AgentStage }) {
  return (
    <Badge
      label={AGENT_STAGE_LABELS[stage]}
      className={AGENT_STAGE_BADGE[stage]}
      title={AGENT_STAGE_DESC[stage]}
    />
  )
}
