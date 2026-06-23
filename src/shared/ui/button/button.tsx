import type { ButtonHTMLAttributes } from 'react'

import styles from './button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({
	variant = 'primary',
	className,
	type = 'button',
	...props
}: ButtonProps) {
	const variantClass =
		variant === 'primary'
			? styles.primary
			: variant === 'danger'
				? styles.danger
				: styles.secondary

	return (
		<button
			className={[styles.button, variantClass, className].filter(Boolean).join(' ')}
			type={type}
			{...props}
		/>
	)
}
