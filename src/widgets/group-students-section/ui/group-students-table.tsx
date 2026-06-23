'use client'

import { useCallback } from 'react'

import { StudentsTable } from '@/widgets/students-table'

import { useGroupStudents } from '../model/group-students-context'

interface GroupStudentsTableProps {
	emptyMessage?: string
}

export default function GroupStudentsTable({
	emptyMessage = 'В этой группе пока нет студентов.',
}: GroupStudentsTableProps) {
	const { groupId, students, deleteStudentOptimistic, restoreStudent } = useGroupStudents()

	const handleStudentDeleted = useCallback(
		(studentId: string) => deleteStudentOptimistic(studentId),
		[deleteStudentOptimistic],
	)

	const handleStudentDeleteFailed = useCallback(
		(student: Parameters<typeof restoreStudent>[0]) => {
			restoreStudent(student)
		},
		[restoreStudent],
	)

	return (
		<StudentsTable
			students={students}
			groupId={groupId}
			emptyMessage={emptyMessage}
			onStudentDeleted={handleStudentDeleted}
			onStudentDeleteFailed={handleStudentDeleteFailed}
		/>
	)
}
