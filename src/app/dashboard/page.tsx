import { ROLE_HOME_TITLES } from '@/entities/user'
import { getDemoRole } from '@/shared/lib/demo-role/server'

import styles from './pages.module.scss'

export default async function DashboardHomePage() {
	const role = await getDemoRole()

	if (role === 'manager') {
		return <section className={styles.page} />
	}

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{ROLE_HOME_TITLES[role]}</h1>
			<p className={styles.text}>
				Это общий каркас интерфейса. При переходе по меню будет меняться только содержимое этой
				области.
			</p>
		</section>
	)
}
