-- ============================================================
-- 프로토타입 쓰기 정책 + Storage 버킷
--  · Auth 도입 전, anon 키로 글/이미지/훈수를 등록할 수 있도록
--    INSERT 정책을 개방한다. (운영 시 service_role 사용 또는
--    auth.uid() 기반 정책으로 강화 권장)
-- ============================================================

-- 쓰기 허용 (프로토타입)
drop policy if exists posts_insert_all on public.posts;
create policy posts_insert_all on public.posts for insert with check (true);

drop policy if exists post_images_insert_all on public.post_images;
create policy post_images_insert_all on public.post_images for insert with check (true);

drop policy if exists comments_insert_all on public.comments;
create policy comments_insert_all on public.comments for insert with check (true);

-- 코디 이미지 저장용 public 버킷
insert into storage.buckets (id, name, public)
values ('coordi', 'coordi', true)
on conflict (id) do update set public = true;

drop policy if exists "coordi read" on storage.objects;
create policy "coordi read" on storage.objects
  for select using (bucket_id = 'coordi');

drop policy if exists "coordi insert" on storage.objects;
create policy "coordi insert" on storage.objects
  for insert with check (bucket_id = 'coordi');

drop policy if exists "coordi update" on storage.objects;
create policy "coordi update" on storage.objects
  for update using (bucket_id = 'coordi');
