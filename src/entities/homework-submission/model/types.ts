export type HomeworkSubmissionStatus = 'draft' | 'in_review' | 'returned' | 'done'

export interface HomeworkSubmission {
	id: string
	homework_id: string
	code: string
	status: HomeworkSubmissionStatus
	updated_at: string
}
