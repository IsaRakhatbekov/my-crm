'use server'

import type { HomeworkSubmission } from '@/entities/homework-submission/model/types'
import { createClient } from '@/shared/lib/supabase/server'

type ActionResult<T> =
	| { data: T; error?: undefined }
	| { data?: undefined; error: string }

export async function getHomeworkSubmission(
	homeworkId: string,
): Promise<ActionResult<HomeworkSubmission | null>> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { error: 'Войдите в аккаунт, чтобы открыть домашнее задание' }
	}

	const { data, error } = await supabase
		.from('homework_submissions')
		.select('id, homework_id, code, status, updated_at')
		.eq('homework_id', homeworkId)
		.eq('student_id', user.id)
		.maybeSingle()

	if (error) {
		return { error: error.message }
	}

	return { data }
}

export async function saveHomeworkSubmission(
	homeworkId: string,
	code: string,
): Promise<ActionResult<HomeworkSubmission>> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return { error: 'Войдите в аккаунт, чтобы сохранить домашнее задание' }
	}

	const { data, error } = await supabase
		.from('homework_submissions')
		.upsert(
			{
				homework_id: homeworkId,
				student_id: user.id,
				code,
				status: 'draft',
			},
			{ onConflict: 'homework_id,student_id' },
		)
		.select('id, homework_id, code, status, updated_at')
		.single()

	if (error) {
		return { error: error.message }
	}

	return { data }
}
