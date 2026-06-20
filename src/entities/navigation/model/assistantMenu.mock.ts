import type { SidebarMenuItem } from './types'

export const assistantMenuItems: SidebarMenuItem[] = [
	{ id: 'home', href: '/dashboard', label: 'Главная' },
	{ id: 'homework', href: '/dashboard/homework', label: 'Проверка ДЗ' },
	{ id: 'journal', href: '/dashboard/journal', label: 'Календарь' },
	{ id: 'profile', href: '/dashboard/profile', label: 'Профиль' },
]
