// AI키우기 페이지 문구 — 원본: docs/PAGES.md §7, docs/FEATURES.md §3·§6

export const GROW_TEXT = {
  headline: "오늘, 아이에게 무엇을 전할까요",
  /** 카운터 (PAGES.md §7) */
  feelings: (count: string) => `${count}개의 마음이 모였습니다`,
  /** 아이(안개)의 이름 — 스크린리더 */
  childLabel: "여러 사람의 마음이 섞여 천천히 숨 쉬는 아이. 끌거나 화살표 키로 돌리면 안개 속에 떠 있는 마음들을 볼 수 있습니다",
  /** 안개 아래 안내 (FEATURES.md §3.2) */
  dragHint: "안개를 끌어 돌려 보세요",
  /** 스크린리더용 안개 속 마음 목록 제목 */
  sphereListLabel: "안개 속에 떠 있는 마음들",
  /** 빈 상태 (FEATURES.md §6) */
  empty: "아직 아무도 마음을 전하지 않았어요. 첫 번째가 되어주세요",
  /** 이름이 없을 때 (탈퇴 등) */
  anonymous: "조합원",
  /** 입력창 (PAGES.md §7, CONTENT.md §5) */
  input: {
    // [초안]
    emotionLegend: "지금 어떤 마음인가요",
    // [초안]
    hueLabel: "이 마음의 색",
    hueAria: "마음의 색상, 0에서 359도",
    // [초안]
    bodyLabel: "아이에게 들려줄 이야기",
    // [이전]
    placeholder: "오늘 전하고 싶은 이야기를 써주세요.",
    submit: "전하기",
    // PAGES.md §7 원문
    success: "전해졌어요. 아이가 당신의 마음을 기억합니다.",
    // PAGES.md §7
    guest: "조합원이 되어 아이에게 마음을 전해보세요",
    join: "가입하기",
    login: "로그인",
  },
  growthTodo: "TODO: 성장 기록 — 감정별 누적 분포, 참여자 수, 아이가 자란 시간 (PAGES.md §7)",
} as const;
