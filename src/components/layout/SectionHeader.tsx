import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 SectionHeader — 인덱스(01 / 05) + label + 제목 + 설명

type SectionHeaderProps = {
  /** 섹션 번호와 전체 개수 → "01 / 05" */
  index?: { current: number; total: number };
  label?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 페이지 타이틀이면 h1, 섹션이면 h2 */
  as?: "h1" | "h2";
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function SectionHeader({ index, label, title, description, as = "h2", className }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {(index || label) && (
        <p className="flex items-center gap-4 text-label uppercase">
          {index && (
            <span className="text-brand-deep tabular-nums">
              {pad(index.current)} / {pad(index.total)}
            </span>
          )}
          {label && <span className="text-text-2">{label}</span>}
        </p>
      )}
      <Heading className={cn("text-text", as === "h1" ? "text-h1" : "text-h2")}>{title}</Heading>
      {description && <p className="text-body-lg text-text-2 lg:w-2/3">{description}</p>}
    </div>
  );
}
