"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

// 로그인 상태를 앱 전체에 공유한다. 세션 변화(로그인·로그아웃·토큰 갱신)를 구독한다.
// 보안은 DB 의 RLS 가 담당하고, 이 상태는 화면 표시용이다.

export type Member = { id: string; displayName: string; memberNo: number };

export type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "member"; member: Member };

const AuthContext = createContext<AuthState>({ status: "loading" });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // DB 연결 전(환경 변수 없음)이면 처음부터 비로그인 상태
  const [state, setState] = useState<AuthState>(isSupabaseConfigured ? { status: "loading" } : { status: "guest" });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    async function load(userId: string | undefined) {
      if (!supabase || !userId) {
        if (!cancelled) setState({ status: "guest" });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, member_no")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      setState(
        data
          ? { status: "member", member: { id: data.id, displayName: data.display_name, memberNo: data.member_no } }
          : { status: "guest" },
      );
    }

    // onAuthStateChange 는 구독 직후 현재 세션으로 한 번 호출된다 (INITIAL_SESSION).
    // 콜백 안에서 supabase 를 직접 await 하면 교착될 수 있어 다음 틱으로 미룬다.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void load(session?.user.id), 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext value={state}>{children}</AuthContext>;
}
