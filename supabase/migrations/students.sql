-- Дополнительная миграция: students + group_students.student_id
-- ВАЖНО: сначала запусти supabase/setup.sql, если таблиц ещё нет!

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

do $$
begin
	if not exists (
		select 1
		from information_schema.tables
		where table_schema = 'public'
			and table_name = 'group_students'
	) then
		raise exception 'Таблица group_students не найдена. Сначала запусти supabase/setup.sql';
	end if;

	alter table public.group_students
	add column if not exists student_id uuid references public.students (id) on delete cascade;

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

		update public.group_students gs
		set student_id = s.id
		from public.students s
		where gs.student_id is null
			and s.login = gs.login;

		alter table public.group_students drop column if exists user_id;
		alter table public.group_students drop column if exists login;
		alter table public.group_students drop column if exists login_type;
	end if;

	alter table public.group_students drop constraint if exists group_students_group_id_login_key;
	alter table public.group_students drop constraint if exists group_students_group_id_student_id_key;

	alter table public.group_students
	add constraint group_students_group_id_student_id_key unique (group_id, student_id);

	drop index if exists group_students_user_id_idx;
	create index if not exists group_students_student_id_idx on public.group_students (student_id);
end $$;
