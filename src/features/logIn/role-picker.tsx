'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ROLE_LABELS, USER_ROLES, type UserRole } from '@/entities/user'
import { getDemoRoleFromCookie, setDemoRoleCookie } from '@/shared/lib/demo-role/client'

import styles from './role-picker.module.scss'

export default function RolePicker() {
	const router = useRouter()
	const [selectedRole, setSelectedRole] = useState<UserRole>(() => getDemoRoleFromCookie())

	const handleSelect = (role: UserRole) => {
		setSelectedRole(role)
		setDemoRoleCookie(role)
		router.push('/dashboard')
		router.refresh()
	}

	return (
		<div className={styles.wrapper}>
			<p className={styles.label}>Выберите роль</p>

			<div className={styles.buttons}>
				{USER_ROLES.map(role => (
					<button
						key={role}
						type='button'
						className={`${styles.button} ${selectedRole === role ? styles.buttonActive : ''}`}
						onClick={() => handleSelect(role)}
						aria-pressed={selectedRole === role}
					>
						{ROLE_LABELS[role]}
					</button>
				))}
			</div>

			<p className={styles.hint}>Нажмите на роль, чтобы открыть соответствующий интерфейс.</p>
		</div>
	)
}
