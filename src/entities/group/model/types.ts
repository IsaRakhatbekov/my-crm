export interface Group {
	id: string
	courseName: string
	createdAt: string
}

export interface GroupListItem extends Group {
	studentsCount: number
	mentorName: string | null
	assistantName: string | null
}
