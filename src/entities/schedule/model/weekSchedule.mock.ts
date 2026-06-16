import type { DaySchedule } from './types'

export const studentWeekScheduleMock: DaySchedule[] = [
	{
		day: 'mon',
		lessons: [
			{
				id: 'mon-1',
				startTime: '10:00',
				endTime: '11:30',
				title: 'React: Компоненты и пропсы',
				teacherName: 'Айдана К.',
				room: 'Zoom',
			},
			{
				id: 'mon-2',
				startTime: '15:00',
				endTime: '16:30',
				title: 'Практика: разбор домашки',
				teacherName: 'Айдана К.',
				room: 'Zoom',
			},
		],
	},
	{
		day: 'wed',
		lessons: [
			{
				id: 'wed-1',
				startTime: '10:00',
				endTime: '11:30',
				title: 'TypeScript: типы и интерфейсы',
				teacherName: 'Нуржан С.',
				room: 'Класс 3',
			},
		],
	},
	{
		day: 'fri',
		lessons: [
			{
				id: 'fri-1',
				startTime: '10:00',
				endTime: '11:30',
				title: 'SCSS Modules и дизайн-система',
				teacherName: 'Нуржан С.',
				room: 'Класс 3',
			},
		],
	},
]
