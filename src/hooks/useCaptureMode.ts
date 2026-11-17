"use client";

import { useSyncExternalStore } from "react";

// 캡처 모드: URL 에 ?capture=1 (FEATURES.md §3.4). 움직임을 멈추고 정지 배치로 보여준다.

const subscribe = () => () => {};
const getSnapshot = () => new URLSearchParams(window.location.search).get("capture") === "1";
const getServerSnapshot = () => false;

export function useCaptureMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
