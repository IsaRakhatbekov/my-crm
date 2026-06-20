import type { UserRole } from '@/entities/user'

import { assistantMenuItems } from './assistantMenu.mock'
import { managerMenuItems } from './managerMenu.mock'
import { studentMenuItems } from './studentMenu.mock'
import { teacherMenuItems } from './teacherMenu.mock'
import type { SidebarMenuItem } from './types'

const menusByRole: Record<UserRole, SidebarMenuItem[]> = {
	student: studentMenuItems,
	teacher: teacherMenuItems,
	assistant: assistantMenuItems,
	manager: managerMenuItems,
}

export function getMenuByRole(role: UserRole): SidebarMenuItem[] {
	return menusByRole[role]
}
