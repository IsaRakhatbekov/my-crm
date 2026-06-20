import { cookies } from 'next/headers'

import { isUserRole, type UserRole } from '@/entities/user'

import { DEMO_ROLE_COOKIE } from './constants'

export async function getDemoRole(): Promise<UserRole> {
	const cookieStore = await cookies()
	const value = cookieStore.get(DEMO_ROLE_COOKIE)?.value

	return isUserRole(value) ? value : 'student'
}
