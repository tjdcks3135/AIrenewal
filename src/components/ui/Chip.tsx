import type { ComponentProps, ReactNode } from "react";
import type { Category, Emotion } from "@/content/taxonomy";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Chip — 감정 칩(8색 점, 선택 가능). 피그마 Badge 모양을 따른다.
// tone: 감정 키 또는 카테고리 키. 없으면 색 점 없는 중립 칩(예: 필터의 "전체").

export type ChipTone = Emotion | Category;

// Tailwind 가 클래스를 찾을 수 있도록 정적 문자열로 둔다.
const DOT: Record<ChipTone, string> = {
  longing: "bg-emo-longing",
  hope: "bg-emo-hope",
  joy: "bg-emo-joy",
  loneliness: "bg-emo-loneliness",
  calm: "bg-emo-calm",
  sadness: "bg-emo-sadness",
  fear: "bg-emo-fear",
  anger: "bg-emo-anger",
  discussion: "bg-cat-discussion",
  today: "bg-cat-today",
  kit: "bg-cat-kit",
  meetup: "bg-cat-meetup",
};

// 피그마 Badge 모양: 모서리 4px, 높이 32px, 좌우 16px, 12px 500.
// 선택 전: Silver Gray(neutral) / 선택: Paper White + 회녹색 테두리.
const BASE =
  "inline-flex h-6 items-center gap-2 rounded-sm border px-4 text-caption font-medium whitespace-nowrap";

function chipClasses(selected: boolean) {
  return cn(BASE, selected ? "border-action bg-surface text-text" : "border-transparent bg-surface-2 text-text");
}

function Dot({ tone }: { tone?: ChipTone }) {
  if (!tone) return null;
  return <span aria-hidden className={cn("size-3 shrink-0 rounded-pill", DOT[tone])} />;
}

type ChipButtonProps = Omit<ComponentProps<"button">, "children"> & {
  tone?: ChipTone;
  selected: boolean;
  children: ReactNode;
};

/** 선택 가능한 칩 (감정 선택, 카테고리 필터). aria-pressed 로 상태를 알린다. */
export function Chip({ tone, selected, className, type = "button", children, ...rest }: ChipButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        chipClasses(selected),
        "transition-colors duration-fast ease-out",
        !selected && "hover:border-line",
        "disabled:cursor-not-allowed disabled:text-text-3 disabled:hover:border-transparent",
        className,
      )}
      {...rest}
    >
      <Dot tone={tone} />
      {children}
    </button>
  );
}

type ChipTagProps = Omit<ComponentProps<"span">, "children"> & {
  tone?: ChipTone;
  children: ReactNode;
};

/** 표시 전용 칩 (피드 항목의 감정, 글의 카테고리 등). */
export function ChipTag({ tone, className, children, ...rest }: ChipTagProps) {
  return (
    <span className={cn(BASE, "border-transparent bg-surface-2 text-text", className)} {...rest}>
      <Dot tone={tone} />
      {children}
    </span>
  );
}
