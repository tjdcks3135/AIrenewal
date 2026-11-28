# 팀원 온보딩 — 연대노동조합 웹사이트 리뉴얼

2031년, AI로 일자리를 잃은 노동자들이 함께 AI를 '키우며' 연대를 회복한다는 스페큘러티브 디자인 웹사이트입니다.
학회 발표(프로젝터 시연)·논문 캡처·사용자 테스트에 씁니다. 세계관은 `docs/PRD.md` §2.

이 문서 하나로 **실행 → 작업 방식 → 지금 상태**까지 알 수 있게 정리했습니다. (2026-11-28 기준)

---

## 1. 시작 전에 받을 것 (저장소 관리자에게 요청)

| 무엇 | 어떻게 받나 | 왜 필요한가 |
|---|---|---|
| **GitHub 저장소 권한** | 관리자가 Settings → Collaborators 로 초대 → 메일/알림에서 수락 | 브랜치를 올리고 PR 만들기 |
| **환경 변수 두 개** | 팀 메신저 등 **비공개 경로**로 전달받기 (`NEXT_PUBLIC_SUPABASE_URL`, 공개용 키) | 사이트가 DB에 연결되려면 필요 |
| **Supabase 프로젝트 초대** | 관리자가 Supabase 조직 → Team 에서 초대 | SQL 실행(DB 변경·데이터 정리), 데이터 확인 |
| **피그마 파일 공유** | 디자인 시스템 파일 (OPUS / Foundations, Common UI) | `docs/DESIGN.md` 의 기준 |

> ⚠️ `service_role`·secret 키와 DB 비밀번호는 주고받지 않습니다. 필요하면 Supabase 대시보드에서 직접 봅니다.
> ⚠️ 환경 변수·계정 정보는 저장소·공개 채널에 올리지 않습니다 (`.env.local` 은 git 에 올라가지 않게 되어 있음).

---

## 2. 내 컴퓨터에서 실행하기

1. **Node.js** 설치 — 지금 개발 환경은 v24 (20 이상이면 동작)
2. 저장소 받기
   ```bash
   git clone https://github.com/tjdcks3135/AIrenewal.git
   ```
   ```bash
   cd AIrenewal
   ```
3. 패키지 설치
   ```bash
   npm install
   ```
4. 환경 변수 파일 만들기 — `.env.example` 을 `.env.local` 로 복사하고 전달받은 두 값을 채운다
   ```bash
   cp .env.example .env.local
   ```
5. 개발 서버 실행 → 브라우저에서 http://localhost:3000
   ```bash
   npm run dev
   ```

확인용 주소: `/` 메인 · `/manifesto` · `/kit` · `/join` · `/login` · `/grow` · `/community`
논문·발표 캡처용 정지 화면: 주소 끝에 `?capture=1` (예: `/grow?capture=1`)

### 자주 쓰는 명령
| 명령 | 용도 |
|---|---|
| `npx tsc --noEmit` | 타입 검사 |
| `npm run lint` | 코드 규칙 검사 |
| `npm run build` | 배포용 빌드 (발표 전 꼭 한 번) |

---

## 3. 작업 방식 (가장 중요)

### 문서가 코드보다 먼저
- 무엇을 어떻게 만들지는 **`docs/` 폴더가 기준**입니다. 바꾸고 싶으면 **문서를 먼저 고치고** 그다음 코드를 고칩니다.
- 처음 한 번은 `CLAUDE.md` 와 `docs/` 를 훑어 주세요.

| 문서 | 내용 |
|---|---|
| `CLAUDE.md` | 작업 규칙 (Claude Code 가 자동으로 읽음) |
| `docs/PRD.md` | 목적, 세계관, 성공 기준 |
| `docs/IA.md` | 페이지 구조, 흐름, URL, 사진 연결 |
| `docs/PAGES.md` | 페이지별 섹션·화면 구도 |
| `docs/FEATURES.md` | 인터랙션, 데이터 모델, 로딩·빈·오류 처리 |
| `docs/DESIGN.md` | 디자인 토큰(색·글자·간격·모서리), 컴포넌트 |
| `docs/CONTENT.md` | 모든 문구 원본, 촬영 리스트 |
| `docs/TECH.md` | 기술 스택, 폴더 구조, 이름 규칙 |
| `README.md` | **팀이 정해야 할 것 목록** (`TODO(팀)`) |

### Claude Code 로 작업할 때
- 저장소 폴더에서 Claude Code 를 열면 `CLAUDE.md` 를 자동으로 읽고 같은 규칙으로 작업합니다.
- **한 번에 한 단계·한 페이지**만 요청하세요. ("커뮤니티 작성 창 만들어줘" O / "남은 거 다 만들어줘" X)
- 작업이 끝나면 Claude 가 만든/고친 파일, 문서와 다르게 한 부분, 문서에 추가할 부분을 짧게 보고합니다.
- 다른 팀원이 나눈 대화 기록은 공유되지 않습니다. 맥락은 **저장소의 코드와 문서**에만 있습니다.

### 꼭 지킬 규칙 (CLAUDE.md 요약)
- 색·글자 크기·간격·모서리는 **`src/styles/tokens.css` 의 토큰만**. `#3a3a3a`, `text-[17px]` 같은 임의값 금지
- 화면에 나오는 문구는 컴포넌트에 직접 쓰지 않고 **`src/content/`** 에서 가져온다
- 데이터는 **Supabase 에만** 저장 (사용자 데이터를 브라우저 저장소에 두지 않음)
- DB 구조를 바꾸면 **`supabase/migrations/` 에 마이그레이션 파일** + `docs/FEATURES.md` §5 수정
- 새 화면을 만들면 **로딩·빈 상태·오류** 세 가지를 함께
- 12px 미만 글자 금지, 사진 자리를 스톡 이미지로 채우지 않는다 (회색 플레이스홀더 + 사진 번호)

