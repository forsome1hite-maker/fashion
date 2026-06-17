/**
 * Remove.bg 누끼(배경) 제거 래퍼 — 바이너리(Buffer) 입력 기반.
 *  · REMOVEBG_API_KEY 가 있으면 실제 API 호출 → 배경 제거된 PNG 버퍼 반환
 *  · 키가 없으면 Mock 모드: 원본 버퍼를 그대로 통과
 */

export type RemoveBgResult = {
  buffer: Buffer; // 결과 이미지 바이너리 (Storage 업로드용)
  contentType: string;
  bgRemoved: boolean; // 실제로 누끼 처리가 됐는지
};

export async function removeBackground(input: {
  buffer: Buffer;
  contentType: string;
}): Promise<RemoveBgResult> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  const contentType = input.contentType || 'image/png';

  // --- Mock 모드: 키가 없으면 원본 버퍼를 그대로 반환 ---
  if (!apiKey) {
    return { buffer: input.buffer, contentType, bgRemoved: false };
  }

  // --- 실제 Remove.bg 호출 (multipart) ---
  const form = new FormData();
  form.append('size', 'auto');
  form.append(
    'image_file',
    new Blob([new Uint8Array(input.buffer)], { type: contentType }),
    'upload'
  );

  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Remove.bg ${res.status}: ${detail.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType: 'image/png', bgRemoved: true };
}

/* contentType → 파일 확장자 */
export function extFor(contentType: string): string {
  if (contentType === 'image/jpeg') return 'jpg';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/gif') return 'gif';
  return 'png';
}

/* 버퍼 → data URL (Mock 모드 표시용) */
export function bufferToDataUrl(buffer: Buffer, contentType: string): string {
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}
