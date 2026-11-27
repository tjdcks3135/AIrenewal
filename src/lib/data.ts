import type { Emotion } from "@/content/taxonomy";
import { getSupabase } from "@/lib/supabase/client";

// 데이터 읽기 함수. 화면 컴포넌트는 Supabase 를 직접 부르지 않고 여기를 거친다.

export class DataError extends Error {}

/** 실제 사용자가 전한 마음 수 (예시 데이터 제외). 화면에는 세계관 기본값과 더해 보여준다 (FEATURES.md §4). */
export async function fetchRealFeelingsCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("feelings")
    .select("id", { count: "exact", head: true })
    .eq("is_seed", false);
  if (error) throw new DataError(error.message);
  return count ?? 0;
}

/** 실제 가입한 조합원 수 (예시 조합원 제외). 화면에는 서명 수 기본값과 더해 보여준다 (FEATURES.md §4). */
export async function fetchRealSignaturesCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_seed", false);
  if (error) throw new DataError(error.message);
  return count ?? 0;
}

/** 마음 한 개. emotion 은 분석용(화면에 보이지 않음), 색은 hue (FEATURES.md §3.1·§5) */
export type FeelingView = { id: string; emotion: Emotion; hue: number; body: string; name: string; createdAt: string };

const FEELING_SELECT = "id, emotion, hue, body, created_at, profiles(display_name)" as const;

type FeelingRowWithName = {
  id: string;
  emotion: Emotion;
  hue: number;
  body: string;
  created_at: string;
  profiles: { display_name: string } | null;
};

function toFeelingView(f: FeelingRowWithName): FeelingView {
  return { id: f.id, emotion: f.emotion, hue: f.hue, body: f.body, name: f.profiles?.display_name ?? "", createdAt: f.created_at };
}

/** 최근 마음 (안개 속 마음·작은 목록 — FEATURES.md §3.2). 이름은 조합원 프로필에서 */
export async function fetchRecentFeelings(limit: number): Promise<FeelingView[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("feelings")
    .select(FEELING_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataError(error.message);
  return (data as unknown as FeelingRowWithName[]).map(toFeelingView);
}

/** 실시간으로 들어온 마음 한 개를 이름과 함께 다시 읽는다 (Realtime 알림에는 이름이 없다) */
export async function fetchFeeling(id: string): Promise<FeelingView | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("feelings").select(FEELING_SELECT).eq("id", id).maybeSingle();
  if (error) throw new DataError(error.message);
  return data ? toFeelingView(data as unknown as FeelingRowWithName) : null;
}

export const FEELING_MAX_LENGTH = 300;

/** 아이에게 마음 전하기 (로그인한 조합원만 — RLS 가 user_id 를 본인으로 강제). 실패하면 DataError */
export async function insertFeeling(emotion: Emotion, hue: number, body: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new DataError("not configured");
  const { error } = await supabase.from("feelings").insert({ emotion, hue: Math.round(hue) % 360, body: body.trim() });
  if (error) throw new DataError(error.message);
}

export type DiscussionPreview = { id: string; title: string; createdAt: string };

/** 최근 "키움 토론" 글 (메인 섹션 4 미리보기) */
export async function fetchRecentDiscussions(limit: number): Promise<DiscussionPreview[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("category", "discussion")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataError(error.message);
  return data.map((p) => ({ id: p.id, title: p.title, createdAt: p.created_at }));
}

/** 새 마음이 들어올 때마다 호출 (Realtime). 해제 함수를 돌려준다. */
export type NewFeelingRow = { id: string; is_seed: boolean; emotion: Emotion };

export function subscribeToNewFeelings(onInsert: (row: NewFeelingRow) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`feelings-insert-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "feelings" }, (payload) =>
      onInsert(payload.new as NewFeelingRow),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
