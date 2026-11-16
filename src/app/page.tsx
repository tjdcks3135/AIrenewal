import { PagePlaceholder } from "@/app/_placeholder/PagePlaceholder";
import { PageLayout } from "@/components/layout/PageLayout";
import { UNION } from "@/content/world";

// TODO: 메인 페이지 본문 (docs/PAGES.md §2) — 5단계. 히어로가 생기면 underHeader 사용
// 메인은 IA.md §3 표에 "다음 단계"가 없다 (모든 페이지의 입구이므로)
export default function Home() {
  return (
    <PageLayout next={null}>
      <PagePlaceholder title={UNION.nameKo} />
    </PageLayout>
  );
}
