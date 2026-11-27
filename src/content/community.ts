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
  /** 이야기 작성 창 (CONTENT.md — 이야기 작성 창 문구) */
  compose: {
    title: "이야기 남기기",
    // [이전]
    description: "당신의 이야기가 새로운 버블이 되어 광장에 떠오릅니다.",
    category: "카테고리",
    postTitle: "제목",
    // [이전]
    titlePlaceholder: "이야기의 제목을 적어주세요",
    body: "이야기",
    // [이전]
    bodyPlaceholder: "당신의 이야기를 들려주세요. 줄을 바꾸면 문단이 나뉩니다.",
    cancel: "취소",
    submit: "버블로 띄우기",
    // [초안]
    done: "이야기가 광장에 떠올랐어요",
  },
} as const;
