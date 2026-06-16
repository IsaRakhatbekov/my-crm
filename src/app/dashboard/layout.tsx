import { studentMenuItems } from '@/entities/navigation/model/studentMenu.mock'
import { DashboardSidebar } from '@/widgets/dashboard-sidebar'

import styles from './shell.module.scss'

const role = 'student'

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className={styles.shell}>
			<header className={styles.header}>
				<div className='container'>
					<div className={styles.headerInner}>
						<p className={styles.logo}>CRM</p>
						<p className={styles.role}>Роль: {role}</p>
					</div>
				</div>
			</header>

			<div className='container'>
				<div className={styles.body}>
					<DashboardSidebar items={studentMenuItems} title='Меню' />

					<main className={styles.main}>{children}</main>
				</div>
			</div>
		</div>
	)
}
