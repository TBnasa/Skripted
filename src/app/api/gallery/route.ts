import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { GalleryPostSchema } from '@/types/schemas';

// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    // Parse pagination (if any)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter');
    const categoryQuery = searchParams.get('category');

    let query = supabase
      .from('gallery_posts')
      .select('id, user_id, author_name, title, description, image_urls, likes_count, downloads_count, created_at, is_public, category, tags');

    if (filter === 'mine') {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Bu işlem için giriş yapmalısınız' }, { status: 401 });
      }
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }

    if (categoryQuery && categoryQuery !== 'All') {
      query = query.eq('category', categoryQuery);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Gallery GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Gallery GET] Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.json();
    const result = GalleryPostSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { title, description, codeSnippet, imageUrls, category, tags } = result.data;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('gallery_posts')
      .insert({
        user_id: userId,
        author_name: user.username || user.firstName || 'Anonymous',
        title,
        description: description || null,
        code_snippet: codeSnippet,
        image_urls: imageUrls || [],
        category: category || 'Other',
        tags: tags || [],
        is_public: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Gallery POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Gallery POST] Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
