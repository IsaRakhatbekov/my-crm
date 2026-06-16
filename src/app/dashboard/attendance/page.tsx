'use client'

import sharedStyles from '../pages.module.scss'
import styles from './page.module.scss'
import ReactECharts from 'echarts-for-react'

export default function AttendancePage() {
	const totalLessons = 104
	const completedLessons = 5
	const attendedLessons = 4
	const missedLessons = 1

	const areaOption = {
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		},
		yAxis: {
			type: 'value',
		},
		series: [
			{
				data: [820, 932, 901, 934, 1290, 1330, 1320],
				type: 'line',
				areaStyle: {},
			},
		],
	} as const

	const summaryCards = [
		{ label: 'Уроков прошло', value: `${completedLessons} из ${totalLessons}` },
		{ label: 'Посетил', value: `${attendedLessons} из ${completedLessons}` },
		{ label: 'Пропустил', value: `${missedLessons} из ${completedLessons}` },
	] as const

	return (
		<section className={styles.page}>
			<header className={styles.header}>
				<h1 className={sharedStyles.title}>Посещаемость</h1>
				<p className={sharedStyles.text}>
					Черновик страницы: показатели, зона под график ECharts и последние события.
				</p>
			</header>

			<ul className={styles.kpiGrid}>
				{summaryCards.map((card) => (
					<li key={card.label} className={styles.kpiCard}>
						<span className={styles.kpiLabel}>{card.label}</span>
						<strong className={styles.kpiValue}>{card.value}</strong>
					</li>
				))}
			</ul>

			<section className={styles.chartCard}>
				<div className={styles.cardHeading}>
					<h2 className={styles.cardTitle}>Динамика посещаемости</h2>
					<span className={styles.cardMeta}>Период: последние 8 недель</span>
				</div>
				<ReactECharts option={areaOption} className={styles.chart} />
			</section>
		</section>
	)
}
