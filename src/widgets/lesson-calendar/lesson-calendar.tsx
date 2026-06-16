'use client'

import { useMemo, useState } from 'react'

import { getLessonsForMonth } from '@/entities/schedule/lib/getLessonsForMonth'
import { getMonthCalendarDays } from '@/entities/schedule/lib/getMonthCalendarDays'
import type { DaySchedule } from '@/entities/schedule/model/types'

import CalendarDayCell from './ui/calendar-day-cell'
import styles from './lesson-calendar.module.scss'

interface LessonCalendarProps {
	schedule: DaySchedule[]
	initialYear?: number
	initialMonth?: number
}

const weekdayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const monthLabels = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

const lessonAccentColors = ['#ff8b5f', '#d4e157', '#42a5f5', '#ab7df5', '#26c6da']

const formatDateKey = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

export default function LessonCalendar({
	schedule,
	initialYear,
	initialMonth,
}: LessonCalendarProps) {
	const today = new Date()
	const [visibleYear, setVisibleYear] = useState(initialYear ?? today.getFullYear())
	const [visibleMonth, setVisibleMonth] = useState(initialMonth ?? today.getMonth())
	const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today))

	const monthDays = useMemo(
		() => getMonthCalendarDays(visibleYear, visibleMonth),
		[visibleMonth, visibleYear],
	)

	const lessonsByDate = useMemo(
		() => getLessonsForMonth(schedule, visibleYear, visibleMonth),
		[schedule, visibleMonth, visibleYear],
	)

	const handlePreviousMonth = () => {
		if (visibleMonth === 0) {
			setVisibleMonth(11)
			setVisibleYear(currentYear => currentYear - 1)
			return
		}

		setVisibleMonth(currentMonth => currentMonth - 1)
	}

	const handleNextMonth = () => {
		if (visibleMonth === 11) {
			setVisibleMonth(0)
			setVisibleYear(currentYear => currentYear + 1)
			return
		}

		setVisibleMonth(currentMonth => currentMonth + 1)
	}

	return (
		<section className={styles.calendar}>
			<header className={styles.header}>
				<div className={styles.monthSwitcher}>
					<p className={styles.monthLabel}>{monthLabels[visibleMonth]}</p>
					<p className={styles.yearLabel}>{visibleYear}</p>
				</div>

				<div className={styles.nav}>
					<button
						className={styles.navButton}
						type='button'
						aria-label='Предыдущий месяц'
						onClick={handlePreviousMonth}
					>
						<span aria-hidden='true'>‹</span>
					</button>
					<button
						className={styles.navButton}
						type='button'
						aria-label='Следующий месяц'
						onClick={handleNextMonth}
					>
						<span aria-hidden='true'>›</span>
					</button>
				</div>
			</header>

			<div className={styles.weekdays}>
				{weekdayLabels.map(label => (
					<p className={styles.weekdayLabel} key={label}>
						{label}
					</p>
				))}
			</div>

			<div className={styles.grid}>
				{monthDays.map(day => (
					<CalendarDayCell
						key={day.dateKey}
						day={day}
						lessons={lessonsByDate.get(day.dateKey) ?? []}
						accentColors={lessonAccentColors}
						isSelected={selectedDateKey === day.dateKey}
						onSelect={setSelectedDateKey}
					/>
				))}
			</div>
		</section>
	)
}
