'use client'

import { useEffect, useMemo, useState } from 'react'

import type { HomeworkItem } from '@/entities/homework/model/types'
import {
	getHomeworkSubmission,
	saveHomeworkSubmission,
} from '@/features/homework-submission'
import { BackIconButton } from '@/shared/ui/back-icon-button'
import { CodeEditor } from '@/shared/ui/code-editor'
import { HomeworkList } from '@/widgets/homework-list'

import styles from './homework-workspace.module.scss'

interface HomeworkWorkspaceProps {
	items: HomeworkItem[]
}

const initialCode = `function solveTask() {
  return
}
`

export default function HomeworkWorkspace({ items }: HomeworkWorkspaceProps) {
	const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null)
	const [code, setCode] = useState(initialCode)
	const [isSwitchingToWorkspace, setIsSwitchingToWorkspace] = useState(false)
	const [isSwitchingToList, setIsSwitchingToList] = useState(false)
	const [isLoadingCode, setIsLoadingCode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [saveMessage, setSaveMessage] = useState<string | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)

	useEffect(() => {
		void import('@monaco-editor/react')
	}, [])

	useEffect(() => {
		if (!activeHomeworkId) {
			return
		}

		let cancelled = false

		const loadSubmission = async () => {
			setIsLoadingCode(true)
			setSaveMessage(null)
			setSaveError(null)

			const result = await getHomeworkSubmission(activeHomeworkId)

			if (cancelled) {
				return
			}

			if (result.error) {
				setSaveError(result.error)
				setCode(initialCode)
			} else {
				setCode(result.data?.code ?? initialCode)
			}

			setIsLoadingCode(false)
		}

		void loadSubmission()

		return () => {
			cancelled = true
		}
	}, [activeHomeworkId])

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

	const handleSave = async () => {
		if (!activeHomeworkId || isSaving) {
			return
		}

		setIsSaving(true)
		setSaveMessage(null)
		setSaveError(null)

		const result = await saveHomeworkSubmission(activeHomeworkId, code)

		setIsSaving(false)

		if (result.error) {
			setSaveError(result.error)
			return
		}

		setSaveMessage('Домашнее задание сохранено')
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
		<section
			className={`${styles.workspace} ${isSwitchingToList ? styles.fadeOut : styles.fadeIn}`}
		>
			<div className={styles.workspaceHeader}>
				<BackIconButton onClick={handleBackToList} />
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
				{isLoadingCode ? (
					<p className={styles.statusMessage}>Загружаем сохранённый код...</p>
				) : (
					<CodeEditor value={code} onChange={setCode} language='typescript' />
				)}
				<div className={styles.actions}>
					{saveError ? <p className={styles.errorMessage}>{saveError}</p> : null}
					{saveMessage ? (
						<p className={styles.successMessage}>{saveMessage}</p>
					) : null}
					<button
						className={styles.saveButton}
						type='button'
						onClick={handleSave}
						disabled={isSaving || isLoadingCode}
					>
						{isSaving ? 'Сохраняем...' : 'Сохранить ДЗ'}
					</button>
				</div>
			</div>
		</section>
	)
}
