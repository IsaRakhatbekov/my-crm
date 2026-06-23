import type { SidebarMenuItem } from './types'

export const managerMenuItems: SidebarMenuItem[] = [
	{ id: 'groups', href: '/dashboard/groups', label: 'Группы' },
	{
		id: 'students',
		href: '/dashboard/students/create',
		label: 'Студенты',
	},
	{
		id: 'staff',
		href: '/dashboard/staff/create',
		label: 'Сотрудники',
	},
]
