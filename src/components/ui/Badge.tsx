import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Badge — 피그마 OPUS Common UI "Badge" (node 173:351)
// 높이 32px, 좌우 16px, 모서리 4px, 12px 500, 차콜 글자.
// neutral: Silver Gray / active: 민트(accent) / outline: 1px 테두리. 표시 전용 (누를 수 없음).

export type BadgeType = "neutral" | "active" | "outline";

const TYPES: Record<BadgeType, string> = {
  neutral: "border-transparent bg-surface-2",
  active: "border-transparent bg-accent",
  outline: "border-line bg-transparent",
};

type BadgeProps = Omit<ComponentProps<"span">, "children"> & {
  type?: BadgeType;
  children: ReactNode;
};

export function Badge({ type = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center justify-center rounded-sm border px-4 text-caption font-medium whitespace-nowrap text-text",
        TYPES[type],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
