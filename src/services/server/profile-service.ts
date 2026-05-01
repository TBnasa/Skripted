import { getSupabaseAdmin } from '@/lib/supabase-server';
import { AppError } from '@/lib/errors';
import { ProfileUpdateInput } from '@/types/schemas';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export class ProfileService {
  private static readonly supabase = getSupabaseAdmin();
  private static readonly TABLE_PROFILES = 'profiles';

  static async getProfile(username: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_PROFILES)
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw AppError.internal('Failed to fetch profile', error);
    }
    return data;
  }

  static async getProfileById(id: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_PROFILES)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw AppError.internal('Failed to fetch profile by ID', error);
    }
    return data;
  }

  /**
   * Securely upserts a profile using whitelisted fields.
   */
  static async upsertProfile(id: string, profileData: ProfileUpdateInput) {
    // Whitelisting (Security: Mass Assignment Mitigation)
    const { username, full_name, bio, avatar_url } = profileData;

    const { data, error } = await this.supabase
      .from(this.TABLE_PROFILES)
      .upsert({
        id,
        username,
        full_name,
        bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw AppError.internal('Failed to upsert profile', error);
    }
    return data;
  }

  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw AppError.validation('Kendinizi takip edemezsiniz');
    }

    const { error } = await this.supabase
      .from('followers')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      if (error.code === '23505') return { success: true }; // Already following
      throw AppError.internal('Failed to follow user', error);
    }

    // Increment counts (RPCs should be idempotent or handled by DB triggers in production)
    await this.supabase.rpc('increment_follower_count', { user_id: followingId });
    await this.supabase.rpc('increment_following_count', { user_id: followerId });

    return { success: true };
  }

  static async unfollowUser(followerId: string, followingId: string) {
    const { error } = await this.supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      throw AppError.internal('Failed to unfollow user', error);
    }

    // Decrement counts
    await this.supabase.rpc('decrement_follower_count', { user_id: followingId });
    await this.supabase.rpc('decrement_following_count', { user_id: followerId });

    return { success: true };
  }
}
