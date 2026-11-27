import Link from "next/link";
import type { Ref } from "react";
import { CATEGORIES, type Category } from "@/content/taxonomy";
import { cn } from "@/lib/cn";
import type { PostView } from "@/lib/data";
import { timeAgo } from "@/lib/format";

// DESIGN.md §3 Bubble — 커뮤니티 버블 S/M/L. 카테고리 색 빛(aura) 위에 카테고리 · 제목 · 날짜 (큰 버블은 첫 문장 일부까지)
// 위치는 BubbleMotion 이 transform 으로 정한다. 필터에서 빠진 버블은 흐리고 작게 (사라지지 않음 — FEATURES.md §3.3)

export type BubbleSize = "sm" | "md" | "lg";

/** 대화량(댓글 + 공감)으로 크기 — PAGES.md §8 (TODO(팀) 기준 확정) */
export function bubbleSize(post: PostView): BubbleSize {
  const talk = post.comments + post.reactions;
  return talk >= 3 ? "lg" : talk === 2 ? "md" : "sm";
}

const SIZES: Record<BubbleSize, string> = {
  sm: "size-bubble-sm",
  md: "size-bubble-md",
  lg: "size-bubble-lg",
};

// Tailwind 가 찾을 수 있도록 정적 문자열 — 방사형 빛의 가운데 색
const AURA: Record<Category, string> = {
  discussion: "from-cat-discussion",
  today: "from-cat-today",
  kit: "from-cat-kit",
  meetup: "from-cat-meetup",
};

const categoryLabel = (key: Category) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

/** 첫 문장 (큰 버블에만) */
const firstSentence = (body: string) => body.split(/(?<=[.?!。])\s/)[0];

type BubbleProps = {
  post: PostView;
  /** 필터에서 빠짐 → 흐리고 작게 */
  dimmed: boolean;
  nodeRef: Ref<HTMLAnchorElement>;
  onHover: (hovering: boolean) => void;
};

export function Bubble({ post, dimmed, nodeRef, onHover }: BubbleProps) {
  const size = bubbleSize(post);
  return (
    <Link
      ref={nodeRef}
      href={`?post=${post.id}`}
      scroll={false}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      aria-label={`${categoryLabel(post.category)} · ${post.title}`}
      className={cn(
        "group absolute top-0 left-0 rounded-pill opacity-0",
        SIZES[size],
        dimmed && "pointer-events-none",
      )}
    >
      <span
        className={cn(
          "flex size-full flex-col items-center justify-center transition duration-slow ease-out",
          dimmed ? "scale-75 opacity-30" : "group-hover:scale-105",
        )}
      >
        {/* 빛(aura): 카테고리 색이 가운데서 바깥으로 번진다 */}
        <span aria-hidden className={cn("absolute -inset-3 rounded-pill bg-radial to-transparent to-70% blur-aura", AURA[post.category])} />
        <span className="relative flex flex-col items-center gap-1 px-5 text-center">
          <span className="text-caption font-medium text-text-2">{categoryLabel(post.category)}</span>
          <span className="line-clamp-3 text-ui font-semibold text-text">{post.title}</span>
          {size === "lg" && <span className="line-clamp-2 text-caption text-text-2">{firstSentence(post.body)}</span>}
          <span className="text-caption text-text-3">{timeAgo(post.createdAt)}</span>
        </span>
      </span>
    </Link>
  );
}
