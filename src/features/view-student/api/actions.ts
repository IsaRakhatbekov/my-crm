'use server'

import type { StudentDetails } from '@/entities/student'
import { loadStudentsInGroup } from '@/entities/student'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'

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

export async function getStudentDetails(
	groupId: string,
	studentId: string,
): Promise<ActionResult<StudentDetails>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const trimmedGroupId = groupId.trim()
	const trimmedStudentId = studentId.trim()

	if (!trimmedGroupId || !trimmedStudentId) {
		return { error: 'Студент не найден' }
	}

	const supabase = createAdminClient()

	const { data: groupRow, error: groupError } = await supabase
		.from('groups')
		.select('id, course_name')
		.eq('id', trimmedGroupId)
		.maybeSingle()

	if (groupError) {
		return { error: groupError.message }
	}

	if (!groupRow) {
		return { error: 'Группа не найдена' }
	}

	const studentsResult = await loadStudentsInGroup(supabase, trimmedGroupId)

	if (studentsResult.error || !studentsResult.data) {
		return { error: studentsResult.error ?? 'Не удалось загрузить студентов' }
	}

	const student = studentsResult.data.find(item => item.id === trimmedStudentId)

	if (!student) {
		return { error: 'Студент не найден' }
	}

	return {
		data: {
			student,
			groupId: groupRow.id,
			groupCourseName: groupRow.course_name,
		},
	}
}
