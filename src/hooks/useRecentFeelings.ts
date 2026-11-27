"use client";

import { useEffect, useState } from "react";
import { fetchFeeling, fetchRecentFeelings, subscribeToNewFeelings, type FeelingView } from "@/lib/data";

// 최근 마음 N개 (FEATURES.md §3.2). 새 마음이 오면 맨 앞에 붙는다.
// 오류 토스트는 같은 화면의 카운터(useFeelingCount)가 한 번 띄운다 — 여기서는 error 상태만.

export type FeelingsState =
  | { status: "loading" }
  | { status: "ready"; items: FeelingView[] }
  | { status: "error"; items: FeelingView[] };

export function useRecentFeelings(limit: number): FeelingsState {
  const [state, setState] = useState<FeelingsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchRecentFeelings(limit)
      .then((items) => !cancelled && setState({ status: "ready", items }))
      .catch(() => !cancelled && setState({ status: "error", items: [] }));

    const unsubscribe = subscribeToNewFeelings((row) => {
      fetchFeeling(row.id)
        .then((item) => {
          if (cancelled || !item) return;
          setState((s) =>
            s.status === "loading" || s.items.some((f) => f.id === item.id)
              ? s
              : { status: "ready", items: [item, ...s.items].slice(0, limit) },
          );
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [limit]);

  return state;
}
