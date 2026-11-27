"use client";

import type { ReactNode } from "react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { StatCounter } from "@/components/ui/StatCounter";
import {
  MANIFESTO_ARTICLES,
  MANIFESTO_CLOSING,
  MANIFESTO_PREAMBLE,
  MANIFESTO_ROOTS,
  MANIFESTO_SECTIONS,
  MANIFESTO_TITLE,
  type RichText,
} from "@/content/manifesto";
import { useSignatureCount } from "@/hooks/useSignatureCount";
import { cn } from "@/lib/cn";

// 선언문 `/manifesto` — docs/PAGES.md §3: 타이틀 → 문학적 뿌리 → 전문 → 강령 제1~4조 → 맺음
// 문구는 src/content/manifesto.ts (CONTENT.md §2). 강조 단어는 굵게 + 회녹색.
// 긴 본문은 차콜(text-text), 회녹색은 강조 단어·인덱스에만 (CLAUDE.md §2).

const TOTAL = 5;
const pad = (n: number) => String(n).padStart(2, "0");

function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <strong key={i} className="font-semibold text-action">
            {part.em}
          </strong>
        ),
      )}
    </>
  );
}

/** "01 / 05  창립 선언" — SectionHeader 와 같은 표기 */
function SectionIndex({ no, label, as: Tag = "p", id }: { no: number; label: string; as?: "p" | "h2"; id?: string }) {
  return (
    <Tag id={id} className="flex items-center gap-4 text-label uppercase">
      <span className="text-action tabular-nums">
        {pad(no)} / {pad(TOTAL)}
      </span>
      {/* 한글 라벨은 자간 0% (피그마 Typography 규칙) */}
      <span className="tracking-0 text-text-2">{label}</span>
    </Tag>
  );
}

function Section({ className, children, labelledBy }: { className?: string; children: ReactNode; labelledBy: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cn("border-t border-line", className)}>
      <div className="container-page grid grid-cols-1 gap-6 py-9 lg:grid-cols-12 lg:gap-gutter lg:py-10">{children}</div>
    </section>
  );
}

/** 1. 타이틀 — 사진 ① + 모토 + 창립일 + 서명 수 */
function TitleSection() {
  const signatures = useSignatureCount();
  return (
    <section aria-labelledby="manifesto-title" className="grid grid-cols-1 lg:grid-cols-12">
      <div className="container-page flex flex-col justify-end gap-6 pt-7 pb-9 lg:col-span-5 lg:px-8 lg:py-10">
        <SectionIndex no={1} label={`${MANIFESTO_SECTIONS.title} · ${MANIFESTO_TITLE.date}`} />
        <h1 id="manifesto-title" className="text-h1 text-text">
          <Rich text={MANIFESTO_TITLE.heading} />
        </h1>
        <StatCounter
          value={signatures.status === "loading" ? null : signatures.value}
          format={MANIFESTO_TITLE.signatures}
          className="text-h3 text-text-2"
        />
      </div>
      {/* 사진: 모바일 4:5, 데스크톱 3:2 + 12칸 중 7칸 (메인 PhotoSection 과 같은 비율) */}
      <div className="relative aspect-4/5 order-first lg:col-span-7 lg:aspect-3/2">
        <PhotoFrame photo={MANIFESTO_TITLE.photo} priority sizes="(min-width: 1024px) 60vw, 100vw" />
      </div>
    </section>
  );
}

/** 2. 문학적 뿌리 — 톨스토이 인용 */
function RootsSection() {
  return (
    <Section labelledBy="manifesto-roots">
      <div className="lg:col-span-4">
        <SectionIndex as="h2" id="manifesto-roots" no={2} label={MANIFESTO_SECTIONS.roots} />
      </div>
      <figure className="flex flex-col gap-6 lg:col-span-8">
        <blockquote className="border-l-2 border-action pl-6 text-h3 text-text">
          <p>
            <Rich text={MANIFESTO_ROOTS.quote} />
          </p>
        </blockquote>
        <figcaption className="pl-6 text-ui text-text-2">
          — {MANIFESTO_ROOTS.author}, <cite className="not-italic">{MANIFESTO_ROOTS.work}</cite>
        </figcaption>
        <p className="text-lead text-text">{MANIFESTO_ROOTS.note}</p>
      </figure>
    </Section>
  );
}

/** 3. 전문 */
function PreambleSection() {
  return (
    <Section labelledBy="manifesto-preamble">
      <div className="lg:col-span-4">
        <SectionIndex as="h2" id="manifesto-preamble" no={3} label={MANIFESTO_SECTIONS.preamble} />
      </div>
      <div className="flex flex-col gap-5 lg:col-span-8">
        {MANIFESTO_PREAMBLE.map((para, i) => (
          <p key={i} className="text-lead text-text">
            <Rich text={para} />
          </p>
        ))}
      </div>
    </Section>
  );
}

/** 4. 강령 제1~4조 */
function ArticlesSection() {
  return (
    <Section labelledBy="manifesto-articles">
      <div className="lg:col-span-4">
        <SectionIndex as="h2" id="manifesto-articles" no={4} label={MANIFESTO_SECTIONS.articles} />
      </div>
      <ol className="flex flex-col divide-y divide-line border-y border-line lg:col-span-8">
        {MANIFESTO_ARTICLES.map((article) => (
          <li key={article.no} className="flex flex-col gap-3 py-7">
            <p className="text-label tracking-0 text-action">{article.no}</p>
            <h3 className="text-h3 text-text">{article.title}</h3>
            <p className="text-body text-text-2 lg:w-5/6">
              <Rich text={article.body} />
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** 5. 맺음 */
function ClosingSection() {
  return (
    <Section labelledBy="manifesto-closing">
      <div className="lg:col-span-4">
        <SectionIndex as="h2" id="manifesto-closing" no={5} label={MANIFESTO_SECTIONS.closing} />
      </div>
      <figure className="flex flex-col gap-6 lg:col-span-8">
        <blockquote className="flex flex-col gap-5">
          <p className="text-h2 text-text">
            <Rich text={MANIFESTO_CLOSING.statement} />
          </p>
          <p className="text-lead text-text">{MANIFESTO_CLOSING.proof}</p>
          <p className="text-lead text-text-2">{MANIFESTO_CLOSING.invite}</p>
        </blockquote>
        <figcaption className="text-ui text-text-2">— {MANIFESTO_CLOSING.signature}</figcaption>
      </figure>
    </Section>
  );
}

export function ManifestoContent() {
  return (
    <article>
      <TitleSection />
      <RootsSection />
      <PreambleSection />
      <ArticlesSection />
      <ClosingSection />
    </article>
  );
}
