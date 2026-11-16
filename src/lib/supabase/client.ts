import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// 브라우저용 Supabase 클라이언트. 세션은 쿠키에 저장된다 (localStorage 사용 안 함 — CLAUDE.md §3).
// 환경 변수: docs/TECH.md §4 (.env.local)

export type Supabase = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let warned = false;

/** 환경 변수가 없으면 null (개발 중 DB 연결 전에도 화면이 깨지지 않도록). */
export function getSupabase(): Supabase | null {
  if (!url || !anonKey) {
    if (!warned && typeof window !== "undefined") {
      warned = true;
      console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 없어 비로그인 상태로 동작합니다.");
    }
    return null;
  }
  // createBrowserClient 는 브라우저에서 싱글턴을 돌려준다.
  return createBrowserClient<Database>(url, anonKey);
}
