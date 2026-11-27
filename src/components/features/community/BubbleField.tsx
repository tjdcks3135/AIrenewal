"use client";

import { useEffect, useRef, useState } from "react";
import { COMMUNITY_TEXT } from "@/content/community";
import type { Category } from "@/content/taxonomy";
import { cn } from "@/lib/cn";
import type { PostView } from "@/lib/data";
import { Bubble } from "./Bubble";
import { BubbleMotion } from "./bubbleMotion";

// 버블 광장 (PAGES.md §8, FEATURES.md §3.3) — 글 하나 = 버블 하나. 화면 폭 전체에 떠다닌다.
// still(캡처 모드·움직임 줄이기): 처음 배치 그대로 멈춤

type BubbleFieldProps = {
  posts: PostView[];
  filter: Category | null;
  still: boolean;
  className?: string;
};

export function BubbleField({ posts, filter, still, className }: BubbleFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const [motion] = useState(() => new BubbleMotion());

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const map = nodes.current;
    const fit = () => {
      motion.setField(el.clientWidth, el.clientHeight);
      motion.sync(map);
      motion.render();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (still) return () => ro.disconnect();

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      motion.step(Math.min(0.05, (now - prev) / 1000));
      prev = now;
      motion.render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [motion, posts, still]);

  return (
    <div
      ref={box}
      role="list"
      aria-label={COMMUNITY_TEXT.plazaLabel}
      className={cn("overflow-hidden", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        motion.pointer(e.clientX - r.left, e.clientY - r.top);
      }}
      onPointerLeave={() => motion.pointer(-1e5, -1e5)}
    >
      {posts.map((post) => (
        <div key={post.id} role="listitem" className="contents">
          <Bubble
            post={post}
            dimmed={filter !== null && post.category !== filter}
            onHover={(h) => motion.freeze(post.id, h)}
            nodeRef={(node) => {
              if (node) nodes.current.set(post.id, node);
              else nodes.current.delete(post.id);
            }}
          />
        </div>
      ))}
    </div>
  );
}
