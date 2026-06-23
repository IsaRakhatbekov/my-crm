'use client'

import { FormEvent, useMemo, useState } from 'react'

import type { GroupListItem } from '@/entities/group'
import { LOGIN_TYPE_LABELS, type DraftStudent, type Student, type StudentInGroup } from '@/entities/student'
import { createStudent } from '@/features/create-student/api/actions'
import { detectLoginType } from '@/shared/lib/detect-login-type'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import styles from './create-student-form.module.scss'

const loginInputId = 'student-login'
const passwordInputId = 'student-password'
const groupSelectId = 'student-group'

interface CreateStudentFormBaseProps {
	onCancel: () => void
	submitLabel?: string
	title?: string
	hint?: string
}

interface CreateStudentDraftFormProps extends CreateStudentFormBaseProps {
	mode: 'draft'
	onDraftAdd: (student: DraftStudent) => void
}

interface CreateStudentPersistFormProps extends CreateStudentFormBaseProps {
	mode: 'persist'
	groupId?: string
	groups?: GroupListItem[]
	requireGroup?: boolean
	onPersisted: (student: Student | StudentInGroup) => void
}

type CreateStudentFormProps = CreateStudentDraftFormProps | CreateStudentPersistFormProps

export default function CreateStudentForm(props: CreateStudentFormProps) {
	const {
		onCancel,
		submitLabel,
		title = 'Новый студент',
		hint = 'Можно указать телефон, Gmail или имя — система определит тип автоматически.',
	} = props

	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [selectedGroupId, setSelectedGroupId] = useState(props.mode === 'persist' ? (props.groupId ?? '') : '')
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

		const trimmedLogin = login.trim()

		if (!trimmedLogin) {
			setIsError(true)
			setMessage('Укажите телефон, email или имя студента')
			return
		}

		if (!password) {
			setIsError(true)
			setMessage('Укажите пароль студента')
			return
		}

		if (props.mode === 'draft') {
			props.onDraftAdd({
				id: crypto.randomUUID(),
				login: trimmedLogin,
				loginType: detectLoginType(trimmedLogin),
				password,
			})
			setLogin('')
			setPassword('')
			return
		}

		setIsSaving(true)

		const resolvedGroupId = props.groupId ?? (selectedGroupId.trim() || undefined)

		if (props.requireGroup && !resolvedGroupId) {
			setIsSaving(false)
			setIsError(true)
			setMessage('Выберите группу для студента')
			return
		}

		const result = await createStudent({
			login: trimmedLogin,
			password,
			groupId: resolvedGroupId,
		})

		setIsSaving(false)

		if (result.error || !result.data) {
			setIsError(true)
			setMessage(result.error ?? 'Не удалось создать студента')
			return
		}

		props.onPersisted(result.data)
		setLogin('')
		setPassword('')
	}

	const defaultSubmitLabel = props.mode === 'draft' ? 'Добавить в список' : 'Создать студента'

	const showGroupSelect = props.mode === 'persist' && !props.groupId && (props.groups?.length ?? 0) > 0

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<p className={styles.title}>{title}</p>
				<p className={styles.hint}>{hint}</p>
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.field}>
					<Label htmlFor={loginInputId}>Логин студента</Label>
					<Input
						id={loginInputId}
						name='studentLogin'
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
						name='studentPassword'
						type='password'
						value={password}
						placeholder='Пароль'
						onChange={event => setPassword(event.target.value)}
						autoComplete='new-password'
					/>
				</div>

				{showGroupSelect ? (
					<div className={styles.field}>
						<Label htmlFor={groupSelectId}>
							Группа{props.requireGroup ? '' : ' (необязательно)'}
						</Label>
						<select
							className={styles.select}
							id={groupSelectId}
							value={selectedGroupId}
							onChange={event => setSelectedGroupId(event.target.value)}
						>
							<option value=''>
								{props.requireGroup ? 'Выберите группу' : 'Без группы'}
							</option>
							{props.groups?.map(group => (
								<option key={group.id} value={group.id}>
									{group.courseName}
								</option>
							))}
						</select>
					</div>
				) : null}

				<div className={styles.actions}>
					<Button type='button' variant='secondary' onClick={onCancel}>
						Отмена
					</Button>
					<Button type='submit' disabled={isSaving}>
						{isSaving ? 'Сохранение...' : (submitLabel ?? defaultSubmitLabel)}
					</Button>
				</div>

				{message ? (
					<p className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}</p>
				) : null}
			</form>
		</div>
	)
}
