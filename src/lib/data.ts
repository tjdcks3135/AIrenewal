import type { Category, Emotion } from "@/content/taxonomy";
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

// ─── 커뮤니티 (PAGES.md §8) ─────────────────────────────

/** 버블 하나 = 글 하나. 대화량 = 댓글 + 공감 (버블 크기) */
export type PostView = {
  id: string;
  category: Category;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  author: string;
  authorJob: string | null;
  comments: number;
  reactions: number;
};

// posts ↔ profiles 관계가 두 개(작성자, 공감)라 작성자 관계를 이름으로 고른다
const POST_SELECT =
  "id, category, title, body, is_pinned, created_at, author:profiles!posts_user_id_fkey(display_name, prior_job), comments(count), reactions(count)" as const;

type PostRow = {
  id: string;
  category: Category;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  author: { display_name: string; prior_job: string | null } | null;
  comments: { count: number }[];
  reactions: { count: number }[];
};

function toPostView(p: PostRow): PostView {
  return {
    id: p.id,
    category: p.category,
    title: p.title,
    body: p.body,
    isPinned: p.is_pinned,
    createdAt: p.created_at,
    author: p.author?.display_name ?? "",
    authorJob: p.author?.prior_job ?? null,
    comments: p.comments[0]?.count ?? 0,
    reactions: p.reactions[0]?.count ?? 0,
  };
}

/** 커뮤니티 글 전체 (최신순) */
export async function fetchPosts(): Promise<PostView[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false });
  if (error) throw new DataError(error.message);
  return (data as unknown as PostRow[]).map(toPostView);
}

// ─── 글 상세: 댓글 · 공감 (PAGES.md §8) ──────────────────────

export const COMMENT_MAX_LENGTH = 500;

export type CommentView = {
  id: string;
  userId: string;
  body: string;
  author: string;
  authorJob: string | null;
  createdAt: string;
};

const COMMENT_SELECT = "id, user_id, body, created_at, author:profiles!comments_user_id_fkey(display_name, prior_job)" as const;

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: { display_name: string; prior_job: string | null } | null;
};

const toCommentView = (c: CommentRow): CommentView => ({
  id: c.id,
  userId: c.user_id,
  body: c.body,
  author: c.author?.display_name ?? "",
  authorJob: c.author?.prior_job ?? null,
  createdAt: c.created_at,
});

/** 글의 댓글 (오래된 순 — 대화가 이어지는 순서) */
export async function fetchComments(postId: string): Promise<CommentView[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw new DataError(error.message);
  return (data as unknown as CommentRow[]).map(toCommentView);
}

async function fetchComment(id: string): Promise<CommentView | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("comments").select(COMMENT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new DataError(error.message);
  return data ? toCommentView(data as unknown as CommentRow) : null;
}

/** 댓글 달기 (로그인한 조합원 — RLS 가 작성자를 본인으로 강제). 단 댓글을 이름과 함께 돌려준다 */
export async function insertComment(postId: string, body: string): Promise<CommentView> {
  const supabase = getSupabase();
  if (!supabase) throw new DataError("not configured");
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, body: body.trim() })
    .select(COMMENT_SELECT)
    .single();
  if (error) throw new DataError(error.message);
  return toCommentView(data as unknown as CommentRow);
}

/** 본인 댓글 지우기 (FEATURES.md §6) */
export async function deleteComment(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new DataError("not configured");
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw new DataError(error.message);
}

/** 이 글에 새 댓글이 달리면 (실시간) — 다른 사람이 단 댓글이 바로 붙는다. 해제 함수를 돌려준다 */
export function subscribeToComments(postId: string, onInsert: (comment: CommentView) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`comments-${postId}-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, (payload) => {
      fetchComment((payload.new as { id: string }).id)
        .then((c) => c && onInsert(c))
        .catch(() => {});
    })
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** 내가 이 글에 공감했는지 */
export async function fetchMyReaction(postId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { count, error } = await supabase
    .from("reactions")
    .select("post_id", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw new DataError(error.message);
  return (count ?? 0) > 0;
}

/** 공감 / 공감 취소 (1인 1회 — FEATURES.md §5) */
export async function setReaction(postId: string, userId: string, on: boolean): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new DataError("not configured");
  const { error } = on
    ? await supabase.from("reactions").insert({ post_id: postId })
    : await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", userId);
  if (error) throw new DataError(error.message);
}
