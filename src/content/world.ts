// 세계관 공통 문구 — 원본: docs/CONTENT.md §1

export const SITE = {
  title: "연대노동조합 · Solidarity Union",
  description: "AI-I Human Labor Union — 우리는 일자리를 잃었지만, 서로를 잃지 않는다.",
} as const;

export const UNION = {
  nameKo: "연대노동조합",
  nameEn: "Solidarity Union",
  /** 글자 로고. 로고 이미지(public/images/brand/logo.png) 옆에 함께 쓴다 */
  logoText: "AI-I Human Labor Union",
} as const;

export const FOOTER = {
  copyright: "© 연대노동조합 2031 — Solidarity Union · 함께 키우는 세계",
  /** 세계관 밖의 정보 — 작고 구분되게 (IA.md §5) */
  credit: "Design Research (1) · Team B (Opus) — 남성찬, 김지우, 이연재, 최원지",
} as const;

/** 세계관 숫자 — 화면에는 "기본값 + 실제 증가분"으로 표시 (FEATURES.md §4) */
export const WORLD = {
  era: "2031",
  foundedAt: "2031. 03. 01",
  /** 서명 수 기본값 (조합원 3,902명) */
  signaturesBase: 3902,
  /** 모인 마음 기본값 */
  feelingsBase: 102418,
  /** 아이가 자란 시간 */
  childDays: 365,
} as const;
