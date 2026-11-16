import Image from "next/image";
import Link from "next/link";
import { NAV_TEXT } from "@/content/nav";
import { UNION } from "@/content/world";
import { cn } from "@/lib/cn";

// 로고(→ 메인): 심볼(public/images/brand/logo.svg) + 글자 로고 (DESIGN.md §2)
/** onHeader: 짙은 초록 헤더 위에서는 글자를 흰색으로 */
export function Logo({ onHeader = false, className }: { onHeader?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${UNION.logoText} — ${NAV_TEXT.home}`}
      className={cn("inline-flex items-center gap-3", onHeader ? "text-on-header" : "text-text", className)}
    >
      <Image src="/images/brand/logo.svg" alt="" width={126} height={527} className="h-7 w-auto shrink-0" priority unoptimized />
      <span className="text-body font-black tracking-heading whitespace-nowrap">{UNION.logoText}</span>
    </Link>
  );
}
