import { SEED_IMAGES, MOCK_POSTS, MockPost } from './mockData';

/**
 * DB 연결 전(StackBlitz/로컬) 코디 변천사 인메모리 저장소.
 * 각 게시글은 최초 1장(원본, sequence=1)을 시드로 갖고 시작하며,
 * 새 코디가 추가될 때마다 sequence 를 1씩 증가시켜 적재한다.
 *
 * (개발 서버 모듈 스코프에 유지 → 서버 재시작 시 초기화됨)
 */

export type MockImage = {
  id: string;
  postId: string;
  sequence: number;
  imageUrl: string;
  label: string;
  bgRemoved: boolean;
};

const store = new Map<string, MockImage[]>();

function labelFor(seq: number) {
  return seq === 1 ? '원본' : `ver.${seq}`;
}

/* 최초 조회 시 변천사 시드로 초기화 (원본 + 코칭본들) */
function ensure(postId: string): MockImage[] {
  if (!store.has(postId)) {
    const seed = SEED_IMAGES[postId] ?? [];
    store.set(
      postId,
      seed.map((s, i) => ({
        id: `${postId}-${i + 1}`,
        postId,
        sequence: i + 1,
        imageUrl: s.image,
        label: s.label ?? labelFor(i + 1),
        bgRemoved: true,
      }))
    );
  }
  return store.get(postId) as MockImage[];
}

export function listImages(postId: string): MockImage[] {
  return ensure(postId);
}

export function addImage(
  postId: string,
  rec: { imageUrl: string; bgRemoved: boolean; label?: string }
): MockImage {
  const list = ensure(postId);
  const seq = (list.length ? list[list.length - 1].sequence : 0) + 1;
  const img: MockImage = {
    id: `${postId}-${seq}`,
    postId,
    sequence: seq,
    imageUrl: rec.imageUrl,
    label: rec.label ?? labelFor(seq),
    bgRemoved: rec.bgRemoved,
  };
  list.push(img);
  return img;
}

/* ------------------------------------------------------------------ */
/* 훈수(댓글) 인메모리 저장소                                            */
/* ------------------------------------------------------------------ */

export type MockComment = {
  id: string;
  postId: string;
  targetSequence: number | null; // 어떤 코디 버전에 대한 피드백인지
  author: string;
  text: string;
  product: any | null;
  likes: number;
};

const commentStore = new Map<string, MockComment[]>();
let commentCounter = 0;

/* ------------------------------------------------------------------ */
/* 게시글 인메모리 저장소 (Mock 모드에서 새 글 작성 지원)                 */
/* ------------------------------------------------------------------ */

const createdPosts: MockPost[] = [];
let postCounter = 0;

export function listPosts(): MockPost[] {
  return [...createdPosts, ...MOCK_POSTS]; // 새 글이 위로
}

export function addPost(p: Omit<MockPost, 'id'>): MockPost {
  postCounter += 1;
  const post: MockPost = { id: `new-${postCounter}`, ...p };
  createdPosts.unshift(post);
  return post;
}

export function listComments(postId: string): MockComment[] {
  return commentStore.get(postId) ?? [];
}

export function addComment(
  postId: string,
  rec: {
    targetSequence: number | null;
    author: string;
    text: string;
    product?: any;
  }
): MockComment {
  const list = commentStore.get(postId) ?? [];
  commentCounter += 1;
  const comment: MockComment = {
    id: `${postId}-c${commentCounter}`,
    postId,
    targetSequence: rec.targetSequence ?? null,
    author: rec.author,
    text: rec.text,
    product: rec.product ?? null,
    likes: 0,
  };
  list.push(comment);
  commentStore.set(postId, list);
  return comment;
}
