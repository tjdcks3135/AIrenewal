import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// DESIGN.md §3 Hotspot — 키트 사진 위 번호 포인트.
// 지름 44px 원, 민트 면 + 차콜 번호, Paper White 2px 테두리. 호버·포커스: 회녹색 면 + Paper White 번호.
// 부모(사진 틀, relative) 기준 x·y(%) 위치에 가운데를 맞춘다. 누르면 해당 구성품으로 이동하는 링크.

type HotspotProps = Omit<ComponentProps<"a">, "children" | "style"> & {
  /** 표시 번호 (예: "1") */
  label: string;
  /** 사진 너비·높이 대비 위치 (%) — 콘텐츠 데이터(src/content)에서 온다 */
  x: number;
  y: number;
};

export function Hotspot({ label, x, y, className, ...rest }: HotspotProps) {
  return (
    <a
      // 위치는 사진마다 다른 데이터 값이라 스타일 속성으로 둔다 (토큰 값이 아님)
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(
        "absolute flex size-control-md -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border-2 border-surface bg-accent text-ui text-text tabular-nums",
        "transition-colors duration-fast ease-out hover:bg-action hover:text-on-action focus-visible:bg-action focus-visible:text-on-action",
        className,
      )}
      {...rest}
    >
      {label}
    </a>
  );
}
