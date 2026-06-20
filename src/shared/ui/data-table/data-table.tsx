import type { ReactNode } from 'react'

import styles from './data-table.module.scss'

export interface DataTableColumn<T> {
	id: string
	header: string
	align?: 'left' | 'center' | 'right'
	width?: string
	cellClassName?: string
	render: (row: T) => ReactNode
}

interface DataTableProps<T> {
	columns: DataTableColumn<T>[]
	rows: T[]
	rowKey: (row: T) => string
	emptyMessage: string
	footerLabel?: (count: number) => string
}

export default function DataTable<T>({
	columns,
	rows,
	rowKey,
	emptyMessage,
	footerLabel = count => `Всего: ${count}`,
}: DataTableProps<T>) {
	if (rows.length === 0) {
		return (
			<div className={styles.wrap}>
				<p className={styles.empty}>{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className={styles.wrap}>
			<div className={styles.scroll}>
				<table className={styles.table}>
					<thead>
						<tr>
							{columns.map(column => (
								<th
									className={[
										styles.th,
										column.align === 'center' ? styles.alignCenter : '',
										column.align === 'right' ? styles.alignRight : '',
									]
										.filter(Boolean)
										.join(' ')}
									key={column.id}
									style={column.width ? { width: column.width } : undefined}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map(row => (
							<tr key={rowKey(row)}>
								{columns.map(column => (
									<td
										className={[
											styles.td,
											column.align === 'center' ? styles.alignCenter : '',
											column.align === 'right' ? styles.alignRight : '',
											column.cellClassName,
										]
											.filter(Boolean)
											.join(' ')}
										key={column.id}
									>
										{column.render(row)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className={styles.footer}>
				<p>{footerLabel(rows.length)}</p>
			</div>
		</div>
	)
}
