import { STAFF_ROLE_LABELS, type StaffMember } from '@/entities/staff'

import styles from './create-group-form.module.scss'

interface SelectedStaffCardProps {
	label: string
	member: StaffMember | null
}

export default function SelectedStaffCard({ label, member }: SelectedStaffCardProps) {
	if (!member) {
		return (
			<p className={styles.selectedStaffEmpty}>
				{label}: <span>не назначен</span>
			</p>
		)
	}

	return (
		<div className={styles.selectedStaffCard}>
			<p className={styles.selectedStaffLabel}>{label}</p>
			<p className={styles.selectedStaffName}>{member.fullName}</p>
			<p className={styles.selectedStaffMeta}>
				{STAFF_ROLE_LABELS[member.role]} · {member.login}
			</p>
		</div>
	)
}
