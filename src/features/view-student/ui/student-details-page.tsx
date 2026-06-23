import Link from 'next/link'

import { LOGIN_TYPE_LABELS, type StudentDetails } from '@/entities/student'
import { BackIconButton } from '@/shared/ui/back-icon-button'

import styles from './student-details-page.module.scss'

interface StudentDetailsErrorPageProps {
	groupId: string
	message: string
}

export function StudentDetailsErrorPage({ groupId, message }: StudentDetailsErrorPageProps) {
	return (
		<section className={styles.page}>
			<BackIconButton
				href={`/dashboard/groups/${groupId}`}
				ariaLabel='Назад к группе'
			/>
			<h1 className={styles.title}>Студент</h1>
			<p className={styles.text}>{message}</p>
		</section>
	)
}

interface StudentDetailsPageProps {
	details: StudentDetails
}

function formatCreatedAt(value: string): string {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		return '—'
	}

	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

export default function StudentDetailsPage({ details }: StudentDetailsPageProps) {
	const { student, groupId, groupCourseName } = details
	const groupHref = `/dashboard/groups/${groupId}`

	return (
		<section className={styles.page}>
			<BackIconButton href={groupHref} ariaLabel='Назад к группе' />

			<h1 className={styles.title}>{student.login}</h1>
			<p className={styles.text}>
				Студент группы{' '}
				<Link className={styles.groupLink} href={groupHref}>
					{groupCourseName}
				</Link>
			</p>

			<div className={styles.infoGrid}>
				<div className={styles.infoCard}>
					<p className={styles.infoLabel}>Логин</p>
					<p className={styles.infoValue}>{student.login}</p>
				</div>
				<div className={styles.infoCard}>
					<p className={styles.infoLabel}>Тип входа</p>
					<p className={styles.infoValue}>{LOGIN_TYPE_LABELS[student.loginType]}</p>
				</div>
				<div className={styles.infoCard}>
					<p className={styles.infoLabel}>Имя</p>
					<p className={styles.infoValue}>{student.fullName || '—'}</p>
				</div>
				<div className={styles.infoCard}>
					<p className={styles.infoLabel}>Добавлен</p>
					<p className={styles.infoValue}>{formatCreatedAt(student.createdAt)}</p>
				</div>
			</div>
		</section>
	)
}
