import { Suspense } from "react";
import { CommunityContent } from "@/components/features/community/CommunityContent";
import { PageLayout } from "@/components/layout/PageLayout";

// 커뮤니티 `/community` — docs/PAGES.md §8. 글 상세는 `?post={id}` 오버레이 (IA.md §4). 다음 단계: 메인 (IA.md §3)
export default function Page() {
  return (
    <PageLayout next="community" underHeader>
      {/* useSearchParams(?post=) 는 Suspense 안에서 (cacheComponents) */}
      <Suspense>
        <CommunityContent />
      </Suspense>
    </PageLayout>
  );
}
