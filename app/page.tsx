'use client';

import { useState } from 'react';
import {
  Flame,
  Eye,
  Coins,
  MessageCircleMore,
  Hand,
  Trophy,
  Crown,
  Medal,
  Sparkles,
  TrendingUp,
  Search,
  Bell,
  Heart,
  Send,
  ShoppingBag,
  X,
  Loader2,
  ExternalLink,
  Tag,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 타입                                                                 */
/* ------------------------------------------------------------------ */

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  link: string;
  mall: string;
};

type Comment = {
  id: number;
  user: string;
  text: string;
  likes: number;
  liked: boolean;
  product?: Product; // 첨부된 추천 상품
};

type Feed = {
  id: number;
  user: string;
  handle: string;
  avatar: string;
  outfit: string;
  tpo: string;
  category: string; // 필터용 (소개팅/첫출근/결혼식)
  urgency: 'critical' | 'warning' | 'normal';
  question: string;
  advisors: number;
  likes: number;
  comments: Comment[];
};

/* ------------------------------------------------------------------ */
/* 현재 로그인한 유저 (DB 연결 전 더미)                                  */
/* ------------------------------------------------------------------ */

const CURRENT_USER = {
  name: '압구정 매의 눈',
  avatar: 'https://i.pravatar.cc/100?img=58',
};

/* ------------------------------------------------------------------ */
/* 더미 데이터                                                          */
/* ------------------------------------------------------------------ */

const FEEDS: Feed[] = [
  {
    id: 1,
    user: '소개팅뉴비',
    handle: '@blind_date_99',
    avatar: 'https://i.pravatar.cc/100?img=11',
    outfit: '/pic/cho.png',
    tpo: '🚨 소개팅 D-1',
    category: '소개팅',
    urgency: 'critical',
    question: '내일 첫 소개팅인데 이 핏 어떤가요? 너무 과한가요...?',
    advisors: 42,
    likes: 318,
    comments: [
      {
        id: 1,
        user: '청담동패션장인',
        text: '소개팅에 풀정장은 과해요! 셔츠 단추 하나 풀고 니트 하나 걸치면 부담 확 줄어요 🔥',
        likes: 24,
        liked: false,
      },
      {
        id: 2,
        user: '핏의정석',
        text: '구두는 합격. 근데 벨트랑 색 맞추면 점수 +10점!',
        likes: 11,
        liked: false,
      },
    ],
  },
  {
    id: 2,
    user: '월요병환자',
    handle: '@new_comer',
    avatar: 'https://i.pravatar.cc/100?img=32',
    outfit: '/pic/KCM.png',
    tpo: '⚠️ 첫출근 긴급',
    category: '첫출근',
    urgency: 'warning',
    question: '스타트업 첫 출근룩이요. 캐주얼인데 너무 풀어진 느낌일까요?',
    advisors: 27,
    likes: 204,
    comments: [
      {
        id: 1,
        user: '무신사털이범',
        text: '첫날부터 비니는 좀... 깔끔한 셔츠 하나만 걸쳐도 인상 확 달라져요',
        likes: 18,
        liked: false,
      },
    ],
  },
  {
    id: 3,
    user: '결혼식하객',
    handle: '@guest_look',
    avatar: 'https://i.pravatar.cc/100?img=45',
    outfit: '/pic/woman1.png',
    tpo: '💍 친구 결혼식 D-3',
    category: '결혼식',
    urgency: 'normal',
    question: '하객룩인데 신부보다 튀면 안 되겠죠? 컬러 톤 봐주세요!',
    advisors: 15,
    likes: 142,
    comments: [
      {
        id: 1,
        user: '컬러닥터',
        text: '화이트 블라우스는 신부랑 겹쳐요! 베이지나 톤다운 컬러 추천 💄',
        likes: 31,
        liked: false,
      },
    ],
  },
];

const RANKING = [
  { rank: 1, name: '청담동패션장인', point: 9820, badge: '🥇', tier: '레전드 스타일리스트' },
  { rank: 2, name: '무신사털이범', point: 8640, badge: '🥈', tier: '신상 큐레이터' },
  { rank: 3, name: '핏의정석', point: 7510, badge: '🥉', tier: '비율 마법사' },
  { rank: 4, name: '오지랖끝판왕', point: 6230, badge: '4', tier: '훈수 마스터' },
  { rank: 5, name: '컬러닥터', point: 5870, badge: '5', tier: '퍼스널컬러 박사' },
];

/* 필터 버튼 목록 */
const FILTERS = ['전체', '소개팅', '첫출근', '결혼식'];

