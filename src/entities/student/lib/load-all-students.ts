import { createAdminClient } from '@/shared/lib/supabase/admin'

import {
	isMissingLoginColumn,
	isMissingStudentsTable,
} from './schema-errors'
import type { Student, StudentLoginType } from '../model/types'

type LoadAllStudentsResult =
	| { data: Student[]; error?: undefined }
	| { data?: undefined; error: string }

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
	user_id: string | null
	login: string
	login_type: StudentLoginType
	created_at: string
}

function mapStudentRow(row: StudentRow): Student {
	return {
		id: row.id,
		userId: row.user_id,
		login: row.login,
		loginType: row.login_type,
		fullName: row.full_name,
		createdAt: row.created_at,
	}
}

function mapLegacyStudents(rows: LegacyMembershipRow[]): Student[] {
	const studentsByLogin = new Map<string, Student>()

	for (const row of rows) {
		const loginKey = row.login.trim().toLowerCase()

		if (!loginKey || studentsByLogin.has(loginKey)) {
			continue
		}

		studentsByLogin.set(loginKey, {
			id: row.id,
			userId: row.user_id,
			login: row.login,
			loginType: row.login_type,
			fullName: row.login,
			createdAt: row.created_at,
		})
	}

	return Array.from(studentsByLogin.values())
}

function mergeStudents(normalized: Student[], legacy: Student[]): Student[] {
	const merged = new Map<string, Student>()

	for (const student of normalized) {
		merged.set(student.login.trim().toLowerCase(), student)
	}

	for (const student of legacy) {
		const loginKey = student.login.trim().toLowerCase()

		if (!merged.has(loginKey)) {
			merged.set(loginKey, student)
		}
	}

	return Array.from(merged.values()).sort(
		(left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
	)
}

export async function loadAllStudents(
	supabase: ReturnType<typeof createAdminClient>,
): Promise<LoadAllStudentsResult> {
	let normalizedStudents: Student[] = []

	const { data, error } = await supabase
		.from('students')
		.select('id, user_id, login, login_type, full_name, created_at')
		.order('created_at', { ascending: false })

	if (!error) {
		normalizedStudents = ((data ?? []) as StudentRow[]).map(mapStudentRow)
	} else if (!isMissingStudentsTable(error)) {
		return { error: error.message }
	}

	const { data: legacyRows, error: legacyError } = await supabase
		.from('group_students')
		.select('id, user_id, login, login_type, created_at')
		.order('created_at', { ascending: false })

	if (legacyError) {
		if (isMissingLoginColumn(legacyError)) {
			return { data: normalizedStudents }
		}

		return { error: legacyError.message }
	}

	return {
		data: mergeStudents(normalizedStudents, mapLegacyStudents((legacyRows ?? []) as LegacyMembershipRow[])),
	}
}
