import type { UserRole } from '@/entities/user'

export type StaffRole = Extract<UserRole, 'teacher' | 'assistant'>

export const STAFF_ROLES: StaffRole[] = ['teacher', 'assistant']

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
	teacher: 'Учитель',
	assistant: 'Помощник',
}

export type StaffLoginType = 'phone' | 'email' | 'name'

export interface StaffMember {
	id: string
	userId: string | null
	role: StaffRole
	fullName: string
	login: string
	loginType: StaffLoginType
	createdAt: string
}

export interface StaffListItem extends StaffMember {
	groupsCount: number
}
