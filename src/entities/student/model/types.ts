export type StudentLoginType = 'phone' | 'email' | 'name'

export interface Student {
	id: string
	userId: string | null
	login: string
	loginType: StudentLoginType
	fullName: string
	createdAt: string
}

export interface StudentInGroup extends Student {
	membershipId: string
	groupId: string
}

export interface DraftStudent {
	id: string
	login: string
	loginType: StudentLoginType
	password: string
}

export interface StudentDetails {
	student: StudentInGroup
	groupId: string
	groupCourseName: string
}
