import type { StudentLoginType } from '../model/types'

export function detectLoginType(value: string): StudentLoginType {
	const trimmed = value.trim()

	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
		return 'email'
	}

	const digitsOnly = trimmed.replace(/\D/g, '')

	if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
		return 'phone'
	}

	return 'name'
}
