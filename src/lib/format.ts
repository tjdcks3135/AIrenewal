// 표시용 포맷 함수

const numberFormat = new Intl.NumberFormat("ko-KR");

/** 102418 → "102,418" */
export const formatNumber = (n: number) => numberFormat.format(n);

/** "3분 전", "2일 전" (FEATURES.md §3.2 마음 피드 표기) */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const sec = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}일 전`;
  const date = new Date(iso);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
}
