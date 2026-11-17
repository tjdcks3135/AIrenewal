"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { fetchRecentDiscussions, type DiscussionPreview } from "@/lib/data";

// 메인 섹션 4: 최근 토론 1~2개 미리보기 (PAGES.md §2)

export type ListState<T> = { status: "loading" } | { status: "ready"; items: T[] } | { status: "error" };

export function useRecentDiscussions(limit = 2): ListState<DiscussionPreview> {
  const toast = useToast();
  const [state, setState] = useState<ListState<DiscussionPreview>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchRecentDiscussions(limit)
      .then((items) => !cancelled && setState({ status: "ready", items }))
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error" });
        toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
      });
    return () => {
      cancelled = true;
    };
  }, [limit, toast]);

  return state;
}
