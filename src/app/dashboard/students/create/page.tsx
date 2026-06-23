import { getStudentsPageData, CreateStudentPage } from '@/features/create-student'

import styles from '../../pages.module.scss'

export default async function CreateStudentRoutePage() {
	const { data, error } = await getStudentsPageData()

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>Студенты</h1>
			{error ? <p className={styles.text}>{error}</p> : null}
			<CreateStudentPage
				initialStudents={data?.students ?? []}
				groups={data?.groups ?? []}
				requireGroup={data?.requireGroup ?? false}
			/>
		</section>
	)
}
