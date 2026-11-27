"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Overlay } from "@/components/ui/Overlay";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { COMMUNITY_TEXT } from "@/content/community";
import { CATEGORIES, type Category } from "@/content/taxonomy";
import { POST_BODY_MAX, POST_TITLE_MAX, insertPost, type PostView } from "@/lib/data";

// 이야기 작성 창 (PAGES.md §8, 이전 사이트 참고): 카테고리 · 제목 · 이야기 → [취소] [버블로 띄우기]
// 띄우면 창을 닫고 onPosted 로 광장에 새 버블을 더한다 (아래에서 떠오름 — FEATURES.md §3.3)
// 상태(FEATURES.md §6): 필수값이 다 차야 버튼 활성 · 제출 중 비활성 + 로딩 · 같은 내용 2초 재제출 방지 · 오류 토스트 + 입력 유지

const C = COMMUNITY_TEXT.compose;
const RESUBMIT_GUARD_MS = 2000;

type PostComposerProps = {
  open: boolean;
  onClose: () => void;
  onPosted: (post: PostView) => void;
};

export function PostComposer({ open, onClose, onPosted }: PostComposerProps) {
  const toast = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const last = useRef<{ key: string; at: number } | null>(null);

  const t = title.trim();
  const b = body.trim();
  const ready = category !== null && t.length > 0 && t.length <= POST_TITLE_MAX && b.length > 0 && b.length <= POST_BODY_MAX;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready || sending || category === null) return;
    const key = `${category}:${t}:${b}`;
    const now = Date.now();
    if (last.current && last.current.key === key && now - last.current.at < RESUBMIT_GUARD_MS) return;
    last.current = { key, at: now };
    setSending(true);
    try {
      const post = await insertPost(category, t, b);
      onPosted(post);
      setCategory(null);
      setTitle("");
      setBody("");
      onClose();
      toast.show({ tone: "success", message: C.done });
    } catch {
      // 입력 내용은 그대로 둔다 (FEATURES.md §6)
      toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
    } finally {
      setSending(false);
    }
  }

  return (
    <Overlay open={open} onClose={onClose} title={C.title}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <p className="text-body text-text-2">{C.description}</p>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-caption font-medium text-text">{C.category}</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.key} tone={c.key} selected={category === c.key} onClick={() => setCategory(c.key)} disabled={sending}>
                {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <TextField
          label={C.postTitle}
          placeholder={C.titlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={POST_TITLE_MAX}
          showCount
          disabled={sending}
        />

        <TextArea
          label={C.body}
          placeholder={C.bodyPlaceholder}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={POST_BODY_MAX}
          showCount
          rows={6}
          disabled={sending}
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            {C.cancel}
          </Button>
          <Button type="submit" disabled={!ready} loading={sending}>
            {C.submit}
          </Button>
        </div>
      </form>
    </Overlay>
  );
}
