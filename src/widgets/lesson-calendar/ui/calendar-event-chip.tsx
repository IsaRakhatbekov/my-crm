import styles from './calendar-event-chip.module.scss'

interface CalendarEventChipProps {
	startTime: string
	endTime: string
	accentColor: string
}

export default function CalendarEventChip({
	startTime,
	endTime,
	accentColor,
}: CalendarEventChipProps) {
	return (
		<div className={styles.chip}>
			<span className={styles.accent} style={{ backgroundColor: accentColor }} />
			<span className={styles.time}>
				{startTime} - {endTime}
			</span>
		</div>
	)
}
