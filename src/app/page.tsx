import { LogIn } from '@/features/logIn'

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

						<LogIn />
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
