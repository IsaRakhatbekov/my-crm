'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { DeleteStudentButton } from '@/features/delete-student'
import { LOGIN_TYPE_LABELS, type Student, type StudentInGroup } from '@/entities/student'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'

import tableStyles from '@/shared/ui/data-table/data-table.module.scss'

interface StudentsTableProps {
	students: Student[] | StudentInGroup[]
	groupId?: string
	emptyMessage?: string
	footerLabel?: (count: number) => string
	onStudentDeleted?: (studentId: string) => StudentInGroup | null
	onStudentDeleteFailed?: (student: StudentInGroup) => void
}

function formatStudentsCount(count: number): string {
	if (count === 1) {
		return '1 студент'
	}

	if (count >= 2 && count <= 4) {
		return `${count} студента`
	}

	return `${count} студентов`
}

export default function StudentsTable({
	students,
	groupId,
	emptyMessage = 'Студентов пока нет.',
	footerLabel = formatStudentsCount,
	onStudentDeleted,
	onStudentDeleteFailed,
}: StudentsTableProps) {
	const columns = useMemo(() => {
		const nextColumns: DataTableColumn<Student>[] = [
			{
				id: 'login',
				header: 'Логин',
				cellClassName: tableStyles.primaryCell,
				render: student =>
					groupId ? (
						<Link
							className={tableStyles.rowCellLink}
							href={`/dashboard/groups/${groupId}/students/${student.id}`}
						>
							{student.login}
						</Link>
					) : (
						student.login
					),
			},
			{
				id: 'loginType',
				header: 'Тип входа',
				width: '160px',
				render: student => (
					<span className={`${tableStyles.badge} ${tableStyles.badgeNeutral}`}>
						{LOGIN_TYPE_LABELS[student.loginType]}
					</span>
				),
			},
		]

		if (groupId && onStudentDeleted && onStudentDeleteFailed) {
			nextColumns.push({
				id: 'actions',
				header: '',
				width: '140px',
				align: 'right',
				render: student => (
					<DeleteStudentButton
						groupId={groupId}
						studentId={student.id}
						studentLogin={student.login}
						onDeleted={onStudentDeleted}
						onDeleteFailed={onStudentDeleteFailed}
					/>
				),
			})
		}

		return nextColumns
	}, [groupId, onStudentDeleted, onStudentDeleteFailed])

	return (
		<DataTable
			columns={columns}
			rows={students}
			rowKey={student => student.id}
			emptyMessage={emptyMessage}
			footerLabel={footerLabel}
		/>
	)
}
