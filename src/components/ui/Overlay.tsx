"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Overlay — 모달·글 상세. 배경 딤 + --radius-lg
// 네이티브 <dialog> 사용: 포커스 가두기, Esc 닫기, 포커스 복귀를 브라우저가 처리한다.

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  /** 접근성 이름. 화면에 보이는 제목으로 렌더된다 */
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Overlay({ open, onClose, title, children, className }: OverlayProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // 딤(배경) 클릭 시 닫기
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-full overflow-y-auto rounded-lg border border-line bg-surface text-text shadow-overlay",
        "backdrop:bg-bg/80 sm:w-5/6 lg:w-2/3 xl:w-1/2",
        className,
      )}
    >
      <div className="relative flex flex-col gap-5 p-5 md:p-7">
        <div className="flex items-start justify-between gap-5">
          <h2 id={titleId} className="text-h3 text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={UI_TEXT.close}
            className="-m-2 shrink-0 rounded-pill p-2 text-text-2 transition-colors duration-fast ease-out hover:bg-surface-2 hover:text-text"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
