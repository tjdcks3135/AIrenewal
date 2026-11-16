"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Overlay } from "@/components/ui/Overlay";
import { AUTH_TEXT } from "@/content/auth";

// DESIGN.md §3 AuthGate — "조합원만 할 수 있어요" + [가입하기] [로그인] (FEATURES.md §1)
// 로그인이 필요한 행동을 시도했을 때 띄운다. 완료 후 지금 페이지로 돌아온다(?next=).

type AuthGateProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthGate({ open, onClose }: AuthGateProps) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);
  return (
    <Overlay open={open} onClose={onClose} title={AUTH_TEXT.gate.title}>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/join?next=${next}`} size="lg">
          {AUTH_TEXT.gate.join}
        </ButtonLink>
        <ButtonLink href={`/login?next=${next}`} variant="secondary" size="lg">
          {AUTH_TEXT.gate.login}
        </ButtonLink>
      </div>
    </Overlay>
  );
}
