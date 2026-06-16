export type HomeworkStatus = 'todo' | 'in_review' | 'returned' | 'done' | 'missed'

export interface HomeworkItem {
	id: string
	lessonTitle: string
	courseTitle: string
	deadline: string
	status: HomeworkStatus
	shortDescription: string
	fullDescription: string
	materials: string[]
}
