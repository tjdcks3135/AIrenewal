import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Skeleton — 로딩 상태 (FEATURES.md §6: 형태만 있는 회색 블록)
// 크기는 className 으로 지정한다 (예: "h-5 w-full").

type SkeletonProps = ComponentProps<"div"> & {
  shape?: "block" | "pill" | "circle";
};

const SHAPES = {
  block: "rounded-md",
  pill: "rounded-pill",
  circle: "rounded-pill aspect-square",
} as const;

export function Skeleton({ shape = "block", className, ...rest }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-breath bg-surface-2", SHAPES[shape], className)} {...rest} />;
}
