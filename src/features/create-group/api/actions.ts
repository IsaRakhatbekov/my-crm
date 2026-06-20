'use server'

import { randomUUID } from 'crypto'

import type { Group, GroupListItem } from '@/entities/group'
import { detectLoginType, type DraftGroupStudent, type StudentLoginType } from '@/entities/student'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'

type ActionResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

interface SaveGroupInput {
	courseName: string
	students: Array<Pick<DraftGroupStudent, 'login' | 'password'>>
	mentor: string | null
	assistant: string | null
}

interface GroupRow {
	id: string
	course_name: string
	mentor_id: string | null
	assistant_id: string | null
	created_at: string
}

interface GroupStudentRow {
	id: string
	group_id: string
	login: string
	login_type: StudentLoginType
	created_at: string
}

interface GroupDetails {
	group: GroupListItem
	students: GroupStudentRow[]
}

interface GroupSummaryRow {
	id: string
	course_name: string
	created_at: string
	students_count: number
	mentor_name: string | null
	assistant_name: string | null
}

async function assertManagerAccess(): Promise<ActionResult<null>> {
	const cookieStore = await cookies()
	const role = cookieStore.get(DEMO_ROLE_COOKIE)?.value

	if (!isUserRole(role) || role !== 'manager') {
		return { error: 'Доступ только для менеджера' }
	}

	return { data: null }
}

function mapGroup(row: GroupRow): Group {
	return {
		id: row.id,
		courseName: row.course_name,
		createdAt: row.created_at,
	}
}

async function createStudentAuthUser(
	login: string,
	loginType: StudentLoginType,
	password: string,
) {
	const admin = createAdminClient()

	if (loginType === 'email') {
		return admin.auth.admin.createUser({
			email: login,
			password,
			email_confirm: true,
			user_metadata: {
				role: 'student',
				login_type: 'email',
				login,
			},
		})
	}

	if (loginType === 'phone') {
		const phone = login.startsWith('+') ? login : `+${login.replace(/\D/g, '')}`

		return admin.auth.admin.createUser({
			phone,
			password,
			phone_confirm: true,
			user_metadata: {
				role: 'student',
				login_type: 'phone',
				login,
			},
		})
	}

	const email = `${randomUUID()}@students.local`

	return admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: {
			role: 'student',
			login_type: 'name',
			login,
			display_name: login,
		},
	})
}

export async function saveGroupWithStudents({
	courseName,
	students,
	mentor,
	assistant,
}: SaveGroupInput): Promise<ActionResult<Group>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const trimmedCourseName = courseName.trim()

	if (!trimmedCourseName) {
		return { error: 'Укажите название группы' }
	}

	const supabase = createAdminClient()

	if (mentor) {
		const { data: mentorRow, error: mentorError } = await supabase
			.from('staff_members')
			.select('id, role')
			.eq('id', mentor)
			.maybeSingle()

		if (mentorError) {
			return { error: mentorError.message }
		}

		if (!mentorRow) {
			return { error: 'Выбранный ментор не найден' }
		}

		if (mentorRow.role !== 'teacher') {
			return { error: 'Ментором можно назначить только сотрудника с ролью «Учитель»' }
		}
	}

	if (assistant) {
		const { data: assistantRow, error: assistantError } = await supabase
			.from('staff_members')
			.select('id, role')
			.eq('id', assistant)
			.maybeSingle()

		if (assistantError) {
			return { error: assistantError.message }
		}

		if (!assistantRow) {
			return { error: 'Выбранный помощник не найден' }
		}

		if (assistantRow.role !== 'assistant') {
			return { error: 'Помощником можно назначить только сотрудника с ролью «Помощник»' }
		}
	}

	const { data: groupRow, error: groupError } = await supabase
		.from('groups')
		.insert({
			course_name: trimmedCourseName,
			mentor_id: mentor,
			assistant_id: assistant,
		})
		.select('id, course_name, mentor_id, assistant_id, created_at')
		.single()

	if (groupError || !groupRow) {
		return { error: groupError?.message ?? 'Не удалось создать группу' }
	}

	for (const student of students) {
		const trimmedLogin = student.login.trim()
		const trimmedPassword = student.password

		if (!trimmedLogin) {
			await supabase.from('groups').delete().eq('id', groupRow.id)
			return { error: 'У одного из студентов не указан логин' }
		}

		const loginType = detectLoginType(trimmedLogin)
		const { data: authData, error: authError } = await createStudentAuthUser(
			trimmedLogin,
			loginType,
			trimmedPassword,
		)

		if (authError || !authData.user) {
			await supabase.from('groups').delete().eq('id', groupRow.id)
			return { error: authError?.message ?? 'Не удалось создать аккаунт студента' }
		}

		const { error: studentError } = await supabase.from('group_students').insert({
			group_id: groupRow.id,
			user_id: authData.user.id,
			login: trimmedLogin,
			login_type: loginType,
		})

		if (studentError) {
			await createAdminClient().auth.admin.deleteUser(authData.user.id)
			await supabase.from('groups').delete().eq('id', groupRow.id)
			return { error: studentError.message }
		}
	}

	return { data: mapGroup(groupRow as GroupRow) }
}

