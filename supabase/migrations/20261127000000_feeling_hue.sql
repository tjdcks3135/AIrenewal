-- 마음의 색을 사용자가 고른다 (docs/FEATURES.md §3.1·§5, DESIGN.md §1.3 마음의 색)
-- hue: 색상 0~359°. 채도·밝기는 화면에서 고정 (--feeling-saturation / --feeling-lightness).
-- 감정(emotion)은 그대로 입력받지만 화면에 보이지 않는 분석용이다.

alter table public.feelings add column hue smallint;

-- 기존 마음: 감정 팔레트(--emo-*) 색의 색상값으로 채운다
update public.feelings set hue = case emotion
  when 'longing'    then 267
  when 'hope'       then 84
  when 'joy'        then 44
  when 'loneliness' then 233
  when 'calm'       then 179
  when 'sadness'    then 217
  when 'fear'       then 290
  when 'anger'      then 5
end
where hue is null;

alter table public.feelings
  alter column hue set not null,
  add constraint feelings_hue_range check (hue between 0 and 359);

-- 사용자는 hue 도 직접 넣는다 (컬럼 단위 권한 — init 마이그레이션 참고)
grant insert (hue) on public.feelings to authenticated;
