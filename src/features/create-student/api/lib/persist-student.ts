import type { Student, StudentInGroup, StudentLoginType } from '@/entities/student'
import { isMissingStudentIdColumn, isMissingStudentsTable } from '@/entities/student/lib/schema-errors'
import { detectLoginType } from '@/shared/lib/detect-login-type'
import { createAdminClient } from '@/shared/lib/supabase/admin'

import { createStudentAuthUser } from './create-student-auth-user'

type PersistResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

interface PersistStudentInput {
	login: string
	password: string
	groupId?: string
}

interface StudentRow {
	id: string
	user_id: string | null
	login: string
	login_type: StudentLoginType
	full_name: string
	created_at: string
}

interface LegacyMembershipRow {
	id: string
	group_id: string
	user_id: string | null
	login: string
	login_type: StudentLoginType
	created_at: string
}

function mapStudent(row: StudentRow): Student {
	return {
		id: row.id,
		userId: row.user_id,
		login: row.login,
		loginType: row.login_type,
		fullName: row.full_name,
		createdAt: row.created_at,
	}
}

async function persistStudentLegacy({
	login,
	password,
	groupId,
	loginType,
	supabase,
}: {
	login: string
	password: string
	groupId?: string
	loginType: StudentLoginType
	supabase: ReturnType<typeof createAdminClient>
}): Promise<PersistResult<Student | StudentInGroup>> {
	if (!groupId) {
		return { error: 'Выберите группу для студента' }
	}

	const { data: existingMembership } = await supabase
		.from('group_students')
		.select('id')
		.eq('login', login)
		.maybeSingle()

	if (existingMembership) {
		return { error: `Студент с логином «${login}» уже существует` }
	}

	const { data: authData, error: authError } = await createStudentAuthUser(login, loginType, password)

	if (authError || !authData.user) {
		return { error: authError?.message ?? 'Не удалось создать аккаунт студента' }
	}

	const { data: membershipRow, error: membershipError } = await supabase
		.from('group_students')
		.insert({
			group_id: groupId,
			user_id: authData.user.id,
			login,
			login_type: loginType,
		})
		.select('id, group_id, user_id, login, login_type, created_at')
		.single()

	if (membershipError || !membershipRow) {
		await createAdminClient().auth.admin.deleteUser(authData.user.id)
		return { error: membershipError?.message ?? 'Не удалось добавить студента в группу' }
	}

	const legacyRow = membershipRow as LegacyMembershipRow

	return {
		data: {
			id: legacyRow.id,
			userId: legacyRow.user_id,
			login: legacyRow.login,
			loginType: legacyRow.login_type,
			fullName: legacyRow.login,
			createdAt: legacyRow.created_at,
			membershipId: legacyRow.id,
			groupId: legacyRow.group_id,
		},
	}
}

export async function persistStudent({
	login,
	password,
	groupId,
}: PersistStudentInput): Promise<PersistResult<Student | StudentInGroup>> {
	const trimmedLogin = login.trim()

	if (!trimmedLogin) {
		return { error: 'Укажите логин студента' }
	}

	if (!password) {
		return { error: 'Укажите пароль студента' }
	}

	const loginType = detectLoginType(trimmedLogin)
	const supabase = createAdminClient()

	const studentsProbe = await supabase.from('students').select('id').limit(1)

	if (studentsProbe.error && isMissingStudentsTable(studentsProbe.error)) {
		return persistStudentLegacy({
			login: trimmedLogin,
			password,
			groupId,
			loginType,
			supabase,
		})
	}

	const { data: existingStudent } = await supabase
		.from('students')
		.select('id')
		.eq('login', trimmedLogin)
		.maybeSingle()

	if (existingStudent) {
		return { error: `Студент с логином «${trimmedLogin}» уже существует` }
	}

	const { data: authData, error: authError } = await createStudentAuthUser(
		trimmedLogin,
		loginType,
		password,
	)

	if (authError || !authData.user) {
		return { error: authError?.message ?? 'Не удалось создать аккаунт студента' }
	}

	const { data: studentRow, error: studentProfileError } = await supabase
		.from('students')
		.insert({
			user_id: authData.user.id,
			login: trimmedLogin,
			login_type: loginType,
			full_name: trimmedLogin,
		})
		.select('id, user_id, login, login_type, full_name, created_at')
		.single()

	if (studentProfileError || !studentRow) {
		await createAdminClient().auth.admin.deleteUser(authData.user.id)
		return { error: studentProfileError?.message ?? 'Не удалось сохранить профиль студента' }
	}

	const student = mapStudent(studentRow as StudentRow)

	if (!groupId) {
		return { data: student }
	}

	const { data: membershipRow, error: membershipError } = await supabase
		.from('group_students')
		.insert({
			group_id: groupId,
			student_id: student.id,
		})
		.select('id, group_id')
		.single()

	if (membershipError && isMissingStudentIdColumn(membershipError)) {
		await supabase.from('students').delete().eq('id', student.id)

		return persistStudentLegacy({
			login: trimmedLogin,
			password,
			groupId,
			loginType,
			supabase,
		})
	}

	if (membershipError || !membershipRow) {
		await supabase.from('students').delete().eq('id', student.id)
		await createAdminClient().auth.admin.deleteUser(authData.user.id)
		return { error: membershipError?.message ?? 'Не удалось добавить студента в группу' }
	}

	return {
		data: {
			...student,
			membershipId: membershipRow.id,
			groupId: membershipRow.group_id,
		},
	}
}
