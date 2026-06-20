import styles from '../pages.module.scss'

export default function ManagerUsersPage() {
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Пользователи</h1>
			<p className={styles.text}>
				Здесь менеджер будет создавать аккаунты учеников, учителей и помощников. Раздел в
				разработке.
			</p>
		</section>
	)
}
