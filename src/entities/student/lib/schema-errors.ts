export function isMissingStudentsTable(error: { message: string } | null): boolean {
	return Boolean(
		error?.message?.includes('public.students') ||
			error?.message?.includes("table 'students'"),
	)
}

export function isMissingStudentIdColumn(error: { message: string } | null): boolean {
	return Boolean(error?.message?.includes('student_id'))
}

export function isMissingLoginColumn(error: { message: string } | null): boolean {
	return Boolean(error?.message?.includes('login'))
}
