"use client";

import Link from "next/link";
import { NEXT_STEP_LABEL, NEXT_STEPS, type NextStepKey } from "@/content/nav";
import { useAuth } from "@/hooks/useAuth";

// DESIGN.md §3 NextStepCTA — 다음 페이지 제목 + 화살표 라인. 본문 끝, Footer 바로 위 (IA.md §3)
// TODO(팀): 발표자료의 "사다리형 화살표 라인" 모티프 SVG 가 준비되면 ArrowLine 을 교체

function ArrowLine() {
  return (
    <span aria-hidden className="flex min-w-8 flex-1 items-center text-text-3 transition-colors duration-base ease-out group-hover:text-action">
      <span className="h-px flex-1 bg-current" />
      <svg viewBox="0 0 24 24" className="-ml-1 size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 5l7 7-7 7M3 12h18" />
      </svg>
    </span>
  );
}

type NextStepCTAProps = {
  step: NextStepKey;
  /** 로그인한 조합원에게 대신 보여줄 단계 (IA.md §3: 선언문·키트 설명 → "AI키우기로 가기") */
  memberStep?: NextStepKey;
};

export function NextStepCTA({ step, memberStep }: NextStepCTAProps) {
  const auth = useAuth();
  const { href, title } = NEXT_STEPS[memberStep && auth.status === "member" ? memberStep : step];
  return (
    <section aria-label={NEXT_STEP_LABEL} className="border-t border-line">
      <Link href={href} className="group container-page flex flex-col gap-4 py-8 md:py-10">
        <span className="text-label uppercase text-text-3">{NEXT_STEP_LABEL}</span>
        <span className="flex items-center gap-6">
          <span className="text-h2 text-text transition-colors duration-base ease-out group-hover:text-action">
            {title}
          </span>
          <ArrowLine />
        </span>
      </Link>
    </section>
  );
}
