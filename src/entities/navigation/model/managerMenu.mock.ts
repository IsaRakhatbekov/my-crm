import type { SidebarMenuItem } from './types'

export const managerMenuItems: SidebarMenuItem[] = [
	{ id: 'groups', href: '/dashboard/groups', label: 'Группы' },
	{
		id: 'staff',
		href: '/dashboard/staff/create',
		label: 'Сотрудники',
	},
]
