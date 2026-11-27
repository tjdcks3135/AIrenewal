"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { Overlay } from "@/components/ui/Overlay";
import { COMMUNITY_TEXT } from "@/content/community";
import { CATEGORIES } from "@/content/taxonomy";
import type { PostCounts } from "@/hooks/usePosts";
import type { PostView } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { PostThread } from "./PostThread";

// 글 상세 오버레이 (`/community?post={id}`, IA.md §4) — 본문 → 공감 → 댓글 스레드 (PAGES.md §8)

type PostOverlayProps = {
  postId: string | null;
  posts: PostView[] | null;
  onClose: () => void;
  /** 공감·댓글 수가 바뀌면 목록(버블 크기)에 반영 */
  onCounts: (id: string, delta: PostCounts) => void;
};

export function PostOverlay({ postId, posts, onClose, onCounts }: PostOverlayProps) {
  const post = postId && posts ? posts.find((p) => p.id === postId) : undefined;
  const loading = postId !== null && posts === null;
  const title = post ? post.title : loading ? "" : COMMUNITY_TEXT.detail.notFound;
  const category = post ? CATEGORIES.find((c) => c.key === post.category)?.label : null;

  return (
    <Overlay open={postId !== null} onClose={onClose} title={title}>
      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      {post && (
        <article className="flex flex-col gap-6">
          <p className="flex flex-wrap items-center gap-3 text-caption text-text-2">
            <span className="font-medium text-text">{category}</span>
            <span>{COMMUNITY_TEXT.detail.byline(post.author, post.authorJob)}</span>
            <span className="text-text-3">{timeAgo(post.createdAt)}</span>
          </p>
          <p className="text-body whitespace-pre-line text-text">{post.body}</p>
          {/* 글을 바꿔 열면 스레드 상태도 새로 (key) */}
          <PostThread key={post.id} post={post} onCounts={(delta) => onCounts(post.id, delta)} />
        </article>
      )}
    </Overlay>
  );
}
