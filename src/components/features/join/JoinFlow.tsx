"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stepper } from "@/components/ui/Stepper";
import { TextArea, TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { JOIN_TEXT } from "@/content/join";
import { useAuth } from "@/hooks/useAuth";
import { PASSWORD_MIN_LENGTH, isEmail, safeNextPath, signUp } from "@/lib/auth";

// 가입하기 `/join` — PAGES.md §5: 4단계 + 완료(조합원 카드). 세계관 속 절차지만 계정은 실제로 만들어진다.
// - 이전 단계로 돌아가도 입력값 유지 (한 상태 객체)
// - 단계마다 필수값이 다 차야 [다음으로] (FEATURES.md §6 폼 검증: 입력칸 아래 빨간 안내는 한 번 건드린 뒤에)
// - 이미 로그인한 사용자가 들어오면 /grow 로 (IA.md §4). 방금 가입을 마친 경우는 완료 화면을 보여준다
// - 중복 이메일: "이미 조합원이에요. 로그인해 주세요" + 로그인 링크 (FEATURES.md §6)

const T = JOIN_TEXT;
const E = AUTH_TEXT.errors;
const MESSAGE_MAX = 300;

type Form = {
  name: string;
  job: string;
  email: string;
  password: string;
  phone: string;
  reasons: string[];
  message: string;
  pledged: boolean;
};

const EMPTY: Form = { name: "", job: "", email: "", password: "", phone: "", reasons: [], message: "", pledged: false };

function StepHeader({ step, title, sub, headingRef }: { step: number; title: string; sub: string; headingRef: Ref<HTMLHeadingElement> }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 ref={headingRef} tabIndex={-1} className="text-h2 text-text outline-none" aria-describedby={`join-step-${step}-sub`}>
        {title}
      </h2>
      <p id={`join-step-${step}-sub`} className="text-body text-text-2">
        {sub}
      </p>
    </div>
  );
}

function Nav({ step, canNext, onPrev, children }: { step: number; canNext: boolean; onPrev: () => void; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
      {step > 1 ? (
        <Button variant="ghost" onClick={onPrev}>
          ← {T.prev}
        </Button>
      ) : (
        <span />
      )}
      {children ?? (
        <Button type="submit" size="lg" disabled={!canNext}>
          {T.next} →
        </Button>
      )}
    </div>
  );
}

