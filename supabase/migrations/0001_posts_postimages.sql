-- ============================================================
-- 오지랖 패션 · 패션 변천사 타임라인 스키마
-- posts (게시글) 1 : N post_images (코디 변천사 이미지)
-- ============================================================

-- 1) Posts: 게시글(질문) 한 건
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid,                       -- 작성자(auth.users.id 참조 가능)
  author_name text not null,
  handle      text,
  avatar      text,
  tpo         text,                        -- TPO 배지 텍스트 (예: 🚨 소개팅 D-1)
  category    text,                        -- 필터 카테고리 (소개팅/첫출근/결혼식)
  urgency     text not null default 'normal'
              check (urgency in ('critical', 'warning', 'normal')),
  question    text not null,
  created_at  timestamptz not null default now()
);

-- 2) PostImages: 게시글당 여러 장(버전 1, 2, 최종본 ...)
--    글 하나(post_id)에 코디 사진을 sequence 로 여러 개 등록 (1:N)
create table if not exists public.post_images (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  sequence     int  not null,             -- 버전 순서 (1=원본, 2=ver.2, ...)
  image_url    text not null,             -- 누끼 제거가 끝난 최종 이미지 URL
  original_url text,                       -- 원본(처리 전) 이미지 URL
  label        text,                       -- '원본' / 'ver.2' / '최종본' 등
  bg_removed   boolean not null default false, -- Remove.bg 처리 여부
  created_at   timestamptz not null default now(),
  unique (post_id, sequence)              -- 한 글 안에서 sequence 중복 방지
);

-- 같은 게시글의 변천사를 sequence 순으로 빠르게 조회
create index if not exists idx_post_images_post_seq
  on public.post_images (post_id, sequence);

-- ============================================================
-- RLS (행 수준 보안)
--  · 서버는 service_role 키로 접근하므로 RLS 를 우회 (insert/update 가능)
--  · 클라이언트(anon)는 읽기만 허용
-- ============================================================
alter table public.posts        enable row level security;
alter table public.post_images  enable row level security;

drop policy if exists "posts_read_all" on public.posts;
create policy "posts_read_all"
  on public.posts for select using (true);

drop policy if exists "post_images_read_all" on public.post_images;
create policy "post_images_read_all"
  on public.post_images for select using (true);
