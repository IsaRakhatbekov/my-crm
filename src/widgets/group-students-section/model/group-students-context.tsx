'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'

import type { StudentInGroup } from '@/entities/student'

interface GroupStudentsContextValue {
	groupId: string
	students: StudentInGroup[]
	addStudent: (student: StudentInGroup) => void
	deleteStudentOptimistic: (studentId: string) => StudentInGroup | null
	restoreStudent: (student: StudentInGroup) => void
}

const GroupStudentsContext = createContext<GroupStudentsContextValue | null>(null)

export function useGroupStudents() {
	const context = useContext(GroupStudentsContext)

	if (!context) {
		throw new Error('useGroupStudents must be used within GroupStudentsProvider')
	}

	return context
}

interface GroupStudentsProviderProps {
	groupId: string
	initialStudents: StudentInGroup[]
	children: ReactNode
}

export function GroupStudentsProvider({
	groupId,
	initialStudents,
	children,
}: GroupStudentsProviderProps) {
	const [students, setStudents] = useState(initialStudents)

	useEffect(() => {
		setStudents(initialStudents)
	}, [initialStudents])

	const deleteStudentOptimistic = useCallback(
		(studentId: string) => {
			const removedStudent = students.find(student => student.id === studentId) ?? null

			if (!removedStudent) {
				return null
			}

			setStudents(current => current.filter(student => student.id !== studentId))

			return removedStudent
		},
		[students],
	)

	const restoreStudent = useCallback((student: StudentInGroup) => {
		setStudents(current => {
			if (current.some(item => item.id === student.id)) {
				return current
			}

			return [...current, student]
		})
	}, [])

	const addStudent = useCallback((student: StudentInGroup) => {
		setStudents(current => {
			if (current.some(item => item.id === student.id)) {
				return current
			}

			return [...current, student]
		})
	}, [])

	const value = useMemo(
		() => ({
			groupId,
			students,
			addStudent,
			deleteStudentOptimistic,
			restoreStudent,
		}),
		[groupId, students, addStudent, deleteStudentOptimistic, restoreStudent],
	)

	return <GroupStudentsContext.Provider value={value}>{children}</GroupStudentsContext.Provider>
}
