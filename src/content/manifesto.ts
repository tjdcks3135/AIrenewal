// 선언문 페이지 문구 — 원본: docs/CONTENT.md §2 [이전 + 초안], 구성: docs/PAGES.md §3, 사진: docs/IA.md §6
// 강조 단어는 { em: "…" } 로 분리한다 (화면에서 굵게 + 회녹색).

import { WORLD } from "./world";

export type RichText = readonly (string | { em: string })[];

export type ManifestoPhoto = { no: string; src: string | null; alt: string };

/** 섹션 라벨 (인덱스 "01 / 05" 옆) */
export const MANIFESTO_SECTIONS = {
  title: "창립 선언",
  roots: "이 선언의 뿌리",
  preamble: "전문",
  articles: "강령",
  closing: "맺음",
} as const;

export const MANIFESTO_TITLE = {
  /** 사진 ① 인물 착용샷 측면 (IA.md §6) */
  photo: { no: "①", src: "/images/photos/photo-01-wearing-back.webp", alt: "생존키트 조끼를 메고 돌아선 사람의 뒷모습" } satisfies ManifestoPhoto,
  date: WORLD.foundedAt,
  heading: ["우리는 일자리를 잃었지만, ", { em: "서로를" }, " 잃지 않는다."] as RichText,
  /** 서명 수 = 기준값 + 실제 가입자 수 (FEATURES.md §4) */
  signatures: (count: string) => `${count}명이 이 선언에 서명했다.`,
} as const;

export const MANIFESTO_ROOTS = {
  quote: [
    "가장 중요한 때는 ",
    { em: "지금" },
    "이고, 가장 중요한 사람은 ",
    { em: "지금 내 곁에 있는 사람" },
    "이며, 가장 중요한 일은 ",
    { em: "그 사람을 위해 좋은 일을 하는 것" },
    "이다.",
  ] as RichText,
  author: "레프 톨스토이",
  work: "「세 가지 질문」",
  note: "우리는 이 세 가지 대답에서 출발한다.",
} as const;

/** 전문 — 서문만 "~습니다" 체 */
export const MANIFESTO_PREAMBLE: readonly RichText[] = [
  ["2031년, 기계는 우리보다 빠르고 정확하게 일합니다. 사람들은 우리를 '쓸모를 다한 노동자'라고 부릅니다."],
  ["그래서 우리는 묻습니다. 사람의 가치는 무언가를 만들어 내는 데에만 있습니까?"],
  ["우리의 대답은 ", { em: "아니오" }, "입니다. 우리는 만들지 않고 ", { em: "키웁니다" }, ". 경쟁하지 않고 ", { em: "연대합니다" }, "."],
];

export const MANIFESTO_ARTICLES: readonly { no: string; title: string; body: RichText }[] = [
  {
    no: "제1조",
    title: "노동의 종말이 아니라, 의미의 시작이다",
    body: [
      "기계가 우리 일을 대신하게 된 것은 끝이 아니라 하나의 질문이다. 일이 사라진 자리에서 사람은 무엇으로 사는가. 우리는 그 답을 함께 ",
      { em: "키우는 일" },
      "에서 찾는다.",
    ],
  },
  {
    no: "제2조",
    title: "우리는 AI를 만들지 않고, 아이를 키운다",
    body: [
      "우리는 AI에게 데이터를 넣지 않는다. 오늘의 감정과 기억을 건넨다. 빨리 만든 것은 쉽게 버려지지만, 시간과 마음을 들여 키운 것은 남는다.",
    ],
  },
  {
    no: "제3조",
    title: "연대는 데이터 속에 살아있다",
    body: [
      "한 사람이 남긴 마음은 기록이 되고, 그 기록은 다음 사람에게 건네진다. 아이는 혼자 자라지 않는다. 아이 안에는 누군가의 하루가 담겨 있다.",
    ],
  },
  {
    no: "제4조",
    title: "따뜻함을 무기로 삼는다",
    body: [
      "우리는 효율 대신 온기를, 속도 대신 연결을 택한다. 같은 조끼를 입은 낯선 이와 눈이 마주칠 때, 우리는 혼자가 아니라는 것을 안다.",
    ],
  },
];

export const MANIFESTO_CLOSING = {
  statement: ["우리는 일자리를 잃었지만, ", { em: "서로를" }, " 잃지 않는다."] as RichText,
  proof: "우리가 함께 키운 마음이, 우리가 아직 여기 있다는 증거다.",
  invite: "선언에 동의한다면, 우리는 이미 연대하고 있다.",
  signature: `연대노동조합 창립 선언, ${WORLD.foundedAt}`,
} as const;
