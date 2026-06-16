'use client'

import dynamic from 'next/dynamic'

import styles from './code-editor.module.scss'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
	ssr: false,
	loading: () => (
		<div className={styles.loading} aria-hidden='true'>
			<div className={styles.loadingLine} />
			<div className={styles.loadingLine} />
			<div className={styles.loadingLineShort} />
		</div>
	),
})

interface CodeEditorProps {
	value: string
	onChange: (value: string) => void
	language?: string
}

export default function CodeEditor({
	value,
	onChange,
	language = 'typescript',
}: CodeEditorProps) {
	return (
		<div className={styles.wrapper}>
			<MonacoEditor
				height='300px'
				language={language}
				value={value}
				theme='vs-dark'
				onChange={editorValue => onChange(editorValue ?? '')}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					scrollBeyondLastLine: true,
					automaticLayout: true,
					padding: { top: 16 },
				}}
			/>
		</div>
	)
}
