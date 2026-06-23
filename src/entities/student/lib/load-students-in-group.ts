import { createAdminClient } from '@/shared/lib/supabase/admin'

import { mapStudentsInGroupFromRpc, type GroupStudentRpcRow } from './map-student'
import type { StudentInGroup, StudentLoginType } from '../model/types'

import { isMissingStudentIdColumn } from './schema-errors'

export async function loadStudentsInGroup(
	supabase: ReturnType<typeof createAdminClient>,
	groupId: string,
): Promise<{ data: StudentInGroup[]; error?: undefined } | { data?: undefined; error: string }> {
	const { data: membershipRows, error: membershipError } = await supabase
		.from('group_students')
		.select('id, group_id, student_id, created_at')
		.eq('group_id', groupId)
		.order('created_at', { ascending: true })

	if (!membershipError) {
		const memberships = membershipRows ?? []
		const studentIds = memberships.map(row => row.student_id)
		const studentsById: Record<
			string,
			{
				id: string
				user_id: string | null
				login: string
				login_type: StudentLoginType
				full_name: string
				created_at: string
			}
		> = {}

		if (studentIds.length > 0) {
			const { data: studentRows, error: studentProfilesError } = await supabase
				.from('students')
				.select('id, user_id, login, login_type, full_name, created_at')
				.in('id', studentIds)

			if (studentProfilesError) {
				return { error: studentProfilesError.message }
			}

			for (const row of studentRows ?? []) {
				studentsById[row.id] = {
					...row,
					login_type: row.login_type as StudentLoginType,
				}
			}
		}

		return {
			data: mapStudentsInGroupFromRpc(
				memberships
					.map(membership => {
						const student = studentsById[membership.student_id]

						if (!student) {
							return null
						}

						return {
							membership_id: membership.id,
							group_id: membership.group_id,
							student_id: student.id,
							user_id: student.user_id,
							login: student.login,
							login_type: student.login_type,
							full_name: student.full_name,
							student_created_at: student.created_at,
						} satisfies GroupStudentRpcRow
					})
					.filter((row): row is GroupStudentRpcRow => row !== null),
			),
		}
	}

	if (!isMissingStudentIdColumn(membershipError)) {
		return { error: membershipError.message }
	}

	const { data: legacyRows, error: legacyError } = await supabase
		.from('group_students')
		.select('id, group_id, user_id, login, login_type, created_at')
		.eq('group_id', groupId)
		.order('created_at', { ascending: true })

	if (legacyError) {
		return { error: legacyError.message }
	}

	return {
		data: mapStudentsInGroupFromRpc(
			(legacyRows ?? []).map(row => ({
				membership_id: row.id,
				group_id: row.group_id,
				student_id: row.id,
				user_id: row.user_id,
				login: row.login,
				login_type: row.login_type as StudentLoginType,
				full_name: row.login,
				student_created_at: row.created_at,
			})),
		),
	}
}
