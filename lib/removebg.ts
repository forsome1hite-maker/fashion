/**
 * Remove.bg 누끼(배경) 제거 래퍼.
 *  · REMOVEBG_API_KEY 가 있으면 실제 API 호출 → 배경 제거된 PNG 버퍼 반환
 *  · 키가 없으면 Mock 모드: 원본 이미지를 그대로 통과시켜 동작만 확인
 *
 * 입력(image): data URL(data:image/...;base64,...) 또는 http(s) 이미지 URL
 */

export type RemoveBgResult = {
  imageUrl: string; // 결과 이미지 (data URL 또는 원본 URL)
  bgRemoved: boolean; // 실제로 누끼 처리가 됐는지
  buffer?: Buffer; // 실제 처리된 PNG 바이너리 (스토리지 업로드용)
};

export async function removeBackground(image: string): Promise<RemoveBgResult> {
  const apiKey = process.env.REMOVEBG_API_KEY;

  // --- Mock 모드: 키가 없으면 원본을 그대로 반환 ---
  if (!apiKey) {
    return { imageUrl: image, bgRemoved: false };
  }

  // --- 실제 Remove.bg 호출 ---
  const form = new FormData();
  form.append('size', 'auto');

  if (image.startsWith('data:')) {
    // data URL → Blob
    const [meta, b64] = image.split(',');
    const mime = meta.match(/data:(.*?);base64/)?.[1] ?? 'image/png';
    const bytes = Buffer.from(b64, 'base64');
    form.append('image_file', new Blob([bytes], { type: mime }), 'upload.png');
  } else {
    // 원격 이미지 URL
    form.append('image_url', image);
  }

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
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

  return { imageUrl: dataUrl, bgRemoved: true, buffer };
}
