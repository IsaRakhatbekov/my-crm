-- Имя сотрудника + ментор/помощник у группы

alter table public.staff_members
add column if not exists full_name text not null default '';

alter table public.groups
add column if not exists mentor_id uuid references public.staff_members (id) on delete set null;

alter table public.groups
add column if not exists assistant_id uuid references public.staff_members (id) on delete set null;

create index if not exists groups_mentor_id_idx on public.groups (mentor_id);
create index if not exists groups_assistant_id_idx on public.groups (assistant_id);

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
