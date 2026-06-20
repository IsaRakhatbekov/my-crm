import { STUDENT_LOGIN_TYPE_LABELS, type DraftGroupStudent } from '@/entities/student'

import styles from './create-group-form.module.scss'

interface GroupStudentsListProps {
	students: DraftGroupStudent[]
}

export default function GroupStudentsList({ students }: GroupStudentsListProps) {
	if (students.length === 0) {
		return (
			<p className={styles.emptyStudents}>Студентов пока нет. Нажмите «Добавить студента».</p>
		)
	}

	return (
		<ul className={styles.studentsList}>
			{students.map(student => (
				<li className={styles.studentCard} key={student.id}>
					<div className={styles.studentCardMain}>
						<p className={styles.studentLogin}>{student.login}</p>
						<span className={styles.studentTypeBadge}>
							{STUDENT_LOGIN_TYPE_LABELS[student.loginType]}
						</span>
					</div>
					<p className={styles.studentPassword}>Пароль задан</p>
				</li>
			))}
		</ul>
	)
}
