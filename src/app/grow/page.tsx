import { GrowContent } from "@/components/features/grow/GrowContent";
import { PageLayout } from "@/components/layout/PageLayout";

// AI키우기 `/grow` — docs/PAGES.md §7. 다음 단계: 커뮤니티 (IA.md §3)
export default function Page() {
  return (
    <PageLayout next="grow" underHeader>
      <GrowContent />
    </PageLayout>
  );
}
