import {
	getStudentDetails,
	StudentDetailsErrorPage,
	StudentDetailsPage,
} from '@/features/view-student'

interface StudentPageProps {
	params: Promise<{ groupId: string; studentId: string }>
}

export default async function StudentPage({ params }: StudentPageProps) {
	const { groupId, studentId } = await params
	const { data, error } = await getStudentDetails(groupId, studentId)

	if (error || !data) {
		return (
			<StudentDetailsErrorPage
				groupId={groupId}
				message={error ?? 'Не удалось загрузить студента'}
			/>
		)
	}

	return <StudentDetailsPage details={data} />
}
