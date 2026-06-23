import { LOGIN_TYPE_LABELS, type DraftStudent } from '@/entities/student'

import styles from './draft-students-list.module.scss'

interface DraftStudentsListProps {
	students: DraftStudent[]
	emptyMessage?: string
}

export default function DraftStudentsList({
	students,
	emptyMessage = 'Студентов пока нет. Нажмите «Добавить студента».',
}: DraftStudentsListProps) {
	if (students.length === 0) {
		return <p className={styles.empty}>{emptyMessage}</p>
	}

	return (
		<ul className={styles.list}>
			{students.map(student => (
				<li className={styles.card} key={student.id}>
					<div className={styles.cardMain}>
						<p className={styles.login}>{student.login}</p>
						<span className={styles.typeBadge}>{LOGIN_TYPE_LABELS[student.loginType]}</span>
					</div>
					<p className={styles.passwordHint}>Пароль задан</p>
				</li>
			))}
		</ul>
	)
}
