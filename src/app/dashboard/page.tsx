import styles from './pages.module.scss'

export default function DashboardHomePage() {
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Главная ученика</h1>
			<p className={styles.text}>
				Это общий каркас интерфейса. При переходе по меню будет меняться только содержимое этой
				области.
			</p>
		</section>
	)
}
