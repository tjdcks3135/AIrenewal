import Image from "next/image";
import Link from "next/link";
import { NAV_TEXT } from "@/content/nav";
import { UNION } from "@/content/world";
import { cn } from "@/lib/cn";

// 로고(→ 메인): 원본 로고 이미지(수정 없이 그대로) + 글자 로고 (DESIGN.md §2)
// 로고에 흰 패널이 있어 반드시 짙은 초록(--color-header) 바탕 위에 둔다 — 헤더·Footer.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${UNION.logoText} — ${NAV_TEXT.home}`}
      className={cn("inline-flex items-center gap-3 text-on-header", className)}
    >
      <Image src="/images/brand/logo.png" alt="" width={711} height={557} className="h-7 w-auto shrink-0" priority unoptimized />
      <span className="text-body font-black tracking-heading whitespace-nowrap">{UNION.logoText}</span>
    </Link>
  );
}
