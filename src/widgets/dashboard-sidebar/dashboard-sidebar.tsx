import type { SidebarMenuItem } from '@/entities/navigation/model/types'
import { SidebarNavButton } from '@/shared/ui/sidebar-nav-button'

import styles from './dashboard-sidebar.module.scss'

interface DashboardSidebarProps {
	title: string
	items: SidebarMenuItem[]
}

export default function DashboardSidebar({ title, items }: DashboardSidebarProps) {
	return (
		<aside className={styles.sidebar}>
			<p className={styles.menuTitle}>{title}</p>
			<nav className={styles.nav}>
				{items.map(item => (
					<SidebarNavButton key={item.id} href={item.href} label={item.label} />
				))}
			</nav>
		</aside>
	)
}
