"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { fetchPosts, subscribeToNewPosts, type PostView } from "@/lib/data";

// 커뮤니티 글 목록 (PAGES.md §8). 오류는 토스트 (FEATURES.md §6)
// adjust: 공감·댓글이 늘거나 줄면 목록의 숫자도 바로 바꾼다 → 광장의 버블 크기가 바뀐다
// add: 새 글(내가 쓴 글·실시간으로 온 다른 사람 글)을 맨 앞에 — 같은 글은 한 번만

export type PostsState =
  | { status: "loading" }
  | { status: "ready"; items: PostView[] }
  | { status: "error"; items: PostView[] };

export type PostCounts = { comments?: number; reactions?: number };

export function usePosts(): {
  state: PostsState;
  adjust: (id: string, delta: PostCounts) => void;
  add: (post: PostView) => void;
} {
  const toast = useToast();
  const [state, setState] = useState<PostsState>({ status: "loading" });

  const add = useCallback((post: PostView) => {
    setState((s) =>
      s.status === "loading" || s.items.some((p) => p.id === post.id) ? s : { ...s, items: [post, ...s.items] },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPosts()
      .then((items) => !cancelled && setState({ status: "ready", items }))
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error", items: [] });
        toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
      });
    const unsubscribe = subscribeToNewPosts((post) => add(post));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [toast, add]);

  const adjust = useCallback((id: string, delta: PostCounts) => {
    setState((s) =>
      s.status === "loading"
        ? s
        : {
            ...s,
            items: s.items.map((p) =>
              p.id === id
                ? { ...p, comments: p.comments + (delta.comments ?? 0), reactions: p.reactions + (delta.reactions ?? 0) }
                : p,
            ),
          },
    );
  }, []);

  return { state, adjust, add };
}
