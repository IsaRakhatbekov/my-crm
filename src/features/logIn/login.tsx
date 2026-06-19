'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { createClient } from '@/shared/lib/supabase/client'

import styles from './login.module.scss'

export default function Login() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)
		setIsLoading(true)

		const supabase = createClient()
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		setIsLoading(false)

		if (signInError) {
			setError('Неверный email или пароль')
			return
		}

		router.push('/dashboard')
		router.refresh()
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={styles.formControl}>
				<Label htmlFor='email'>Email</Label>
				<Input
					id='email'
					name='email'
					type='email'
					placeholder='you@company.com'
					value={email}
					onChange={event => setEmail(event.target.value)}
					required
					autoComplete='email'
				/>
			</div>
			<div className={styles.formControl}>
				<Label htmlFor='password'>Пароль</Label>
				<Input
					id='password'
					name='password'
					type='password'
					placeholder='Введите пароль'
					value={password}
					onChange={event => setPassword(event.target.value)}
					required
					autoComplete='current-password'
				/>
			</div>
			{error ? <p className={styles.error}>{error}</p> : null}
			<button className={styles.submit} type='submit' disabled={isLoading}>
				{isLoading ? 'Входим...' : 'Войти'}
			</button>
		</form>
	)
}