/* 긴급도 배지 스타일 */
const URGENCY_STYLE: Record<Feed['urgency'], string> = {
  critical:
    'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/40 animate-pulse',
  warning:
    'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-500/40',
  normal: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/40',
};

/* ================================================================== */
/* 상품 검색 모달                                                       */
/* ================================================================== */

function ProductSearchModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (p: Product) => void;
}) {
  const [query, setQuery] = useState('검정 슬랙스');
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [source, setSource] = useState<'mock' | 'naver' | null>(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setSource(data.source ?? null);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-4 text-white">
          <h3 className="flex items-center gap-2 text-base font-black">
            <ShoppingBag size={18} /> 추천 상품 검색
          </h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <X size={18} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="flex gap-2 p-4">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-2 ring-1 ring-transparent focus-within:bg-white focus-within:ring-fuchsia-300">
            <Search size={16} className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="예) 검정 슬랙스, 니트, 구두..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={search}
            className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-2 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95"
          >
            검색
          </button>
        </div>

        {/* 결과 영역 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 size={28} className="animate-spin text-fuchsia-500" />
              <p className="text-sm">상품을 찾는 중...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              {searched
                ? '검색 결과가 없어요 🥲 다른 키워드로 시도해보세요.'
                : '검색어를 입력하고 상품을 찾아보세요!'}
            </div>
          ) : (
            <>
              {source === 'mock' && (
                <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-600">
                  ⚙️ 현재 Mock 데이터로 표시 중 · 네이버 API 키 등록 시 실제 검색
                  결과로 전환됩니다
                </p>
              )}
              <ul className="space-y-2">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl p-2 ring-1 ring-slate-100 transition hover:bg-fuchsia-50/60 hover:ring-fuchsia-200"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-400">{p.mall}</p>
                      <p className="text-sm font-black text-fuchsia-600">
                        {p.price.toLocaleString()}원
                      </p>
                    </div>
                    <button
                      onClick={() => onSelect(p)}
                      className="shrink-0 rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-fuchsia-600 active:scale-95"
                    >
                      선택
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 피드 카드 (카드별 댓글 State를 독립적으로 보유)                       */
/* ================================================================== */

function FeedCard({ feed }: { feed: Feed }) {
  const [comments, setComments] = useState<Comment[]>(feed.comments);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false); // 댓글 패널 열림 여부
  const [modalOpen, setModalOpen] = useState(false); // 상품 검색 모달
  const [attached, setAttached] = useState<Product | null>(null); // 첨부된 상품

  /* ① 댓글 추가 (첨부 상품 포함) */
  const addComment = () => {
    const text = input.trim();
    if (!text && !attached) return;
    setComments((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        user: CURRENT_USER.name,
        text,
        likes: 0,
        liked: false,
        product: attached ?? undefined,
      },
    ]);
    setInput('');
    setAttached(null);
  };

  /* ② 댓글 좋아요 토글 */
  const toggleLike = (commentId: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
          : c
      )
    );
  };

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 transition hover:shadow-2xl hover:shadow-fuchsia-200/50">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-3">
          <img
            src={feed.avatar}
            alt={feed.user}
            className="h-10 w-10 rounded-full ring-2 ring-fuchsia-200 object-cover"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold">{feed.user}</p>
            <p className="text-xs text-slate-400">{feed.handle}</p>
          </div>
        </div>

        {/* TPO 긴급도 배지 */}
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-extrabold shadow-lg ${URGENCY_STYLE[feed.urgency]}`}
        >
          {feed.tpo}
        </span>
      </div>

      {/* 질문 텍스트 */}
      <p className="px-5 pt-3 text-[15px] font-semibold text-slate-700">
        “{feed.question}”
      </p>

      {/* 누끼 코디 이미지 */}
      <div className="relative mt-4 mx-5 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <img
          src={feed.outfit}
          alt="코디 착샷"
          className="mx-auto h-96 w-auto max-w-full object-contain py-2 transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          📸 누끼 자동 처리됨
        </span>
      </div>

      {/* 카드 푸터 */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-fuchsia-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
            </span>
            <MessageCircleMore size={16} />
            현재 {feed.advisors + comments.length - feed.comments.length}명의 오지랖퍼가 훈수 중
          </span>
          <span className="hidden sm:flex items-center gap-1 text-slate-400">
            <Heart size={15} /> {feed.likes}
          </span>
        </div>

        {/* ③ 훈수 두기 → 댓글 패널 토글 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 ${
            open
              ? 'bg-slate-100 text-slate-600 shadow-slate-200'
              : 'bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white shadow-fuchsia-500/30'
          }`}
        >
          <Hand size={16} />
          {open ? '닫기' : '나도 훈수 두기'}
        </button>
      </div>

      {/* ===== 댓글 패널 ===== */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          {/* 댓글 입력창 */}
          <div className="flex items-start gap-2">
            <img
              src={CURRENT_USER.avatar}
              alt="나"
              className="h-9 w-9 rounded-full ring-2 ring-violet-200 object-cover"
            />
            <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-fuchsia-300">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addComment();
                  }
                }}
                rows={2}
                placeholder="따뜻한 팩폭 한마디 남겨주세요... (추천템은 상품 검색으로 첨부 🛍️)"
                className="max-h-32 w-full resize-none bg-transparent px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />

              {/* 첨부된 상품 미리보기 */}
              {attached && (
                <div className="flex items-center gap-2 rounded-xl bg-fuchsia-50 p-2 ring-1 ring-fuchsia-200">
                  <img
                    src={attached.image}
                    alt={attached.title}
                    className="h-10 w-10 shrink-0 rounded-lg bg-white object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {attached.title}
                    </p>
                    <p className="text-xs font-black text-fuchsia-600">
                      {attached.price.toLocaleString()}원
                    </p>
                  </div>
                  <button
                    onClick={() => setAttached(null)}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* 액션 버튼 줄 */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
                >
                  <ShoppingBag size={14} />
                  상품 검색
                </button>
                <button
                  onClick={addComment}
                  disabled={!input.trim() && !attached}
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send size={14} />
                  훈수 두기
                </button>
              </div>
            </div>
          </div>

          {/* 댓글 리스트 */}
          <ul className="mt-4 space-y-3">
            {comments.length === 0 && (
              <li className="py-4 text-center text-sm text-slate-400">
                아직 훈수가 없어요. 첫 오지랖의 주인공이 되어보세요! 👀
              </li>
            )}
            {comments.map((c) => {
              const isMine = c.user === CURRENT_USER.name;
              return (
                <li key={c.id} className="flex items-start gap-2.5">
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      isMine
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-fuchsia-100 text-fuchsia-600'
                    }`}
                  >
                    {c.user.slice(0, 2)}
                  </div>

                  <div className="flex-1">
                    <div className="inline-block max-w-full rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        {c.user}
                        {isMine && (
                          <span className="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
                            나
                          </span>
                        )}
                      </p>
                      {c.text && (
                        <p className="mt-0.5 text-sm text-slate-700">{c.text}</p>
                      )}

                      {/* 첨부된 추천 상품 카드 */}
                      {c.product && (
                        <a
                          href={c.product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-50 to-rose-50 p-2 ring-1 ring-fuchsia-200 transition hover:ring-fuchsia-400"
                        >
                          <img
                            src={c.product.image}
                            alt={c.product.title}
                            className="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1 text-[10px] font-bold text-fuchsia-500">
                              <Tag size={10} /> 추천 상품
                            </p>
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {c.product.title}
                            </p>
                            <p className="text-xs font-black text-fuchsia-600">
                              {c.product.price.toLocaleString()}원
                            </p>
                          </div>
                          <ExternalLink
                            size={14}
                            className="shrink-0 text-slate-400"
                          />
                        </a>
                      )}
                    </div>

                    {/* 좋아요(매의 눈 추천) 버튼 */}
                    <button
                      onClick={() => toggleLike(c.id)}
                      className={`mt-1 ml-1 flex items-center gap-1 text-xs font-semibold transition ${
                        c.liked
                          ? 'text-fuchsia-600'
                          : 'text-slate-400 hover:text-fuchsia-500'
                      }`}
                    >
                      <Eye
                        size={14}
                        className={c.liked ? 'fill-fuchsia-200' : ''}
                      />
                      매의 눈 추천 {c.likes > 0 && c.likes}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 상품 검색 모달 */}
      {modalOpen && (
        <ProductSearchModal
          onClose={() => setModalOpen(false)}
          onSelect={(p) => {
            setAttached(p);
            setModalOpen(false);
          }}
        />
      )}
    </article>
  );
}

/* ================================================================== */
/* 페이지                                                               */
/* ================================================================== */

export default function Home() {
  const [filter, setFilter] = useState('전체');

  const visibleFeeds =
    filter === '전체'
      ? FEEDS
      : FEEDS.filter((f) => f.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 text-slate-900">
      {/* ===================== 상단 내비게이션 ===================== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/60 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-rose-500 text-white shadow-lg shadow-fuchsia-500/30">
              <Sparkles size={22} />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-black tracking-tight">오지랖 패션</h1>
              <p className="text-[11px] font-medium text-fuchsia-500">
                참견은 사랑입니다 💅
              </p>
            </div>
          </div>

          {/* 검색 (장식용) */}
          <div className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full bg-slate-100/80 px-4 py-2 text-slate-400">
            <Search size={16} />
            <span className="text-sm">오늘은 어떤 코디를 구할까요?</span>
          </div>

          {/* 내 등급 / 포인트 */}
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white grid place-items-center">
                3
              </span>
            </button>

            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 pl-2 text-white shadow-lg shadow-fuchsia-500/30">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <Eye size={18} />
              </div>
              <div className="leading-tight pr-1">
                <p className="text-[11px] font-semibold opacity-90">
                  {CURRENT_USER.name}
                </p>
                <p className="flex items-center gap-1 text-xs font-bold">
                  <Coins size={12} className="text-amber-300" />
                  1,250p
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== 본문 ===================== */}
      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* --------------------- 메인 피드 --------------------- */}
        <section className="space-y-6">
          {/* 인트로 배너 */}
          <div className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 p-6 text-white shadow-xl shadow-rose-500/20">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Flame className="text-amber-200" /> 지금 긴급 훈수가 필요한 코디들
            </h2>
            <p className="mt-1 text-sm font-medium text-white/90">
              착샷 올리면 오지랖퍼들이 쇼핑몰 링크까지 들고 달려옵니다 🔥
            </p>
          </div>

          {/* ③ TPO 필터 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
                    active
                      ? 'bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white shadow-lg shadow-fuchsia-500/30'
                      : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === '전체' && <ShoppingBag size={14} />}
                  {f}
                </button>
              );
            })}
            <span className="ml-auto text-xs font-medium text-slate-400">
              총 {visibleFeeds.length}개의 코디
            </span>
          </div>

          {/* 피드 카드 목록 */}
          {visibleFeeds.length === 0 ? (
            <div className="rounded-3xl bg-white py-16 text-center text-slate-400 shadow-lg ring-1 ring-slate-100">
              <p className="text-3xl">🧐</p>
              <p className="mt-2 text-sm font-medium">
                해당 TPO의 코디가 아직 없어요!
              </p>
            </div>
          ) : (
            visibleFeeds.map((feed) => <FeedCard key={feed.id} feed={feed} />)
          )}
        </section>

        {/* --------------------- 우측 사이드바 --------------------- */}
        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          {/* 명예의 전당 */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4 text-white">
              <h3 className="flex items-center gap-2 text-base font-black">
                <Trophy size={18} /> 이번 주 베스트 코디네이터
              </h3>
              <p className="text-xs font-medium text-white/90">
                명예의 전당 · 매주 월요일 초기화
              </p>
            </div>

            <ul className="divide-y divide-slate-100">
              {RANKING.map((r) => (
                <li
                  key={r.rank}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-amber-50/60"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${
                      r.rank <= 3
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.badge}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-bold">{r.name}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {r.tier}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-fuchsia-600">
                    <Coins size={12} className="text-amber-400" />
                    {r.point.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full border-t border-slate-100 py-3 text-sm font-bold text-fuchsia-600 transition hover:bg-fuchsia-50">
              전체 랭킹 보기 →
            </button>
          </div>

          {/* 오늘의 등급 안내 */}
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-fuchsia-500/20">
            <h3 className="flex items-center gap-2 text-sm font-black">
              <Crown size={16} className="text-amber-300" /> 다음 등급까지
            </h3>
            <p className="mt-2 text-xs text-white/90">
              <b className="text-amber-300">압구정 매의 눈</b> → 청담동 패션장인
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-amber-300 to-rose-300" />
            </div>
            <p className="mt-2 text-right text-[11px] font-medium text-white/80">
              훈수 8번 더 두면 승급! 🔥
            </p>
          </div>

          {/* 통계 위젯 */}
          <div className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-700">
              <TrendingUp size={16} className="text-emerald-500" /> 오늘의 오지랖
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-fuchsia-50 py-3">
                <p className="text-xl font-black text-fuchsia-600">1,204</p>
                <p className="text-[11px] text-slate-500">오늘의 훈수</p>
              </div>
              <div className="rounded-2xl bg-amber-50 py-3">
                <p className="text-xl font-black text-amber-600">389</p>
                <p className="text-[11px] text-slate-500">구원받은 코디</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ===================== 푸터 ===================== */}
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
        <Medal size={16} className="mx-auto mb-1 text-slate-300" />
        오지랖 패션 · 당신의 패션을 구원하는 따뜻한 참견 ⓒ 2026
      </footer>
    </div>
  );
}
