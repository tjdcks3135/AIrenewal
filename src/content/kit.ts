// 키트 설명 페이지 문구 — 원본: docs/CONTENT.md §3 (구성품·[초안] 문구), 구성: docs/PAGES.md §4, 연출: docs/FEATURES.md §3.7
// 사진 번호: docs/IA.md §6, 촬영 리스트: docs/CONTENT.md §7

export type KitPhoto = { no: string; src: string | null; alt: string };

export const KIT_SECTIONS = {
  intro: "생존키트",
  unfold: "펼쳐보기",
  items: "구성품",
  role: "키트가 하는 일",
} as const;

export const KIT_INTRO = {
  /** 사진 ② 인물 착용샷 정면·후면 (IA.md §6) */
  photo: { no: "②", src: "/images/photos/photo-02-wearing-front.webp", alt: "생존키트 조끼를 입고 가슴끈을 잡은 사람의 정면, 왼쪽 주머니에 금속 캡슐" } satisfies KitPhoto,
  title: "실직한 노동자에게 배부되는 연대노동조합의 생존키트",
  // [초안] CONTENT.md §3 키트 소개 문장
  body: "일자리를 잃은 노동자에게 연대노동조합이 보내는 생존키트. 이 가방은 당신을 다른 사람들에게, 그리고 우리가 함께 키우는 아이에게 데려다줄 것입니다.",
} as const;

export const KIT_UNFOLD = {
  /** 연출샷 — 가방과 소품을 나열 (CONTENT.md §7 촬영 리스트 5번: "키트 설명 핫스팟") */
  photo: { no: "④", src: "/images/photos/photo-04-kit-flatlay.webp", alt: "조끼 위 초대장과 도시락통, 금속 캡슐, 오브제를 나란히 놓은 사진" } satisfies KitPhoto,
  title: "가방 안에 든 다섯 가지",
  hint: "번호를 누르면 각 구성품으로 이동합니다.",
  hotspotLabel: (no: string, name: string) => `${no} ${name}(으)로 이동`,
} as const;

export type KitItem = {
  /** 주소 조각 (/kit#vest) — FEATURES.md §3.7 */
  id: "vest" | "lunchbox" | "invitation" | "capsule" | "object";
  no: string;
  name: string;
  meaning: string;
  /** 구성품 클로즈업 사진 3:2 (PAGES.md §4). 없으면 플레이스홀더 */
  photo: KitPhoto;
  /**
   * 펼쳐보기 사진(photo-04-kit-flatlay, 3:2) 위 핫스팟 위치 (사진 너비·높이 대비 %).
   * 물건을 가리지 않도록 물건 옆·모서리에 둔다. 사진을 바꾸면 함께 맞춘다.
   */
  spot: { x: number; y: number };
};

export const KIT_ITEMS_TITLE = "다섯 가지 구성품";
export const KIT_ITEMS_COUNTER = (current: number, total: number) =>
  `${String(current).padStart(2, "0")} — ${String(total).padStart(2, "0")}`;

export const KIT_ITEMS: readonly KitItem[] = [
  {
    id: "vest",
    no: "①",
    name: "조끼",
    meaning:
      "우리가 만든 새로운 노동조합도 기존 노동조합의 이미지를 빌려 만든 것이므로, 조합의 형식적 상징물. 같은 조끼를 입은 사람끼리 거리에서 서로를 알아본다.",
    photo: { no: "조끼", src: "/images/photos/vest-logo.webp", alt: "조끼 아래쪽에 반사 소재로 찍힌 연대노동조합 로고" },
    spot: { x: 22, y: 30 },
  },
  {
    id: "lunchbox",
    no: "②",
    name: "도시락통",
    meaning:
      "식탁에서 함께하는 과정이야말로 사람이 모일 수 있는 강력한 동기. 포틀럭 파티에 각자의 음식을 담아 오듯, 연대의 장으로 모이는 것을 상징한다. 온라인에서 모이는 것을 넘어 실제로 만날 기회가 된다.",
    photo: { no: "도시락통", src: "/images/photos/lunchbox.webp", alt: "조끼 주머니에 꽂힌 반투명 도시락통과 로고 스티커" },
    spot: { x: 87, y: 30 },
  },
  {
    id: "invitation",
    no: "③",
    name: "초대장",
    meaning: "식탁에서의 연대를 바탕으로 한 실제 만남으로의 초대.",
    photo: { no: "초대장", src: null, alt: "생존키트 초대장" },
    spot: { x: 51, y: 29 },
  },
  {
    id: "capsule",
    no: "④",
    name: "알약통(캡슐)",
    meaning: "노동조합의 가치관이 담겨 있다. 재난 상황의 상비약처럼, 조합의 정신을 늘 지니고 다닌다.",
    photo: { no: "알약통", src: "/images/photos/capsule.webp", alt: "조끼 가슴 주머니의 금속 캡슐과 그 안에서 꺼낸 두루마리 문구" },
    spot: { x: 89, y: 47 },
  },
  {
    id: "object",
    no: "⑤",
    name: "오브제",
    meaning:
      "손가락에 끼우는 오브제. 엄지와 검지 사이에 지압 같은 물리적 자극을 주어, '인간다움'과 '감'처럼 말로 형용하기 어려운 개념을 몸의 감각으로 인식하게 한다.",
    photo: { no: "오브제", src: "/images/photos/object-hand.webp", alt: "엄지와 검지 사이에 끼운 반투명 오브제" },
    spot: { x: 89, y: 70 },
  },
];

/** [초안] CONTENT.md §3 — PRD §2 역할 분담 */
export const KIT_ROLE = {
  title: "키트는 사람을 모으고, 웹사이트는 함께 키운다",
  sides: [
    {
      key: "kit",
      label: "생존키트",
      title: "손에 쥐는 연대",
      body: "같은 조끼로 서로를 알아보고, 도시락을 들고 식탁에 모인다. 키트는 흩어진 사람들을 조합으로, 그리고 이 웹사이트로 불러들인다.",
    },
    {
      key: "web",
      label: "웹사이트",
      title: "함께 키우는 공간",
      body: "조합원들이 하루의 마음을 건네 아이를 키우고, 온라인 광장에서 이야기를 나누며 다음 만남을 정한다.",
    },
  ],
} as const;
