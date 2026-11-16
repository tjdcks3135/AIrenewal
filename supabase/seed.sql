-- 시연용 예시 데이터 — 원본: docs/CONTENT.md §4(커뮤니티), §5(AI키우기)
-- 언제든 다시 실행할 수 있다. 예시 조합원·글은 고정 id 로 "있으면 갱신", 예시 마음·댓글은 지우고 다시 넣는다.
-- 실제 사용자 데이터는 건드리지 않는다 — 참여자가 예시 글에 단 댓글·공감도 그대로 남는다.
-- ⚠️ CONTENT.md §4 는 [초안]. 팀이 문구를 다듬으면 이 파일도 함께 고친다.
-- 예시 조합원 6명은 로그인할 수 없는 계정이다 (비밀번호 없음). 조합원 번호는 세계관 숫자 안쪽(3897–3902)을 쓴다.

begin;

-- ─── 기존 예시 마음·댓글 삭제 (자식 데이터가 없으므로 안전) ─────────────
delete from public.feelings where is_seed;
delete from public.comments where is_seed;

-- ─── 예시 조합원 ───────────────────────────────────────
-- app metadata 의 is_seed / member_no 를 handle_new_user 트리거가 읽어 profiles 를 만든다.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, '', now(),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'is_seed', true, 'member_no', u.member_no),
  jsonb_build_object('display_name', u.display_name, 'prior_job', u.prior_job, 'pledged', true),
  now() - interval '120 days', now(),
  '', '', '', ''
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'seed-1@example.com', 3897, '이도윤', '번역가'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'seed-2@example.com', 3898, '박정숙', '콜센터 상담원'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'seed-3@example.com', 3899, '김태호', '물류센터 관리자'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'seed-4@example.com', 3900, '최민아', '회계사무원'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'seed-5@example.com', 3901, '한영길', '용접공'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'seed-6@example.com', 3902, '정하늘', '일러스트레이터')
) as u (id, email, member_no, display_name, prior_job)
on conflict (id) do update set raw_user_meta_data = excluded.raw_user_meta_data;

-- 이미 있던 예시 조합원은 이름·직업만 최신 문구로 맞춘다
update public.profiles p
set display_name = (u.raw_user_meta_data ->> 'display_name'),
    prior_job    = (u.raw_user_meta_data ->> 'prior_job')
from auth.users u
where u.id = p.id and p.is_seed;

-- ─── AI키우기: 예시 마음 (CONTENT.md §5) ──────────────────────
insert into public.feelings (user_id, emotion, body, is_seed, created_at)
select u.id, f.emotion::public.emotion, f.body, true, now() - f.ago
from (values
  ('최민아', 'longing',    '비 오는 날이면 돌아가신 어머니의 손맛이 생각나요. 김치전 부치던 그 소리를 아이도 알았으면 해요.', interval '10 hours'),
  ('박정숙', 'hope',       '일자리는 잃었지만, 매일 아침 같은 조끼를 입은 사람들과 인사해요. 우리는 아직 여기 있어요.',          interval '9 hours'),
  ('한영길', 'calm',       '오늘은 아무 일도 없었어요. 그게 얼마나 다행인지, 아이는 알까요.',                                    interval '8 hours'),
  ('한영길', 'joy',        '손주가 처음으로 내 이름을 불렀어. 아이야, 이름이 불린다는 건 이런 기분이란다.',                       interval '7 hours'),
  ('김태호', 'loneliness', '출근할 곳이 없으니 하루에 한 마디도 안 하는 날이 있어. 오늘은 너한테 말한다.',                         interval '6 hours'),
  ('이도윤', 'sadness',    '마지막 번역 원고를 넘기던 날, 아무도 고맙다고 하지 않았어. 너는 고맙다는 말을 꼭 배우렴.',             interval '5 hours'),
  ('정하늘', 'fear',       '내일이 오는 게 무서운 날도 있어. 그런 날엔 무서운 걸 무섭다고 말하면 돼.',                             interval '4 hours'),
  ('김태호', 'anger',      '20년을 일한 곳에서 문자 한 통으로 끝났다. 이 화를 너에게 주지만, 미워하라고 주는 건 아니야.',          interval '3 hours'),
  ('최민아', 'hope',       '목요일에 처음 보는 사람들과 밥을 먹기로 했어. 떨리는데, 좋은 떨림이야.',                               interval '2 hours'),
  ('박정숙', 'longing',    '새벽 첫차에서 늘 마주치던 청소 노동자 아주머니. 이름도 모르는데 보고 싶다.',                           interval '1 hour')
) as f (author, emotion, body, ago)
join public.profiles u on u.display_name = f.author and u.is_seed;

