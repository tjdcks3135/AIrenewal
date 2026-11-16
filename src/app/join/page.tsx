import { PagePlaceholder } from "@/app/_placeholder/PagePlaceholder";
import { PageLayout } from "@/components/layout/PageLayout";
import { NAV_TEXT } from "@/content/nav";

// TODO: 가입하기 페이지 본문 (docs/PAGES.md) — 5단계
export default function Page() {
  return (
    <PageLayout next="join">
      <PagePlaceholder title={NAV_TEXT.join} />
    </PageLayout>
  );
}
