import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 서버 전용 Supabase 클라이언트 (service_role 키 사용 → RLS 우회).
 * 환경변수가 없으면 null 을 반환하고, API 라우트는 Mock 모드로 폴백한다.
 *
 *  .env.local
 *    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=eyJ...   (절대 클라이언트에 노출 금지)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, serviceKey as string, {
      auth: { persistSession: false },
    })
  : null;
