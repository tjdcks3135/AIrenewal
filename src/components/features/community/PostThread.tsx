"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthGate } from "@/components/features/AuthGate";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextArea } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { COMMUNITY_TEXT } from "@/content/community";
import { useAuth } from "@/hooks/useAuth";
import {
  COMMENT_MAX_LENGTH,
  deleteComment,
  fetchComments,
  fetchMyReaction,
  insertComment,
  setReaction,
  subscribeToComments,
  type CommentView,
  type PostView,
} from "@/lib/data";
import { timeAgo } from "@/lib/format";
import type { PostCounts } from "@/hooks/usePosts";

// 글 상세의 공감 · 댓글 스레드 (PAGES.md §8 — 댓글이 핵심)
// 공감: 1인 1회 토글, 비로그인은 AuthGate. 댓글: 오래된 순, 다른 사람 댓글은 실시간, 본인 댓글만 삭제.
// 숫자가 바뀌면 onCounts 로 광장의 버블 크기도 바로 바꾼다.
// 상태(FEATURES.md §6): 로딩 스켈레톤 · 0개 문구 · 오류 토스트 + 입력 유지 · 제출 중 비활성 · 같은 내용 2초 재제출 방지

const D = COMMUNITY_TEXT.detail;
const RESUBMIT_GUARD_MS = 2000;

type CommentsState = { status: "loading" } | { status: "ready"; items: CommentView[] } | { status: "error"; items: CommentView[] };

type PostThreadProps = {
  post: PostView;
  onCounts: (delta: PostCounts) => void;
};

export function PostThread({ post, onCounts }: PostThreadProps) {
  const auth = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const memberId = auth.status === "member" ? auth.member.id : null;

  const [comments, setComments] = useState<CommentsState>({ status: "loading" });
  const [reacted, setReacted] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const last = useRef<{ key: string; at: number } | null>(null);
  /** 이미 화면에 있는 댓글 id — 내가 단 댓글이 실시간으로 다시 와도 두 번 붙거나 두 번 세지 않게 */
  const known = useRef(new Set<string>());
  const onCountsRef = useRef(onCounts);
  useEffect(() => {
    onCountsRef.current = onCounts;
  }, [onCounts]);

  // 댓글 불러오기 + 실시간으로 붙는 댓글
  useEffect(() => {
    let cancelled = false;
    fetchComments(post.id)
      .then((items) => {
        if (cancelled) return;
        known.current = new Set(items.map((c) => c.id));
        setComments({ status: "ready", items });
      })
      .catch(() => {
        if (cancelled) return;
        setComments({ status: "error", items: [] });
        toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
      });
    const unsubscribe = subscribeToComments(post.id, (c) => {
      if (known.current.has(c.id)) return;
      known.current.add(c.id);
      setComments((s) => (s.status === "loading" ? s : { ...s, items: [...s.items, c] }));
      onCountsRef.current({ comments: 1 });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [post.id, toast]);

  // 내가 공감했는지
  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    fetchMyReaction(post.id, memberId)
      .then((on) => !cancelled && setReacted(on))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [post.id, memberId]);

  async function toggleReaction() {
    if (!memberId) {
      setGateOpen(true);
      return;
    }
    if (reacting) return;
    const next = !reacted;
    setReacting(true);
    try {
      await setReaction(post.id, memberId, next);
      setReacted(next);
      onCounts({ reactions: next ? 1 : -1 });
    } catch {
      toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
    } finally {
      setReacting(false);
    }
  }

  const trimmed = body.trim();
  const ready = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready || sending) return;
    const key = `${post.id}:${trimmed}`;
    const now = Date.now();
    if (last.current && last.current.key === key && now - last.current.at < RESUBMIT_GUARD_MS) return;
    last.current = { key, at: now };
    setSending(true);
    try {
      const c = await insertComment(post.id, trimmed);
      if (!known.current.has(c.id)) {
        known.current.add(c.id);
        setComments((s) => (s.status === "loading" ? s : { ...s, items: [...s.items, c] }));
        onCounts({ comments: 1 });
      }
      setBody("");
    } catch {
      // 입력 내용은 그대로 둔다 (FEATURES.md §6)
      toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
    } finally {
      setSending(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(D.deleteConfirm)) return;
    try {
      await deleteComment(id);
      known.current.delete(id);
      setComments((s) => (s.status === "loading" ? s : { ...s, items: s.items.filter((c) => c.id !== id) }));
      onCounts({ comments: -1 });
    } catch {
      toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
    }
  }

  const items = comments.status === "loading" ? [] : comments.items;
  const next = encodeURIComponent(`${pathname}?post=${post.id}`);

  return (
    <div className="flex flex-col gap-6">
      {/* 공감 */}
      <div>
        <Button
          variant={reacted ? "primary" : "secondary"}
          onClick={toggleReaction}
          loading={reacting}
          aria-pressed={reacted}
          aria-label={`${D.reactLabel(reacted)} (${post.reactions})`}
        >
          {D.react} {post.reactions}
        </Button>
      </div>

      {/* 댓글 스레드 */}
      <section aria-labelledby={`comments-${post.id}`} className="flex flex-col gap-4 border-t border-line pt-6">
        <h3 id={`comments-${post.id}`} className="text-label tracking-0 text-text-2">
          {D.commentsTitle} {post.comments}
        </h3>

        {comments.status === "loading" && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {comments.status === "ready" && items.length === 0 && <p className="text-ui text-text-2">{D.commentsEmpty}</p>}
        {items.length > 0 && (
          <ul className="flex flex-col divide-y divide-line">
            {items.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-4 first:pt-0">
                <p className="flex items-center justify-between gap-4 text-caption text-text-2">
                  <span>
                    <span className="font-medium text-text">{c.author || D.anonymous}</span>
                    {c.authorJob && <span> · 전 {c.authorJob}</span>}
                    <span className="text-text-3"> · {timeAgo(c.createdAt)}</span>
                  </span>
                  {memberId === c.userId && (
                    <Button variant="ghost" onClick={() => onDelete(c.id)}>
                      {D.delete}
                    </Button>
                  )}
                </p>
                <p className="text-body whitespace-pre-line text-text">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {/* 댓글 쓰기 */}
        {auth.status === "member" ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <TextArea
              label={D.commentLabel}
              placeholder={D.commentPlaceholder}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={COMMENT_MAX_LENGTH}
              showCount
              rows={3}
              disabled={sending}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!ready} loading={sending}>
                {D.commentSubmit}
              </Button>
            </div>
          </form>
        ) : auth.status === "guest" ? (
          <div className="flex flex-col items-start gap-3 rounded-sm border border-line bg-surface p-5">
            <p className="text-body text-text">{D.guest}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/join?next=${next}`}>{D.join}</ButtonLink>
              <ButtonLink href={`/login?next=${next}`} variant="secondary">
                {D.login}
              </ButtonLink>
            </div>
          </div>
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
      </section>

      <AuthGate open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  );
}
