"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Checkbox — 피그마 OPUS Common UI "Checkbox" (node 173:331)
// 24px 상자(1px 테두리, 모서리 4px, Paper White) — 체크 시 회녹색 + ✓. 라벨은 ui(14px 500).
// 비활성: 라벨이 보조 회색. 네이티브 checkbox 를 그대로 써서 키보드·스크린리더를 지원한다.

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
  label: ReactNode;
};

export function Checkbox({ label, id, className, disabled, ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 text-ui",
        disabled ? "cursor-not-allowed text-text-2" : "cursor-pointer text-text",
        className,
      )}
    >
      <span className="relative inline-flex size-5 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className="peer size-5 cursor-pointer appearance-none disabled:cursor-not-allowed rounded-sm border border-line bg-surface transition-colors duration-fast ease-out checked:border-action checked:bg-action disabled:bg-surface-2"
          {...rest}
        />
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute inset-0 m-auto size-4 text-on-action opacity-0 peer-checked:opacity-100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      {label}
    </label>
  );
}
