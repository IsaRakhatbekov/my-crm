import { STAFF_ROLE_LABELS, type StaffMember, type StaffRole } from '@/entities/staff'
import { Button } from '@/shared/ui/button'

import styles from './create-group-form.module.scss'

interface AssignStaffPanelProps {
	title: string
	role: StaffRole
	staffMembers: StaffMember[]
	selectedId: string | null
	onSelect: (member: StaffMember) => void
	onCancel: () => void
}

export default function AssignStaffPanel({
	title,
	role,
	staffMembers,
	selectedId,
	onSelect,
	onCancel,
}: AssignStaffPanelProps) {
	const candidates = staffMembers.filter(member => member.role === role)

	return (
		<div className={styles.staffPanel}>
			<div className={styles.staffPanelHeader}>
				<p className={styles.staffPanelTitle}>{title}</p>
				<p className={styles.staffPanelHint}>
					Выберите из списка сотрудников ({STAFF_ROLE_LABELS[role].toLowerCase()}).
				</p>
			</div>

			{candidates.length === 0 ? (
				<p className={styles.staffPanelEmpty}>
					Нет сотрудников с ролью «{STAFF_ROLE_LABELS[role]}». Создайте в разделе «Сотрудники».
				</p>
			) : (
				<ul className={styles.staffPickList}>
					{candidates.map(member => (
						<li key={member.id}>
							<button
								className={`${styles.staffPickButton} ${selectedId === member.id ? styles.staffPickButtonActive : ''}`}
								type='button'
								onClick={() => onSelect(member)}
							>
								<span className={styles.staffPickName}>{member.fullName}</span>
								<span className={styles.staffPickLogin}>{member.login}</span>
							</button>
						</li>
					))}
				</ul>
			)}

			<div className={styles.staffPanelActions}>
				<Button type='button' variant='secondary' onClick={onCancel}>
					Закрыть
				</Button>
			</div>
		</div>
	)
}
