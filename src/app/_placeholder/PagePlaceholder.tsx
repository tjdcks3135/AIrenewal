import { SectionHeader } from "@/components/layout/SectionHeader";
import { UI_TEXT } from "@/content/ui";

// 임시: 5단계에서 각 페이지 본문으로 교체한다. (app/_placeholder 는 라우트가 아니다)
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="container-page flex flex-col gap-7 py-9">
      <SectionHeader as="h1" title={title} />
      <div className="flex h-11 items-center justify-center rounded-lg border border-dashed border-line bg-surface">
        <p className="px-5 text-center text-caption text-text-3">{UI_TEXT.todoBody}</p>
      </div>
    </div>
  );
}
