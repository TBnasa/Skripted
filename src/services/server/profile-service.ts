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

    // Atomic: single RPC handles insert + count increments
    const { error } = await this.supabase.rpc('follow_user', {
      p_follower_id: followerId,
      p_following_id: followingId,
    });

    if (error) {
      throw AppError.internal('Failed to follow user', error);
    }

    return { success: true };
  }

  static async unfollowUser(followerId: string, followingId: string) {
    // Atomic: single RPC handles delete + count decrements
    const { error } = await this.supabase.rpc('unfollow_user', {
      p_follower_id: followerId,
      p_following_id: followingId,
    });

    if (error) {
      throw AppError.internal('Failed to unfollow user', error);
    }

    return { success: true };
  }
}
