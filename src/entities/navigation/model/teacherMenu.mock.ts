import type { SidebarMenuItem } from './types'

export const teacherMenuItems: SidebarMenuItem[] = [
	{ id: 'home', href: '/dashboard', label: 'Главная' },
	{ id: 'groups', href: '/dashboard/groups', label: 'Группы' },
	{ id: 'homework', href: '/dashboard/homework', label: 'Домашние задания' },
	{ id: 'journal', href: '/dashboard/journal', label: 'Календарь' },
	{ id: 'attendance', href: '/dashboard/attendance', label: 'Посещаемость' },
	{ id: 'profile', href: '/dashboard/profile', label: 'Профиль' },
]
