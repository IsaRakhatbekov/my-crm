'use client'

import { useState } from 'react'

import type { GroupListItem } from '@/entities/group'
import type { StaffMember } from '@/entities/staff'
import CreateGroupForm from '@/features/create-group/ui/create-group-form'
import { Button } from '@/shared/ui/button'
import { GroupsList } from '@/widgets/groups-list'

import styles from './groups-page.module.scss'

interface GroupsPageProps {
	initialGroups: GroupListItem[]
	staffMembers: StaffMember[]
}

export default function GroupsPage({ initialGroups, staffMembers }: GroupsPageProps) {
	const [groups, setGroups] = useState(initialGroups)
	const [isFormOpen, setIsFormOpen] = useState(false)

	const handleSaved = (group: GroupListItem) => {
		setGroups(current => [group, ...current])
		setIsFormOpen(false)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.actions}>
				<Button
					type='button'
					variant={isFormOpen ? 'secondary' : 'primary'}
					onClick={() => setIsFormOpen(current => !current)}
				>
					{isFormOpen ? 'Скрыть форму' : 'Создать группу'}
				</Button>
			</div>

			{isFormOpen ? (
				<CreateGroupForm
					staffMembers={staffMembers}
					onSaved={handleSaved}
					onCancel={() => setIsFormOpen(false)}
				/>
			) : null}

			<GroupsList groups={groups} />
		</div>
	)
}
