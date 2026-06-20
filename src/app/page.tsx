import { RolePicker } from '@/features/logIn'

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
							Выберите роль, чтобы открыть нужный интерфейс.
						</p>

						<RolePicker />
					</section>

					<div className={styles.rightSide}>
						<img
							className={styles.image}
							src='/home-bg.JPG'
							alt='Фоновое изображение CRM'
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
