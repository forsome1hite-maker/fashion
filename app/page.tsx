'use client';

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
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 더미 데이터                                                          */
/* ------------------------------------------------------------------ */

type Feed = {
  id: number;
  user: string;
  handle: string;
  avatar: string;
  outfit: string;
  tpo: string;
  urgency: 'critical' | 'warning' | 'normal';
  question: string;
  advisors: number;
  likes: number;
};

const FEEDS: Feed[] = [
  {
    id: 1,
    user: '소개팅뉴비',
    handle: '@blind_date_99',
    avatar: 'https://i.pravatar.cc/100?img=11',
    outfit:
      'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80',
    tpo: '🚨 소개팅 D-1',
    urgency: 'critical',
    question: '내일 첫 소개팅인데 이 핏 어떤가요? 너무 과한가요...?',
    advisors: 42,
    likes: 318,
  },
  {
    id: 2,
    user: '월요병환자',
    handle: '@new_comer',
    avatar: 'https://i.pravatar.cc/100?img=32',
    outfit:
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80',
    tpo: '⚠️ 첫출근 긴급',
    urgency: 'warning',
    question: '스타트업 첫 출근룩이요. 캐주얼인데 너무 풀어진 느낌일까요?',
    advisors: 27,
    likes: 204,
  },
  {
    id: 3,
    user: '결혼식하객',
    handle: '@guest_look',
    avatar: 'https://i.pravatar.cc/100?img=45',
    outfit:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    tpo: '💍 친구 결혼식 D-3',
    urgency: 'normal',
    question: '하객룩인데 신부보다 튀면 안 되겠죠? 컬러 톤 봐주세요!',
    advisors: 15,
    likes: 142,
  },
];

const RANKING = [
  { rank: 1, name: '청담동패션장인', point: 9820, badge: '🥇', tier: '레전드 스타일리스트' },
  { rank: 2, name: '무신사털이범', point: 8640, badge: '🥈', tier: '신상 큐레이터' },
  { rank: 3, name: '핏의정석', point: 7510, badge: '🥉', tier: '비율 마법사' },
  { rank: 4, name: '오지랖끝판왕', point: 6230, badge: '4', tier: '훈수 마스터' },
  { rank: 5, name: '컬러닥터', point: 5870, badge: '5', tier: '퍼스널컬러 박사' },
];

/* ------------------------------------------------------------------ */
/* 긴급도 배지 스타일                                                   */
/* ------------------------------------------------------------------ */

const URGENCY_STYLE: Record<Feed['urgency'], string> = {
  critical:
    'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/40 animate-pulse',
  warning:
    'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-500/40',
  normal: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/40',
};

/* ------------------------------------------------------------------ */
/* 페이지                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
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
                  압구정 매의 눈
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

          {/* 피드 카드 목록 */}
          {FEEDS.map((feed) => (
            <article
              key={feed.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-200/50"
            >
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
              <div className="relative mt-4 mx-5 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100">
                <img
                  src={feed.outfit}
                  alt="코디 착샷"
                  className="mx-auto h-80 w-full object-cover transition duration-500 group-hover:scale-105"
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
                    현재 {feed.advisors}명의 오지랖퍼가 훈수 중
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-slate-400">
                    <Heart size={15} /> {feed.likes}
                  </span>
                </div>

                <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 active:scale-95">
                  <Hand size={16} />
                  나도 훈수 두기
                </button>
              </div>
            </article>
          ))}
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
