-- Запусти ОДИН раз в Supabase: SQL Editor → New query → Run
-- Полная настройка БД для CRM (с нуля или дозаполнение недостающего)

-- 1. Сотрудники

create table if not exists public.staff_members (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users (id) on delete set null,
	role text not null check (role in ('teacher', 'assistant')),
	full_name text not null default '',
	login text not null unique,
	login_type text not null check (login_type in ('phone', 'email', 'name')),
	created_at timestamptz not null default now()
);

alter table public.staff_members
add column if not exists full_name text not null default '';

create index if not exists staff_members_role_idx on public.staff_members (role);

alter table public.staff_members enable row level security;

-- 2. Студенты (профиль)

create table if not exists public.students (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users (id) on delete set null,
	login text not null unique,
	login_type text not null check (login_type in ('phone', 'email', 'name')),
	full_name text not null default '',
	created_at timestamptz not null default now()
);

create index if not exists students_user_id_idx on public.students (user_id);

alter table public.students enable row level security;

-- 3. Группы

create table if not exists public.groups (
	id uuid primary key default gen_random_uuid(),
	course_name text not null,
	mentor_id uuid references public.staff_members (id) on delete set null,
	assistant_id uuid references public.staff_members (id) on delete set null,
	created_at timestamptz not null default now()
);

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

alter table public.groups
add column if not exists mentor_id uuid references public.staff_members (id) on delete set null;

alter table public.groups
add column if not exists assistant_id uuid references public.staff_members (id) on delete set null;

create index if not exists groups_mentor_id_idx on public.groups (mentor_id);
create index if not exists groups_assistant_id_idx on public.groups (assistant_id);

alter table public.groups enable row level security;

-- 4. Связь группа ↔ студент

create table if not exists public.group_students (
	id uuid primary key default gen_random_uuid(),
	group_id uuid not null references public.groups (id) on delete cascade,
	student_id uuid not null references public.students (id) on delete cascade,
	created_at timestamptz not null default now(),
	unique (group_id, student_id)
);

-- Миграция со старой схемы group_students (login/user_id внутри связи)
do $$
begin
	if exists (
		select 1
		from information_schema.columns
		where table_schema = 'public'
			and table_name = 'group_students'
			and column_name = 'login'
	) then
		insert into public.students (user_id, login, login_type, full_name, created_at)
		select distinct on (gs.login)
			gs.user_id,
			gs.login,
			gs.login_type,
			gs.login,
			gs.created_at
		from public.group_students gs
		where not exists (
			select 1 from public.students s where s.login = gs.login
		)
		order by gs.login, gs.created_at;

		alter table public.group_students add column if not exists student_id uuid references public.students (id) on delete cascade;

		update public.group_students gs
		set student_id = s.id
		from public.students s
		where gs.student_id is null
			and s.login = gs.login;

		alter table public.group_students drop column if exists user_id;
		alter table public.group_students drop column if exists login;
		alter table public.group_students drop column if exists login_type;

		alter table public.group_students drop constraint if exists group_students_group_id_login_key;
		alter table public.group_students drop constraint if exists group_students_group_id_student_id_key;
		alter table public.group_students
		add constraint group_students_group_id_student_id_key unique (group_id, student_id);
	end if;
end $$;

create index if not exists group_students_group_id_idx on public.group_students (group_id);
create index if not exists group_students_student_id_idx on public.group_students (student_id);

alter table public.group_students enable row level security;

-- 5. RPC: список групп

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

-- 6. RPC: список сотрудников

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

-- 7. RPC: студенты группы

create or replace function public.get_group_students(p_group_id uuid)
returns table (
	membership_id uuid,
	group_id uuid,
	student_id uuid,
	user_id uuid,
	login text,
	login_type text,
	full_name text,
	student_created_at timestamptz
)
language sql
stable
as $$
	select
		gs.id as membership_id,
		gs.group_id,
		s.id as student_id,
		s.user_id,
		s.login,
		s.login_type,
		s.full_name,
		s.created_at as student_created_at
	from public.group_students gs
	inner join public.students s on s.id = gs.student_id
	where gs.group_id = p_group_id
	order by gs.created_at asc;
$$;

notify pgrst, 'reload schema';
