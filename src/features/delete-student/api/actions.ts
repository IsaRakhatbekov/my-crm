'use server'

import { loadStudentsInGroup } from '@/entities/student'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function deleteStudent(
	groupId: string,
	studentId: string,
): Promise<ActionResult<null>> {
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
	const studentsResult = await loadStudentsInGroup(supabase, trimmedGroupId)

	if (studentsResult.error || !studentsResult.data) {
		return { error: studentsResult.error ?? 'Не удалось загрузить студентов' }
	}

	const student = studentsResult.data.find(item => item.id === trimmedStudentId)

	if (!student) {
		return { error: 'Студент не найден в этой группе' }
	}

	const { data: profile, error: profileError } = await supabase
		.from('students')
		.select('id, user_id')
		.eq('id', trimmedStudentId)
		.maybeSingle()

	if (!profileError && profile) {
		const userId = profile.user_id

		const { error: membershipsError } = await supabase
			.from('group_students')
			.delete()
			.eq('student_id', profile.id)

		if (membershipsError) {
			return { error: membershipsError.message }
		}

		const { error: studentDeleteError } = await supabase
			.from('students')
			.delete()
			.eq('id', profile.id)

		if (studentDeleteError) {
			return { error: studentDeleteError.message }
		}

		if (userId) {
			const { error: authError } = await supabase.auth.admin.deleteUser(userId)

			if (authError) {
				return { error: authError.message }
			}
		}

		revalidatePath(`/dashboard/groups/${trimmedGroupId}`)
		revalidatePath('/dashboard/groups')

		return { data: null }
	}

	const { data: legacyRow, error: legacyError } = await supabase
		.from('group_students')
		.select('id, user_id, login')
		.eq('id', student.membershipId)
		.eq('group_id', trimmedGroupId)
		.maybeSingle()

	if (legacyError) {
		return { error: legacyError.message }
	}

	if (!legacyRow) {
		return { error: 'Студент не найден' }
	}

	const userId = legacyRow.user_id ?? student.userId
	const { error: deleteByLoginError } = await supabase
		.from('group_students')
		.delete()
		.eq('login', legacyRow.login)

	if (deleteByLoginError) {
		const { error: deleteMembershipError } = await supabase
			.from('group_students')
			.delete()
			.eq('id', legacyRow.id)

		if (deleteMembershipError) {
			return { error: deleteMembershipError.message }
		}
	}

	if (userId) {
		const { error: authError } = await supabase.auth.admin.deleteUser(userId)

		if (authError) {
			return { error: authError.message }
		}
	}

	revalidatePath(`/dashboard/groups/${trimmedGroupId}`)
	revalidatePath('/dashboard/groups')

	return { data: null }
}
