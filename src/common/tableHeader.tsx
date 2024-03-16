import React, { Component } from 'react'

import { TableProps, TableColumn } from '@/interfaces/TableColumn'

function TableHeader<T>(props: TableProps<T>) {
	const callSort = (path: keyof T) => {
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
		const { sortColumn } = props
		if (column.path !== sortColumn.path) {
			return null
		}
		if (sortColumn.order === 'asc') {
			return <i className='fa-solid fa-sort-up' />
		}
		return <i className='fa-solid fa-sort-down' />
	}
	const handleSorting = (column: TableColumn<T>) => {
		if (column.path) {
			callSort(column.path)
		}
		return
	}

	return (
		<thead>
			<tr>
				{props.columns.map((column: TableColumn<T>) => (
					<th
						key={(column.path as string) || column.key}
						className={column.path ? 'clickable' : ''}
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
