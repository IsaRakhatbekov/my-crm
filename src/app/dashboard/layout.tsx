import Link from 'next/link'

import { getMenuByRole } from '@/entities/navigation/model/getMenuByRole'
import { ROLE_LABELS } from '@/entities/user'
import { getDemoRole } from '@/shared/lib/demo-role/server'
import { DashboardSidebar } from '@/widgets/dashboard-sidebar'

import styles from './shell.module.scss'

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const role = await getDemoRole()
	const menuItems = getMenuByRole(role)

	return (
		<div className={styles.shell}>
			<header className={styles.header}>
				<div className='container'>
					<div className={styles.headerInner}>
						<Link className={styles.logo} href='/'>
							CRM
						</Link>
						<p className={styles.role}>Роль: {ROLE_LABELS[role]}</p>
					</div>
				</div>
			</header>

			<div className='container'>
				<div className={styles.body}>
					<DashboardSidebar items={menuItems} title='Меню' />

					<main className={styles.main}>{children}</main>
				</div>
			</div>
		</div>
	)
}
