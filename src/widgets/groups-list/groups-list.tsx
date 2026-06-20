import Link from 'next/link'
import type { GroupListItem } from '@/entities/group'

import styles from './groups-list.module.scss'

interface GroupsListProps {
	groups: GroupListItem[]
}

function getInitials(name: string | null): string {
	if (!name?.trim()) {
		return '?'
	}

	const parts = name.trim().split(/\s+/).filter(Boolean)

	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
	}

	return parts[0].slice(0, 2).toUpperCase()
}

function getStaffFillPercent(group: GroupListItem): number {
	let filled = 0

	if (group.mentorName) {
		filled += 1
	}

	if (group.assistantName) {
		filled += 1
	}

	if (group.studentsCount > 0) {
		filled += 1
	}

	return Math.round((filled / 3) * 100)
}

function GroupCard({ group }: { group: GroupListItem }) {
	const staffFill = getStaffFillPercent(group)
	const avatarItems = [
		{ label: getInitials(group.mentorName), className: styles.avatarMentor },
		{ label: getInitials(group.assistantName), className: styles.avatarAssistant },
		{ label: String(group.studentsCount), className: styles.avatarStudents },
	]

	return (
		<Link className={styles.cardLink} href={`/dashboard/groups/${group.id}`}>
			<article className={styles.card}>
				<div className={styles.cardHeader}>
					<span className={styles.cardIcon} aria-hidden='true'>
						<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M4 7.5C4 6.12 5.12 5 6.5 5H17.5C18.88 5 20 6.12 20 7.5V16.5C20 17.88 18.88 19 17.5 19H6.5C5.12 19 4 17.88 4 16.5V7.5Z'
								stroke='currentColor'
								strokeWidth='1.5'
							/>
							<path
								d='M8 9H16M8 12.5H13'
								stroke='currentColor'
								strokeWidth='1.5'
								strokeLinecap='round'
							/>
						</svg>
					</span>
					<span className={styles.cardLabel}>Группа</span>
				</div>

				<div className={styles.socialRow}>
					<div className={styles.avatarStack}>
						{avatarItems.map((item, index) => (
							<span className={`${styles.avatar} ${item.className}`} key={index}>
								{item.label}
							</span>
						))}
					</div>
					<p className={styles.socialText}>
						{group.studentsCount}{' '}
						{group.studentsCount === 1
							? 'студент'
							: group.studentsCount >= 2 && group.studentsCount <= 4
								? 'студента'
								: 'студентов'}
					</p>
				</div>

				<h2 className={styles.courseName}>{group.courseName}</h2>

				<div className={styles.metricRow}>
					<p className={styles.metricValue}>{group.studentsCount}</p>
					<p className={styles.metricHint}>в группе</p>
				</div>

				<div className={styles.progressTrack}>
					<div className={styles.progressFill} style={{ width: `${staffFill}%` }} />
				</div>

				<div className={styles.footer}>
					<span className={styles.legendItem}>
						<span className={`${styles.legendDot} ${styles.legendMentor}`} />
						{group.mentorName ?? 'без ментора'}
					</span>
					<span className={styles.legendItem}>
						<span className={`${styles.legendDot} ${styles.legendAssistant}`} />
						{group.assistantName ?? 'без помощника'}
					</span>
				</div>
			</article>
		</Link>
	)
}

export default function GroupsList({ groups }: GroupsListProps) {
	if (groups.length === 0) {
		return <p className={styles.empty}>Групп пока нет. Нажмите «Создать группу» выше.</p>
	}

	return (
		<ul className={styles.grid}>
			{groups.map(group => (
				<li key={group.id}>
					<GroupCard group={group} />
				</li>
			))}
		</ul>
	)
}
