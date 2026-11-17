"use client";

import { useSyncExternalStore } from "react";

// 브레이크포인트 판별. 서버에서는 false (모바일 배치) 로 렌더된다.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
