'use client'

import { useCallback } from 'react'

import { deleteStudent } from '@/features/delete-student/api/actions'
import type { StudentInGroup } from '@/entities/student'
import { DeleteButton } from '@/shared/ui/delete-button'

interface DeleteStudentButtonProps {
	groupId: string
	studentId: string
	studentLogin: string
	onDeleted: (studentId: string) => StudentInGroup | null
	onDeleteFailed: (student: StudentInGroup) => void
}

export default function DeleteStudentButton({
	groupId,
	studentId,
	studentLogin,
	onDeleted,
	onDeleteFailed,
}: DeleteStudentButtonProps) {
	const handleClick = useCallback(async () => {
		const confirmed = window.confirm(
			`Удалить студента «${studentLogin}»? Аккаунт и все данные будут удалены безвозвратно.`,
		)

		if (!confirmed) {
			return
		}

		const removedStudent = onDeleted(studentId)

		if (!removedStudent) {
			return
		}

		const result = await deleteStudent(groupId, studentId)

		if (result.error) {
			onDeleteFailed(removedStudent)
			window.alert(result.error)
		}
	}, [groupId, onDeleteFailed, onDeleted, studentId, studentLogin])

	return (
		<DeleteButton
			aria-label={`Удалить студента ${studentLogin}`}
			onClick={handleClick}
		>
			Удалить
		</DeleteButton>
	)
}