### Git 흐름
1. `main` 에서 최신 받기 → `git pull`
2. 브랜치 만들기 → `feat/페이지명` 또는 `fix/내용`
3. 작업 · 커밋 (`feat: 커뮤니티 작성 창` 처럼 한 줄 요약)
4. 푸시 → GitHub 에서 PR → 확인 후 `main` 에 병합
- `main` 에 직접 커밋하지 않습니다
- **같은 파일을 두 사람이 동시에 고치지 않도록** 페이지 단위로 나눠 작업하세요

---

## 4. 폴더 안내

```
src/app/                   라우트 (page.tsx = 메인, manifesto/, kit/, join/, login/, grow/, community/)
src/components/ui/         공통 부품 — Button, Chip, TextField, Overlay, Toast, Stepper, Hotspot …
src/components/layout/     Header, Footer, PageLayout, NextStepCTA
src/components/features/   페이지별 부품 — main/, manifesto/, kit/, grow/, community/, join/
src/content/               모든 화면 문구 (main.ts, manifesto.ts, kit.ts, grow.ts, community.ts, join.ts …)
src/lib/                   Supabase 연결, 데이터 함수(data.ts), 인증(auth.ts)
src/hooks/                 로그인 상태, 실시간 데이터 등
src/styles/                tokens.css(디자인 토큰), globals.css(Tailwind 테마)
supabase/migrations/       DB 테이블·권한 (실제 DB 에는 SQL Editor 로 직접 실행)
supabase/seed.sql          예시 데이터 (조합원 6명, 마음 10개, 글 9개)
public/images/             웹용 사진 (WebP) / assets-src/ 원본
```

---

## 5. 지금 상태 (2026-11-28)

### 만든 것
| 페이지 | 상태 |
|---|---|
| 메인 `/` | 로딩 화면(로고 + 글자 로고) → 히어로 → 사진 스크롤 연출 |
| 선언문 `/manifesto` | 문구 확정, 서명 수(기본값 + 실제 가입자) |
| 생존키트 `/kit` | 실사 사진, 번호 핫스팟, 구성품 스크롤 연출 (`/kit#vest` 등으로 바로 이동) |
| 가입하기 `/join` | 4단계 + 조합원 카드 |
| AI키우기 `/grow` | 안개 아이(three.js), 끌어서 돌리는 안개 속 마음, 사용자가 고른 색으로 물드는 안개, 입력창 |
| 커뮤니티 `/community` | 떠다니는 버블 광장, 필터, 오늘의 질문, 글 상세(공감·댓글), 작성 창(새 버블이 떠오름) |

실제 DB 로 가입 → 마음 전하기 → 글쓰기 → 공감·댓글까지 동작 확인했습니다.

### 남은 일
- **온보딩 `/intro`** — 첫 방문 안내 (`docs/PAGES.md` §1, `FEATURES.md` §2)
- **AI키우기 성장 기록** 섹션, **마음 전하기 연출** (글이 빛 입자로 빨려 들어가는 장면 — `FEATURES.md` §3.1)
- **404 페이지**
- **6단계 점검**: 반응형(모바일), 접근성, 캡처 모드 전체 점검
- **사진**: 메인 ⑤(가입하기)·초대장 클로즈업 촬영 (`docs/IA.md` §6)
- **예시 데이터 늘리기**: 마음 20개 이상, 커뮤니티 글 더 — 캡처가 풍성해지도록 (`docs/CONTENT.md` §4·§5)
- **팀 결정**: `README.md` 의 결정 목록 (버블 크기 기준, 글자 수 제한, 연락처 수집 여부, 생존키트 색 대비 등)

---

## 6. 알아두면 좋은 것 (겪었던 문제)

- **화면 모양이 갑자기 이상하면** (버블이 납작함, 새 스타일이 안 먹음) → 개발 서버의 스타일 캐시 문제인 경우가 많습니다. 서버를 끄고 `.next` 폴더를 지운 뒤 `npm run dev` 로 다시 켜세요. 디자인 토큰을 새로 추가한 뒤에도 재시작이 필요합니다.
- **DB 를 바꿀 때**: `supabase/migrations/` 에 파일을 만들고, 실제 DB 에는 Supabase 대시보드 → **SQL Editor** 에 붙여 넣어 실행합니다. 실행 후 API 가 새 칸을 못 찾으면 `notify pgrst, 'reload schema';` 도 함께 실행.
- **예시 데이터 다시 넣기**: `supabase/seed.sql` 을 SQL Editor 에서 실행 (여러 번 실행해도 안전, 실제 사용자 데이터는 건드리지 않음).
- **테스트 계정 정리**: 실제 가입으로 시험했다면 SQL Editor 에서 해당 계정을 지우고 조합원 번호를 되돌립니다.
  ```sql
  delete from auth.users where id = (select id from public.profiles where member_no = 3903 and is_seed = false);
  select setval('public.member_no_seq', 3903, false);
  ```
  (번호는 지울 계정에 맞게 바꾸세요. 지우면 그 계정의 글·마음·댓글·공감도 함께 지워집니다.)
- **발표용 데모 계정**은 팀 내부에서만 공유하고 저장소에 적지 않습니다 (`README.md` P2).
- 이 저장소는 현재 **공개(Public)** 입니다. 비공개로 바꿀지는 팀에서 정하세요.
