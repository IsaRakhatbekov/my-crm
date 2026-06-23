-- Студенты группы через SQL join (без PostgREST embed)

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
