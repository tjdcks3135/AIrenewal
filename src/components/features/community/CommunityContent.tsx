"use client";

import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/features/AuthGate";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tab, TabList } from "@/components/ui/Tab";
import { COMMUNITY_TEXT } from "@/content/community";
import { CATEGORIES, type Category } from "@/content/taxonomy";
import { useAuth } from "@/hooks/useAuth";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { usePosts } from "@/hooks/usePosts";
import { formatNumber } from "@/lib/format";
import { BubbleField } from "./BubbleField";
import { PostComposer } from "./PostComposer";
import { PostOverlay } from "./PostOverlay";

// 커뮤니티 `/community` — PAGES.md §8 화면 구도(토대)
// 첫 화면 전체가 버블 광장. 그 위 상단에 반투명 유리 패널(타이틀 · 오늘의 질문 · 카테고리 필터)이 떠 있다.
// 버블 → 글 상세 오버레이(?post=), 우하단 [이야기 남기기]

export function CommunityContent() {
  const capture = useCaptureMode();
  const reduced = useReducedMotion() ?? false;
  const auth = useAuth();
  const { state: posts, adjust, add } = usePosts();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filter, setFilter] = useState<Category | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);

  const items = posts.status === "loading" ? [] : posts.items;
  const today = items.find((p) => p.isPinned) ?? null;
  const postId = params.get("post");

  return (
    <>
      <section aria-labelledby="community-title" className="relative h-dvh">
        {/* 버블 광장: 화면 전체 */}
        <BubbleField posts={items} filter={filter} still={capture || reduced} className="absolute inset-0" />

        {posts.status === "ready" && items.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-2/3 text-center text-body text-text-2">{COMMUNITY_TEXT.empty}</p>
        )}

        {/* 상단 유리 패널 — 빈 곳은 클릭이 뒤의 버블로 지나간다 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-b border-line/60 bg-bg/55 pt-8 backdrop-blur-glass">
          <div className="container-page flex flex-col gap-6 pt-8 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-gutter">
            <div className="flex flex-col gap-4">
              <h1 id="community-title" className="text-h1 text-text">
                {COMMUNITY_TEXT.title}
              </h1>
              {posts.status === "loading" ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-body text-text-2">{COMMUNITY_TEXT.subtitle(formatNumber(items.length))}</p>
              )}
              <TabList aria-label={COMMUNITY_TEXT.filterLabel} className="pointer-events-auto">
                <Tab active={filter === null} onClick={() => setFilter(null)}>
                  {COMMUNITY_TEXT.filterAll}
                </Tab>
                {CATEGORIES.map((c) => (
                  <Tab key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)}>
                    {c.label}
                  </Tab>
                ))}
              </TabList>
            </div>

            {/* 오늘의 질문 — 상단 고정 토론 주제 */}
            {today && (
              <Link
                href={`?post=${today.id}`}
                scroll={false}
                className="pointer-events-auto flex flex-col gap-2 rounded-sm border border-line bg-surface p-5 transition-colors duration-fast ease-out hover:border-action lg:w-1/3"
              >
                <span className="text-label tracking-0 text-action">{COMMUNITY_TEXT.todayLabel}</span>
                <span className="text-h3 text-text">{today.title}</span>
                <span className="text-caption text-text-2">{COMMUNITY_TEXT.replies(today.comments)}</span>
              </Link>
            )}
          </div>
        </div>

        {/* 우하단 고정 [이야기 남기기] */}
        {!capture && (
          <div className="fixed right-6 bottom-6 z-10">
            <Button size="lg" onClick={() => setWriteOpen(true)}>
              {COMMUNITY_TEXT.write}
            </Button>
          </div>
        )}
      </section>

      <PostOverlay
        postId={postId}
        posts={posts.status === "loading" ? null : items}
        onClose={() => router.replace(pathname, { scroll: false })}
        onCounts={adjust}
      />

      {/* 쓰기: 비로그인 → "조합원만 할 수 있어요" / 조합원 → 작성 창. 띄우면 필터를 풀어 새 버블이 보이게 */}
      <AuthGate open={writeOpen && auth.status !== "member"} onClose={() => setWriteOpen(false)} />
      <PostComposer
        open={writeOpen && auth.status === "member"}
        onClose={() => setWriteOpen(false)}
        onPosted={(post) => {
          setFilter(null);
          add(post);
        }}
      />
    </>
  );
}
