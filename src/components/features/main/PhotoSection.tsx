"use client";

import { motion } from "motion/react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { cn } from "@/lib/cn";
import { readDurationMs, readEase } from "@/lib/tokens";
import { ChapterBody, type Chapter, type MainLiveData } from "./ChapterBody";

// DESIGN.md §3 PhotoSection — 사진 + 글 + 링크, 좌우 배치 교차.
// 메인 섹션 2~5 의 정지 배치: 모바일·태블릿, 캡처 모드, 움직임 줄이기 (FEATURES.md §3.6).
// still=true(캡처·움직임 줄이기)면 나타나는 연출도 없다.

type PhotoSectionProps = {
  chapter: Chapter;
  index: number;
  live: MainLiveData;
  still: boolean;
};

export function PhotoSection({ chapter, index, live, still }: PhotoSectionProps) {
  const flip = index % 2 === 1;
  // still 이어도 서버에서 투명하게 그려졌을 수 있으므로 "보이는 상태"를 명시한다
  const reveal = still
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: readDurationMs("--dur-slow", 600) / 1000, ease: readEase("--ease-out", [0.16, 1, 0.3, 1]) },
      };

  return (
    <motion.section {...reveal} className="grid grid-cols-1 lg:grid-cols-12">
      {/* 사진: 모바일 4:5, 데스크톱(캡처) 3:2 + 12칸 중 7칸 — 화면 절반 이상 */}
      <div className={cn("relative aspect-4/5 lg:col-span-7 lg:aspect-3/2", flip && "lg:order-2")}>
        <PhotoFrame photo={chapter.photo} sizes="(min-width: 1024px) 60vw, 100vw" />
      </div>
      <div className={cn("container-page flex items-center py-8 lg:col-span-5 lg:px-8", flip && "lg:order-1")}>
        <ChapterBody chapter={chapter} index={index} live={live} className="w-full" />
      </div>
    </motion.section>
  );
}
