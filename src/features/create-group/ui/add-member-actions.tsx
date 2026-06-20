import { Button } from '@/shared/ui/button'

import styles from './create-group-form.module.scss'

export type MemberPanel = 'student' | 'mentor' | 'assistant'

interface AddMemberActionsProps {
	activePanel: MemberPanel | null
	onSelect: (panel: MemberPanel) => void
}

export default function AddMemberActions({ activePanel, onSelect }: AddMemberActionsProps) {
	return (
		<div className={styles.memberActions}>
			<Button
				type='button'
				variant={activePanel === 'student' ? 'primary' : 'secondary'}
				onClick={() => onSelect('student')}
			>
				+ Добавить студента
			</Button>

			<Button
				type='button'
				variant={activePanel === 'mentor' ? 'primary' : 'secondary'}
				onClick={() => onSelect('mentor')}
			>
				+ Назначить ментора
			</Button>

			<Button
				type='button'
				variant={activePanel === 'assistant' ? 'primary' : 'secondary'}
				onClick={() => onSelect('assistant')}
			>
				+ Назначить помощника
			</Button>
		</div>
	)
}
