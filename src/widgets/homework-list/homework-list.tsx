import type {
	HomeworkItem,
	HomeworkStatus,
} from '@/entities/homework/model/types'

import styles from './homework-list.module.scss'

interface HomeworkListProps {
	items: HomeworkItem[]
	onStartHomework: (homeworkId: string) => void
}

const statusLabelByCode: Record<HomeworkStatus, string> = {
	todo: 'К выполнению',
	in_review: 'На проверке',
	returned: 'Возвращено',
	done: 'Сдано',
	missed: 'Пропущено',
}

const statusClassByCode: Record<HomeworkStatus, string> = {
	todo: styles.statusTodo,
	in_review: styles.statusReview,
	returned: styles.statusReturned,
	done: styles.statusDone,
	missed: styles.statusMissed,
}

export default function HomeworkList({
	items,
	onStartHomework,
}: HomeworkListProps) {
	return (
		<div className={styles.list}>
			{items.map(
				({ id, lessonTitle, deadline, status, fullDescription, materials }) => (
					<details className={styles.card} key={id}>
						<summary className={styles.summary}>
							<div className={styles.summaryMain}>
								<p className={styles.label}>Тема:</p>
								<p className={styles.lessonTitle}>{lessonTitle}</p>
							</div>
							<div className={styles.meta}>
								<p className={`${styles.status} ${statusClassByCode[status]}`}>
									{statusLabelByCode[status]}
								</p>
								<p className={styles.deadlineLine}>
									<span className={styles.deadlineLabel}>Дедлайн:</span>
									<span className={styles.deadline}>{deadline}</span>
								</p>
							</div>
						</summary>

						<div className={styles.content}>
							<div className={styles.detailsBody}>
								<div>
									<p className={styles.detailsLabel}>Задание:</p>
									<p className={styles.fullDescription}>{fullDescription}</p>
								</div>
								<div className={styles.materials}>
									<p className={styles.detailsLabel}>Материалы:</p>
									<p className={styles.materialsHint}>
										Сюда преподаватель может прикрепить файлы, проекты, скрины и
										другие материалы. Студент только просматривает их.
									</p>
									<ul className={styles.materialsList}>
										{materials.map(material => (
											<li className={styles.materialItem} key={material}>
												{material}
											</li>
										))}
									</ul>
								</div>
								<div className={styles.actions}>
									<button
										className={styles.ctaButton}
										type='button'
										onClick={() => onStartHomework(id)}
									>
										Приступить к выполнению
									</button>
								</div>
							</div>
						</div>
					</details>
				),
			)}
		</div>
	)
}
