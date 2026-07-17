import { getSupabaseAdmin } from '@/lib/supabase-server';

export const DAILY_GENERATION_LIMIT = 50;

/**
 * Checks if a user has exceeded their daily generation limit.
 * Uses a single atomic query via the optimized RPC.
 */
export async function checkUsageLimit(userId: string) {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('usage_limits')
    .select('generations_today, last_generation_date, tier')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[UsageLimit] Error fetching usage info:', error);
    return { allowed: true, current: 0, limit: DAILY_GENERATION_LIMIT, tier: 'Free' }; 
  }

  if (!data) {
    return { allowed: true, current: 0, limit: DAILY_GENERATION_LIMIT, tier: 'Free' };
  }

  const isNewDay = data.last_generation_date !== today;
  const current = isNewDay ? 0 : (data.generations_today ?? 0);

  return {
    allowed: current < DAILY_GENERATION_LIMIT,
    current,
    limit: DAILY_GENERATION_LIMIT,
    tier: data.tier || 'Free',
  };
}

/**
 * Atomic increment of the user's daily generation count.
 * Uses optimized RPC with built-in auto-insert and date-reset logic.
 */
export async function incrementUsage(userId: string) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.rpc('increment_usage_count', { x_user_id: userId });

  if (error) {
    console.error('[UsageLimit] Increment RPC error:', error);
  }
}
