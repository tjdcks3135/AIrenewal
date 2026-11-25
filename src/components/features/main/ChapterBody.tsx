"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCounter } from "@/components/ui/StatCounter";
import { MAIN_LIVE, MAIN_STORY, type MainChapterKey } from "@/content/main";
import { NAV_ITEMS, NAV_TEXT, NEXT_STEPS } from "@/content/nav";
import { useAuth } from "@/hooks/useAuth";
import type { CountState } from "@/hooks/useFeelingCount";
import type { ListState } from "@/hooks/useRecentDiscussions";
import { cn } from "@/lib/cn";
import type { DiscussionPreview } from "@/lib/data";
import { timeAgo } from "@/lib/format";

// 메인 섹션 2~5 의 글 영역: 인덱스 · 메뉴 이름 · 제목 · 한 줄 설명 · 실시간 데이터 · 링크 (PAGES.md §2)
// ScrollStory(데스크톱)와 PhotoSection(모바일·캡처)이 함께 쓴다.

export type Chapter = (typeof MAIN_STORY.chapters)[number];

export const TOTAL_SECTIONS = 5; // 히어로 + 4장

const LABELS: Record<MainChapterKey, string> = {
  kit: NAV_ITEMS[1].label,
  grow: NAV_ITEMS[2].label,
  community: NAV_ITEMS[3].label,
  join: NAV_TEXT.join,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** 실시간 데이터는 페이지에서 한 번만 불러와 내려준다 (장이 바뀌어도 다시 불러오지 않게) */
export type MainLiveData = { feelings: CountState; discussions: ListState<DiscussionPreview> };

function FeelingCount({ count }: { count: CountState }) {
  return (
    <StatCounter
      value={count.status === "loading" ? null : count.value}
      format={MAIN_LIVE.feelings}
      className="text-h3 text-action"
    />
  );
}

function RecentDiscussions({ list }: { list: ListState<DiscussionPreview> }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-label tracking-0 text-text-3">{MAIN_LIVE.recentDiscussionsLabel}</p>
      {list.status === "loading" && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}
      {list.status === "ready" && list.items.length === 0 && (
        <p className="text-body text-text-2">{MAIN_LIVE.emptyDiscussions}</p>
      )}
      {list.status === "ready" && list.items.length > 0 && (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {list.items.map((post) => (
            <li key={post.id}>
              <Link
                href={`/community?post=${post.id}`}
                className="flex items-baseline justify-between gap-4 py-3 transition-colors duration-fast ease-out hover:text-action"
              >
                <span className="text-body font-semibold">{post.title}</span>
                <span className="shrink-0 text-caption text-text-3">{timeAgo(post.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ChapterBodyProps = {
  chapter: Chapter;
  /** 0부터 (섹션 번호는 index + 2) */
  index: number;
  live: MainLiveData;
  className?: string;
};

export function ChapterBody({ chapter, index, live, className }: ChapterBodyProps) {
  const auth = useAuth();

  // 가입 섹션: 이미 조합원이면 AI키우기로 (IA.md §3)
  const isMemberJoin = chapter.key === "join" && auth.status === "member";
  const href = isMemberJoin ? NEXT_STEPS.memberToGrow.href : chapter.href;
  const linkLabel = isMemberJoin ? NEXT_STEPS.memberToGrow.title : LABELS[chapter.key];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="flex items-center gap-4 text-label uppercase">
        <span className="text-action tabular-nums">
          {pad(index + 2)} / {pad(TOTAL_SECTIONS)}
        </span>
        <span className="tracking-0 text-text-2">{LABELS[chapter.key]}</span>
      </p>
      <h2 className="text-h2 text-text">{chapter.title}</h2>
      {chapter.description && <p className="text-lead text-text-2">{chapter.description}</p>}
      {chapter.key === "grow" && <FeelingCount count={live.feelings} />}
      {chapter.key === "community" && <RecentDiscussions list={live.discussions} />}
      <div>
        <ButtonLink href={href} variant={chapter.key === "join" ? "primary" : "secondary"} size="lg">
          {linkLabel} →
        </ButtonLink>
      </div>
    </div>
  );
}
