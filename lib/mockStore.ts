/**
 * DB 연결 전(StackBlitz/로컬) sequence 발급용 인메모리 저장소.
 * 각 게시글은 최초 1장(원본, sequence=1)을 갖고 시작한다고 가정하고,
 * 새 코디가 추가될 때마다 sequence 를 1씩 증가시켜 반환한다.
 *
 * (개발 서버 모듈 스코프에 유지되므로 새로고침/재시작 시 초기화됨)
 */
const sequences = new Map<string, number>();

export function nextSequence(postId: string): number {
  const current = sequences.get(postId) ?? 1; // 원본(1)이 이미 있다고 가정
  const next = current + 1;
  sequences.set(postId, next);
  return next;
}
