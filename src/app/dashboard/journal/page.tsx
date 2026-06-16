import { studentWeekScheduleMock } from '@/entities/schedule/model/weekSchedule.mock'
import { LessonCalendar } from '@/widgets/lesson-calendar'

export default function JournalPage() {
	return <LessonCalendar schedule={studentWeekScheduleMock} />
}
