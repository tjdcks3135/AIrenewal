import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Button — primary(민트 배경) · secondary(외곽선) · ghost(텍스트) / md·lg

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill whitespace-nowrap " +
  "transition-colors duration-fast ease-out select-none " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-strong active:bg-brand-strong hover:shadow-glow " +
    "disabled:bg-surface-2 disabled:text-text-3 disabled:shadow-none " +
    "aria-disabled:bg-surface-2 aria-disabled:text-text-3",
  secondary:
    "border border-text-2 text-text hover:border-brand hover:text-brand active:bg-surface-2 " +
    "disabled:border-line disabled:text-text-3 disabled:hover:text-text-3 " +
    "aria-disabled:border-line aria-disabled:text-text-3",
  ghost:
    "text-text-2 hover:text-text active:text-brand " +
    "disabled:text-text-3 disabled:hover:text-text-3 aria-disabled:text-text-3",
};

const SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-body font-semibold",
  lg: "px-6 py-4 text-body-lg font-bold",
};

// ghost 는 텍스트 버튼이므로 좌우 패딩을 줄인다
const GHOST_SIZES: Record<ButtonSize, string> = {
  md: "px-2 py-3 text-body font-semibold",
  lg: "px-3 py-4 text-body-lg font-bold",
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
