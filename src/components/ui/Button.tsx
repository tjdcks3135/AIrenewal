import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Button — 피그마 OPUS Common UI "Button" (node 173:266)
// primary(회녹색 + Paper White, 호버 차콜) · secondary(Paper White + 1px 테두리) · ghost(텍스트, 사이트 추가분)
// size: md = 피그마 Small(40px), lg = 피그마 Large(52px). 좌우 16px, 모서리 4px, 글자 ui(14px 500).
// 포커스는 전역 :focus-visible 테두리(회녹색)로 표시한다.

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm text-ui whitespace-nowrap " +
  "transition-colors duration-fast ease-out select-none " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-on-action hover:bg-action-strong active:bg-action-strong " +
    "disabled:bg-surface-2 disabled:text-text-2 disabled:hover:bg-surface-2 " +
    "aria-disabled:bg-surface-2 aria-disabled:text-text-2",
  // 피그마 secondary 는 호버가 기본과 같다. 사이트에서는 포커스와 같은 회녹색 테두리로 호버를 알린다.
  secondary:
    "border border-line bg-surface text-text hover:border-action active:border-action " +
    "disabled:bg-surface-2 disabled:text-text-2 disabled:hover:border-line " +
    "aria-disabled:bg-surface-2 aria-disabled:text-text-2",
  ghost:
    "text-text-2 hover:text-text active:text-action " +
    "disabled:text-text-3 disabled:hover:text-text-3 aria-disabled:text-text-3",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-control-sm px-4",
  lg: "h-control-lg px-4",
};

// ghost 는 텍스트 버튼이므로 좌우 패딩을 줄인다
const GHOST_SIZES: Record<ButtonSize, string> = {
  md: "h-control-sm px-2",
  lg: "h-control-lg px-2",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    BASE,
    VARIANTS[variant],
    variant === "ghost" ? GHOST_SIZES[size] : SIZES[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 제출 중: 비활성 + 로딩 표시 (FEATURES.md §6 연속 제출) */
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      <span className={cn("inline-flex items-center gap-2", loading && "animate-breath")}>
        {children}
      </span>
      {loading && <span className="sr-only">{UI_TEXT.loading}</span>}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
};

/** 버튼 모양의 링크 (페이지 이동용). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  disabled,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    />
  );
}
