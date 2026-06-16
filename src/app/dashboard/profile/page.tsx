import styles from '../pages.module.scss'

export default function ProfilePage() {
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Профиль</h1>
			<p className={styles.text}>
				Здесь будут данные пользователя. Позже добавим отображение по роли автоматически.
			</p>
		</section>
	)
}
