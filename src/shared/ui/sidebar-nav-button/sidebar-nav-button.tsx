import Link from 'next/link'

import styles from './sidebar-nav-button.module.scss'

interface SidebarNavButtonProps {
	href: string
	label: string
}

export default function SidebarNavButton({ href, label }: SidebarNavButtonProps) {
	return (
		<Link className={styles.button} href={href}>
			{label}
		</Link>
	)
}
