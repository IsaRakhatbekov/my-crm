'use client'

import { useGroupStudents } from '../model/group-students-context'

interface GroupStudentsCountCardProps {
	cardClassName: string
	labelClassName: string
	valueClassName: string
}

export default function GroupStudentsCountCard({
	cardClassName,
	labelClassName,
	valueClassName,
}: GroupStudentsCountCardProps) {
	const { students } = useGroupStudents()

	return (
		<div className={cardClassName}>
			<p className={labelClassName}>Студентов</p>
			<p className={valueClassName}>{students.length}</p>
		</div>
	)
}
