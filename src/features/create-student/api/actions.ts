'use server'

import type { GroupListItem } from '@/entities/group'
import type { Student, StudentInGroup } from '@/entities/student'
import { loadAllStudents } from '@/entities/student'
import { isMissingStudentsTable } from '@/entities/student/lib/schema-errors'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { persistStudent } from './lib/persist-student'

type ActionResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

async function assertManagerAccess(): Promise<ActionResult<null>> {
	const cookieStore = await cookies()
	const role = cookieStore.get(DEMO_ROLE_COOKIE)?.value

	if (!isUserRole(role) || role !== 'manager') {
		return { error: 'Доступ только для менеджера' }
	}

	return { data: null }
}

export async function getStudents(): Promise<ActionResult<Student[]>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const supabase = createAdminClient()
	const result = await loadAllStudents(supabase)

	if (result.error || !result.data) {
		return { error: result.error ?? 'Не удалось загрузить студентов' }
	}

	return { data: result.data }
}

export async function getStudentsPageData(): Promise<
	ActionResult<{ students: Student[]; groups: GroupListItem[]; requireGroup: boolean }>
> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const supabase = createAdminClient()
	const result = await loadAllStudents(supabase)

	if (result.error || !result.data) {
		return { error: result.error ?? 'Не удалось загрузить студентов' }
	}

	const { data: groups, error: groupsError } = await supabase.rpc('get_group_summaries')

	if (groupsError) {
		return { error: groupsError.message }
	}

	const studentsProbe = await supabase.from('students').select('id').limit(1)
	const requireGroup = Boolean(studentsProbe.error && isMissingStudentsTable(studentsProbe.error))

	return {
		data: {
			students: result.data,
			groups: ((groups ?? []) as Array<{
				id: string
				course_name: string
				created_at: string
				students_count: number
				mentor_name: string | null
				assistant_name: string | null
			}>).map(row => ({
				id: row.id,
				courseName: row.course_name,
				createdAt: row.created_at,
				studentsCount: Number(row.students_count ?? 0),
				mentorName: row.mentor_name,
				assistantName: row.assistant_name,
			})),
			requireGroup,
		},
	}
}

interface CreateStudentInput {
	login: string
	password: string
	groupId?: string
}

export async function createStudent({
	login,
	password,
	groupId,
}: CreateStudentInput): Promise<ActionResult<Student | StudentInGroup>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const trimmedGroupId = groupId?.trim()

	if (trimmedGroupId) {
		const supabase = createAdminClient()
		const { data: groupRow, error: groupError } = await supabase
			.from('groups')
			.select('id')
			.eq('id', trimmedGroupId)
			.maybeSingle()

		if (groupError) {
			return { error: groupError.message }
		}

		if (!groupRow) {
			return { error: 'Группа не найдена' }
		}
	}

	const result = await persistStudent({
		login,
		password,
		groupId: trimmedGroupId,
	})

	if (result.error || !result.data) {
		return { error: result.error ?? 'Не удалось создать студента' }
	}

	if (trimmedGroupId) {
		revalidatePath(`/dashboard/groups/${trimmedGroupId}`)
		revalidatePath('/dashboard/groups')
	}

	revalidatePath('/dashboard/students/create')

	return { data: result.data }
}
