import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import styles from './page.module.scss'

export default function HomePage() {
	return (
		<div className={styles.home}>
			<div className={`${styles.container} container`}>
				<div className={styles.wrapper}>
					<section className={styles.leftSide}>
						<p className={styles.kicker}>CRM Platform</p>
						<h1 className={styles.title}>С возвращением</h1>
						<p className={styles.subtitle}>
							Войдите в систему, чтобы продолжить работу с клиентами и задачами.
						</p>

						<form className={styles.form}>
							<div className={styles.formControl}>
								<Label htmlFor='email'>Email</Label>
								<Input id='email' name='email' type='email' placeholder='you@company.com' />
							</div>
							<div className={styles.formControl}>
								<Label htmlFor='password'>Пароль</Label>
								<Input id='password' name='password' type='password' placeholder='Введите пароль' />
							</div>
							<button className={styles.submit} type='submit'>
								Войти
							</button>
						</form>
					</section>

					<div className={styles.rightSide}>
						<img
							className={styles.image}
							src='/login-illustration.svg'
							alt='Иллюстрация панели управления CRM'
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
