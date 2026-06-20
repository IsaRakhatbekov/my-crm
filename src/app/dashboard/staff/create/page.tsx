import { CreateStaffPage } from '@/features/create-staff'
import { getStaffMembers } from '@/features/create-staff/api/actions'

import styles from '../../pages.module.scss'

export default async function CreateStaffRoutePage() {
	const { data, error } = await getStaffMembers()

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Сотрудники</h1>
			{error ? <p className={styles.text}>{error}</p> : null}
			<CreateStaffPage initialMembers={data ?? []} />
		</section>
	)
}
