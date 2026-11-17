import { MainContent } from "@/components/features/main/MainContent";
import { PageLayout } from "@/components/layout/PageLayout";

// 메인 `/` — docs/PAGES.md §2. IA.md §3 표에 메인의 "다음 단계"는 없다 (모든 페이지의 입구).
// TODO(온보딩 단계): 첫 방문이면 /intro 로 보내기 (FEATURES.md §2) — /intro 가 아직 없음
export default function Home() {
  return (
    <PageLayout next={null} underHeader>
      <MainContent />
    </PageLayout>
  );
}
