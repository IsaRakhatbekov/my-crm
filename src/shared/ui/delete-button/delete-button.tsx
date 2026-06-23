import type { ButtonHTMLAttributes } from 'react'

import { Button } from '@/shared/ui/button'

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	label?: string
}

export default function DeleteButton({
	label = 'Удалить',
	className,
	type = 'button',
	children,
	...props
}: DeleteButtonProps) {
	return (
		<Button
			className={className}
			type={type}
			variant='danger'
			{...props}
		>
			{children ?? label}
		</Button>
	)
}
