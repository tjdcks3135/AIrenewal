// 공통 UI 컴포넌트 안에서 쓰는 짧은 문구 (스크린리더용 포함)

export const UI_TEXT = {
  close: "닫기",
  loading: "처리 중",
  required: "필수",
  stepOf: (current: number, total: number) => `Step ${current}/${total}`,
  /** 사진 자리 플레이스홀더 (CLAUDE.md §6) */
  photoNo: (no: string) => `사진 ${no}`,
  /** 5단계(페이지 구현) 전까지 본문 자리 표시 */
  todoBody: "TODO: 페이지 본문 — CLAUDE.md §4 작업 순서 5단계에서 구현",
} as const;
