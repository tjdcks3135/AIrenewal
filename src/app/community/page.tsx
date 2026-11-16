import { PagePlaceholder } from "@/app/_placeholder/PagePlaceholder";
import { PageLayout } from "@/components/layout/PageLayout";
import { NAV_ITEMS } from "@/content/nav";

// TODO: 커뮤니티 페이지 본문 (docs/PAGES.md) — 5단계
export default function Page() {
  return (
    <PageLayout next="community">
      <PagePlaceholder title={NAV_ITEMS[3].label} />
    </PageLayout>
  );
}
