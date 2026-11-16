// 공통 UI 컴포넌트 안에서 쓰는 짧은 문구 (스크린리더용 포함)

export const UI_TEXT = {
  close: "닫기",
  loading: "처리 중",
  required: "필수",
  stepOf: (current: number, total: number) => `Step ${current}/${total}`,
} as const;
