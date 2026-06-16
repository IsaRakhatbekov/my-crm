import type { LessonSlot } from '@/entities/schedule/model/types'
import type { MonthCalendarDay } from '@/entities/schedule/lib/getMonthCalendarDays'

import CalendarEventChip from './calendar-event-chip'
import styles from './calendar-day-cell.module.scss'

interface CalendarDayCellProps {
	day: MonthCalendarDay
	lessons: LessonSlot[]
	accentColors: string[]
	isSelected: boolean
	onSelect: (dateKey: string) => void
}

export default function CalendarDayCell({
	day,
	lessons,
	accentColors,
	isSelected,
	onSelect,
}: CalendarDayCellProps) {
	const { dateKey, dayNumber, isCurrentMonth, isToday } = day

	return (
		<button
			type='button'
			className={[
				styles.cell,
				!isCurrentMonth ? styles.cellOutsideMonth : '',
				isToday ? styles.cellToday : '',
				isSelected ? styles.cellSelected : '',
			]
				.filter(Boolean)
				.join(' ')}
			onClick={() => onSelect(dateKey)}
		>
			<span
				className={[
					styles.dayNumber,
					isToday ? styles.dayNumberToday : '',
					!isCurrentMonth ? styles.dayNumberOutsideMonth : '',
				]
					.filter(Boolean)
					.join(' ')}
			>
				{dayNumber}
			</span>

			<div className={styles.events}>
				{lessons.map((lesson, index) => (
					<CalendarEventChip
						key={lesson.id}
						startTime={lesson.startTime}
						endTime={lesson.endTime}
						accentColor={accentColors[index % accentColors.length]}
					/>
				))}
			</div>
		</button>
	)
}
