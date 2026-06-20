export const USER_ROLES = ['student', 'teacher', 'assistant', 'manager'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
	student: 'Ученик',
	teacher: 'Учитель',
	assistant: 'Помощник',
	manager: 'Менеджер',
}

export const ROLE_HOME_TITLES: Record<UserRole, string> = {
	student: 'Главная ученика',
	teacher: 'Главная учителя',
	assistant: 'Главная помощника',
	manager: 'Панель менеджера',
}

export function isUserRole(value: string | undefined): value is UserRole {
	return USER_ROLES.includes(value as UserRole)
}
