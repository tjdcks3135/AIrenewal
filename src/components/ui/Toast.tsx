"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Toast — 성공/오류 알림, 3초
// 사용: 루트에 <ToastProvider> 를 두고, 컴포넌트에서 const toast = useToast(); toast.show({ tone, message })

export type ToastTone = "success" | "error";

type ToastItem = { id: number; tone: ToastTone; message: ReactNode };

type ToastApi = { show: (toast: { tone: ToastTone; message: ReactNode }) => void };

const TOAST_DURATION_MS = 3000;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast 는 <ToastProvider> 안에서만 쓸 수 있습니다.");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback<ToastApi["show"]>(
    ({ tone, message }) => {
      const id = nextId.current++;
      setItems((list) => [...list, { id, tone, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), TOAST_DURATION_MS));
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  // 토스트 영역을 popover(top layer)로 띄워, 열린 Overlay(<dialog>) 위에도 보이게 한다.
  // 새 토스트가 올 때마다 다시 열어 top layer 의 맨 위로 올린다.
  const regionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    if (region.matches(":popover-open")) region.hidePopover();
    if (items.length > 0) region.showPopover();
  }, [items]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        ref={regionRef}
        popover="manual"
        className="pointer-events-none inset-x-0 top-auto bottom-6 m-0 w-full overflow-visible border-0 bg-transparent px-4 py-0 open:flex flex-col items-center gap-3"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-center gap-3 rounded-pill border border-line bg-surface px-5 py-3 text-body text-text shadow-overlay"
          >
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-pill", t.tone === "error" ? "bg-danger" : "bg-brand")}
            />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
