"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextArea } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { GROW_TEXT } from "@/content/grow";
import { EMOTIONS, type Emotion } from "@/content/taxonomy";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { FEELING_MAX_LENGTH, insertFeeling } from "@/lib/data";
import { feelingCss } from "@/lib/feelingColor";

// AI키우기 입력창 — 감정 칩 8개(분석용, 화면에 표시되지 않음) + 마음의 색(색상 띠) + 경험(최대 300자) + [전하기] (PAGES.md §7)
// 비로그인: "조합원이 되어 아이에게 마음을 전해보세요" + [가입하기] [로그인] (돌아올 곳: 지금 페이지)
// 상태(FEATURES.md §6): 제출 중 버튼 비활성 + 로딩, 같은 내용 2초 안 재제출 방지, 오류는 토스트 + 입력 유지
// 성공: 입력을 비우고 "전해졌어요…" — 새 마음은 실시간으로 안개 속에 나타나고 그쪽으로 돈다

const RESUBMIT_GUARD_MS = 2000;
const SUCCESS_SHOW_MS = 4000;
const DEFAULT_HUE = 160;

// 안개 위 유리 패널: 흰 박스 대신 바탕색 반투명 + 뒤 흐림 → 안개에 녹아든다 (DESIGN.md §1.6 --blur-glass)
const SURFACE = "rounded-glass border border-line/60 bg-bg/55 p-5 backdrop-blur-glass";

export function FeelingInput({ className }: { className?: string }) {
  const auth = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  // 마음의 색: 화면이 뜬 뒤 아무 색에서 시작 (서버에서는 무작위 값을 만들지 않는다)
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const last = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHue(Math.floor(Math.random() * 360)));
    return () => cancelAnimationFrame(id);
  }, []);

  // "전해졌어요" 는 잠시 보였다가 사라진다
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), SUCCESS_SHOW_MS);
    return () => clearTimeout(t);
  }, [sent]);

  if (auth.status === "loading") {
    return <Skeleton className={cn("h-10 w-full", className)} />;
  }

  if (auth.status === "guest") {
    const next = encodeURIComponent(pathname);
    return (
      <div className={cn(SURFACE, "flex flex-col items-center gap-4 text-center", className)}>
        <p className="text-body text-text">{GROW_TEXT.input.guest}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/join?next=${next}`}>{GROW_TEXT.input.join}</ButtonLink>
          <ButtonLink href={`/login?next=${next}`} variant="secondary">
            {GROW_TEXT.input.login}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const trimmed = body.trim();
  const ready = emotion !== null && trimmed.length > 0 && trimmed.length <= FEELING_MAX_LENGTH;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready || sending || emotion === null) return;
    const key = `${emotion}:${trimmed}`;
    const now = Date.now();
    if (last.current && last.current.key === key && now - last.current.at < RESUBMIT_GUARD_MS) return;
    last.current = { key, at: now };

    setSending(true);
    try {
      await insertFeeling(emotion, hue, trimmed);
      setBody("");
      setEmotion(null);
      setSent(true);
    } catch {
      // 입력 내용은 그대로 둔다 (FEATURES.md §6)
      toast.show({ tone: "error", message: AUTH_TEXT.errors.network });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn(SURFACE, "flex flex-col gap-4 text-left", className)}>
      <fieldset>
        {/* 칩만으로 뜻이 분명해 안내는 스크린리더에만 — 돔을 덜 가리도록 입력창을 낮게 */}
        <legend className="sr-only">{GROW_TEXT.input.emotionLegend}</legend>
        <div className="flex flex-wrap justify-center gap-2">
          {EMOTIONS.map((e) => (
            <Chip key={e.key} selected={emotion === e.key} onClick={() => setEmotion(e.key)} disabled={sending}>
              {e.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-4">
        <span className="shrink-0 text-caption font-medium text-text">{GROW_TEXT.input.hueLabel}</span>
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          disabled={sending}
          aria-label={GROW_TEXT.input.hueAria}
          aria-valuetext={`${hue}°`}
          // 손잡이에 지금 고른 색을 보여준다 (값은 사용자 데이터라 스타일 속성으로)
          style={{ "--hue-thumb": feelingCss(hue) } as CSSProperties}
          className="hue-slider w-full"
        />
      </label>

      <TextArea
        label={GROW_TEXT.input.bodyLabel}
        placeholder={GROW_TEXT.input.placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={FEELING_MAX_LENGTH}
        showCount
        rows={2}
        disabled={sending}
        surface="glass"
        className="resize-none"
      />

      <div className="flex items-center justify-between gap-4">
        <p role="status" aria-live="polite" className="text-ui text-action">
          {sent ? GROW_TEXT.input.success : ""}
        </p>
        <Button type="submit" disabled={!ready} loading={sending}>
          {GROW_TEXT.input.submit}
        </Button>
      </div>
    </form>
  );
}
