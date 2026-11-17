"use client";

import Image from "next/image";
import { useState } from "react";
import { UI_TEXT } from "@/content/ui";
import { cn } from "@/lib/cn";

// 사진 자리. 실제 사진이 없으면 회색 플레이스홀더 + 사진 번호("사진 ③")를 보여준다 (CLAUDE.md §6).
// 로드에 실패하면 회색 배경 + 대체 텍스트 (FEATURES.md §6).
// 부모가 크기를 정한다 (relative + 높이/비율). 사진은 부모를 꽉 채운다.

export type Photo = { no: string; src: string | null; alt: string };

type PhotoFrameProps = {
  photo: Photo;
  /** 첫 화면에 보이는 사진이면 true (먼저 불러온다) */
  priority?: boolean;
  sizes?: string;
  /** 플레이스홀더의 사진 번호 위치. 사진 아래쪽에 글이 올라가면 "top" */
  placeholderAlign?: "center" | "top";
  className?: string;
};

export function PhotoFrame({ photo, priority = false, sizes = "100vw", placeholderAlign = "center", className }: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !photo.src || failed;

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-surface-2", className)}>
      {photo.src && !failed && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      )}
      {showPlaceholder && (
        <>
          <Image src="/images/placeholder/photo.svg" alt="" fill unoptimized className="object-cover" aria-hidden />
          <div role="img" aria-label={photo.alt} className={cn("absolute inset-0 flex flex-col items-center gap-2 p-5 text-center", placeholderAlign === "top" ? "justify-start pt-10" : "justify-center")}>
            <span className="text-h3 text-text-3">{UI_TEXT.photoNo(photo.no)}</span>
            {failed && <span className="text-caption text-text-3">{photo.alt}</span>}
          </div>
        </>
      )}
    </div>
  );
}
