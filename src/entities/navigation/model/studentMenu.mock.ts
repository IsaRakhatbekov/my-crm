import type { SidebarMenuItem } from './types'

export const studentMenuItems: SidebarMenuItem[] = [
	{ id: 'home', href: '/dashboard', label: 'Главная' },
	{ id: 'homework', href: '/dashboard/homework', label: 'Домашнее задание' },
	{ id: 'journal', href: '/dashboard/journal', label: 'Календарь' },
	{ id: 'attendance', href: '/dashboard/attendance', label: 'Посещаемость' },
	{ id: 'profile', href: '/dashboard/profile', label: 'Профиль' },
]
