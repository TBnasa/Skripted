import { getSupabaseAdmin } from '@/lib/supabase-server';
import { UserScriptSchema, UserScriptInput } from '@/types/schemas';
import { stripHtmlTags } from '@/lib/utils/sanitize';
import { StorageArchiver } from '@/lib/storage-archiver';
import { AppError } from '@/lib/errors';
import { extractCode } from '@/lib/utils/code-extractor';

interface ScriptRow {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  version: string;
  linked_session_id: string | null;
  updated_at: string;
  created_at: string;
}

export class UserScriptService {
  private static readonly supabase = getSupabaseAdmin();
  private static readonly TABLE_SCRIPTS = 'user_scripts';
  private static readonly TABLE_VERSIONS = 'user_script_versions';
  private static readonly TABLE_CHAT = 'chat_history';

  static async getUserScripts(userId: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_SCRIPTS)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw AppError.internal('Failed to fetch user scripts', error);
    
    const hydratedList = (await StorageArchiver.hydrateObject(data)) as ScriptRow[];
    
    // Batch fetch assistant content for linked sessions (Performance: Avoid N+1 queries)
    const sessionIds = hydratedList
      .filter((s) => s.linked_session_id && !s.content)
      .map((s) => s.linked_session_id as string);

    if (sessionIds.length > 0) {
      const { data: chatData, error: chatError } = await this.supabase
        .from(this.TABLE_CHAT)
        .select('session_id, content, created_at')
        .in('session_id', sessionIds)
        .eq('role', 'assistant')
        .order('created_at', { ascending: false });

      if (chatError) throw AppError.internal('Failed to fetch linked chat history', chatError);

      // Create a map of latest assistant content per session
      const contentMap = new Map<string, string>();
      chatData?.forEach((row: { session_id: string; content: string }) => {
        if (!contentMap.has(row.session_id)) {
          contentMap.set(row.session_id, extractCode(row.content));
        }
      });

      // Hydrate scripts with mapped content
      for (const script of hydratedList) {
        if (script.linked_session_id && !script.content) {
          script.content = contentMap.get(script.linked_session_id) || '';
        }
      }
    }

    return hydratedList;
  }

  static async getScriptById(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from(this.TABLE_SCRIPTS)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw AppError.internal(`Script not found: ${id}`, error);
    
    const hydrated = await StorageArchiver.hydrateObject(data);

    if (hydrated.linked_session_id && !hydrated.content) {
      const { data: chatData, error: chatError } = await this.supabase
        .from(this.TABLE_CHAT)
        .select('content')
        .eq('session_id', hydrated.linked_session_id)
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!chatError && chatData) {
        hydrated.content = extractCode(chatData.content);
      }
    }

    return hydrated;
  }

  static async createScript(userId: string, scriptData: UserScriptInput) {
    const validated = this.validateData(UserScriptSchema, scriptData);
    const sanitizedTitle = stripHtmlTags(validated.title);

    // Performance: Only archive if content is actually large
    const archivedContent = validated.content 
      ? await StorageArchiver.archiveIfLarge(validated.content, 'scripts') 
      : null;

    const { data, error } = await this.supabase
      .from(this.TABLE_SCRIPTS)
      .insert({
        user_id: userId,
        title: sanitizedTitle,
        content: archivedContent,
        version: validated.version || '1.0.0',
        linked_session_id: validated.linked_session_id || null,
      })
      .select()
      .single();

    if (error) throw AppError.internal('Failed to create script', error);
    return data;
  }

  static async updateScript(id: string, userId: string, updateData: Partial<UserScriptInput>) {
    const validated = this.validateData(UserScriptSchema.partial(), updateData);

    // Verify ownership and existence
    await this.getScriptById(id, userId);

    const updatePayload: any = { ...validated, updated_at: new Date().toISOString() };

    if (validated.title) {
      updatePayload.title = stripHtmlTags(validated.title);
    }

    if (validated.content) {
      updatePayload.content = await StorageArchiver.archiveIfLarge(validated.content, 'scripts');
    }

    const { data, error } = await this.supabase
      .from(this.TABLE_SCRIPTS)
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw AppError.internal('Failed to update script', error);

    // Create a version snapshot asynchronously
    this.createVersionSnapshot(id, data.content).catch(err => 
      console.error('[UserScriptService] Snapshot failed:', err)
    );

    return data;
  }

  static async deleteScript(id: string, userId: string) {
    const { error } = await this.supabase
      .from(this.TABLE_SCRIPTS)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw AppError.internal('Failed to delete script', error);
    return { success: true };
  }

  /**
   * Private helper to validate data against a schema.
   */
  private static validateData<T>(schema: any, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw AppError.validation(result.error.issues[0].message);
    }
    return result.data as T;
  }

  /**
   * Private helper to handle versioning without blocking the main flow.
   */
  private static async createVersionSnapshot(scriptId: string, content: string) {
    await this.supabase
      .from(this.TABLE_VERSIONS)
      .insert({ script_id: scriptId, content });
  }
}
