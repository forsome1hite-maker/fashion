'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  History,
  Loader2,
  Sparkles,
  GitCompareArrows,
  Eye,
  Camera,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 타입                                                                 */
/* ------------------------------------------------------------------ */

type PostImage = {
  id: string;
  postId: string;
  sequence: number;
  imageUrl: string;
  label: string;
  bgRemoved: boolean;
};

type Post = {
  id: string;
  user: string;
  handle: string;
  avatar: string;
  tpo: string;
  category: string;
  urgency: 'critical' | 'warning' | 'normal';
  question: string;
};

/* ------------------------------------------------------------------ */
/* sequence → 상태 배지 자동 매핑                                        */
/*   1 = 최초 코디 / 마지막 = 최종 완성 / 중간 = 코칭 N차 적용           */
/* ------------------------------------------------------------------ */

function statusBadge(seq: number, max: number) {
  if (seq === 1) return { text: '최초 코디', cls: 'bg-slate-700' };
  if (seq === max)
    return {
      text: '최종 완성',
      cls: 'bg-gradient-to-r from-fuchsia-600 to-rose-500',
    };
  return { text: `코칭 ${seq - 1}차 적용`, cls: 'bg-amber-500' };
}

/* ================================================================== */
/* 상세 페이지                                                          */
/* ================================================================== */

export default function PostDetailPage({
  params,
}: {
  params: { postId: string };
}) {
  const postId = params.postId;

  const [post, setPost] = useState<Post | null>(null);
  const [images, setImages] = useState<PostImage[]>([]);
  const [activeSeq, setActiveSeq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState(false); // 비포&애프터 비교 모드

  /* DB(또는 Mock)에서 게시글 메타 + 변천사 이미지 로드 */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [pRes, iRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/posts/${postId}/images`),
        ]);
        const pData = await pRes.json();
        const iData = await iRes.json();
        if (!alive) return;
        setPost(pData.post ?? null);
        const imgs: PostImage[] = (iData.images ?? [])
          .slice()
          .sort((a: PostImage, b: PostImage) => a.sequence - b.sequence);
        setImages(imgs);
        // 기본 메인 = 최신(마지막) 버전
        setActiveSeq(imgs.length ? imgs[imgs.length - 1].sequence : null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  const maxSeq = images.length ? images[images.length - 1].sequence : 0;
  const active =
    images.find((v) => v.sequence === activeSeq) ?? images[images.length - 1];
  const first = images[0];
  const last = images[images.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 text-slate-900">
      {/* 상단바 */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-rose-500 text-white shadow-lg shadow-fuchsia-500/30">
              <Sparkles size={18} />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-black tracking-tight">
                패션 변천사
              </h1>
              <p className="text-[11px] font-medium text-fuchsia-500">
                코칭 비포 & 애프터 🔥
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-32 text-slate-400">
            <Loader2 size={30} className="animate-spin text-fuchsia-500" />
            <p className="text-sm">변천사를 불러오는 중...</p>
          </div>
        ) : !post || images.length === 0 ? (
          <div className="rounded-3xl bg-white py-24 text-center text-slate-400 shadow-lg ring-1 ring-slate-100">
            <p className="text-3xl">🧐</p>
            <p className="mt-2 text-sm font-medium">
              게시글 또는 코디 기록을 찾을 수 없어요.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white"
            >
              피드로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            {/* 게시글 정보 */}
            <div className="mb-5 flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.user}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-fuchsia-200"
                />
                <div className="leading-tight">
                  <p className="text-sm font-bold">{post.user}</p>
                  <p className="text-xs text-slate-400">{post.handle}</p>
                </div>
              </div>
              <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-fuchsia-500/30">
                {post.tpo}
              </span>
            </div>

            <p className="mb-5 rounded-3xl bg-white px-5 py-4 text-[15px] font-semibold text-slate-700 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
              “{post.question}”
            </p>

            {/* ① 메인 캔버스 */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
              {/* 헤더: 단계 표시 + 비교 토글 */}
              <div className="flex items-center justify-between px-5 pt-4">
                <span className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                  <Camera size={16} className="text-fuchsia-500" />
                  {compare ? '비포 & 애프터 비교' : '최신 코디 미리보기'}
                </span>
                {images.length > 1 && (
                  <button
                    onClick={() => setCompare((v) => !v)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                      compare
                        ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <GitCompareArrows size={14} />
                    비포&애프터
                  </button>
                )}
              </div>

              {compare ? (
                /* 비교 모드: 최초 vs 최종 나란히 */
                <div className="grid grid-cols-2 gap-3 p-5">
                  {[first, last].map((img, idx) => {
                    const badge = statusBadge(img.sequence, maxSeq);
                    return (
                      <div
                        key={img.id}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100"
                      >
                        <span
                          className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow ${badge.cls}`}
                        >
                          {idx === 0 ? 'BEFORE · ' : 'AFTER · '}
                          {badge.text}
                        </span>
                        <img
                          src={img.imageUrl}
                          alt={img.label}
                          className="mx-auto h-80 w-auto max-w-full object-contain py-2"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 단일 메인 캔버스 (선택된 버전) */
                <div className="relative mx-5 mb-5 mt-3 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100">
                  {active &&
                    (() => {
                      const badge = statusBadge(active.sequence, maxSeq);
                      return (
                        <>
                          <span
                            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold text-white shadow ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                            {images.findIndex(
                              (v) => v.sequence === active.sequence
                            ) + 1}{' '}
                            / {images.length}
                          </span>
                          <img
                            src={active.imageUrl}
                            alt={active.label}
                            className="mx-auto h-[460px] w-auto max-w-full object-contain py-3 transition duration-300"
                          />
                          {active.bgRemoved && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 backdrop-blur">
                              📸 누끼 처리됨
                            </span>
                          )}
                        </>
                      );
                    })()}
                </div>
              )}
            </div>

            {/* ② 타임라인 슬라이더 */}
            <div className="mt-5 rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                <History size={16} className="text-fuchsia-500" />
                코디 변천사 타임라인
                <span className="ml-1 text-[11px] font-medium text-slate-400">
                  총 {images.length}단계 · 썸네일을 눌러 비교해보세요
                </span>
              </h3>

              <div className="mt-4 flex items-stretch gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => {
                  const badge = statusBadge(img.sequence, maxSeq);
                  const selected =
                    !compare && img.sequence === active?.sequence;
                  return (
                    <div key={img.id} className="flex shrink-0 items-center">
                      <button
                        onClick={() => {
                          setCompare(false);
                          setActiveSeq(img.sequence);
                        }}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        {/* ③ 상태 배지 */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow ${badge.cls}`}
                        >
                          {badge.text}
                        </span>
                        {/* ④ 썸네일 (클릭 → 메인 전환) */}
                        <div
                          className={`relative overflow-hidden rounded-2xl ring-2 transition ${
                            selected
                              ? 'ring-fuchsia-500'
                              : 'ring-transparent group-hover:ring-fuchsia-200'
                          }`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.label}
                            className="h-28 w-24 bg-slate-100 object-cover"
                          />
                          {selected && (
                            <span className="absolute inset-0 grid place-items-center bg-fuchsia-600/15">
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-fuchsia-600 text-white">
                                <Eye size={15} />
                              </span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {i + 1}단계 · {img.label}
                        </span>
                      </button>

                      {/* 단계 사이 화살표 */}
                      {i < images.length - 1 && (
                        <span className="px-1 text-lg font-black text-slate-300">
                          →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
