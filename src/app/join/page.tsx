import { Suspense } from "react";
import { JoinFlow } from "@/components/features/join/JoinFlow";
import { PageLayout } from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { JOIN_TEXT } from "@/content/join";

// 가입하기 `/join` — docs/PAGES.md §5. 왼쪽: 타이틀·설명·모토 / 오른쪽: 단계 진행 (이전 사이트 구도)
// 다음 단계: AI키우기 "아이에게 첫 마음 전하기" (IA.md §3)
export default function Page() {
  return (
    <PageLayout next="join">
      <div className="container-page grid grid-cols-1 gap-8 py-9 lg:grid-cols-12 lg:gap-gutter lg:py-10">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h1 className="text-h1 text-text">{JOIN_TEXT.title}</h1>
          <p className="text-lead text-text-2">{JOIN_TEXT.description}</p>
          <figure className="mt-auto hidden flex-col gap-2 border-t border-line pt-6 lg:flex">
            <blockquote className="text-h3 text-text">{JOIN_TEXT.motto}</blockquote>
            <figcaption className="text-caption text-text-3">— {JOIN_TEXT.mottoSource}</figcaption>
          </figure>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          {/* ?next= 를 읽으므로 Suspense 안에서 (cacheComponents) */}
          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
            <JoinFlow />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}
