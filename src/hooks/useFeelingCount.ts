"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { WORLD } from "@/content/world";
import { fetchRealFeelingsCount, subscribeToNewFeelings } from "@/lib/data";

// "모인 마음 수" = 세계관 기본값 + 실제 사용자가 전한 마음 수 (FEATURES.md §4). 새 마음이 오면 실시간으로 늘어난다.

export type CountState = { status: "loading" } | { status: "ready"; value: number } | { status: "error"; value: number };

export function useFeelingCount(): CountState {
  const toast = useToast();
  const [state, setState] = useState<CountState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchRealFeelingsCount()
      .then((real) => !cancelled && setState({ status: "ready", value: WORLD.feelingsBase + real }))
      .catch(() => {
        if (cancelled) return;
        // 오류여도 세계관 기본값은 보여준다 (FEATURES.md §6: 토스트로 알림)
        setState({ status: "error", value: WORLD.feelingsBase });
        toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
      });

    const unsubscribe = subscribeToNewFeelings((row) => {
      if (row.is_seed) return;
      setState((s) => (s.status === "loading" ? s : { ...s, value: s.value + 1 }));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [toast]);

  return state;
}
