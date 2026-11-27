import { ManifestoContent } from "@/components/features/manifesto/ManifestoContent";
import { PageLayout } from "@/components/layout/PageLayout";

// 선언문 `/manifesto` — docs/PAGES.md §3. 다음 단계: 가입하기 / 조합원은 AI키우기 (IA.md §3)
export default function Page() {
  return (
    <PageLayout next="manifesto" memberNext="memberToGrow">
      <ManifestoContent />
    </PageLayout>
  );
}
