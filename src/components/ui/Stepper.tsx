import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Stepper — 가입 단계 표시 (PAGES.md §5 "상단 진행 표시(Step 1/4)")

type StepperProps = {
  /** 단계 제목 목록 (content 에서 전달) */
  steps: readonly string[];
  /** 현재 단계, 1부터 시작 */
  current: number;
  className?: string;
};

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-label uppercase text-brand">{UI_TEXT.stepOf(current, steps.length)}</p>
      <ol className="grid grid-flow-col auto-cols-fr gap-2">
        {steps.map((title, i) => {
          const step = i + 1;
          const state = step < current ? "done" : step === current ? "current" : "upcoming";
          return (
            <li
              key={title}
              aria-current={state === "current" ? "step" : undefined}
              className="flex flex-col gap-2"
            >
              <span
                aria-hidden
                className={cn(
                  "h-1 rounded-pill transition-colors duration-base ease-out",
                  state === "upcoming" ? "bg-line" : "bg-brand",
                )}
              />
              <span
                className={cn(
                  "hidden text-caption md:block",
                  state === "current" ? "font-semibold text-text" : "text-text-3",
                )}
              >
                {title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
