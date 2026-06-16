export type WeekdayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface LessonSlot {
	id: string
	startTime: string
	endTime: string
	title: string
	groupName?: string
	teacherName?: string
	room?: string
}

export interface DaySchedule {
	day: WeekdayCode
	lessons: LessonSlot[]
}
