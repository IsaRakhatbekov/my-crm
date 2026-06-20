import GroupsPage from '@/features/create-group/ui/groups-page'
import { getGroups } from '@/features/create-group/api/actions'
import { getStaffMembers } from '@/features/create-staff/api/actions'

import styles from '../pages.module.scss'

export default async function GroupsRoutePage() {
	const [{ data: groups, error: groupsError }, { data: staffMembers }] = await Promise.all([
		getGroups(),
		getStaffMembers(),
	])

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Группы</h1>

			{groupsError ? <p className={styles.text}>{groupsError}</p> : null}

			<GroupsPage initialGroups={groups ?? []} staffMembers={staffMembers ?? []} />
		</section>
	)
}
