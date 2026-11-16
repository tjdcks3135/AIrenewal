"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { AUTH_TEXT } from "@/content/auth";
import { NAV_ITEMS, NAV_TEXT } from "@/content/nav";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

// DESIGN.md §3 Header — GNB. 짙은 초록(--color-header) 배경 고정. 로그인 상태 영역 포함 (IA.md §5)
// TODO(온보딩 단계): 로고 길게 누르기 → /intro (FEATURES.md §2)

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** GNB 우측: [가입하기] 또는 "No.#3903 ○○○" + 로그아웃 (IA.md §5) */
function MemberSlot({ size, onNavigate }: { size: "md" | "lg"; onNavigate?: () => void }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <Skeleton shape="pill" className={size === "lg" ? "h-8 w-full" : "h-7 w-10"} />;
  }

  if (auth.status === "guest") {
    return (
      <ButtonLink href="/join" size={size} className={size === "lg" ? "w-full" : undefined} onClick={onNavigate}>
        {NAV_TEXT.join}
      </ButtonLink>
    );
  }

  const { memberNo, displayName } = auth.member;
  return (
    <div className={cn("flex items-center gap-4", size === "lg" && "justify-between")}>
      <span className={cn("font-semibold whitespace-nowrap text-on-header", size === "lg" ? "text-body-lg" : "text-body")}>
        {AUTH_TEXT.member.badge(memberNo, displayName)}
      </span>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void signOut();
        }}
        className="rounded-pill px-3 py-2 text-body text-on-header-2 underline-offset-4 transition-colors duration-fast ease-out hover:text-on-header hover:underline"
      >
        {AUTH_TEXT.member.logout}
      </button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header data-surface="header" className="fixed inset-x-0 top-0 z-40 bg-header">
      <div className="container-page flex h-8 items-center justify-between gap-6">
        <Logo onHeader />

        {/* 데스크톱 메뉴 */}
        <nav aria-label={NAV_TEXT.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-2 text-body font-semibold transition-colors duration-fast ease-out",
                      active ? "text-on-header" : "text-on-header-2 hover:text-on-header",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1 rounded-pill bg-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <MemberSlot size="md" />
          </div>

          {/* 모바일 메뉴 토글 */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? NAV_TEXT.menuClose : NAV_TEXT.menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="-mr-2 rounded-pill p-2 text-on-header lg:hidden"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label={NAV_TEXT.mainNav} className="bg-header lg:hidden">
          <ul className="container-page flex flex-col pb-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn("block py-3 text-h3", active ? "text-brand" : "text-on-header")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-5">
              <MemberSlot size="lg" onNavigate={() => setMenuOpen(false)} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
