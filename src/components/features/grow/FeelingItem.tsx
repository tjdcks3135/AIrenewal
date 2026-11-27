import { GROW_TEXT } from "@/content/grow";
import { cn } from "@/lib/cn";
import type { FeelingView } from "@/lib/data";
import { feelingCss } from "@/lib/feelingColor";
import { timeAgo } from "@/lib/format";

// DESIGN.md §3 FeelingItem — 마음 한 개: 색 점 · 내용 · 이름 · 시간 (FEATURES.md §3.2)
// 감정 이름은 보이지 않는다 (분석용) — 색은 사용자가 고른 색상 (DESIGN.md §1.3 마음의 색)

type FeelingItemProps = {
  feeling: FeelingView;
  /** 내용 줄 수 (넘치면 말줄임) */
  lines?: 2 | 3;
  /** 시간 표시 여부 (안개 속에서는 생략) */
  showTime?: boolean;
  /** 안개 속에서는 가운데 정렬 */
  align?: "start" | "center";
  className?: string;
};

export function FeelingItem({ feeling, lines = 2, showTime = true, align = "start", className }: FeelingItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", align === "center" && "items-center text-center", className)}>
      {/* 색 점 — 색은 사용자 데이터라 스타일 속성으로 */}
      <span aria-hidden className="size-2 shrink-0 rounded-pill" style={{ backgroundColor: feelingCss(feeling.hue) }} />
      <p className={cn("text-ui text-text", lines === 2 ? "line-clamp-2" : "line-clamp-3")}>{feeling.body}</p>
      <p className="text-caption text-text-3">
        {feeling.name || GROW_TEXT.anonymous}
        {showTime && <> · {timeAgo(feeling.createdAt)}</>}
      </p>
    </div>
  );
}
