import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_POSTS } from '@/lib/mockData';

export const runtime = 'nodejs';

/* GET /api/posts/[postId] — 게시글 메타 단건 조회 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({
      post: {
        id: data.id,
        user: data.author_name,
        handle: data.handle,
        avatar: data.avatar,
        tpo: data.tpo,
        category: data.category,
        urgency: data.urgency,
        question: data.question,
      },
      source: 'supabase',
    });
  }

  // Mock 폴백
  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (!post) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json({ post, source: 'mock' });
}
