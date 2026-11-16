"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TEXT } from "@/content/auth";
import { useAuth } from "@/hooks/useAuth";
import { isEmail, safeNextPath, signIn } from "@/lib/auth";

// PAGES.md §6 로그인 — 이메일 + 비밀번호. 로그인 후 원래 가려던 페이지로 돌아간다.

const T = AUTH_TEXT.login;
const E = AUTH_TEXT.errors;

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const auth = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  // 이미 로그인한 사용자는 돌아갈 곳으로 (IA.md §4: 로그인은 비로그인 전용)
  useEffect(() => {
    if (auth.status === "member") router.replace(next);
  }, [auth.status, next, router]);

  const emailError = !email.trim() ? E.required : !isEmail(email) ? E.emailFormat : null;
  const passwordError = !password ? E.required : null;
  const valid = !emailError && !passwordError;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!valid || submitting) return;
    setSubmitting(true);
    setFailed(false);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.ok) {
      router.replace(next);
      return;
    }
    if (result.reason === "invalid") setFailed(true);
    else toast.show({ tone: "error", message: E.network });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <TextField
        label={T.email}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFailed(false);
        }}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={touched.email ? emailError : null}
      />
      <TextField
        label={T.password}
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setFailed(false);
        }}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={touched.password ? passwordError : null}
      />

      {failed && (
        <p role="alert" className="text-body text-danger">
          {E.loginFailed}
        </p>
      )}

      <Button type="submit" size="lg" loading={submitting} disabled={!valid} className="w-full">
        {T.submit}
      </Button>

      <p className="text-body text-text-2">
        {T.toJoinQuestion}{" "}
        <Link
          href={`/join?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-deep underline underline-offset-4"
        >
          {T.toJoinLink}
        </Link>
      </p>
    </form>
  );
}
