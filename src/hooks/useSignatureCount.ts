"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { WORLD } from "@/content/world";
import { fetchRealSignaturesCount } from "@/lib/data";
import type { CountState } from "./useFeelingCount";

// "서명 수" = 세계관 기본값 + 실제 가입한 조합원 수 (FEATURES.md §4).

export function useSignatureCount(): CountState {
  const toast = useToast();
  const [state, setState] = useState<CountState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchRealSignaturesCount()
      .then((real) => !cancelled && setState({ status: "ready", value: WORLD.signaturesBase + real }))
      .catch(() => {
        if (cancelled) return;
        // 오류여도 세계관 기본값은 보여준다 (FEATURES.md §6: 토스트로 알림)
        setState({ status: "error", value: WORLD.signaturesBase });
        toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return state;
}
