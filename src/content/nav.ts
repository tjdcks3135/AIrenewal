// 내비게이션·다음 단계 CTA — 원본: docs/IA.md §3–§5

/** GNB·Footer 메뉴. 순서는 사이트 흐름 순서와 같다 (IA.md §5) */
export const NAV_ITEMS = [
  { href: "/manifesto", label: "선언문" },
  { href: "/kit", label: "생존키트" },
  { href: "/grow", label: "AI 키우기" },
  { href: "/community", label: "커뮤니티" },
] as const;

export const NAV_TEXT = {
  home: "메인으로",
  join: "가입하기",
  menuOpen: "메뉴 열기",
  menuClose: "메뉴 닫기",
  mainNav: "주요 메뉴",
  footerNav: "사이트 메뉴",
} as const;

/** 페이지 하단 "다음 단계" CTA (IA.md §3 표). 문구는 `제안` 단계.
 *  문서 문구 끝의 "→" 는 NextStepCTA 의 화살표 라인이 대신하므로 뺐다. */
export const NEXT_STEPS = {
  intro: { href: "/", title: "연대노동조합에 들어가기" },
  manifesto: { href: "/join", title: "선언에 동의하고 함께하기" },
  kit: { href: "/join", title: "생존키트 받기" },
  join: { href: "/grow", title: "아이에게 첫 마음 전하기" },
  grow: { href: "/community", title: "다른 조합원들의 이야기 보기" },
  community: { href: "/", title: "처음으로 돌아가기" },
  /** 로그인한 사용자가 선언문·키트 설명에 왔을 때 (이미 가입함) */
  memberToGrow: { href: "/grow", title: "AI키우기로 가기" },
} as const;

export type NextStepKey = keyof typeof NEXT_STEPS;

export const NEXT_STEP_LABEL = "Next Step";
