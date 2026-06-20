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

-- Сотрудники (учитель, помощник)

create table if not exists public.staff_members (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users (id) on delete set null,
	role text not null check (role in ('teacher', 'assistant')),
	full_name text not null default '',
	login text not null unique,
	login_type text not null check (login_type in ('phone', 'email', 'name')),
	created_at timestamptz not null default now()
);

create index if not exists staff_members_role_idx on public.staff_members (role);

alter table public.staff_members enable row level security;

create or replace function public.get_staff_summaries()
returns table (
	id uuid,
	user_id uuid,
	role text,
	full_name text,
	login text,
	login_type text,
	created_at timestamptz,
	groups_count bigint
)
language sql
stable
as $$
	select
		s.id,
		s.user_id,
		s.role,
		s.full_name,
		s.login,
		s.login_type,
		s.created_at,
		(
			select count(*)
			from public.groups g
			where g.mentor_id = s.id or g.assistant_id = s.id
		) as groups_count
	from public.staff_members s
	order by s.created_at desc;
$$;

-- Группы и студенты группы (менеджер сохраняет через server actions + service role)

create table if not exists public.groups (
	id uuid primary key default gen_random_uuid(),
	course_name text not null,
	mentor_id uuid references public.staff_members (id) on delete set null,
	assistant_id uuid references public.staff_members (id) on delete set null,
	created_at timestamptz not null default now()
);

-- Безопасное переименование, если таблица была создана со старым полем name
do $$
begin
	if exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'groups'
			and column_name = 'name'
	) and not exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'groups'
			and column_name = 'course_name'
	) then
		alter table public.groups rename column name to course_name;
	end if;
end $$;

create table if not exists public.group_students (
	id uuid primary key default gen_random_uuid(),
	group_id uuid not null references public.groups (id) on delete cascade,
	user_id uuid references auth.users (id) on delete set null,
	login text not null,
	login_type text not null check (login_type in ('phone', 'email', 'name')),
	created_at timestamptz not null default now(),
	unique (group_id, login)
);

create index if not exists group_students_group_id_idx on public.group_students (group_id);
create index if not exists group_students_user_id_idx on public.group_students (user_id);
create index if not exists groups_mentor_id_idx on public.groups (mentor_id);
create index if not exists groups_assistant_id_idx on public.groups (assistant_id);

alter table public.groups enable row level security;
alter table public.group_students enable row level security;

create or replace function public.get_group_summaries()
returns table (
	id uuid,
	course_name text,
	created_at timestamptz,
	students_count bigint,
	mentor_name text,
	assistant_name text
)
language sql
stable
as $$
	select
		g.id,
		g.course_name,
		g.created_at,
		count(gs.id) as students_count,
		nullif(trim(coalesce(m.full_name, '')), '') as mentor_name,
		nullif(trim(coalesce(a.full_name, '')), '') as assistant_name
	from public.groups g
	left join public.group_students gs on gs.group_id = g.id
	left join public.staff_members m on m.id = g.mentor_id
	left join public.staff_members a on a.id = g.assistant_id
	group by g.id, g.course_name, g.created_at, m.full_name, a.full_name
	order by g.created_at desc;
$$;
