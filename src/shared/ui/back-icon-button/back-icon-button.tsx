import Link from 'next/link'
import type { ButtonHTMLAttributes } from 'react'

import styles from './back-icon-button.module.scss'

interface BackIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
	href?: string
	ariaLabel?: string
}

function ArrowIcon() {
	return (
		<svg
			className={styles.icon}
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			aria-hidden='true'
		>
			<path
				d='M6 12H18M6 12L11 7M6 12L11 17'
				stroke='currentColor'
				strokeWidth='1.75'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}

export default function BackIconButton({
	href,
	ariaLabel = 'Назад',
	className,
	...props
}: BackIconButtonProps) {
	const classes = [styles.button, className].filter(Boolean).join(' ')

	if (href) {
		return (
			<Link className={classes} href={href} aria-label={ariaLabel}>
				<ArrowIcon />
			</Link>
		)
	}

	return (
		<button className={classes} type='button' aria-label={ariaLabel} {...props}>
			<ArrowIcon />
		</button>
	)
}