export function JoinFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"), "/grow");
  const auth = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // 이미 조합원이면 가입할 필요가 없다 → 돌아갈 곳(기본 AI키우기)으로
  useEffect(() => {
    if (auth.status === "member" && !completed) router.replace(next);
  }, [auth.status, completed, next, router]);

  // 단계가 바뀌면 그 단계 제목으로 초점 (스크린리더·키보드)
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const touch = (key: keyof Form) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = {
    name: !form.name.trim() ? E.required : null,
    email: !form.email.trim() ? E.required : !isEmail(form.email) ? E.emailFormat : null,
    password: !form.password ? E.required : form.password.length < PASSWORD_MIN_LENGTH ? E.passwordLength : null,
  };
  const stepValid: Record<number, boolean> = {
    1: !errors.name,
    2: !errors.email && !errors.password,
    3: form.reasons.length > 0 && form.message.length <= MESSAGE_MAX,
    4: form.pledged,
  };

  function goNext(e: FormEvent) {
    e.preventDefault();
    if (step === 1) touch("name");
    if (step === 2) setTouched((t) => ({ ...t, email: true, password: true }));
    if (!stepValid[step]) return;
    setStep((s) => s + 1);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!stepValid[4] || submitting) return;
    setSubmitting(true);
    setDuplicate(false);
    const result = await signUp({
      email: form.email,
      password: form.password,
      displayName: form.name.trim(),
      priorJob: form.job.trim() || undefined,
      reasons: form.reasons,
      message: form.message.trim() || undefined,
      phone: form.phone.trim() || undefined,
      pledged: form.pledged,
    });
    setSubmitting(false);
    if (result.ok) {
      setCompleted(true);
      return;
    }
    if (result.reason === "duplicate") setDuplicate(true);
    else toast.show({ tone: "error", message: E.network });
  }

  // ─── 완료: 조합원 카드 ─────────────────────────────
  if (completed) {
    const member = auth.status === "member" ? auth.member : null;
    return (
      <section aria-labelledby="join-done" className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <h2 id="join-done" className="text-h2 text-text">
            {T.done.title}
          </h2>
          <p className="text-lead text-text-2">{T.done.sub}</p>
        </div>

        {/* 조합원 카드 — 논문·발표 캡처용 (PAGES.md §5) */}
        <div className="flex flex-col gap-4 rounded-sm border border-t-2 border-line border-t-action bg-surface p-7">
          <p className="text-label uppercase text-text-3">{T.done.cardLabel}</p>
          {member ? (
            <>
              <p className="text-display text-action tabular-nums">{T.done.memberNo(member.memberNo)}</p>
              <p className="text-h3 text-text">{member.displayName}</p>
            </>
          ) : (
            <>
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </>
          )}
          <p className="text-caption text-text-3">{T.done.cardMeta}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/grow" size="lg">
            {T.done.toGrow} →
          </ButtonLink>
          {next !== "/grow" && next !== "/" ? (
            <ButtonLink href={next} variant="secondary" size="lg">
              {T.done.back}
            </ButtonLink>
          ) : (
            <ButtonLink href="/" variant="secondary" size="lg">
              {T.done.home}
            </ButtonLink>
          )}
        </div>
      </section>
    );
  }

  // ─── 단계 ─────────────────────────────────────
  const prev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="flex flex-col gap-8">
      <Stepper steps={T.steps} current={step} />

      {step === 1 && (
        <form noValidate onSubmit={goNext} className="flex flex-col gap-6">
          <StepHeader step={1} title={T.step1.title} sub={T.step1.sub} headingRef={heading} />
          <TextField
            label={T.step1.name}
            placeholder={T.step1.namePlaceholder}
            required
            autoComplete="nickname"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => touch("name")}
            error={touched.name ? errors.name : null}
          />
          <TextField
            label={T.step1.job}
            placeholder={T.step1.jobPlaceholder}
            help={T.step1.jobHelp}
            value={form.job}
            onChange={(e) => set("job", e.target.value)}
          />
          <Nav step={1} canNext={stepValid[1]} onPrev={prev} />
        </form>
      )}

      {step === 2 && (
        <form noValidate onSubmit={goNext} className="flex flex-col gap-6">
          <StepHeader step={2} title={T.step2.title} sub={T.step2.sub} headingRef={heading} />
          <TextField
            label={T.step2.email}
            type="email"
            autoComplete="email"
            required
            help={T.step2.emailHelp}
            value={form.email}
            onChange={(e) => {
              set("email", e.target.value);
              setDuplicate(false);
            }}
            onBlur={() => touch("email")}
            error={touched.email ? errors.email : null}
          />
          <TextField
            label={T.step2.password}
            type="password"
            autoComplete="new-password"
            required
            help={T.step2.passwordHelp}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            onBlur={() => touch("password")}
            error={touched.password ? errors.password : null}
          />
          <TextField
            label={T.step2.phone}
            type="tel"
            autoComplete="tel"
            help={T.step2.phoneHelp}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Nav step={2} canNext={stepValid[2]} onPrev={prev} />
        </form>
      )}

      {step === 3 && (
        <form noValidate onSubmit={goNext} className="flex flex-col gap-6">
          <StepHeader step={3} title={T.step3.title} sub={T.step3.sub} headingRef={heading} />
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{T.step3.reasonsLegend}</legend>
            <div className="flex flex-wrap gap-2">
              {T.step3.reasons.map((r) => {
                const on = form.reasons.includes(r);
                return (
                  <Chip
                    key={r}
                    selected={on}
                    onClick={() => set("reasons", on ? form.reasons.filter((x) => x !== r) : [...form.reasons, r])}
                  >
                    {r}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
          <TextArea
            label={T.step3.message}
            placeholder={T.step3.messagePlaceholder}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            maxLength={MESSAGE_MAX}
            showCount
            rows={3}
          />
          <Nav step={3} canNext={stepValid[3]} onPrev={prev} />
        </form>
      )}

      {step === 4 && (
        <form noValidate onSubmit={submit} className="flex flex-col gap-6">
          <StepHeader step={4} title={T.step4.title} sub={T.step4.sub} headingRef={heading} />
          <blockquote className="border-l-2 border-action pl-6 text-lead text-text">
            {T.step4.pledge.map((part, i) =>
              typeof part === "string" ? (
                part
              ) : (
                <strong key={i} className="font-semibold text-action">
                  {part.em}
                </strong>
              ),
            )}
          </blockquote>
          <Checkbox label={T.step4.agree} checked={form.pledged} onChange={(e) => set("pledged", e.target.checked)} />

          {duplicate && (
            <p role="alert" className="text-body text-danger">
              {E.duplicateEmail}{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold underline underline-offset-4">
                {AUTH_TEXT.login.submit}
              </Link>
            </p>
          )}

          <Nav step={4} canNext={stepValid[4]} onPrev={prev}>
            <Button type="submit" size="lg" disabled={!stepValid[4]} loading={submitting}>
              {T.step4.submit} →
            </Button>
          </Nav>
        </form>
      )}
    </div>
  );
}
