import type { DaySchedule, LessonSlot } from '../model/types'

import { jsDayToWeekdayCode } from './weekday'

export const getLessonsForMonth = (
	schedule: DaySchedule[],
	year: number,
	month: number,
): Map<string, LessonSlot[]> => {
	const lessonsByWeekday = new Map(schedule.map(daySchedule => [daySchedule.day, daySchedule.lessons]))
	const lessonsByDate = new Map<string, LessonSlot[]>()

	const daysInMonth = new Date(year, month + 1, 0).getDate()

	for (let day = 1; day <= daysInMonth; day += 1) {
		const date = new Date(year, month, day)
		const weekdayCode = jsDayToWeekdayCode[date.getDay()]
		const lessons = lessonsByWeekday.get(weekdayCode)

		if (!lessons?.length) {
			continue
		}

		const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
		lessonsByDate.set(dateKey, lessons)
	}

	return lessonsByDate
}
