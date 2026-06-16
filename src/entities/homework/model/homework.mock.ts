import type { HomeworkItem } from './types'

export const homeworkListMock: HomeworkItem[] = [
	{
		id: 'hw-1',
		lessonTitle: 'React: Компоненты и пропсы',
		courseTitle: 'Frontend Basic',
		deadline: '20.06.2026 18:00',
		status: 'done',
		shortDescription: 'Собрать форму авторизации и разбить на переиспользуемые компоненты.',
		fullDescription:
			'Нужно сверстать форму логина, вынести Input, Label и кнопку в отдельные UI-компоненты, добавить базовую валидацию и подготовить структуру под FSD.',
		materials: ['Презентация урока', 'Чек-лист по FSD', 'Пример структуры проекта'],
	},
	{
		id: 'hw-2',
		lessonTitle: 'TypeScript: Типы и интерфейсы',
		courseTitle: 'Frontend Basic',
		deadline: '22.06.2026 20:00',
		status: 'missed',
		shortDescription: 'Протайпить сущности пользователя, урока и домашнего задания.',
		fullDescription:
			'Создать типы и интерфейсы для сущностей приложения, выделить типы в model-слой и использовать их в компонентах без any.',
		materials: ['Конспект по TypeScript', 'Практика по интерфейсам'],
	},
	{
		id: 'hw-3',
		lessonTitle: 'SCSS Modules и дизайн-система',
		courseTitle: 'Frontend Basic',
		deadline: '24.06.2026 19:30',
		status: 'returned',
		shortDescription: 'Перевести повторяющиеся стили в единые UI-компоненты.',
		fullDescription:
			'Нужно уменьшить дублирование стилей: вынести общий стиль карточек, типографики и кнопок в shared/ui и shared/styles, а также исправить нейминг классов.',
		materials: ['Гайд по SCSS Modules', 'UI-kit референс'],
	},
]
