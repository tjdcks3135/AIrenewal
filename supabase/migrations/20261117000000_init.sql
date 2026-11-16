-- 연대노동조합 초기 스키마 — docs/FEATURES.md §5
-- 테이블: profiles, feelings, posts, comments, reactions
-- 보안: 읽기는 모두, 쓰기는 본인 user_id 로만, 수정·삭제는 본인 것만 (RLS + 컬럼 권한)

-- ─── enum ──────────────────────────────────────────────
create type public.emotion as enum (
  'longing', 'hope', 'joy', 'loneliness', 'calm', 'sadness', 'fear', 'anger'
);

create type public.post_category as enum ('discussion', 'today', 'kit', 'meetup');

-- ─── 조합원 번호: 세계관 숫자(3,902명)에 이어 3903부터 ──────────
create sequence public.member_no_seq start with 3903;

-- ─── profiles ─────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) > 0),
  prior_job    text,
  reasons      text[] not null default '{}',
  message      text,
  member_no    int not null unique default nextval('public.member_no_seq'),
  phone        text,            -- 선택 입력. API 로는 아무도 읽을 수 없다 (아래 컬럼 권한)
  pledged_at   timestamptz,
  is_seed      boolean not null default false,
  created_at   timestamptz not null default now()
);

alter sequence public.member_no_seq owned by public.profiles.member_no;

-- ─── feelings (AI키우기: 아이에게 전한 마음) ──────────────────
create table public.feelings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  emotion    public.emotion not null,
  body       text not null check (char_length(btrim(body)) between 1 and 300),
  is_seed    boolean not null default false,
  created_at timestamptz not null default now()
);

create index feelings_created_at_idx on public.feelings (created_at desc);

-- ─── posts (커뮤니티 글) ──────────────────────────────────
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category   public.post_category not null,
  title      text not null check (char_length(btrim(title)) > 0),
  body       text not null check (char_length(btrim(body)) > 0),
  is_pinned  boolean not null default false,  -- 오늘의 질문 (팀이 DB 에서 지정)
  is_seed    boolean not null default false,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

-- ─── comments ─────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) > 0),
  is_seed    boolean not null default false,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id, created_at);

-- ─── reactions (공감: 1인 1회) ─────────────────────────────
create table public.reactions (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ─── 가입 시 profiles 자동 생성 ─────────────────────────────
-- 가입 화면이 보낸 user metadata(display_name, prior_job, reasons, message, phone, pledged)로 만든다.
-- member_no·is_seed 는 사용자가 정할 수 없다. 예시 데이터만 app metadata(서비스 권한으로만 쓰기 가능)로 지정한다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app  jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  seed boolean := coalesce((app ->> 'is_seed')::boolean, false);
begin
  insert into public.profiles (id, display_name, prior_job, reasons, message, member_no, phone, pledged_at, is_seed)
  values (
    new.id,
    coalesce(nullif(btrim(meta ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    nullif(btrim(meta ->> 'prior_job'), ''),
    coalesce(array(select jsonb_array_elements_text(meta -> 'reasons')), '{}'),
    nullif(btrim(meta ->> 'message'), ''),
    case when seed then (app ->> 'member_no')::int else nextval('public.member_no_seq') end,
    nullif(btrim(meta ->> 'phone'), ''),
    case when coalesce((meta ->> 'pledged')::boolean, false) then now() end,
    seed
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RLS ──────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.feelings  enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;
alter table public.reactions enable row level security;

-- 읽기: 모두
create policy "profiles: 모두 읽기"  on public.profiles  for select to anon, authenticated using (true);
create policy "feelings: 모두 읽기"  on public.feelings  for select to anon, authenticated using (true);
create policy "posts: 모두 읽기"     on public.posts     for select to anon, authenticated using (true);
create policy "comments: 모두 읽기"  on public.comments  for select to anon, authenticated using (true);
create policy "reactions: 모두 읽기" on public.reactions for select to anon, authenticated using (true);

-- 쓰기: 본인 user_id 로만
create policy "feelings: 본인 쓰기"  on public.feelings  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "posts: 본인 쓰기"     on public.posts     for insert to authenticated with check (user_id = (select auth.uid()));
create policy "comments: 본인 쓰기"  on public.comments  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reactions: 본인 쓰기" on public.reactions for insert to authenticated with check (user_id = (select auth.uid()));

-- 수정: 본인 것만
create policy "profiles: 본인 수정" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "posts: 본인 수정" on public.posts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "comments: 본인 수정" on public.comments for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 삭제: 본인 것만
create policy "feelings: 본인 삭제"  on public.feelings  for delete to authenticated using (user_id = (select auth.uid()));
create policy "posts: 본인 삭제"     on public.posts     for delete to authenticated using (user_id = (select auth.uid()));
create policy "comments: 본인 삭제"  on public.comments  for delete to authenticated using (user_id = (select auth.uid()));
create policy "reactions: 본인 삭제" on public.reactions for delete to authenticated using (user_id = (select auth.uid()));

-- ─── 컬럼 권한 ─────────────────────────────────────────
-- RLS 는 행만 막는다. 사용자가 member_no·is_seed·is_pinned 를 바꾸거나 phone 을 읽지 못하도록 컬럼 단위로 다시 허용한다.
revoke all on public.profiles, public.feelings, public.posts, public.comments, public.reactions
  from anon, authenticated;

grant select (id, display_name, prior_job, reasons, message, member_no, pledged_at, is_seed, created_at)
  on public.profiles to anon, authenticated;
grant update (display_name, prior_job, reasons, message) on public.profiles to authenticated;

grant select on public.feelings, public.posts, public.comments, public.reactions to anon, authenticated;

grant insert (emotion, body)          on public.feelings  to authenticated;
grant insert (category, title, body)  on public.posts     to authenticated;
grant update (category, title, body)  on public.posts     to authenticated;
grant insert (post_id, body)          on public.comments  to authenticated;
grant update (body)                   on public.comments  to authenticated;
grant insert (post_id)                on public.reactions to authenticated;

grant delete on public.feelings, public.posts, public.comments, public.reactions to authenticated;

-- ─── 실시간: feelings, posts, comments insert 구독 ──────────────
alter publication supabase_realtime add table public.feelings, public.posts, public.comments;