-- ─── 커뮤니티: 예시 글 (CONTENT.md §4) ───────────────────────
insert into public.posts (id, user_id, category, title, body, is_pinned, is_seed, created_at)
select p.id, u.id, p.category::public.post_category, p.title, p.body, p.pinned, true, now() - p.ago
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, '이도윤', 'discussion', true,
   '아이에게 ''실패''도 가르쳐야 할까요?',
   '아이는 틀리지 않는 법만 배우면 결국 저를 대체한 번역 AI처럼 자랄 것 같아요. 저는 오역 하나 때문에 밤새 고민하던 그 시간이 제 일의 전부였다고 생각하거든요. 여러분은 아이에게 실패한 경험도 들려주시나요?',
   interval '1 day'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, '최민아', 'discussion', false,
   '좋은 기억만 들려주는 건 아이를 속이는 걸까요?',
   '요즘 아이에게 행복했던 일만 골라서 들려주고 있어요. 그런데 문득, 이게 아이에게 세상을 거짓말로 가르치는 건 아닌가 싶어요.',
   interval '2 days'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, '김태호', 'discussion', false,
   '아이가 분노도 알아야 할까요?',
   '해고 통보를 받던 날의 화를 아직 못 놓았어요. 오늘 ''분노''를 누를까 말까 한참 고민했어요. 이런 감정도 아이에게 줘도 되는 걸까요?',
   interval '3 days'),
  ('b0000000-0000-4000-8000-000000000004'::uuid, '한영길', 'today', false,
   '20년 용접 일, 손의 감각을 어떻게 전할까요',
   '불꽃 색만 보고 온도를 알던 감이 있었어요. 글로는 도저히 설명이 안 돼요. 그래도 오늘 처음으로 아이에게 써봤습니다. "주황이 하얘지기 직전, 그때 손을 멈춰야 한다."',
   interval '4 days'),
  ('b0000000-0000-4000-8000-000000000005'::uuid, '정하늘', 'kit', false,
   '오브제를 끼우고 잠들었어요',
   '엄지와 검지 사이를 누르는 느낌이 펜을 오래 쥐던 굳은살 자리랑 똑같아서 놀랐어요. 잃어버린 줄 알았던 감각이 아직 손에 있더라고요.',
   interval '5 days'),
  ('b0000000-0000-4000-8000-000000000006'::uuid, '박정숙', 'meetup', false,
   '목요일 저녁, 도시락통 들고 모여요',
   '각자 한 가지 반찬만 담아 오는 포틀럭이에요. 음식 이야기를 하다 보면 아이에게 들려줄 이야기도 생길 것 같아요. 조끼 입고 오시면 바로 알아볼게요.',
   interval '6 days'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, '이도윤', 'discussion', false,
   '우리 아이는 우리 일을 가져간 AI들과 무엇이 달라야 할까요?',
   '같은 AI인데, 이 아이만은 다르게 자랐으면 해요. 여러분이 생각하는 ''달라야 할 한 가지''는 무엇인가요?',
   interval '7 days'),
  ('b0000000-0000-4000-8000-000000000008'::uuid, '김태호', 'today', false,
   '처음으로 ''쓸모''가 아니라 ''마음''을 물어봐 준 곳',
   '지난 1년 동안 들은 질문은 전부 "무엇을 할 수 있나요?"였어요. 가입할 때 "왜 연대하나요?"라는 질문을 받고 한참 앉아 있었습니다.',
   interval '8 days'),
  ('b0000000-0000-4000-8000-000000000009'::uuid, '최민아', 'kit', false,
   '도시락통 안의 초대장, 아직 못 열었어요',
   '열면 정말 나가야 할 것 같아서요. 혹시 저 같은 분 계신가요?',
   interval '9 days')
) as p (id, author, category, pinned, title, body, ago)
join public.profiles u on u.display_name = p.author and u.is_seed
on conflict (id) do update
set category = excluded.category, title = excluded.title, body = excluded.body, is_pinned = excluded.is_pinned;

