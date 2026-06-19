-- Запусти этот SQL в Supabase: SQL Editor → New query → Run
--
-- Перед тестом создай пользователя:
-- Authentication → Users → Add user (email + password)

create table if not exists public.homework_submissions (
	id uuid primary key default gen_random_uuid(),
	homework_id text not null,
	student_id uuid not null references auth.users (id) on delete cascade,
	code text not null default '',
	status text not null default 'draft' check (status in ('draft', 'in_review', 'returned', 'done')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (homework_id, student_id)
);

create index if not exists homework_submissions_student_id_idx
	on public.homework_submissions (student_id);

create index if not exists homework_submissions_homework_id_idx
	on public.homework_submissions (homework_id);

create or replace function public.set_homework_submissions_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists homework_submissions_updated_at on public.homework_submissions;

create trigger homework_submissions_updated_at
before update on public.homework_submissions
for each row
execute function public.set_homework_submissions_updated_at();

alter table public.homework_submissions enable row level security;

drop policy if exists "Students can view own submissions" on public.homework_submissions;
drop policy if exists "Students can insert own submissions" on public.homework_submissions;
drop policy if exists "Students can update own submissions" on public.homework_submissions;

create policy "Students can view own submissions"
	on public.homework_submissions
	for select
	using (auth.uid() = student_id);

create policy "Students can insert own submissions"
	on public.homework_submissions
	for insert
	with check (auth.uid() = student_id);

create policy "Students can update own submissions"
	on public.homework_submissions
	for update
	using (auth.uid() = student_id);
