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
export function subscribeToNewFeelings(onInsert: (row: { is_seed: boolean }) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`feelings-insert-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "feelings" }, (payload) =>
      onInsert(payload.new as { is_seed: boolean }),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
