// 메인 페이지 문구 — 원본: docs/PAGES.md §2, docs/IA.md §6(사진), docs/CONTENT.md §3(키트 소개 [초안])
// 링크 글자는 별도로 정해진 문구가 없어 메뉴 이름(nav.ts)을 쓴다.

export type MainPhoto = {
  /** 사진 번호 ①~⑤ (CONTENT.md §7 촬영 리스트) */
  no: string;
  /** 실제 사진 경로. 준비되면 채운다 (public/images/main/photo-0N-설명.webp — TECH.md §3) */
  src: string | null;
  alt: string;
};

export const MAIN_HERO = {
  photo: { no: "①", src: null, alt: "생존키트 조끼를 입은 사람의 측면 모습" } satisfies MainPhoto,
  /** 모토 — 강조 단어는 emphasis 로 분리 (CONTENT.md §2 타이틀) */
  motto: { before: "우리는 일자리를 잃었지만, ", emphasis: "서로를", after: " 잃지 않는다" },
  label: "연대노동조합 · 2031",
  /** 로그인 사용자: 히어로 하단 한 줄 (PAGES.md §2) */
  memberLine: (memberNo: number) => `조합원 No.#${memberNo}님, 오늘 아이에게 마음을 전했나요?`,
} as const;

export const MAIN_STORY = {
  /** "02 — 05" 카운터 */
  counter: (current: number, total: number) =>
    `${String(current).padStart(2, "0")} — ${String(total).padStart(2, "0")}`,
  /** 진행 점의 접근성 이름 */
  dotLabel: (title: string) => `${title}(으)로 이동`,
  chapters: [
    {
      key: "kit",
      photo: { no: "②", src: null, alt: "생존키트 조끼를 입은 사람의 정면과 뒷모습" },
      title: "당신에게 도착한 생존키트",
      // [초안] CONTENT.md §3 키트 소개 문장
      description:
        "일자리를 잃은 노동자에게 연대노동조합이 보내는 생존키트. 이 가방은 당신을 다른 사람들에게, 그리고 우리가 함께 키우는 아이에게 데려다줄 것입니다.",
      href: "/kit",
    },
    {
      key: "grow",
      photo: { no: "③", src: null, alt: "열린 가방에서 키트 소품들이 빠져나오는 연출 사진" },
      title: "우리가 함께 키우는 아이",
      description: null,
      href: "/grow",
    },
    {
      key: "community",
      photo: { no: "④", src: null, alt: "가방과 키트 소품들을 나란히 놓은 사진" },
      title: "아이를 어떻게 키울까요?",
      description: null,
      href: "/community",
    },
    {
      key: "join",
      photo: { no: "⑤", src: null, alt: "생존키트 내용물을 펼쳐 놓은 사진" },
      title: "생존키트를 받고 연대의 일원이 되세요",
      description: null,
      href: "/join",
    },
  ],
} as const;

export type MainChapterKey = (typeof MAIN_STORY.chapters)[number]["key"];

/** 섹션 3·4 의 실시간 데이터 문구 (PAGES.md §7·§8, FEATURES.md §6) */
export const MAIN_LIVE = {
  feelings: (count: string) => `${count}개의 마음이 모였습니다`,
  recentDiscussionsLabel: "최근 토론",
  emptyDiscussions: "광장이 조용해요. 첫 이야기를 띄워주세요",
} as const;
