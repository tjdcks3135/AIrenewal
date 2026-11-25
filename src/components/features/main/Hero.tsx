"use client";

import { ButtonLink } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { MAIN_HERO } from "@/content/main";
import { NAV_ITEMS } from "@/content/nav";
import { useAuth } from "@/hooks/useAuth";
import { TOTAL_SECTIONS } from "./ChapterBody";

// 메인 섹션 1 — 히어로: 사진 ① + 모토 + 연대노동조합 · 2031 → 선언문 (PAGES.md §2)
// 사진 위 글은 아래쪽에 --color-bg → 투명 그라데이션을 깔아 대비를 확보한다 (DESIGN.md §5).

export function Hero() {
  const auth = useAuth();
  const { motto } = MAIN_HERO;

  return (
    <section className="relative flex min-h-dvh items-end">
      <PhotoFrame photo={MAIN_HERO.photo} priority placeholderAlign="top" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-bg via-bg/80 to-transparent" />

      <div className="relative container-page flex flex-col gap-6 pt-10 pb-9">
        <p className="flex items-center gap-4 text-label uppercase">
          <span className="text-action tabular-nums">01 / {String(TOTAL_SECTIONS).padStart(2, "0")}</span>
          <span className="tracking-0 text-text-2">{MAIN_HERO.label}</span>
        </p>
        <h1 className="text-h1 text-text lg:w-3/4">
          {motto.before}
          <span className="text-action">{motto.emphasis}</span>
          {motto.after}
        </h1>
        {auth.status === "member" && (
          <p className="text-lead text-text-2">{MAIN_HERO.memberLine(auth.member.memberNo)}</p>
        )}
        <div>
          <ButtonLink href="/manifesto" size="lg">
            {NAV_ITEMS[0].label} →
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
