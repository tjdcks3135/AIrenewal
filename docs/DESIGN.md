# DESIGN — 디자인 시스템

## 0. 방향
- **원본: 피그마 "OPUS"** (2026-11-25 결정 — 이 문서의 기준을 피그마로 전환).
  - 파일: 팀 피그마 `긍정심리워크샵` → 페이지 `웹사이트 리뉴얼`
  - `OPUS / Foundations v1 / Typography + Color` (node 173:124) · `OPUS / Common UI v1` (node 173:259)
  - 피그마와 이 문서가 다르면 **피그마가 기준**이다. 단, 아래 "피그마와 다르게 둔 값"은 이유가 있어 문서가 우선한다.
- **키워드**: 연대 · 온기 · 2031 디스토피아 속의 작은 빛
- **"Neutral first. Green as a signal."** — 화면의 90~95%는 회색 계열, 초록·민트는 5~10%만. 민트는 도형·핫스팟·활성 표시에만 쓰고 작은 글자에는 쓰지 않는다.
- **주인공은 사진**: 배경은 차분한 연회색, 장식을 줄여 사진이 돋보이게.
- **이전 결정과의 관계**: 화이트 베이스(2026-11-17)와 로고 민트 버튼(#5DC3AB)은 피그마 기준으로 대체됐다. 로고 파일 자체의 민트는 원본 그대로다(§2).
- `TODO(팀)` 연한 민트·화이트 톤의 키트 실물이 연회색 배경에서 묻히지 않도록 촬영 배경·색 보정 확인 (§5).
- `TODO(팀)` 발표 슬라이드(블랙 + #00FFB7)에서 웹사이트(연회색 + 회녹색)로 넘어갈 때의 전환이 어색하지 않은지 확인.

### 피그마와 다르게 둔 값
| 항목 | 피그마 | 이 문서 | 이유 |
|---|---|---|---|
| `label` 크기 | 11px | **12px** | CLAUDE.md "12px 미만 금지" (발표 프로젝터 가독성) |
| 오류 색 | 없음 (오류 문구도 보조 회색) | `--color-danger` #B3261E | FEATURES.md §6 "입력칸 아래 빨간 안내". 연회색 위 대비 5.6:1 |
| 비활성·placeholder 3단계 회색 | 없음 | `--color-text-3` #7E8682 | 비활성 글자·placeholder 구분용 |
| 헤더·Footer 글자 | 없음 | `--color-on-header` / `-2` | 회녹색 헤더 위 글자 (§1.1) |
| 감정·카테고리 색 | 없음 | §1.2·§1.3 유지 | 기능 전용 색 (아이의 색, 버블) |
| 오버레이 그림자·모션 | 없음 | §1.6 유지 | 모달, 메인 연출 |
| 피그마의 3D 뷰어 상태·아카이브 카드 | 있음 | **만들지 않음** | PRD §6(3D 조끼 대신 실사 사진)·§8(아카이브 범위 밖)과 충돌 — README 결정 항목 F4 |

## 1. 디자인 토큰
`src/styles/tokens.css`에 CSS 변수로 정의하고 Tailwind 테마에 연결한다. **이 표에 없는 값은 쓰지 않는다.**

### 1.1 컬러 — 기본 (피그마 OPUS · Gray-led palette)
| 토큰 | 값 | 피그마 변수 | 용도 |
|---|---|---|---|
| `--color-bg` | `#EDEEEE` | color/bg/primary (Light Gray) | 페이지 배경 |
| `--color-surface` | `#FAFAF9` | color/bg/surface (Paper White) | 카드, 입력칸, 사진 자리, 오버레이 |
| `--color-surface-2` | `#DFE2E1` | color/bg/section (Silver Gray) | 구역 구분, 호버, 비활성 배경 |
| `--color-line` | `#C7CECA` | color/border/default (Cool Gray) | 구분선, 테두리 |
| `--color-text` | `#252A28` | color/text/primary (Charcoal) | 제목, 본문 |
| `--color-text-2` | `#646C68` | color/text/secondary (Medium Gray) | 캡션, 보조 글자 (배경 대비 4.7:1) |
| `--color-text-3` | `#7E8682` | — (피그마에 없음) | 비활성 글자, placeholder |
| `--color-action` | `#465A50` | color/action/primary (Gray Green) | 주요 버튼, 활성 탭, 체크된 체크박스, **강조 글자**(현재 메뉴·인덱스), 포커스 |
| `--color-action-strong` | `#252A28` | (= text/primary) | 주요 버튼 호버 |
| `--color-on-action` | `#FAFAF9` | (= bg/surface) | 회녹색 위 글자 |
| `--color-accent` | `#83CDB5` | color/accent/mint (Soft Mint) | 도형·핫스팟·활성 표시(밑줄·점·막대)·활성 배지. **글자색 금지** |
| `--color-danger` | `#B3261E` | — (피그마에 없음) | 오류 |
| `--color-header` | `#465A50` | (= action/primary) | 헤더(GNB)·Footer·로딩 화면 배경. 로고의 흰 패널이 보이도록 어두운 바탕 |
| `--color-on-header` | `#FAFAF9` | (= bg/surface) | 헤더 위 글자 — 로고 글자, 현재 메뉴 |
| `--color-on-header-2` | `#C7CECA` | (= border/default) | 헤더 위 보조 글자 — 나머지 메뉴 (대비 4.6:1) |

규칙:
- 긴 본문은 `--color-text` / `--color-text-2`만.
- `--color-accent`(민트)는 면·도형에만. 작은 글자에 쓰지 않는다 (피그마 규칙).
- 주요 버튼: 회녹색 + Paper White 글자 (피그마 "Primary action: Gray Green + Paper White text").
- 바탕은 연회색을 유지한다. 순백(#FFFFFF) 편집형 배경은 피그마에서도 "나중에 테스트"로 남겨 둔 상태 — 쓰려면 먼저 이 문서에 추가.

<details><summary>이전 값 (참고) — 화이트 베이스 2026-11-17 ~ 11-25</summary>

bg `#FFFFFF` · surface `#F4F7F6` · surface-2 `#E9EFEC` · line `#D6E0DC` · text `#0A0F0D` · text-2 `#43514B` · text-3 `#6B7A73` · brand `#5DC3AB` · brand-deep `#006548` · danger `#D63A2B` · header `#006548`
</details>

### 1.2 컬러 — 커뮤니티 카테고리
| 카테고리 | 토큰 | 값 |
|---|---|---|
| 키움 토론 | `--cat-discussion` | `#83CDB5` (= accent) |
| 오늘의 마음 | `--cat-today` | `#C79BFF` |
| 생존키트 | `--cat-kit` | `#DDEBE4` |
| 만남 제안 | `--cat-meetup` | `#FFD45C` |

버블은 해당 색을 중심으로 바깥이 투명해지는 방사형 그라데이션 + 살짝의 glow.
`TODO(팀)` 연회색 배경(#EDEEEE)에서 `--cat-kit`(#DDEBE4)과 노랑 계열은 배경과 대비가 거의 없다. 테두리를 두거나 진한 값을 따로 둘지 결정 필요.

### 1.3 컬러 — 감정 팔레트 (아이의 색)
| 감정 | 토큰 | 값 |
|---|---|---|
| 그리움 | `--emo-longing` | `#C79BFF` |
| 희망 | `--emo-hope` | `#B8F55A` |
| 기쁨 | `--emo-joy` | `#FFD45C` |
| 외로움 | `--emo-loneliness` | `#6E7BD9` |
| 평온 | `--emo-calm` | `#6FE3E1` |
| 슬픔 | `--emo-sadness` | `#5B9BFF` |
| 두려움 | `--emo-fear` | `#A08FB5` |
| 분노 | `--emo-anger` | `#FF6B5C` |

아이(AI)의 색, 감정 칩, 성장 기록 그래프가 모두 이 팔레트를 공유한다.

### 1.4 타이포그래피 (피그마 OPUS Foundations)
- 폰트: **Pretendard** (한글·영문 공통). 대체: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 굵기는 **400 / 500 / 600 / 700만** 쓴다.
- 크기는 "모바일 / 데스크톱" 두 값. **데스크톱 값은 `lg`(1024px) 이상**에서 적용.

| 토큰 | 모바일 / 데스크톱 | 굵기 | 행간 | 자간 | 용도 |
|---|---|---|---|---|---|
| `display` | 56 / 112px | 700 | 105% | -2% (한글) | 메인 그래픽 타이틀 |
| `h1` | 36 / 64px | 600 | 115% | -3% | 페이지 타이틀 |
| `h2` | 28 / 40px | 600 | 125% | -2% | 섹션 타이틀 |
| `h3` | 20 / 24px | 600 | 135% | -1% | 소제목, 카드 제목 |
| `lead` | 20 / 24px | 500 | 155% | -1% | 선언문·핵심 문장 |
| `body` | 16px | 400 | 170% | -1% | 본문, 입력값 |
| `ui` | 14px | 500 | 145% | 0 | 내비게이션, 버튼, 탭, 체크박스 |
| `caption` | 12px | 400 | 150% | 0 | 사진 캡션, 날짜, 도움말 |
| `label` | **12px** (피그마 11px) | 500 | 140% | +10% | 짧은 영문 대문자 라벨 (한글 라벨은 자간 0) |

규칙:
- 피그마: "Korean Display: −2% / English Display: −4%". 이 사이트는 한글이 기본이라 `display`는 −2%.
- `label`: 짧은 영문 대문자는 자간 +10%(`text-label uppercase`), **한글 라벨은 자간 0%**(`text-label tracking-0`). 숫자 인덱스("02 / 05")는 영문과 같이 +10%.
- 발표 화면에서 읽혀야 하므로 **12px 미만 금지**, 본문 굵기 400 미만 금지.
- `TODO(팀)` 피그마 글자 크기가 이전 문서보다 작다(H1 최대 96→64px, 본문 17→16px). 1920×1080 프로젝터에서 읽히는지 리허설 확인.

### 1.5 간격 (4px 단위)
피그마 spacing 변수: 0 · 4 · 8 · 12 · 16 · 24 · 32 · 48. 큰 여백용 64 · 96 · 128 · 192는 문서 값 유지.

`--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 · `-7` 48 · `-8` 64 · `-9` 96 · `-10` 128 · `-11` 192 (px)
- 섹션 사이: `-10`(데스크톱) / `-8`(모바일)
- 페이지 좌우 여백: 데스크톱 64px, 모바일 20px. 콘텐츠 최대 폭 1440px.
- 컨트롤 높이 (피그마 컴포넌트): `--control-sm` 40px(버튼 Small) · `--control-md` 44px(탭) · `--control-lg` 52px(버튼 Large). 입력칸 48px(`-7`), 배지 32px(`-6`), 체크박스 24px(`-5`).
- `TODO(팀)` 미정 값 확정: 여백 전환 지점(현재 md 768px), 헤더 높이(현재 64px), 오버레이 배경 딤(현재 글자색 40%)·폭(5/6 → 2/3 → 1/2). 모바일 여백 20px 은 간격 스케일 밖의 값.

### 1.6 Radius · 테두리 · 그림자 · 모션
| 토큰 | 값 |
|---|---|
| `--radius-sm` | 4px — 피그마 radius/small. 버튼·입력칸·카드·탭·배지·체크박스·오버레이 **모두** |
| `--radius-pill` | 999px — 점·진행 막대 같은 작은 도형에만 (버튼·칩에는 쓰지 않음) |
| 테두리 | 1px (피그마 border-1) |
| `--shadow-overlay` | `0 24px 80px rgba(37,42,40,0.16)` (모달 전용, 피그마에 없음) |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)` |
| `--dur-fast` / `-base` / `-slow` / `-breath` | 150ms / 300ms / 600ms / 1200ms |

이전의 `--radius-md` 16 · `--radius-lg` 32 · `--shadow-glow`(민트 빛)는 피그마 기준에 맞춰 없앴다.

## 2. 그래픽 모티프 (발표자료에서 가져옴)
과하게 쓰지 않는다. 페이지당 1개 이하.
- **하프톤 세계지도**: 온보딩, 메인 히어로 배경 텍스처 (낮은 불투명도)
- **점선 밑줄(체인 도트)**: 핵심 문장 강조
- **사다리형 화살표 라인**: 섹션 전환, NextStepCTA. `TODO(팀)` 발표자료의 모티프 SVG 필요 (지금은 단순한 선 + 화살표).
- **로고(AI-I Human Labor Union)**: 메인 로딩 화면, GNB, Footer, 조합원 카드, 파비콘. 심볼 옆에 글자 로고를 함께 쓴다.
  - 파일: `public/images/brand/logo.png` — 원본(`assets-src/brand/logo.png`)과 **같은 파일을 수정 없이** 쓴다. 다시 그리거나 색을 바꾸지 않는다.
  - 구성: 흰 패널 두 장 — 왼쪽은 사람 모양이 투명하게 뚫려 있고, 오른쪽 안에 민트(#5DC3AB, 로고 고유 색) 사람.
  - **반드시 어두운 바탕(`--color-header`) 위에 놓는다.** 흰 바탕에서는 흰 패널과 뚫린 사람이 사라진다. 그래서 헤더·Footer·로딩 화면은 `--color-header` 배경이고, 파비콘은 `--color-header` 사각형 위에 올린다. 밝은 바탕 화면(예: 히어로)에는 로고를 두지 않는다.
  - `TODO(팀)` 로고 원본 디자인 파일(AI·SVG)이 있으면 고해상도용으로 교체.

## 3. 컴포넌트 목록
새 컴포넌트가 필요하면 이 목록에 먼저 추가한다.

| 컴포넌트 | 변형 / 설명 |
|---|---|
| `Button` | 피그마 Button. primary(회녹색 + Paper White, 호버 차콜) · secondary(Paper White + 1px 테두리, 포커스 시 회녹색 테두리) · ghost(텍스트, 사이트 추가분) / size md=Small 40px · lg=Large 52px / 좌우 16px · 모서리 4px · `ui` 글자 / 상태 hover·focus·disabled(배경 Silver Gray + 보조 글자)·loading |
| `Header` | GNB. `--color-header` 회녹색 배경 고정. 현재 메뉴는 Paper White 글자 + 민트 밑줄. 로그인 상태 영역 포함 |
| `Footer` | 메뉴 + 세계관 카피 + 프로젝트 크레딧. `--color-header` 회녹색 배경 (로고가 보이도록) |
| `NextStepCTA` | 다음 페이지 제목 + 화살표 라인. 페이지 하단 공통 |
| `SectionHeader` | 인덱스(01 / 05) + label + 제목 + 설명 |
| `PhotoSection` | 메인용. 사진 + 텍스트 + 링크, 좌우 배치 교차 (모바일·캡처 모드의 정지 배치) |
| `Preloader` | 메인 로딩 화면. `--color-header` 배경 + 로고 심볼 (`FEATURES.md` §3.5) |
| `ScrollStory` | 메인 섹션 2~5 스크롤 연출. 고정 사진 + 바뀌는 텍스트 + 진행 점·카운터 (`FEATURES.md` §3.6) |
| `Chip` | 감정 칩(8색 점, 선택 가능). 피그마 Badge 모양(모서리 4px, 높이 32px)을 따르고 감정 색 점을 더함. 선택 시 회녹색 테두리 |
| `Tab` | 피그마 Tab. 카테고리 필터 등. 기본(투명) · 호버(Silver Gray) · 활성(회녹색 + Paper White) / 높이 44px · `ui` 글자 |
| `Badge` | 피그마 Badge. neutral(Silver Gray) · active(민트) · outline(1px 테두리) / 높이 32px · 12px 500 |
| `Checkbox` | 피그마 Checkbox. 24px 상자(1px 테두리, 체크 시 회녹색 + ✓) + `ui` 글자 라벨 / 비활성. 가입 서약 등 |
| `ContentCard` | 피그마 Content card — Community 형만 (Archive 형은 범위 밖). Paper White + 1px 테두리, 라벨·제목(h3)·요약·날짜/링크. 커뮤니티 페이지에서 사용 여부 결정 |
| `TextField` / `TextArea` | 피그마 Input. 라벨(12px 500) + 입력칸(48px, 안쪽 12px, 1px 테두리, Paper White, 포커스 시 회녹색 테두리, 비활성 Silver Gray) + 도움말(12px). 오류는 빨간 테두리·문구(사이트 추가분) + 글자 수 카운터 |
| `Stepper` | 가입 단계 표시 |
| `Overlay` | 모달·글 상세. 배경 딤 + `--radius-sm` |
| `Toast` | 성공/오류 알림, 3초 |
| `AuthGate` | "조합원만 할 수 있어요" 안내 + 가입/로그인 버튼 |
| `MemberCard` | 조합원 번호 카드 (가입 완료, 캡처용) |
| `ChildBlob` | AI키우기의 아이 (`FEATURES.md` §3.1) |
| `FeelingItem` | 마음 피드 항목 |
| `StatCounter` | 숫자 + 설명, 증가 애니메이션 |
| `Bubble` | 커뮤니티 버블 S/M/L |
| `Hotspot` | 키트 사진 위 번호 포인트 |
| `Skeleton` | 로딩 상태 |
| `PhotoFrame` | 사진 자리. 사진이 없으면 회색 플레이스홀더 + "사진 ③", 로드 실패 시 회색 + 대체 텍스트 (CLAUDE.md §6, FEATURES.md §6) |

## 4. 레이아웃
- 12컬럼 그리드, gutter 24px, 최대 폭 1440px.
- 브레이크포인트: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1440 · `2xl` 1920

## 5. 이미지 규칙
- 사진은 같은 색 보정(약간 차갑고 낮은 채도, 민트·화이트 키트가 돋보이게)으로 통일.
- 사진 위 텍스트: 하단 또는 측면에 `--color-bg` → 투명 그라데이션을 깔아 대비 확보.
- 비율: 히어로 16:9, 메인 섹션 4:5 또는 3:2, 누끼컷은 투명 PNG/WebP 정사각.
- 파일: WebP, 긴 변 2400px 이하. 원본은 `assets-src/`에 따로 보관.
