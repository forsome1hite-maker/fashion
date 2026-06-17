import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { removeBackground, extFor, bufferToDataUrl } from '@/lib/removebg';
import { listImages, addImage } from '@/lib/mockStore';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* 응답 DTO                                                            */
/* ------------------------------------------------------------------ */

type PostImageDTO = {
  id: string;
  postId: string;
  sequence: number;
  imageUrl: string;
  label: string;
  bgRemoved: boolean;
};

function labelFor(seq: number) {
  return seq === 1 ? '원본' : `ver.${seq}`;
}

function rowToDTO(row: any): PostImageDTO {
  return {
    id: row.id,
    postId: row.post_id,
    sequence: row.sequence,
    imageUrl: row.image_url,
    label: row.label ?? labelFor(row.sequence),
    bgRemoved: row.bg_removed,
  };
}

/* ================================================================== */
/* GET /api/posts/[postId]/images                                      */
/* 게시글의 코디 변천사(여러 버전)를 sequence 순으로 조회               */
/* ================================================================== */

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('post_images')
      .select('*')
      .eq('post_id', postId)
      .order('sequence', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      images: (data ?? []).map(rowToDTO),
      source: 'supabase',
    });
  }

  // Mock 모드: 인메모리 스토어(원본 시드 포함)에서 반환
  return NextResponse.json({ images: listImages(postId), source: 'mock' });
}

/* ================================================================== */
/* POST /api/posts/[postId]/images                                     */
/* '새로운 코디 추가 업로드' → Remove.bg 누끼 제거 → sequence++ 저장    */
/* body: { image: string(dataURL|httpURL), label?: string }            */
/* ================================================================== */

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'multipart/form-data 형식으로 전송해주세요.' },
      { status: 400 }
    );
  }

  const label: string | undefined = form.get('label')?.toString() || undefined;
  const file = form.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: '코디 사진 파일(file)이 필요합니다.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 1) 누끼 제거 (Remove.bg)
  let processed;
  try {
    processed = await removeBackground({ buffer, contentType: file.type });
  } catch (e: any) {
    return NextResponse.json(
      { error: `누끼 제거 실패: ${e?.message ?? e}` },
      { status: 502 }
    );
  }

  // 2) DB 연결 시: 다음 sequence 계산 → 스토리지 업로드 → post_images insert
  if (isSupabaseConfigured && supabaseAdmin) {
    // 현재 게시글의 가장 큰 sequence 를 찾아 +1
    const { data: maxRow } = await supabaseAdmin
      .from('post_images')
      .select('sequence')
      .eq('post_id', postId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    const seq = (maxRow?.sequence ?? 0) + 1;

    // 처리된 이미지를 Storage('coordi' 버킷)에 업로드 후 공개 URL 사용
    const path = `${postId}/${seq}.${extFor(processed.contentType)}`;
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

    const { data, error } = await supabaseAdmin
      .from('post_images')
      .insert({
        post_id: postId,
        sequence: seq,
        image_url: finalUrl,
        label: label ?? labelFor(seq),
        bg_removed: processed.bgRemoved,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ image: rowToDTO(data), source: 'supabase' });
  }

  // 3) Mock 폴백 — 인메모리 스토어에 적재 후 반환
  const img = addImage(postId, {
    imageUrl: bufferToDataUrl(processed.buffer, processed.contentType),
    bgRemoved: processed.bgRemoved,
    label,
  });
  return NextResponse.json({ image: img, source: 'mock' });
}
