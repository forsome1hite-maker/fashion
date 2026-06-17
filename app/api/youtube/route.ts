import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // 매 요청마다 env(키) 확인 → 실연동 반영

/**
 * 🚨 패션 심폐소생소 — 국내 패션 유튜버 최신 영상.
 *  · YOUTUBE_API_KEY 가 있으면 YouTube Data API v3(search.list)로 실제 최신 영상
 *  · 없으면 Mock 폴백(고정 데모 데이터)
 *
 *  .env.local
 *    YOUTUBE_API_KEY=AIza...   (YouTube Data API v3 키)
 */

type Video = {
  channel: string;
  title: string;
  views: string;
  thumb: string;
  link: string;
};

/* 심폐소생소에 노출할 패션 크리에이터 검색어 */
const CREATORS = ['핏더사이즈', '깡스타일리스트', '짱구대디', '보라끌레르'];

/* ------------------------------------------------------------------ */
/* Mock 폴백                                                            */
/* ------------------------------------------------------------------ */

const MOCK: Video[] = [
  {
    channel: '핏더사이즈',
    title: '키 작은 남자 비율 200% 살리는 코트 기장의 비밀',
    views: '32만',
    thumb: 'https://picsum.photos/seed/fitthesize/320/180',
    link: 'https://www.youtube.com/results?search_query=핏더사이즈',
  },
  {
    channel: '깡스타일리스트',
    title: '소개팅 첫인상 합격하는 데일리룩 3가지',
    views: '21만',
    thumb: 'https://picsum.photos/seed/kkangstylist/320/180',
    link: 'https://www.youtube.com/results?search_query=깡스타일리스트',
  },
  {
    channel: '짱구대디',
    title: '4060도 10살 어려보이는 어른 코디법',
    views: '18만',
    thumb: 'https://picsum.photos/seed/jjangu/320/180',
    link: 'https://www.youtube.com/results?search_query=짱구대디',
  },
  {
    channel: '보라끌레르',
    title: '체형 커버 끝판왕! 가을 원피스 추천템',
    views: '27만',
    thumb: 'https://picsum.photos/seed/voraclaire/320/180',
    link: 'https://www.youtube.com/results?search_query=보라끌레르',
  },
];

/* HTML 엔티티 디코드 (YouTube title 은 &amp; 등으로 옴) */
function decode(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/* ------------------------------------------------------------------ */
/* GET /api/youtube                                                     */
/* ------------------------------------------------------------------ */

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ videos: MOCK, source: 'mock' });
  }

  try {
    // 크리에이터별로 최신 영상 1건씩 (search.list, type=video, order=date)
    const results = await Promise.all(
      CREATORS.map(async (name) => {
        const url =
          'https://www.googleapis.com/youtube/v3/search?part=snippet' +
          `&q=${encodeURIComponent(name)}&type=video&order=date&maxResults=1` +
          `&key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) return null;
        const data = await res.json();
        const item = data.items?.[0];
        if (!item) return null;
        const vid = item.id?.videoId;
        const sn = item.snippet ?? {};
        const thumb =
          sn.thumbnails?.medium?.url ?? sn.thumbnails?.default?.url ?? '';
        const video: Video = {
          channel: sn.channelTitle ? decode(sn.channelTitle) : name,
          title: sn.title ? decode(sn.title) : '',
          views: '', // search.list 는 조회수 미제공
          thumb,
          link: vid
            ? `https://www.youtube.com/watch?v=${vid}`
            : `https://www.youtube.com/results?search_query=${encodeURIComponent(
                name
              )}`,
        };
        return video;
      })
    );

    const videos = results.filter((v): v is Video => v !== null);
    if (videos.length === 0) {
      return NextResponse.json({ videos: MOCK, source: 'mock' });
    }
    return NextResponse.json({ videos, source: 'youtube' });
  } catch {
    return NextResponse.json({ videos: MOCK, source: 'mock' });
  }
}
