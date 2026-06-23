import { randomUUID } from 'crypto'

import type { StudentLoginType } from '@/entities/student'
import { createAdminClient } from '@/shared/lib/supabase/admin'

export async function createStudentAuthUser(
	login: string,
	loginType: StudentLoginType,
	password: string,
) {
	const admin = createAdminClient()

	if (loginType === 'email') {
		return admin.auth.admin.createUser({
			email: login,
			password,
			email_confirm: true,
			user_metadata: {
				role: 'student',
				login_type: 'email',
				login,
			},
		})
	}

	if (loginType === 'phone') {
		const phone = login.startsWith('+') ? login : `+${login.replace(/\D/g, '')}`

		return admin.auth.admin.createUser({
			phone,
			password,
			phone_confirm: true,
			user_metadata: {
				role: 'student',
				login_type: 'phone',
				login,
			},
		})
	}

	const email = `${randomUUID()}@students.local`

	return admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: {
			role: 'student',
			login_type: 'name',
			login,
			display_name: login,
		},
	})
}
