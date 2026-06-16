import type { WeekdayCode } from '../model/types'

export const weekdayCodeToJsDay: Record<WeekdayCode, number> = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
}

export const jsDayToWeekdayCode: Record<number, WeekdayCode> = {
	0: 'sun',
	1: 'mon',
	2: 'tue',
	3: 'wed',
	4: 'thu',
	5: 'fri',
	6: 'sat',
}
