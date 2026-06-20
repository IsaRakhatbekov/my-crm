-- Запусти только этот файл, если полный schema.sql уже падал.
-- Создаёт таблицу сотрудников и чинит groups без ошибки про column "name".

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

create table if not exists public.staff_members (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users (id) on delete set null,
	role text not null check (role in ('teacher', 'assistant')),
	login text not null unique,
	login_type text not null check (login_type in ('phone', 'email', 'name')),
	created_at timestamptz not null default now()
);

create index if not exists staff_members_role_idx on public.staff_members (role);

alter table public.staff_members enable row level security;