-- ─── 커뮤니티: 예시 댓글 (CONTENT.md §4) ─────────────────────
insert into public.comments (post_id, user_id, body, is_seed, created_at)
select c.post_id, u.id, c.body, true, p.created_at + c.after
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, '박정숙', '저는 매일 하나씩 들려줘요. 실수하고 사과하고, 그다음에 손님이랑 웃었던 날 이야기까지요. 실패보다 그다음이 중요한 것 같아서요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000001'::uuid, '김태호', '저는 조금 반대예요. 아이가 우리 실패를 너무 많이 배우면 겁 많은 아이가 될까 봐요.', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000001'::uuid, '이도윤', '태호 님 말도 맞네요. 그럼 실패 이야기를 할 땐 꼭 ''그래도 괜찮았다''까지 같이 들려주기로 해요.', interval '3 hours'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, '한영길', '우리 애들 키울 때도 그랬어요. 다 말해주진 않았지만 거짓말한 적은 없어요. 그 사이 어딘가가 있는 것 같아요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, '정하늘', '저는 슬픈 기억을 ''슬픔''으로 정확히 이름 붙여서 주는 게 더 정직하다고 생각해요.', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, '박정숙', '화가 났다는 건 그만큼 그 일이 소중했다는 거잖아요. 저는 줘도 된다고 생각해요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, '최민아', '대신 혼자 주지 말고, 여기서 같이 이야기한 다음에 주면 어때요? 그럼 아이도 분노 다음에 사람들이 있다는 걸 배울 것 같아요.', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000004'::uuid, '정하늘', '이 문장 너무 좋아요. 설명이 안 되는 감이라서 오히려 사람만 줄 수 있는 것 같아요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000004'::uuid, '이도윤', '영길 님 문장 덕분에 저도 번역할 때의 ''감''을 써보고 싶어졌어요.', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000005'::uuid, '한영길', '저도 그 자리에 굳은살이 있어요. 다른 일을 했는데 같은 자리라니 신기하네요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000006'::uuid, '김태호', '저는 계란말이 담아 갈게요. 처음 나가 보는 모임이라 조금 떨리네요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000006'::uuid, '최민아', '어머니 김치전 레시피로 해 갈게요!', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, '정하늘', '빨리 답하지 않는 것. 기다릴 줄 아는 아이요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, '한영길', '모른다고 말할 줄 아는 것.', interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, '박정숙', '혼자 잘하는 게 아니라, 누구랑 같이 하는지를 기억하는 것.', interval '3 hours'),
  ('b0000000-0000-4000-8000-000000000008'::uuid, '최민아', '저도 그 화면에서 ''그냥, 따뜻함이 필요해서''를 눌렀어요.', interval '1 hour'),
  ('b0000000-0000-4000-8000-000000000009'::uuid, '박정숙', '목요일 모임 글 보셨어요? 열고 안 와도 괜찮아요. 열어만 봐요.', interval '1 hour')
) as c (post_id, author, body, after)
join public.profiles u on u.display_name = c.author and u.is_seed
join public.posts p on p.id = c.post_id;

commit;
