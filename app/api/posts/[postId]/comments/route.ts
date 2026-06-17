import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { listComments, addComment } from '@/lib/mockStore';

export const runtime = 'nodejs';

/* 응답 DTO */
type CommentDTO = {
  id: string;
  postId: string;
  targetSequence: number | null;
  author: string;
  text: string;
  product: any | null;
  likes: number;
};

function rowToDTO(row: any): CommentDTO {
  return {
    id: row.id,
    postId: row.post_id,
    targetSequence: row.target_sequence ?? null,
    author: row.author_name,
    text: row.text ?? '',
    product: row.product ?? null,
    likes: row.likes ?? 0,
  };
}

/* ================================================================== */
/* GET /api/posts/[postId]/comments — 훈수 목록                         */
/* ================================================================== */

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      comments: (data ?? []).map(rowToDTO),
      source: 'supabase',
    });
  }

  return NextResponse.json({ comments: listComments(postId), source: 'mock' });
}

/* ================================================================== */
/* POST /api/posts/[postId]/comments — 훈수 등록                        */
/* body: { author, text, product?, targetSequence? }                   */
/*  targetSequence: 특정 코디 버전에 대한 피드백이면 그 sequence,        */
/*                  전체 코디에 대한 훈수면 null                         */
/* ================================================================== */

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const author: string = body?.author ?? '익명의 오지랖퍼';
  const text: string = (body?.text ?? '').toString();
  const product = body?.product ?? null;
  const targetSequence: number | null =
    typeof body?.targetSequence === 'number' ? body.targetSequence : null;

  if (!text.trim() && !product) {
    return NextResponse.json(
      { error: '댓글 내용이나 첨부 상품이 필요합니다.' },
      { status: 400 }
    );
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        target_sequence: targetSequence,
        author_name: author,
        text,
        product,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ comment: rowToDTO(data), source: 'supabase' });
  }

  // Mock 폴백
  const comment = addComment(postId, {
    targetSequence,
    author,
    text,
    product,
  });
  return NextResponse.json({ comment, source: 'mock' });
}
