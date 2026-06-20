import { STAFF_ROLE_LABELS, type StaffListItem } from '@/entities/staff'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'

import tableStyles from '@/shared/ui/data-table/data-table.module.scss'

const columns: DataTableColumn<StaffListItem>[] = [
	{
		id: 'name',
		header: 'Имя',
		cellClassName: tableStyles.primaryCell,
		render: member => member.fullName,
	},
	{
		id: 'role',
		header: 'Должность',
		render: member => (
			<span
				className={`${tableStyles.badge} ${member.role === 'teacher' ? tableStyles.badgeBlue : tableStyles.badgeGray}`}
			>
				{STAFF_ROLE_LABELS[member.role]}
			</span>
		),
	},
	{
		id: 'groups',
		header: 'Групп',
		align: 'center',
		width: '120px',
		cellClassName: tableStyles.numericCell,
		render: member => member.groupsCount,
	},
]

interface StaffTableProps {
	members: StaffListItem[]
}

export default function StaffTable({ members }: StaffTableProps) {
	return (
		<DataTable
			columns={columns}
			rows={members}
			rowKey={member => member.id}
			emptyMessage='Сотрудников пока нет.'
		/>
	)
}
