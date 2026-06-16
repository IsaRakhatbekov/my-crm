import { homeworkListMock } from '@/entities/homework/model/homework.mock'
import { HomeworkWorkspace } from '@/widgets/homework-workspace'

export default function HomeworkPage() {
	return <HomeworkWorkspace items={homeworkListMock} />
}
