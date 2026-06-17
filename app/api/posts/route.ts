import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { removeBackground, extFor, bufferToDataUrl } from '@/lib/removebg';
import {
  listPosts,
  addPost,
  listImages,
  addImage,
  listComments,
} from '@/lib/mockStore';

export const runtime = 'nodejs';

/* 피드 카드용 Feed DTO */
type FeedDTO = {
  id: string;
  user: string;
  handle: string;
  avatar: string;
  tpo: string;
  category: string;
  urgency: 'critical' | 'warning' | 'normal';
  question: string;
  advisors: number;
  likes: number;
  versions: {
    sequence: number;
    image: string;
    label: string;
    bgRemoved: boolean;
  }[];
  comments: {
    id: string;
    user: string;
    text: string;
    likes: number;
    liked: boolean;
    product: any | null;
    targetSequence: number | null;
  }[];
};

const DEFAULT_AVATAR = 'https://i.pravatar.cc/100?img=12';

/* ================================================================== */
/* GET /api/posts — 피드(게시글 + 변천사 + 훈수) 목록                    */
/* ================================================================== */

export async function GET() {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ids = (posts ?? []).map((p) => p.id);
    const [{ data: images }, { data: comments }] = await Promise.all([
      supabaseAdmin
        .from('post_images')
        .select('*')
        .in('post_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
        .order('sequence', { ascending: true }),
      supabaseAdmin
        .from('comments')
        .select('*')
        .in('post_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: true }),
    ]);

    const feeds: FeedDTO[] = (posts ?? []).map((p) => {
      const imgs = (images ?? []).filter((i) => i.post_id === p.id);
      const cmts = (comments ?? []).filter((c) => c.post_id === p.id);
      return {
        id: p.id,
        user: p.author_name,
        handle: p.handle ?? '',
        avatar: p.avatar ?? DEFAULT_AVATAR,
        tpo: p.tpo ?? '',
        category: p.category ?? '',
        urgency: p.urgency ?? 'normal',
        question: p.question,
        advisors: cmts.length,
        likes: 0,
        versions: imgs.map((i) => ({
          sequence: i.sequence,
          image: i.image_url,
          label: i.label ?? `ver.${i.sequence}`,
          bgRemoved: i.bg_removed,
        })),
        comments: cmts.map((c) => ({
          id: c.id,
          user: c.author_name,
          text: c.text ?? '',
          likes: c.likes ?? 0,
          liked: false,
          product: c.product ?? null,
          targetSequence: c.target_sequence ?? null,
        })),
      };
    });

    return NextResponse.json({ feeds, source: 'supabase' });
  }

  // Mock 폴백
  const feeds: FeedDTO[] = listPosts().map((p) => {
    const imgs = listImages(p.id);
    const cmts = listComments(p.id);
    return {
      id: p.id,
      user: p.user,
      handle: p.handle,
      avatar: p.avatar,
      tpo: p.tpo,
      category: p.category,
      urgency: p.urgency,
      question: p.question,
      advisors: cmts.length,
      likes: 0,
      versions: imgs.map((i) => ({
        sequence: i.sequence,
        image: i.imageUrl,
        label: i.label,
        bgRemoved: i.bgRemoved,
      })),
      comments: cmts.map((c) => ({
        id: c.id,
        user: c.author,
        text: c.text,
        likes: c.likes,
        liked: false,
        product: c.product,
        targetSequence: c.targetSequence,
      })),
    };
  });

  return NextResponse.json({ feeds, source: 'mock' });
}

/* ================================================================== */
/* POST /api/posts — 새 착샷(게시글 + 첫 코디 이미지) 등록              */
/* body: { author, handle?, avatar?, tpo, category, urgency, question,  */
/*         image(dataURL) }                                             */
/* ================================================================== */

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'multipart/form-data 형식으로 전송해주세요.' },
      { status: 400 }
    );
  }

  const author = (form.get('author')?.toString() ?? '').trim() || '익명의 패션테러리스트';
  const handle = form.get('handle')?.toString() ?? '';
  const avatar = form.get('avatar')?.toString() || DEFAULT_AVATAR;
  const tpo = form.get('tpo')?.toString() ?? '';
  const category = form.get('category')?.toString() ?? '';
  const urgencyRaw = form.get('urgency')?.toString() ?? 'normal';
  const urgency: 'critical' | 'warning' | 'normal' = [
    'critical',
    'warning',
    'normal',
  ].includes(urgencyRaw)
    ? (urgencyRaw as any)
    : 'normal';
  const question = (form.get('question')?.toString() ?? '').trim();
  const file = form.get('file');

  if (!question) {
    return NextResponse.json({ error: '질문 내용을 입력해주세요.' }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: '코디 사진을 첨부해주세요.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 누끼 제거 (키 없으면 통과)
  let processed;
  try {
    processed = await removeBackground({ buffer, contentType: file.type });
  } catch (e: any) {
    return NextResponse.json(
      { error: `누끼 제거 실패: ${e?.message ?? e}` },
      { status: 502 }
    );
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    // 1) 게시글 insert
    const { data: post, error: pErr } = await supabaseAdmin
      .from('posts')
      .insert({ author_name: author, handle, avatar, tpo, category, urgency, question })
      .select()
      .single();

    if (pErr || !post) {
      return NextResponse.json(
        { error: pErr?.message ?? '게시글 저장 실패' },
        { status: 500 }
      );
    }

    // 2) 첫 이미지 Storage 업로드 후 공개 URL
    const path = `${post.id}/1.${extFor(processed.contentType)}`;
    const up = await supabaseAdmin.storage
      .from('coordi')
      .upload(path, processed.buffer, {
        contentType: processed.contentType,
        upsert: true,
      });
    if (up.error) {
      return NextResponse.json({ error: up.error.message }, { status: 500 });
    }
    const finalUrl = supabaseAdmin.storage.from('coordi').getPublicUrl(path).data
      .publicUrl;

    const { error: iErr } = await supabaseAdmin.from('post_images').insert({
      post_id: post.id,
      sequence: 1,
      image_url: finalUrl,
      label: '원본',
      bg_removed: processed.bgRemoved,
    });

    if (iErr) {
      return NextResponse.json({ error: iErr.message }, { status: 500 });
    }

    return NextResponse.json({ postId: post.id, source: 'supabase' });
  }

  // Mock 폴백
  const post = addPost({ user: author, handle, avatar, tpo, category, urgency, question });
  addImage(post.id, {
    imageUrl: bufferToDataUrl(processed.buffer, processed.contentType),
    bgRemoved: processed.bgRemoved,
    label: '원본',
  });
  return NextResponse.json({ postId: post.id, source: 'mock' });
}
