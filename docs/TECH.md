# TECH — 기술 스택과 규칙

## 1. 스택
| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js (App Router) + TypeScript** | 페이지 라우팅이 IA와 1:1로 대응, AI 코딩 도구가 가장 잘 다룸 |
| 스타일 | **Tailwind CSS** + `tokens.css`(CSS 변수) | 토큰을 Tailwind 테마로 연결해 임의값 사용을 막음 |
| 인증·DB·실시간 | **Supabase** (Auth, Postgres, Realtime) | 로그인, 저장, "다른 사람의 입력이 실시간으로 보이는" 기능을 한 곳에서 해결 |
| 배포 | **Vercel** | Next.js 기본 배포. 이전 버전의 GitHub Pages는 정적 사이트만 가능해서 로그인·DB에 부적합 |
| UI 모션 | Motion (framer-motion) | 페이지·컴포넌트 전환 |
| 아이(blob) | three.js (`@react-three/fiber`) + 노이즈 셰이더 | 유기적인 울렁임과 색 섞기. 성능이 부족하면 Canvas 2D + simplex-noise로 대체 |
| 버블 광장 | d3-force | 겹치지 않는 배치, 고정 시드로 캡처 재현 |
| 폰트 | Pretendard (CDN 또는 next/font/local) | |

이 표에 없는 라이브러리를 추가하려면 먼저 문서에 제안한다.

## 2. 폴더 구조
```
/
├─ CLAUDE.md                 # AI 작업 규칙
├─ docs/                     # 기준 문서 (이 폴더)
├─ assets-src/               # 사진 원본 (배포 제외)
├─ public/
│  └─ images/
│     ├─ main/               # photo-01-hero.webp … photo-05-unpacked.webp
│     ├─ kit/                # vest.webp, lunchbox.webp, invitation.webp, capsule.webp, object.webp
│     ├─ placeholder/        # 회색 플레이스홀더
│     └─ brand/              # logo.svg, map-halftone.svg
├─ src/
│  ├─ app/                   # 라우트: page.tsx(/), intro/, manifesto/, kit/, join/, login/, grow/, community/, not-found.tsx
│  ├─ components/
│  │  ├─ ui/                 # Button, Chip, TextField, Overlay, Toast, Skeleton …
│  │  ├─ layout/             # Header, Footer, NextStepCTA, SectionHeader
│  │  └─ features/           # ChildBlob, FeelingItem, Bubble, MemberCard, Hotspot, AuthGate
│  ├─ content/               # 모든 문구 (world.ts, manifesto.ts, kit.ts, join.ts, nav.ts)
│  ├─ lib/                   # supabase 클라이언트, 데이터 함수, 유틸
│  ├─ hooks/                 # useAuth, useRealtimeFeelings …
│  └─ styles/                # tokens.css, globals.css
└─ supabase/
   ├─ migrations/            # 테이블, enum, RLS (FEATURES.md §5)
   └─ seed.sql               # 예시 데이터 (CONTENT.md §4, §5)
```

## 3. 네이밍
- 컴포넌트 파일·이름: `PascalCase` (`ChildBlob.tsx`)
- 훅: `useCamelCase`, 유틸·변수: `camelCase`, 상수: `UPPER_SNAKE`
- DB 테이블·컬럼: `snake_case`
- 이미지: `kebab-case`, 메인 사진은 `photo-0N-설명.webp`
- 브랜치: `feat/페이지명`, `fix/내용` / 커밋: `feat: 커뮤니티 버블 광장` 처럼 한 줄 요약

## 4. 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
`.env.local`에만 두고 저장소에 올리지 않는다(`.gitignore`). 발표용 계정 정보도 저장소에 넣지 않는다.

## 5. 팀 작업 규칙
- 한 사람이 한 페이지(또는 한 기능)를 맡고 브랜치를 나눈다.
- 공통 컴포넌트(`ui/`, `layout/`)와 `tokens.css`는 **한 명이 먼저 완성**한 뒤 나머지가 페이지 작업을 시작한다.
- AI 코딩 도구: Claude Code는 루트의 `CLAUDE.md`를 자동으로 읽는다. Cursor를 쓰는 팀원은 같은 내용을 `.cursor/rules/`에 복사한다.
- 문서와 코드가 다르면 문서가 기준. 결정이 바뀌면 문서부터 고친다.

## 6. 발표 전 체크
- [ ] 1920×1080, 1440×900에서 전 페이지 확인
- [ ] 발표 PC 브라우저에서 온보딩 플래그 초기화 (`/intro`)
- [ ] 발표용 계정 로그인 상태 확인
- [ ] 예시 데이터 재투입(`seed.sql`) 및 테스트 중 생긴 데이터 정리
- [ ] 와이파이가 불안정할 때를 대비한 화면 녹화본 준비
