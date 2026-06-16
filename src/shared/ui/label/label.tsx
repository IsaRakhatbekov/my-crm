import { ReactNode } from 'react'

import styles from './label.module.scss'

interface LabelProps {
	children: ReactNode
	htmlFor?: string
}

export default function Label({ children, htmlFor }: LabelProps) {
	return (
		<label className={styles.label} htmlFor={htmlFor}>
			{children}
		</label>
	)
}
