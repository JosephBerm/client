import React from 'react'

import { TableProps, TableColumn } from '@/interfaces/Table'

function TableHeader<T>(props: TableProps<T>) {
	const callSort = (path: keyof T) => {
		if (!props.sortColumn) return

		const sortColumn = { ...props.sortColumn }
		if (sortColumn.path === path) {
			sortColumn.order = sortColumn.order === 'asc' ? 'desc' : 'asc'
		} else {
			sortColumn.path = path
			sortColumn.order = 'asc'
		}

		props.onSort?.(sortColumn)
	}

	const renderSortIcon = (column: TableColumn<T>) => {
		if (!props.sortColumn) return

		const { sortColumn } = props
		if (column.name !== sortColumn.path) {
			return null
		}
		if (sortColumn.order === 'asc') {
			return (
				<div className='sort-container'>
					<i className='fa-solid fa-sort-up active' />
					<i className='fa-solid fa-sort-down' />
				</div>
			)
		}
		return (
			<div className='sort-container'>
				<i className='fa-solid fa-sort-up' />
				<i className='fa-solid fa-sort-down active' />
			</div>
		)
	}
	const handleSorting = (column: TableColumn<T>) => {
		if (column.name) {
			callSort(column.name)
		}
		return
	}

	return (
		<thead>
			<tr>
				{props.columns.map((column: TableColumn<T>) => (
					<th
						key={(column.name as string) || column.key}
						className={column.name ? 'clickable' : ''}
						onClick={() => handleSorting(column)}>
						{column.label}
						{renderSortIcon(column)}
					</th>
				))}
			</tr>
		</thead>
	)
}

export default TableHeader
