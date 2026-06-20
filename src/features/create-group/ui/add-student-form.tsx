'use client'

import { FormEvent, useMemo, useState } from 'react'

import { detectLoginType, STUDENT_LOGIN_TYPE_LABELS, type DraftGroupStudent } from '@/entities/student'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import styles from './create-group-form.module.scss'

interface AddStudentFormProps {
	onAdded: (student: DraftGroupStudent) => void
	onCancel: () => void
}

const loginInputId = 'student-login'
const passwordInputId = 'student-password'

export default function AddStudentForm({ onAdded, onCancel }: AddStudentFormProps) {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)

	const detectedLoginType = useMemo(() => {
		if (!login.trim()) {
			return null
		}

		return detectLoginType(login)
	}, [login])

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setMessage(null)
		setIsError(false)

		const trimmedLogin = login.trim()

		if (!trimmedLogin) {
			setIsError(true)
			setMessage('Укажите телефон, email или имя студента')
			return
		}

		onAdded({
			id: crypto.randomUUID(),
			login: trimmedLogin,
			loginType: detectLoginType(trimmedLogin),
			password,
		})

		setLogin('')
		setPassword('')
	}

	return (
		<div className={styles.studentPanel}>
			<div className={styles.studentPanelHeader}>
				<p className={styles.studentPanelTitle}>Новый студент</p>
				<p className={styles.studentPanelHint}>
					Можно указать телефон, Gmail или имя — система определит тип автоматически.
				</p>
			</div>

			<form className={styles.studentForm} onSubmit={handleSubmit}>
				<div className={styles.studentField}>
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
							Определено как: {STUDENT_LOGIN_TYPE_LABELS[detectedLoginType]}
						</p>
					) : null}
				</div>

				<div className={styles.studentField}>
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

				<div className={styles.studentActions}>
					<Button type='button' variant='secondary' onClick={onCancel}>
						Отмена
					</Button>
					<Button type='submit'>Добавить в список</Button>
				</div>

				{message ? (
					<p className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}</p>
				) : null}
			</form>
		</div>
	)
}
