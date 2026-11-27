import type { ReactNode } from "react";
import type { NextStepKey } from "@/content/nav";
import { cn } from "@/lib/cn";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { NextStepCTA } from "./NextStepCTA";

// 모든 페이지 공통 셸: Header(GNB) + 본문 + NextStepCTA + Footer (PAGES.md 공통, CLAUDE.md §3)

type PageLayoutProps = {
  /** 하단 "다음 단계" CTA (IA.md §3). null 이면 표시하지 않음 */
  next: NextStepKey | null;
  /** 로그인한 조합원에게는 이 단계를 대신 보여준다 (IA.md §3) */
  memberNext?: NextStepKey;
  /** true 면 본문이 투명 헤더 아래까지 올라간다 (히어로 사진 등) */
  underHeader?: boolean;
  children: ReactNode;
  className?: string;
};

export function PageLayout({ next, memberNext, underHeader = false, children, className }: PageLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className={cn("flex-1", !underHeader && "pt-8", className)}>
        {children}
      </main>
      {next && <NextStepCTA step={next} memberStep={memberNext} />}
      <Footer />
    </div>
  );
}
