'use client'

import { useState } from 'react'

import type { GroupListItem } from '@/entities/group'
import type { Student } from '@/entities/student'
import CreateStudentForm from '@/features/create-student/ui/create-student-form'
import { Button } from '@/shared/ui/button'
import { StudentsTable } from '@/widgets/students-table'

import styles from './create-student-page.module.scss'

interface CreateStudentPageProps {
	initialStudents: Student[]
	groups: GroupListItem[]
	requireGroup: boolean
}

export default function CreateStudentPage({
	initialStudents,
	groups,
	requireGroup,
}: CreateStudentPageProps) {
	const [students, setStudents] = useState(initialStudents)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const handleSaved = (student: Student) => {
		setStudents(current => {
			const loginKey = student.login.trim().toLowerCase()

			if (current.some(item => item.login.trim().toLowerCase() === loginKey)) {
				return current
			}

			return [student, ...current]
		})
		setIsFormOpen(false)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.actions}>
				<Button
					type='button'
					variant={isFormOpen ? 'secondary' : 'primary'}
					onClick={() => setIsFormOpen(current => !current)}
				>
					{isFormOpen ? 'Скрыть форму' : 'Создать студента'}
				</Button>
			</div>

			{isFormOpen ? (
				<CreateStudentForm
					mode='persist'
					groups={groups}
					requireGroup={requireGroup}
					onCancel={() => setIsFormOpen(false)}
					onPersisted={handleSaved}
				/>
			) : null}

			<StudentsTable students={students} emptyMessage='Студентов пока нет.' />
		</div>
	)
}
