'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  ImagePlus,
  Loader2,
  Send,
  X,
} from 'lucide-react';

/* 파일 → data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CATEGORIES = ['소개팅', '첫출근', '결혼식', '데이트', '면접', '기타'];

const URGENCIES: {
  value: 'critical' | 'warning' | 'normal';
  label: string;
  emoji: string;
}[] = [
  { value: 'critical', label: '긴급 (D-1)', emoji: '🚨' },
  { value: 'warning', label: '주의', emoji: '⚠️' },
  { value: 'normal', label: '여유', emoji: '💜' },
];

export default function NewPostPage() {
  const router = useRouter();

  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('소개팅');
  const [urgency, setUrgency] = useState<'critical' | 'warning' | 'normal'>(
    'critical'
  );
  const [tpo, setTpo] = useState('');
  const [question, setQuestion] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  /* 카테고리/긴급도 기반 TPO 배지 자동 추천 */
  const suggestedTpo = () => {
    const emoji =
      URGENCIES.find((u) => u.value === urgency)?.emoji ?? '💜';
    const suffix = urgency === 'critical' ? ' D-1' : '';
    return `${emoji} ${category}${suffix}`;
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
    e.target.value = '';
  };

  const submit = async () => {
    setError('');
    if (!question.trim()) return setError('질문 내용을 입력해주세요.');
    if (!imageDataUrl) return setError('코디 사진을 첨부해주세요.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim(),
          handle: author.trim() ? `@${author.trim()}` : '',
          tpo: tpo.trim() || suggestedTpo(),
          category,
          urgency,
          question: question.trim(),
          image: imageDataUrl,
        }),
      });
      const data = await res.json();
      if (data?.postId) {
        router.push(`/posts/${data.postId}`);
      } else {
        setError(data?.error ?? '등록에 실패했어요. 다시 시도해주세요.');
        setSubmitting(false);
      }
    } catch {
      setError('네트워크 오류가 발생했어요.');
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-fuchsia-300';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 text-slate-900">
      {/* 상단바 */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
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
              <h1 className="text-base font-black tracking-tight">착샷 올리기</h1>
              <p className="text-[11px] font-medium text-fuchsia-500">
                오지랖퍼들의 훈수를 받아보세요 🙏
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-5">
          {/* 코디 사진 업로드 */}
          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-700">
              코디 사진 <span className="text-fuchsia-500">*</span>
            </label>
            {imageDataUrl ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-lg ring-1 ring-slate-100">
                <img
                  src={imageDataUrl}
                  alt="미리보기"
                  className="mx-auto h-80 w-auto max-w-full object-contain py-3"
                />
                <button
                  onClick={() => setImageDataUrl(null)}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                >
                  <X size={16} />
                </button>
                <span className="absolute left-3 top-3 rounded-full bg-fuchsia-600/90 px-2.5 py-1 text-[11px] font-bold text-white">
                  📸 업로드 시 누끼 자동 처리
                </span>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-fuchsia-300 bg-white/60 text-fuchsia-500 transition hover:bg-fuchsia-50"
              >
                <ImagePlus size={32} />
                <span className="text-sm font-bold">코디 사진 선택하기</span>
                <span className="text-[11px] text-slate-400">
                  전신 착샷이면 훈수가 더 정확해요!
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-700">
              닉네임
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="예) 소개팅뉴비 (비우면 익명)"
              className={inputCls}
            />
          </div>

          {/* 카테고리 + 긴급도 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-black text-slate-700">
                TPO 카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-black text-slate-700">
                긴급도
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className={inputCls}
              >
                {URGENCIES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.emoji} {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TPO 배지 */}
          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-700">
              TPO 배지{' '}
              <span className="text-[11px] font-medium text-slate-400">
                (비우면 자동: {suggestedTpo()})
              </span>
            </label>
            <input
              value={tpo}
              onChange={(e) => setTpo(e.target.value)}
              placeholder={suggestedTpo()}
              className={inputCls}
            />
          </div>

          {/* 질문 */}
          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-700">
              질문 <span className="text-fuchsia-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="예) 내일 첫 소개팅인데 이 핏 어떤가요? 너무 과한가요...?"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}

          {/* 제출 */}
          <button
            onClick={submit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 py-3.5 text-sm font-black text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> 누끼 처리 & 등록 중...
              </>
            ) : (
              <>
                <Send size={16} /> 훈수 요청하기
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
