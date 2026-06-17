import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버에서 사용하는 Supabase 클라이언트.
 *  · SUPABASE_SERVICE_ROLE_KEY 가 있으면 service_role (RLS 우회) 사용 — 권장(운영)
 *  · 없으면 NEXT_PUBLIC_SUPABASE_ANON_KEY (anon) 로 동작 — 프로토타입
 *    (이 경우 테이블에 insert 정책이 열려 있어야 쓰기가 됨)
 *  · URL/키가 모두 없으면 null → API 라우트는 Mock 모드로 폴백
 *
 *  .env.local
 *    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        (공개 가능)
 *    SUPABASE_SERVICE_ROLE_KEY=eyJ...            (선택, 서버 전용·노출 금지)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const key = serviceKey || anonKey;

export const isSupabaseConfigured = Boolean(url && key);
export const usingServiceRole = Boolean(serviceKey);

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, {
      auth: { persistSession: false },
    })
  : null;
