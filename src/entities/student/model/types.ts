export type StudentLoginType = 'phone' | 'email' | 'name'

export interface GroupStudent {
	id: string
	groupId: string
	loginType: StudentLoginType
	login: string
	password: string
	createdAt: string
}

export interface DraftGroupStudent {
	id: string
	loginType: StudentLoginType
	login: string
	password: string
}

export const STUDENT_LOGIN_TYPE_LABELS: Record<StudentLoginType, string> = {
	phone: 'Телефон',
	email: 'Gmail',
	name: 'Имя',
}
