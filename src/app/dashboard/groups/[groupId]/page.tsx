import { getGroupDetails } from '@/features/create-group/api/actions'
import { BackIconButton } from '@/shared/ui/back-icon-button'
import {
	GroupStudentsAddPanel,
	GroupStudentsCountCard,
	GroupStudentsProvider,
	GroupStudentsTable,
} from '@/widgets/group-students-section'

import pageStyles from '../../pages.module.scss'
import styles from './page.module.scss'

interface GroupDetailsPageProps {
	params: Promise<{ groupId: string }>
}

export default async function GroupDetailsPage({ params }: GroupDetailsPageProps) {
	const { groupId } = await params
	const { data, error } = await getGroupDetails(groupId)

	if (error || !data) {
		return (
			<section className={pageStyles.page}>
				<BackIconButton href='/dashboard/groups' ariaLabel='Назад к списку групп' />
				<h1 className={pageStyles.title}>Группа</h1>
				<p className={pageStyles.text}>{error ?? 'Не удалось загрузить группу'}</p>
			</section>
		)
	}

	return (
		<section className={pageStyles.page}>
			<BackIconButton href='/dashboard/groups' ariaLabel='Назад к списку групп' />

			<h1 className={pageStyles.title}>{data.group.courseName}</h1>

			<GroupStudentsProvider groupId={groupId} initialStudents={data.students}>
				<div className={styles.infoGrid}>
					<GroupStudentsCountCard
						cardClassName={styles.infoCard}
						labelClassName={styles.infoLabel}
						valueClassName={styles.infoValue}
					/>
					<div className={styles.infoCard}>
						<p className={styles.infoLabel}>Ментор</p>
						<p className={styles.infoValue}>{data.group.mentorName ?? 'не назначен'}</p>
					</div>
					<div className={styles.infoCard}>
						<p className={styles.infoLabel}>Помощник</p>
						<p className={styles.infoValue}>{data.group.assistantName ?? 'не назначен'}</p>
					</div>
				</div>

				<div className={styles.section}>
					<div className={styles.sectionHeader}>
						<h2 className={styles.sectionTitle}>Студенты группы</h2>
						<GroupStudentsAddPanel />
					</div>
					<GroupStudentsTable emptyMessage='В этой группе пока нет студентов.' />
				</div>
			</GroupStudentsProvider>
		</section>
	)
}
