import type { AuthError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

// 인증 함수 — docs/FEATURES.md §1 (이메일 + 비밀번호, 이메일 인증 끔)

export type AuthFailure = "invalid" | "duplicate" | "network" | "unknown";
export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

export const PASSWORD_MIN_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

function toFailure(error: AuthError | Error): AuthFailure {
  const code = "code" in error ? error.code : undefined;
  const status = "status" in error ? error.status : undefined;
  if (code === "invalid_credentials") return "invalid";
  if (code === "user_already_exists" || code === "email_exists") return "duplicate";
  if (error.name === "AuthRetryableFetchError" || status === 0 || error instanceof TypeError) return "network";
  return "unknown";
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "network" };
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, reason: toFailure(error) } : { ok: true };
  } catch (e) {
    return { ok: false, reason: toFailure(e as Error) };
  }
}

/** 가입 = 키트 받기 = 계정 생성 (PAGES.md §5). profiles 는 DB 트리거가 만든다. */
export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  priorJob?: string;
  reasons: string[];
  message?: string;
  /** TODO(팀) 연락처 수집 여부 미정 (PAGES.md §5) — 선택 입력 */
  phone?: string;
  pledged: boolean;
};

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "network" };
  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          display_name: input.displayName,
          prior_job: input.priorJob,
          reasons: input.reasons,
          message: input.message,
          phone: input.phone,
          pledged: input.pledged,
        },
      },
    });
    if (error) return { ok: false, reason: toFailure(error) };
    // 이메일 인증을 끈 상태에서 이미 있는 이메일이면 identities 가 빈 배열로 온다
    if (data.user && data.user.identities?.length === 0) return { ok: false, reason: "duplicate" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: toFailure(e as Error) };
  }
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}

/** 로그인 후 돌아갈 주소. 사이트 내부 경로만 허용 (외부 주소로 보내는 리다이렉트 방지). */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
