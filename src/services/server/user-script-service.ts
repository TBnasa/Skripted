import { getSupabaseAdmin } from '@/lib/supabase-server';
import { UserScriptSchema } from '@/types/schemas';
import { stripHtmlTags } from '@/lib/utils/sanitize';
import { StorageArchiver } from '@/lib/storage-archiver';

export class UserScriptService {
  private static supabase = getSupabaseAdmin();

  static async getUserScripts(userId: string) {
    const { data, error } = await this.supabase
      .from('user_scripts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    const hydratedList = await StorageArchiver.hydrateObject(data);

    for (const script of hydratedList) {
      if (script.linked_session_id && !script.content) {
        const { data: chatData } = await this.supabase
          .from('chat_history')
          .select('content')
          .eq('session_id', script.linked_session_id)
          .eq('role', 'assistant')
          .order('created_at', { ascending: false })
          .limit(1);

        if (chatData && chatData.length > 0) {
          const match = chatData[0].content.match(/```(?:skript)?\n([\s\S]*?)```/);
          script.content = match ? match[1].trim() : '';
        }
      }
    }

    return hydratedList;
  }

  static async getScriptById(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('user_scripts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    const hydrated = await StorageArchiver.hydrateObject(data);

    if (hydrated.linked_session_id) {
      const { data: chatData } = await this.supabase
        .from('chat_history')
        .select('content')
        .eq('session_id', hydrated.linked_session_id)
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1);

      if (chatData && chatData.length > 0) {
        const match = chatData[0].content.match(/```(?:skript)?\n([\s\S]*?)```/);
        hydrated.content = match ? match[1].trim() : '';
      }
    }

    return hydrated;
  }

  static async createScript(userId: string, scriptData: any) {
    const validation = UserScriptSchema.safeParse(scriptData);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const { title, content, version, linked_session_id } = validation.data;
    const sanitizedTitle = stripHtmlTags(title);

    // Archive large code to storage
    const archivedContent = content ? await StorageArchiver.archiveIfLarge(content, 'scripts') : null;

    const { data, error } = await this.supabase
      .from('user_scripts')
      .insert({
        user_id: userId,
        title: sanitizedTitle,
        content: archivedContent,
        version: version || '1.0.0',
        linked_session_id: linked_session_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateScript(id: string, userId: string, updateData: any) {
    const validation = UserScriptSchema.partial().safeParse(updateData);
    if (!validation.success) {
      throw new Error('Invalid update data');
    }

    // Verify ownership
    await this.getScriptById(id, userId);

    if (validation.data.title) {
      validation.data.title = stripHtmlTags(validation.data.title);
    }

    if (validation.data.content) {
      validation.data.content = await StorageArchiver.archiveIfLarge(validation.data.content, 'scripts');
    }

    const { data, error } = await this.supabase
      .from('user_scripts')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Create a version snapshot
    try {
      // Version content is already archived if data.content became a reference
      await this.supabase
        .from('user_script_versions')
        .insert({
          script_id: id,
          content: data.content,
        });
    } catch (versionErr) {
      console.error('[UserScriptService] Failed to save version:', versionErr);
    }

    return data;
  }

  static async deleteScript(id: string, userId: string) {
    const { error } = await this.supabase
      .from('user_scripts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
}
