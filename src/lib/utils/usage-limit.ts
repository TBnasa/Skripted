import { getSupabaseAdmin } from '@/lib/supabase-server';

export const DAILY_GENERATION_LIMIT = 50;

/**
 * Checks if a user has exceeded their daily generation limit.
 * Resets the count if it's a new day.
 */
export async function checkUsageLimit(userId: string) {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If error is not "No rows found", log it
  if (error && error.code !== 'PGRST116') {
    console.error('[UsageLimit] Error fetching usage info:', error);
    return { allowed: true, current: 0, limit: DAILY_GENERATION_LIMIT }; 
  }

  // First time user registration in usage_limits
  if (!data) {
    const { error: insertError } = await supabase
      .from('usage_limits')
      .insert({
        user_id: userId,
        generations_today: 0,
        last_generation_date: today,
        tier: 'Free'
      });
    
    if (insertError) console.error('[UsageLimit] Insert error:', insertError);
    return { allowed: true, current: 0, limit: DAILY_GENERATION_LIMIT };
  }

  // Reset logic if it's a new day
  if (data.last_generation_date !== today) {
    const { error: resetError } = await supabase
      .from('usage_limits')
      .update({ 
        generations_today: 0, 
        last_generation_date: today 
      })
      .eq('user_id', userId);

    if (resetError) console.error('[UsageLimit] Reset error:', resetError);
    return { allowed: true, current: 0, limit: DAILY_GENERATION_LIMIT };
  }

  return {
    allowed: data.generations_today < DAILY_GENERATION_LIMIT,
    current: data.generations_today,
    limit: DAILY_GENERATION_LIMIT,
    tier: data.tier,
  };
}

/**
 * Atomic increment of the user's daily generation count.
 */
export async function incrementUsage(userId: string) {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase.rpc('increment_usage_count', { x_user_id: userId });
  
  if (error) {
    console.error('[UsageLimit] Increment RPC error:', error);
    // Manual fallback
    const { data } = await supabase
      .from('usage_limits')
      .select('generations_today')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      await supabase
        .from('usage_limits')
        .update({ generations_today: data.generations_today + 1 })
        .eq('user_id', userId);
    }
  }
}
