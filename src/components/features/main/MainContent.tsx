"use client";

import { useReducedMotion } from "motion/react";
import { MAIN_STORY } from "@/content/main";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { useFeelingCount } from "@/hooks/useFeelingCount";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRecentDiscussions } from "@/hooks/useRecentDiscussions";
import type { MainLiveData } from "./ChapterBody";
import { Hero } from "./Hero";
import { PhotoSection } from "./PhotoSection";
import { Preloader } from "./Preloader";
import { ScrollStory } from "./ScrollStory";

// 메인 페이지 본문 (PAGES.md §2): 로딩 화면 → 히어로 → 섹션 2~5
// 섹션 2~5: 데스크톱은 스크롤 연출, 모바일·캡처 모드·움직임 줄이기는 정지 배치 (FEATURES.md §3.6)

export function MainContent() {
  const capture = useCaptureMode();
  const reduced = useReducedMotion() ?? false;
  const desktop = useMediaQuery("(min-width: 1024px)");
  const still = capture || reduced;

  // 실시간 데이터는 여기서 한 번만 불러와 각 장에 내려준다
  const live: MainLiveData = { feelings: useFeelingCount(), discussions: useRecentDiscussions(2) };

  return (
    <>
      <Preloader />
      <Hero />
      {desktop && !still ? (
        <ScrollStory chapters={MAIN_STORY.chapters} live={live} />
      ) : (
        MAIN_STORY.chapters.map((chapter, i) => (
          <PhotoSection key={chapter.key} chapter={chapter} index={i} live={live} still={still} />
        ))
      )}
    </>
  );
}
