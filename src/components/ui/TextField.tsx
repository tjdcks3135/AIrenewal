"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 TextField / TextArea — 피그마 OPUS Common UI "Input" (node 173:302)
// 라벨(12px 500) + 입력칸(48px, 안쪽 12px, 1px 테두리, Paper White) + 도움말(12px), 모서리 4px.
// 포커스 시 회녹색 테두리, 비활성은 Silver Gray. 오류는 빨간 테두리·문구(사이트 추가분, FEATURES.md §6).

type FieldFrameProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  /** 글자 수 카운터: 현재 길이와 최대 길이 */
  count?: { current: number; max: number };
  children: ReactNode;
};

function FieldFrame({ id, label, required, help, error, count, children }: FieldFrameProps) {
  const over = count ? count.current > count.max : false;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption font-medium text-text">
        {label}
        {required && (
          <span className="ml-1 text-action" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> ({UI_TEXT.required})</span>}
      </label>
      {children}
      {(help || error || count) && (
        <div className="flex items-start justify-between gap-4 text-caption">
          <p id={`${id}-desc`} className={error ? "text-danger" : "text-text-2"}>
            {error || help}
          </p>
          {count && (
            <p
              aria-live="polite"
              className={cn("shrink-0 tabular-nums", over ? "text-danger" : "text-text-3")}
            >
              {count.current}/{count.max}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-sm border px-3 text-body text-text placeholder:text-text-2 " +
  "transition-colors duration-fast ease-out " +
  "focus:border-action disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-2";

/** solid: 기본(Paper White) / glass: 안개 위 유리 패널 안 — 바탕 없이 테두리만 (DESIGN.md §1.6 --blur-glass) */
export type FieldSurface = "solid" | "glass";

function controlClasses(invalid: boolean, surface: FieldSurface, className?: string) {
  return cn(
    CONTROL,
    surface === "glass" ? "bg-transparent" : "bg-surface",
    invalid ? "border-danger" : "border-line hover:enabled:border-text-2",
    className,
  );
}

type CommonProps = {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  /** true 이면 maxLength 기준 카운터를 표시 */
  showCount?: boolean;
  surface?: FieldSurface;
};

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & CommonProps & { id?: string };

export function TextField({
  id,
  label,
  help,
  error,
  showCount,
  required,
  maxLength,
  value,
  surface = "solid",
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const length = typeof value === "string" ? value.length : 0;
  return (
    <FieldFrame
      id={fieldId}
      label={label}
      required={required}
      help={help}
      error={error}
      count={showCount && maxLength ? { current: length, max: maxLength } : undefined}
    >
      <input
        id={fieldId}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={help || error ? `${fieldId}-desc` : undefined}
        className={controlClasses(Boolean(error), surface, cn("h-7", className))}
        {...rest}
      />
    </FieldFrame>
  );
}

type TextAreaProps = Omit<ComponentProps<"textarea">, "id"> & CommonProps & { id?: string };

export function TextArea({
  id,
  label,
  help,
  error,
  showCount,
  required,
  maxLength,
  value,
  rows = 4,
  surface = "solid",
  className,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const length = typeof value === "string" ? value.length : 0;
  return (
    <FieldFrame
      id={fieldId}
      label={label}
      required={required}
      help={help}
      error={error}
      count={showCount && maxLength ? { current: length, max: maxLength } : undefined}
    >
      <textarea
        id={fieldId}
        required={required}
        maxLength={maxLength}
        value={value}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={help || error ? `${fieldId}-desc` : undefined}
        className={controlClasses(Boolean(error), surface, cn("resize-y py-3", className))}
        {...rest}
      />
    </FieldFrame>
  );
}
