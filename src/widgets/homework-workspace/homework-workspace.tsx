'use client'

import { useEffect, useMemo, useState } from 'react'

import type { HomeworkItem } from '@/entities/homework/model/types'
import { CodeEditor } from '@/shared/ui/code-editor'
import { HomeworkList } from '@/widgets/homework-list'

import styles from './homework-workspace.module.scss'

interface HomeworkWorkspaceProps {
	items: HomeworkItem[]
}

const initialCode = `function solveTask() {
  // TODO: add your solution
  return 'ready'
}
`

export default function HomeworkWorkspace({ items }: HomeworkWorkspaceProps) {
	const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null)
	const [code, setCode] = useState(initialCode)
	const [isSwitchingToWorkspace, setIsSwitchingToWorkspace] = useState(false)
	const [isSwitchingToList, setIsSwitchingToList] = useState(false)

	useEffect(() => {
		void import('@monaco-editor/react')
	}, [])

	const activeHomework = useMemo(
		() => items.find(({ id }) => id === activeHomeworkId) ?? null,
		[activeHomeworkId, items],
	)

	const handleStartHomework = (homeworkId: string) => {
		setIsSwitchingToWorkspace(true)

		window.setTimeout(() => {
			setActiveHomeworkId(homeworkId)
			setIsSwitchingToWorkspace(false)
		}, 220)
	}

	const handleBackToList = () => {
		setIsSwitchingToList(true)

		window.setTimeout(() => {
			setActiveHomeworkId(null)
			setIsSwitchingToList(false)
		}, 220)
	}

	if (!activeHomework) {
		return (
			<section
				className={`${styles.workspace} ${isSwitchingToWorkspace ? styles.fadeOut : styles.fadeIn}`}
			>
				<h1 className={styles.pageTitle}>Домашнее задание</h1>
				<HomeworkList items={items} onStartHomework={handleStartHomework} />
			</section>
		)
	}

	const { lessonTitle, fullDescription, materials } = activeHomework

	return (
		<section className={`${styles.workspace} ${isSwitchingToList ? styles.fadeOut : styles.fadeIn}`}>
			<div className={styles.workspaceHeader}>
				<button
					className={styles.backButton}
					type='button'
					onClick={handleBackToList}
				>
					<span aria-hidden='true'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
							<g
								id='SVGRepo_tracerCarrier'
								strokeLinecap='round'
								strokeLinejoin='round'
							></g>
							<g id='SVGRepo_iconCarrier'>
								{' '}
								<path
									d='M6 12H18M6 12L11 7M6 12L11 17'
									stroke='#000000'
									strokeWidth='1'
									strokeLinecap='round'
									strokeLinejoin='round'
								></path>{' '}
							</g>
						</svg>
					</span>
				</button>
				<h2 className={styles.title}>{lessonTitle}</h2>
			</div>

			<div className={styles.meta}>
				<p className={styles.blockLabel}>Задание:</p>
				<p className={styles.description}>{fullDescription}</p>
			</div>

			<div className={styles.meta}>
				<p className={styles.blockLabel}>Материалы:</p>
				<ul className={styles.materials}>
					{materials.map(material => (
						<li key={material}>{material}</li>
					))}
				</ul>
			</div>

			<div className={styles.editorSection}>
				<p className={styles.blockLabel}>Редактор кода:</p>
				<CodeEditor value={code} onChange={setCode} language='typescript' />
				<div className={styles.actions}>
					<button className={styles.saveButton} type='button'>
						Сохранить ДЗ
					</button>
				</div>
			</div>
		</section>
	)
}
