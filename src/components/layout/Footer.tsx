import Link from "next/link";
import { NAV_ITEMS, NAV_TEXT } from "@/content/nav";
import { FOOTER } from "@/content/world";
import { Logo } from "./Logo";

// DESIGN.md §3 Footer — 메뉴 + 세계관 카피 + 프로젝트 크레딧 (IA.md §5)
// 로고(흰 패널)가 보이도록 헤더와 같은 짙은 초록(--color-header) 배경.

const LINK =
  "text-body text-on-header-2 transition-colors duration-fast ease-out hover:text-on-header";

export function Footer() {
  return (
    <footer data-surface="header" className="bg-header">
      <div className="container-page flex flex-col gap-7 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav aria-label={NAV_TEXT.footerNav}>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/join" className={LINK}>
                  {NAV_TEXT.join}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-on-header-2/30 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-on-header">{FOOTER.copyright}</p>
          {/* 세계관 밖의 정보: 작고 구분되게 */}
          <p className="text-caption text-on-header-2">{FOOTER.credit}</p>
        </div>
      </div>
    </footer>
  );
}
