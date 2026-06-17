import { NextRequest, NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/* 상품 타입 (네이버 쇼핑 API 응답을 정규화한 형태)                       */
/* ------------------------------------------------------------------ */

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  link: string;
  mall: string;
};

/* ------------------------------------------------------------------ */
/* Mock 데이터 (실제 API 키 연동 전 동작 확인용)                         */
/* ------------------------------------------------------------------ */

const MOCK: Product[] = [
  {
    id: 'm1',
    title: '남성 세미오버핏 슬랙스 (블랙)',
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80&auto=format&fit=crop',
    price: 39000,
    link: 'https://search.shopping.naver.com/search/all?query=검정 슬랙스',
    mall: '무신사',
  },
  {
    id: 'm2',
    title: '여성 하이웨스트 와이드 슬랙스 (차콜)',
    image:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80&auto=format&fit=crop',
    price: 32900,
    link: 'https://search.shopping.naver.com/search/all?query=와이드 슬랙스',
    mall: '지그재그',
  },
  {
    id: 'm3',
    title: '베이직 옥스포드 셔츠 (화이트)',
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80&auto=format&fit=crop',
    price: 24900,
    link: 'https://search.shopping.naver.com/search/all?query=옥스포드 셔츠',
    mall: '에이블리',
  },
  {
    id: 'm4',
    title: '램스울 크루넥 니트 (오트밀)',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80&auto=format&fit=crop',
    price: 45000,
    link: 'https://search.shopping.naver.com/search/all?query=크루넥 니트',
    mall: '29CM',
  },
  {
    id: 'm5',
    title: '클래식 더비 구두 (브라운)',
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80&auto=format&fit=crop',
    price: 89000,
    link: 'https://search.shopping.naver.com/search/all?query=더비 구두',
    mall: '브랜드스토어',
  },
  {
    id: 'm6',
    title: '오버핏 싱글 블레이저 자켓 (블랙)',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80&auto=format&fit=crop',
    price: 79000,
    link: 'https://search.shopping.naver.com/search/all?query=블레이저 자켓',
    mall: '무신사',
  },
  {
    id: 'm7',
    title: '슬림 치노 팬츠 (베이지)',
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&q=80&auto=format&fit=crop',
    price: 36000,
    link: 'https://search.shopping.naver.com/search/all?query=치노 팬츠',
    mall: '폴햄',
  },
  {
    id: 'm8',
    title: '미니멀 스퀘어 토트백 (블랙)',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=80&auto=format&fit=crop',
    price: 59000,
    link: 'https://search.shopping.naver.com/search/all?query=토트백',
    mall: '핸드메이드',
  },
];

/* HTML 태그 제거 (네이버 title 은 <b> 태그가 포함되어 옴) */
function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, '');
}

/* ------------------------------------------------------------------ */
/* GET /api/search?query=검정 슬랙스                                     */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get('query') ?? '').trim();

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  /* ① 실제 네이버 쇼핑 API (키가 있을 때만) */
  if (clientId && clientSecret && query) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(
          query
        )}&display=12&sort=sim`,
        {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const data = await res.json();
        const items: Product[] = (data.items ?? []).map((it: any) => ({
          id: String(it.productId),
          title: stripTags(it.title),
          image: it.image,
          price: Number(it.lprice) || 0,
          link: it.link,
          mall: it.mallName || '네이버쇼핑',
        }));
        return NextResponse.json({ items, source: 'naver' });
      }
    } catch {
      /* 실패 시 아래 Mock 으로 폴백 */
    }
  }

  /* ② Mock 폴백: 검색어 토큰이 제목에 포함되면 필터, 없으면 전체 노출 */
  const tokens = query.split(/\s+/).filter(Boolean);
  let items = MOCK;
  if (tokens.length) {
    const matched = MOCK.filter((p) => tokens.some((t) => p.title.includes(t)));
    if (matched.length) items = matched;
  }

  return NextResponse.json({ items, source: 'mock' });
}