export async function getGroups(): Promise<ActionResult<GroupListItem[]>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const supabase = createAdminClient()

	const { data: groups, error: groupsError } = await supabase.rpc('get_group_summaries')

	if (groupsError) {
		return { error: groupsError.message }
	}

	return {
		data: ((groups ?? []) as GroupSummaryRow[]).map(row => ({
			id: row.id,
			courseName: row.course_name,
			createdAt: row.created_at,
			studentsCount: Number(row.students_count ?? 0),
			mentorName: row.mentor_name,
			assistantName: row.assistant_name,
		})),
	}
}

export async function getGroupStudents(groupId: string): Promise<ActionResult<GroupStudentRow[]>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const supabase = createAdminClient()

	const { data, error } = await supabase
		.from('group_students')
		.select('id, group_id, login, login_type, created_at')
		.eq('group_id', groupId)
		.order('created_at', { ascending: true })

	if (error) {
		return { error: error.message }
	}

	return { data: (data ?? []) as GroupStudentRow[] }
}

export async function getGroupDetails(groupId: string): Promise<ActionResult<GroupDetails>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const trimmedGroupId = groupId.trim()

	if (!trimmedGroupId) {
		return { error: 'Группа не найдена' }
	}

	const supabase = createAdminClient()

	const { data: groupRow, error: groupError } = await supabase
		.from('groups')
		.select('id, course_name, mentor_id, assistant_id, created_at')
		.eq('id', trimmedGroupId)
		.maybeSingle()

	if (groupError) {
		return { error: groupError.message }
	}

	if (!groupRow) {
		return { error: 'Группа не найдена' }
	}

	const staffIds = [groupRow.mentor_id, groupRow.assistant_id].filter(Boolean) as string[]
	const staffNamesById: Record<string, string> = {}

	if (staffIds.length > 0) {
		const { data: staffRows, error: staffError } = await supabase
			.from('staff_members')
			.select('id, full_name')
			.in('id', [...new Set(staffIds)])

		if (staffError) {
			return { error: staffError.message }
		}

		for (const row of staffRows ?? []) {
			staffNamesById[row.id] = row.full_name?.trim() || '—'
		}
	}

	const { data: studentsRows, error: studentsError } = await supabase
		.from('group_students')
		.select('id, group_id, login, login_type, created_at')
		.eq('group_id', trimmedGroupId)
		.order('created_at', { ascending: true })

	if (studentsError) {
		return { error: studentsError.message }
	}

	return {
		data: {
			group: {
				...mapGroup(groupRow as GroupRow),
				studentsCount: (studentsRows ?? []).length,
				mentorName: groupRow.mentor_id ? (staffNamesById[groupRow.mentor_id] ?? '—') : null,
				assistantName: groupRow.assistant_id
					? (staffNamesById[groupRow.assistant_id] ?? '—')
					: null,
			},
			students: (studentsRows ?? []) as GroupStudentRow[],
		},
	}
}
