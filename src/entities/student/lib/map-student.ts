import type { StudentInGroup, StudentLoginType } from '../model/types'

export interface GroupStudentRpcRow {
	membership_id: string
	group_id: string
	student_id: string
	user_id: string | null
	login: string
	login_type: StudentLoginType
	full_name: string
	student_created_at: string
}

export function mapStudentsInGroupFromRpc(rows: GroupStudentRpcRow[]): StudentInGroup[] {
	return rows.map(row => ({
		id: row.student_id,
		userId: row.user_id,
		login: row.login,
		loginType: row.login_type,
		fullName: row.full_name,
		createdAt: row.student_created_at,
		membershipId: row.membership_id,
		groupId: row.group_id,
	}))
}
