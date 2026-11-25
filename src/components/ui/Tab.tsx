import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Tab — 피그마 OPUS Common UI "Tab" (node 173:344)
// 높이 44px, 좌우 16px, 모서리 4px, ui(14px 500).
// 기본: 투명 + 차콜 글자 / 호버: Silver Gray / 활성: 회녹색 + Paper White.
// 카테고리 필터처럼 하나를 고르는 버튼 묶음에 쓴다 (aria-pressed 로 상태를 알림).

type TabProps = Omit<ComponentProps<"button">, "children"> & {
  active: boolean;
  children: ReactNode;
};

export function Tab({ active, className, type = "button", children, ...rest }: TabProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex h-control-md items-center justify-center gap-2 rounded-sm px-4 text-ui whitespace-nowrap",
        "transition-colors duration-fast ease-out",
        active ? "bg-action text-on-action" : "text-text hover:bg-surface-2",
        "disabled:cursor-not-allowed disabled:text-text-3 disabled:hover:bg-transparent",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** 탭 묶음. 가로로 나열하고 좁은 화면에서는 줄바꿈한다. */
export function TabList({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div role="group" className={cn("flex flex-wrap items-center gap-2", className)} {...rest}>
      {children}
    </div>
  );
}
