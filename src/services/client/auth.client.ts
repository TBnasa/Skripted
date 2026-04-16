import { createClient } from '@/lib/supabase-browser';
import { APP_URL } from '@/lib/constants';

export class AuthClientService {
  static async signInWithGitHub() {
    const supabase = createClient();
    return await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
  }
}
