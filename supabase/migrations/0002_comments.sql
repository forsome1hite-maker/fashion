-- ============================================================
-- 오지랖 패션 · 훈수(댓글) 테이블
-- posts 1 : N comments, 그리고 어떤 코디 버전(sequence)에 대한
-- 피드백인지 target_sequence 로 분류한다.
-- ============================================================

create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references public.posts(id) on delete cascade,
  target_sequence int,                  -- 피드백 대상 코디 버전 (null = 전체 코디)
  author_name     text not null,
  text            text,
  product         jsonb,                 -- 첨부된 추천 상품 (옵션)
  likes           int  not null default 0,
  created_at      timestamptz not null default now()
);

-- 게시글의 훈수를 시간순/버전별로 조회
create index if not exists idx_comments_post_created
  on public.comments (post_id, created_at);
create index if not exists idx_comments_post_target
  on public.comments (post_id, target_sequence);

alter table public.comments enable row level security;

drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all"
  on public.comments for select using (true);
