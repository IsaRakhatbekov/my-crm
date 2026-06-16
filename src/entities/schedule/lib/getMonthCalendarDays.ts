export interface MonthCalendarDay {
	date: Date
	dateKey: string
	dayNumber: number
	isCurrentMonth: boolean
	isToday: boolean
}

const formatDateKey = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

const isSameDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate()

export const getMonthCalendarDays = (year: number, month: number): MonthCalendarDay[] => {
	const today = new Date()
	const firstDayOfMonth = new Date(year, month, 1)
	const lastDayOfMonth = new Date(year, month + 1, 0)

	const gridStart = new Date(firstDayOfMonth)
	gridStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay())

	const gridEnd = new Date(lastDayOfMonth)
	gridEnd.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()))

	const days: MonthCalendarDay[] = []
	const cursor = new Date(gridStart)

	while (cursor <= gridEnd) {
		days.push({
			date: new Date(cursor),
			dateKey: formatDateKey(cursor),
			dayNumber: cursor.getDate(),
			isCurrentMonth: cursor.getMonth() === month,
			isToday: isSameDay(cursor, today),
		})

		cursor.setDate(cursor.getDate() + 1)
	}

	return days
}
