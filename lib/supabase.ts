import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/** Cliente server-side con service role (bypasa RLS). Solo usar en Server Components y Server Actions. */
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
