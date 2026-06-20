import { isUserRole, type UserRole } from '@/entities/user'

import { DEMO_ROLE_COOKIE, DEMO_ROLE_MAX_AGE } from './constants'

export function getDemoRoleFromCookie(): UserRole {
	if (typeof document === 'undefined') {
		return 'student'
	}

	const match = document.cookie
		.split('; ')
		.find(row => row.startsWith(`${DEMO_ROLE_COOKIE}=`))

	const value = match?.split('=')[1]

	return isUserRole(value) ? value : 'student'
}

export function setDemoRoleCookie(role: UserRole) {
	document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=${DEMO_ROLE_MAX_AGE}; SameSite=Lax`
}
