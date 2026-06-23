'use server'

import type { Group, GroupListItem } from '@/entities/group'
import {
	loadStudentsInGroup,
	type DraftStudent,
	type StudentInGroup,
} from '@/entities/student'
import { persistStudent } from '@/features/create-student/api/lib/persist-student'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'

type ActionResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

interface SaveGroupInput {
	courseName: string
	students: Array<Pick<DraftStudent, 'login' | 'password'>>
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

interface GroupDetails {
	group: GroupListItem
	students: StudentInGroup[]
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

		if (!trimmedLogin) {
			await supabase.from('groups').delete().eq('id', groupRow.id)
			return { error: 'У одного из студентов не указан логин' }
		}

		const result = await persistStudent({
			login: trimmedLogin,
			password: student.password,
			groupId: groupRow.id,
		})

		if (result.error) {
			await supabase.from('groups').delete().eq('id', groupRow.id)
			return { error: result.error }
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

	const studentsResult = await loadStudentsInGroup(supabase, trimmedGroupId)

	if (studentsResult.error) {
		return { error: studentsResult.error }
	}

	const students = studentsResult.data ?? []

	return {
		data: {
			group: {
				...mapGroup(groupRow as GroupRow),
				studentsCount: students.length,
				mentorName: groupRow.mentor_id ? (staffNamesById[groupRow.mentor_id] ?? '—') : null,
				assistantName: groupRow.assistant_id
					? (staffNamesById[groupRow.assistant_id] ?? '—')
					: null,
			},
			students,
		},
	}
}
