'use server'

import { randomUUID } from 'crypto'

import type { StaffListItem, StaffMember, StaffLoginType, StaffRole } from '@/entities/staff'
import { detectLoginType } from '@/entities/student'
import { isUserRole } from '@/entities/user'
import { DEMO_ROLE_COOKIE } from '@/shared/lib/demo-role/constants'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { cookies } from 'next/headers'

type ActionResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

interface SaveStaffInput {
	role: StaffRole
	fullName: string
	login: string
	password: string
}

interface StaffSummaryRow {
	id: string
	user_id: string | null
	role: StaffRole
	full_name: string
	login: string
	login_type: StaffLoginType
	created_at: string
	groups_count: number
}

async function assertManagerAccess(): Promise<ActionResult<null>> {
	const cookieStore = await cookies()
	const role = cookieStore.get(DEMO_ROLE_COOKIE)?.value

	if (!isUserRole(role) || role !== 'manager') {
		return { error: 'Доступ только для менеджера' }
	}

	return { data: null }
}

function mapStaff(row: StaffSummaryRow): StaffMember {
	return {
		id: row.id,
		userId: row.user_id,
		role: row.role,
		fullName: row.full_name,
		login: row.login,
		loginType: row.login_type,
		createdAt: row.created_at,
	}
}

function mapStaffListItem(row: StaffSummaryRow): StaffListItem {
	return {
		...mapStaff(row),
		groupsCount: Number(row.groups_count ?? 0),
	}
}

async function createStaffAuthUser(
	login: string,
	loginType: StaffLoginType,
	password: string,
	role: StaffRole,
	fullName: string,
) {
	const admin = createAdminClient()
	const displayName = fullName.trim() || login

	if (loginType === 'email') {
		return admin.auth.admin.createUser({
			email: login,
			password,
			email_confirm: true,
			user_metadata: {
				role,
				login_type: 'email',
				login,
				display_name: displayName,
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
				role,
				login_type: 'phone',
				login,
				display_name: displayName,
			},
		})
	}

	const email = `${randomUUID()}@staff.local`

	return admin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: {
			role,
			login_type: 'name',
			login,
			display_name: displayName,
		},
	})
}

export async function saveStaffMember({
	role,
	fullName,
	login,
	password,
}: SaveStaffInput): Promise<ActionResult<StaffMember>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const trimmedFullName = fullName.trim()
	const trimmedLogin = login.trim()

	if (!trimmedFullName) {
		return { error: 'Укажите имя сотрудника' }
	}

	if (!trimmedLogin) {
		return { error: 'Укажите логин сотрудника' }
	}

	const loginType = detectLoginType(trimmedLogin)
	const supabase = createAdminClient()

	const { data: existingStaff } = await supabase
		.from('staff_members')
		.select('id')
		.eq('login', trimmedLogin)
		.maybeSingle()

	if (existingStaff) {
		return { error: 'Сотрудник с таким логином уже существует' }
	}

	const { data: authData, error: authError } = await createStaffAuthUser(
		trimmedLogin,
		loginType,
		password,
		role,
		trimmedFullName,
	)

	if (authError || !authData.user) {
		return { error: authError?.message ?? 'Не удалось создать аккаунт сотрудника' }
	}

	const { data: staffRow, error: staffError } = await supabase
		.from('staff_members')
		.insert({
			user_id: authData.user.id,
			role,
			full_name: trimmedFullName,
			login: trimmedLogin,
			login_type: loginType,
		})
		.select('id, user_id, role, full_name, login, login_type, created_at')
		.single()

	if (staffError || !staffRow) {
		await createAdminClient().auth.admin.deleteUser(authData.user.id)
		return { error: staffError?.message ?? 'Не удалось сохранить сотрудника' }
	}

	return { data: mapStaff(staffRow as StaffSummaryRow) }
}

export async function getStaffMembers(): Promise<ActionResult<StaffListItem[]>> {
	const access = await assertManagerAccess()

	if (access.error) {
		return { error: access.error }
	}

	const supabase = createAdminClient()

	const { data, error } = await supabase.rpc('get_staff_summaries')

	if (error) {
		return { error: error.message }
	}

	return { data: ((data ?? []) as StaffSummaryRow[]).map(mapStaffListItem) }
}
