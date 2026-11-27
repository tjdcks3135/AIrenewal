import { KitContent } from "@/components/features/kit/KitContent";
import { PageLayout } from "@/components/layout/PageLayout";

// 키트 설명 `/kit` — docs/PAGES.md §4. 다음 단계: 가입하기("생존키트 받기") / 조합원은 AI키우기 (IA.md §3)
export default function Page() {
  return (
    <PageLayout next="kit" memberNext="memberToGrow" underHeader>
      <KitContent />
    </PageLayout>
  );
}
