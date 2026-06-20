-- Список сотрудников с количеством групп (один запрос)

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
