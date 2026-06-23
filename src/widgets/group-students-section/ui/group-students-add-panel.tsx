'use client'

import { useState } from 'react'

import type { Student, StudentInGroup } from '@/entities/student'
import { CreateStudentForm } from '@/features/create-student'
import { Button } from '@/shared/ui/button'

import { useGroupStudents } from '../model/group-students-context'

import styles from './group-students-add-panel.module.scss'

function isStudentInGroup(student: Student): student is StudentInGroup {
	return 'membershipId' in student && 'groupId' in student
}

export default function GroupStudentsAddPanel() {
	const { groupId, addStudent } = useGroupStudents()
	const [isFormOpen, setIsFormOpen] = useState(false)

	const handlePersisted = (student: Student) => {
		if (!isStudentInGroup(student)) {
			return
		}

		addStudent(student)
		setIsFormOpen(false)
	}

	return (
		<div className={styles.wrapper}>
			<Button
				type='button'
				variant={isFormOpen ? 'secondary' : 'primary'}
				onClick={() => setIsFormOpen(current => !current)}
			>
				{isFormOpen ? 'Скрыть форму' : 'Добавить студента'}
			</Button>

			{isFormOpen ? (
				<CreateStudentForm
					mode='persist'
					groupId={groupId}
					submitLabel='Добавить в группу'
					hint='Студент сразу сохранится в базе и появится в этой группе.'
					onCancel={() => setIsFormOpen(false)}
					onPersisted={handlePersisted}
				/>
			) : null}
		</div>
	)
}
