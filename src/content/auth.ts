// 인증 관련 문구 — 원본: docs/PAGES.md §6, docs/FEATURES.md §1·§6

export const AUTH_TEXT = {
  login: {
    title: "로그인",
    email: "이메일",
    password: "비밀번호",
    submit: "로그인",
    toJoinQuestion: "아직 조합원이 아니신가요?",
    toJoinLink: "가입하기",
  },
  member: {
    /** GNB: "No.#3903 ○○○" */
    badge: (memberNo: number, name: string) => `No.#${memberNo} ${name}`,
    logout: "로그아웃",
  },
  gate: {
    title: "조합원만 할 수 있어요",
    join: "가입하기",
    login: "로그인",
  },
  errors: {
    // FEATURES.md §6 원문
    loginFailed: "이메일 또는 비밀번호를 확인해 주세요",
    duplicateEmail: "이미 조합원이에요. 로그인해 주세요",
    network: "연결이 잠시 끊겼어요. 다시 시도해 주세요",
    // [초안] FEATURES.md §6 은 검증 항목만 정하고 문구는 없다 — 팀 확인 필요
    required: "꼭 입력해 주세요",
    emailFormat: "이메일 형식을 확인해 주세요",
    passwordLength: "비밀번호는 8자 이상이어야 해요",
  },
} as const;
