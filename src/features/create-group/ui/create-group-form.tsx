'use client'

import { useState } from 'react'

import type { GroupListItem } from '@/entities/group'
import type { StaffMember } from '@/entities/staff'
import type { DraftGroupStudent } from '@/entities/student'
import { saveGroupWithStudents } from '@/features/create-group/api/actions'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import AddMemberActions, { type MemberPanel } from './add-member-actions'
import AddStudentForm from './add-student-form'
import AssignStaffPanel from './assign-staff-panel'
import GroupStudentsList from './group-students-list'
import SelectedStaffCard from './selected-staff-card'
import styles from './create-group-form.module.scss'

const inputId = 'course-name'

interface CreateGroupFormProps {
	staffMembers: StaffMember[]
	onSaved: (group: GroupListItem) => void
	onCancel: () => void
}

export default function CreateGroupForm({
	staffMembers,
	onSaved,
	onCancel,
}: CreateGroupFormProps) {
	const [courseName, setCourseName] = useState('')
	const [draftStudents, setDraftStudents] = useState<DraftGroupStudent[]>([])
	const [mentor, setMentor] = useState<StaffMember | null>(null)
	const [assistant, setAssistant] = useState<StaffMember | null>(null)
	const [activePanel, setActivePanel] = useState<MemberPanel | null>(null)
	const [message, setMessage] = useState<string | null>(null)
	const [isError, setIsError] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const handleAddStudent = (student: DraftGroupStudent) => {
		const duplicate = draftStudents.some(
			item => item.login.toLowerCase() === student.login.toLowerCase(),
		)

		if (duplicate) {
			setIsError(true)
			setMessage('Такой студент уже есть в списке')
			return
		}

		setDraftStudents(current => [...current, student])
		setActivePanel(null)
		setMessage(null)
		setIsError(false)
	}

	const handleMemberSelect = (panel: MemberPanel) => {
		if (!courseName.trim()) {
			setIsError(true)
			setMessage('Сначала укажите название группы')
			return
		}

		setMessage(null)
		setIsError(false)
		setActivePanel(current => (current === panel ? null : panel))
	}

	const handleSaveAll = async () => {
		setMessage(null)
		setIsError(false)
		setIsSaving(true)

		const result = await saveGroupWithStudents({
			courseName,
			students: draftStudents.map(({ login, password }) => ({ login, password })),
			mentor: mentor?.id ?? null,
			assistant: assistant?.id ?? null,
		})

		setIsSaving(false)

		if (result.error) {
			setIsError(true)
			setMessage(result.error)
			return
		}

		if (result.data) {
			onSaved({
				...result.data,
				studentsCount: draftStudents.length,
				mentorName: mentor?.fullName ?? null,
				assistantName: assistant?.fullName ?? null,
			})
			setCourseName('')
			setDraftStudents([])
			setMentor(null)
			setAssistant(null)
			setActivePanel(null)
			setMessage(null)
			setIsError(false)
		}
	}

	return (
		<div className={styles.panel}>
			<div className={styles.form}>
				<Label htmlFor={inputId}>Напишите название группы</Label>

				<div className={styles.fieldRow}>
					<div className={styles.inputWrap}>
						<Input
							id={inputId}
							name='courseName'
							value={courseName}
							placeholder='Например, Frontend-2026'
							onChange={event => setCourseName(event.target.value)}
							autoComplete='off'
						/>
					</div>
				</div>
			</div>

			<section className={styles.membersSection}>
				<div className={styles.membersSectionHeader}>
					<p className={styles.membersSectionTitle}>Состав группы</p>
					<p className={styles.membersSectionSubtitle}>
						Всё сохранится одной кнопкой «Сохранить» внизу
					</p>
				</div>

				<AddMemberActions activePanel={activePanel} onSelect={handleMemberSelect} />

				<div className={styles.selectedStaffRow}>
					<SelectedStaffCard label='Ментор' member={mentor} />
					<SelectedStaffCard label='Помощник' member={assistant} />
				</div>

				{activePanel === 'student' ? (
					<AddStudentForm onAdded={handleAddStudent} onCancel={() => setActivePanel(null)} />
				) : null}

				{activePanel === 'mentor' ? (
					<AssignStaffPanel
						title='Назначить ментора'
						role='teacher'
						staffMembers={staffMembers}
						selectedId={mentor?.id ?? null}
						onSelect={member => {
							setMentor(member)
							setActivePanel(null)
						}}
						onCancel={() => setActivePanel(null)}
					/>
				) : null}

				{activePanel === 'assistant' ? (
					<AssignStaffPanel
						title='Назначить помощника'
						role='assistant'
						staffMembers={staffMembers}
						selectedId={assistant?.id ?? null}
						onSelect={member => {
							setAssistant(member)
							setActivePanel(null)
						}}
						onCancel={() => setActivePanel(null)}
					/>
				) : null}

				<GroupStudentsList students={draftStudents} />
			</section>

			<div className={styles.saveAllRow}>
				<Button type='button' variant='secondary' onClick={onCancel}>
					Отмена
				</Button>
				<Button type='button' disabled={isSaving || !courseName.trim()} onClick={handleSaveAll}>
					{isSaving ? 'Сохранение...' : 'Сохранить'}
				</Button>
			</div>

			{message ? (
				<p className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}</p>
			) : null}
		</div>
	)
}
