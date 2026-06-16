import type { InputHTMLAttributes } from 'react'

import styles from './input.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ type = 'text', ...props }: InputProps) {
	return <input className={styles.input} type={type} {...props} />
}
