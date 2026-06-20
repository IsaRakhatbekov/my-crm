import { STUDENT_LOGIN_TYPE_LABELS, type StudentLoginType } from '@/entities/student'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'

import tableStyles from '@/shared/ui/data-table/data-table.module.scss'

interface GroupStudentRow {
	id: string
	login: string
	login_type: StudentLoginType
}

const columns: DataTableColumn<GroupStudentRow>[] = [
	{
		id: 'login',
		header: 'Логин',
		cellClassName: tableStyles.primaryCell,
		render: student => student.login,
	},
	{
		id: 'loginType',
		header: 'Тип входа',
		width: '160px',
		render: student => (
			<span className={`${tableStyles.badge} ${tableStyles.badgeNeutral}`}>
				{STUDENT_LOGIN_TYPE_LABELS[student.login_type]}
			</span>
		),
	},
]

interface GroupStudentsTableProps {
	students: GroupStudentRow[]
}

export default function GroupStudentsTable({ students }: GroupStudentsTableProps) {
	return (
		<DataTable
			columns={columns}
			rows={students}
			rowKey={student => student.id}
			emptyMessage='В этой группе пока нет студентов.'
			footerLabel={count =>
				count === 1 ? '1 студент' : count >= 2 && count <= 4 ? `${count} студента` : `${count} студентов`
			}
		/>
	)
}
