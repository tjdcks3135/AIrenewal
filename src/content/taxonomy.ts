// 감정·커뮤니티 카테고리 — 원본: docs/FEATURES.md §5 (enum), docs/DESIGN.md §1.2–1.3 (색)
// key 는 DB enum 값과 같다.

export const EMOTIONS = [
  { key: "longing", label: "그리움" },
  { key: "hope", label: "희망" },
  { key: "joy", label: "기쁨" },
  { key: "loneliness", label: "외로움" },
  { key: "calm", label: "평온" },
  { key: "sadness", label: "슬픔" },
  { key: "fear", label: "두려움" },
  { key: "anger", label: "분노" },
] as const;

export type Emotion = (typeof EMOTIONS)[number]["key"];

export const CATEGORIES = [
  { key: "discussion", label: "키움 토론" },
  { key: "today", label: "오늘의 마음" },
  { key: "kit", label: "생존키트" },
  { key: "meetup", label: "만남 제안" },
] as const;

export type Category = (typeof CATEGORIES)[number]["key"];
