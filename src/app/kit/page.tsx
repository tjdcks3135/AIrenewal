import { PagePlaceholder } from "@/app/_placeholder/PagePlaceholder";
import { PageLayout } from "@/components/layout/PageLayout";
import { NAV_ITEMS } from "@/content/nav";

// TODO: 키트 설명 페이지 본문 (docs/PAGES.md) — 5단계
export default function Page() {
  return (
    <PageLayout next="kit">
      <PagePlaceholder title={NAV_ITEMS[1].label} />
    </PageLayout>
  );
}
