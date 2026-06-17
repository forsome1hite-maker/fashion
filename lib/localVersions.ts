/**
 * Mock 모드(DB 연결 전) 코디 변천사 영속화 유틸.
 * 인메모리 서버 스토어는 재시작/리로드 시 사라지므로,
 * 추가된 버전을 브라우저 localStorage 에 보관해 새로고침/페이지 이동에도 유지한다.
 * (Supabase 연결 시에는 API 응답(source: 'supabase')을 우선 사용)
 */

export type StoredImage = {
  id: string;
  postId: string;
  sequence: number;
  imageUrl: string;
  label: string;
  bgRemoved: boolean;
};

const key = (postId: string) => `ojirap:versions:${postId}`;

export function getLocalVersions(postId: string): StoredImage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key(postId));
    return raw ? (JSON.parse(raw) as StoredImage[]) : [];
  } catch {
    return [];
  }
}

export function addLocalVersion(postId: string, img: StoredImage) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalVersions(postId);
    list.push(img);
    window.localStorage.setItem(key(postId), JSON.stringify(list));
  } catch {
    /* 용량 초과 등 무시 */
  }
}

/* sequence 기준 병합 (중복 sequence 는 extra 가 덮어씀) + 정렬 */
export function mergeBySequence(
  base: StoredImage[],
  extra: StoredImage[]
): StoredImage[] {
  const map = new Map<number, StoredImage>();
  for (const i of base) map.set(i.sequence, i);
  for (const i of extra) map.set(i.sequence, i);
  return [...map.values()].sort((a, b) => a.sequence - b.sequence);
}
