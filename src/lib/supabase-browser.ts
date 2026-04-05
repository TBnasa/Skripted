/* ═══════════════════════════════════════════
   Skripted — Supabase Browser Client
   ═══════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Browser-side Supabase client singleton.
 * Uses the publishable anon key — safe for client bundles.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
