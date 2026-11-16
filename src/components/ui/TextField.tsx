"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 TextField / TextArea — 라벨, 도움말, 오류 메시지, 글자 수 카운터
// 검증 규칙과 문구는 FEATURES.md §6 (입력칸 아래 빨간 안내)

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
      <label htmlFor={id} className="text-body font-semibold text-text">
        {label}
        {required && (
          <span className="ml-1 text-brand" aria-hidden>
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
  "w-full rounded-sm border bg-surface px-4 py-3 text-body text-text placeholder:text-text-3 " +
  "transition-colors duration-fast ease-out " +
  "focus:border-brand disabled:cursor-not-allowed disabled:text-text-3";

function controlClasses(invalid: boolean, className?: string) {
  return cn(CONTROL, invalid ? "border-danger" : "border-line hover:enabled:border-text-3", className);
}

type CommonProps = {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  /** true 이면 maxLength 기준 카운터를 표시 */
  showCount?: boolean;
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
        className={controlClasses(Boolean(error), className)}
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
        className={controlClasses(Boolean(error), cn("resize-y", className))}
        {...rest}
      />
    </FieldFrame>
  );
}
