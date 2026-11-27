// 커뮤니티 페이지 문구 — 원본: docs/PAGES.md §8, docs/FEATURES.md §6

export const COMMUNITY_TEXT = {
  title: "커뮤니티",
  /** "연대노동조합의 이야기들 — 지금까지 N개의 이야기가 모였습니다" */
  subtitle: (count: string) => `연대노동조합의 이야기들 — 지금까지 ${count}개의 이야기가 모였습니다`,
  todayLabel: "오늘의 질문",
  replies: (n: number) => `답글 ${n}`,
  filterAll: "전체",
  filterLabel: "카테고리",
  plazaLabel: "이야기 버블 광장",
  /** FEATURES.md §6 원문 */
  empty: "광장이 조용해요. 첫 이야기를 띄워주세요",
  write: "이야기 남기기",
  /** 글 상세 */
  detail: {
    byline: (name: string, job: string | null) => (job ? `${name} · 전 ${job}` : name),
    notFound: "이 이야기를 찾을 수 없어요",
    react: "공감",
    reactLabel: (on: boolean) => (on ? "공감 취소" : "공감하기"),
    commentsTitle: "댓글",
    // [이전]
    commentsEmpty: "아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요.",
    // [이전]
    commentLabel: "댓글",
    commentPlaceholder: "이 이야기에 댓글을 남겨주세요",
    commentSubmit: "댓글 남기기",
    // [초안]
    guest: "조합원이 되어 이야기에 답해보세요",
    join: "가입하기",
    login: "로그인",
    delete: "삭제",
    /** 이름이 없을 때 (탈퇴 등) */
    anonymous: "조합원",
    // [초안]
    deleteConfirm: "이 댓글을 지울까요? 지운 댓글은 되돌릴 수 없어요.",
  },
  writeTodo: "TODO: 이야기 작성 모달 (PAGES.md §8 — 다음 단계)",
} as const;
