import { getSupabaseAdmin } from '@/lib/supabase-server';

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export class ProfileService {
  private static supabase = getSupabaseAdmin();

  static async getProfile(username: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getProfileById(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async upsertProfile(id: string, profileData: Partial<Profile>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Kendinizi takip edemezsiniz');

    const { error } = await this.supabase
      .from('followers')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) throw error;

    // Increment counts
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

    if (error) throw error;

    // Decrement counts
    await this.supabase.rpc('decrement_follower_count', { user_id: followingId });
    await this.supabase.rpc('decrement_following_count', { user_id: followerId });

    return { success: true };
  }
}
