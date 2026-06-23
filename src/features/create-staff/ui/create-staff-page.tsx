'use client'

import { FormEvent, useMemo, useState } from 'react'

import {
	STAFF_ROLE_LABELS,
	STAFF_ROLES,
	type StaffListItem,
	type StaffRole,
} from '@/entities/staff'
import { LOGIN_TYPE_LABELS } from '@/entities/student'
import { detectLoginType } from '@/shared/lib/detect-login-type'
import { saveStaffMember } from '@/features/create-staff/api/actions'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import styles from './create-staff.module.scss'
import StaffTable from './staff-table'

interface AddStaffFormProps {
	onSaved: (member: StaffListItem) => void
	onCancel: () => void
}

const roleSelectId = 'staff-role'
const nameInputId = 'staff-name'
const loginInputId = 'staff-login'
const passwordInputId = 'staff-password'

function AddStaffForm({ onSaved, onCancel }: AddStaffFormProps) {
	const [role, setRole] = useState<StaffRole>('teacher')
	const [fullName, setFullName] = useState('')
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const detectedLoginType = useMemo(() => {
		if (!login.trim()) {
			return null
		}

		return detectLoginType(login)
	}, [login])

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setMessage(null)
		setIsError(false)
		setIsSaving(true)

		const result = await saveStaffMember({ role, fullName, login, password })

		setIsSaving(false)

		if (result.error) {
			setIsError(true)
			setMessage(result.error)
			return
		}

		if (result.data) {
			onSaved({ ...result.data, groupsCount: 0 })
		}
	}

	return (
		<div className={styles.panel}>
			<div>
				<p className={styles.panelTitle}>Новый сотрудник</p>
				<p className={styles.panelHint}>
					Укажите имя, роль, логин (телефон, Gmail или имя) и пароль.
				</p>
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.field}>
					<Label htmlFor={nameInputId}>Имя</Label>
					<Input
						id={nameInputId}
						name='staffName'
						value={fullName}
						placeholder='Например, Анна Петрова'
						onChange={event => setFullName(event.target.value)}
						autoComplete='name'
					/>
				</div>

				<div className={styles.field}>
					<Label htmlFor={roleSelectId}>Роль</Label>
					<select
						className={styles.select}
						id={roleSelectId}
						value={role}
						onChange={event => setRole(event.target.value as StaffRole)}
					>
						{STAFF_ROLES.map(staffRole => (
							<option key={staffRole} value={staffRole}>
								{STAFF_ROLE_LABELS[staffRole]}
							</option>
						))}
					</select>
				</div>

				<div className={styles.field}>
					<Label htmlFor={loginInputId}>Логин</Label>
					<Input
						id={loginInputId}
						name='staffLogin'
						value={login}
						placeholder='+7 900 000-00-00, email@gmail.com или Иван'
						onChange={event => setLogin(event.target.value)}
						autoComplete='off'
					/>
					{detectedLoginType ? (
						<p className={styles.detectedType}>
							Определено как: {LOGIN_TYPE_LABELS[detectedLoginType]}
						</p>
					) : null}
				</div>

				<div className={styles.field}>
					<Label htmlFor={passwordInputId}>Пароль</Label>
					<Input
						id={passwordInputId}
						name='staffPassword'
						type='password'
						value={password}
						placeholder='Пароль'
						onChange={event => setPassword(event.target.value)}
						autoComplete='new-password'
					/>
				</div>

				<div className={styles.formActions}>
					<Button type='button' variant='secondary' onClick={onCancel}>
						Отмена
					</Button>
					<Button type='submit' disabled={isSaving}>
						{isSaving ? 'Сохранение...' : 'Сохранить'}
					</Button>
				</div>

				{message ? (
					<p className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}</p>
				) : null}
			</form>
		</div>
	)
}

interface CreateStaffPageProps {
	initialMembers: StaffListItem[]
}

export default function CreateStaffPage({ initialMembers }: CreateStaffPageProps) {
	const [members, setMembers] = useState(initialMembers)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const handleSaved = (member: StaffListItem) => {
		setMembers(current => [member, ...current])
		setIsFormOpen(false)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.actions}>
				<Button
					type='button'
					variant={isFormOpen ? 'secondary' : 'primary'}
					onClick={() => setIsFormOpen(current => !current)}
				>
					{isFormOpen ? 'Скрыть форму' : 'Создать сотрудника'}
				</Button>
			</div>

			{isFormOpen ? (
				<AddStaffForm onSaved={handleSaved} onCancel={() => setIsFormOpen(false)} />
			) : null}

			<StaffTable members={members} />
		</div>
	)
}
