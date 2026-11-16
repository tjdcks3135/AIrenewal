"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_ITEMS, NAV_TEXT } from "@/content/nav";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

// DESIGN.md §3 Header — GNB. 짙은 초록(--color-header) 배경 고정. 로그인 상태 영역 포함 (IA.md §5)
// TODO(4단계 인증): 로그인 시 [가입하기] 대신 "No.#3903 ○○○" + 로그아웃
// TODO(온보딩 단계): 로고 길게 누르기 → /intro (FEATURES.md §2)

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
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
            <ButtonLink href="/join">{NAV_TEXT.join}</ButtonLink>
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
              <ButtonLink href="/join" size="lg" className="w-full" onClick={() => setMenuOpen(false)}>
                {NAV_TEXT.join}
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
