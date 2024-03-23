import React, { ReactNode } from 'react'
import { TableProps, TableColumn } from '@/interfaces/TableColumn'

import _ from 'lodash'

function TableBody<T>(props: TableProps<T>) {
	const renderCell = (item: T, column: TableColumn<T>): ReactNode => {
		if (typeof column.content === 'function') {
			const content = column.content(item)
			return React.isValidElement(content) ? content : null
		} else if (column.name) return _.get(item, column.name) as ReactNode

		return <></>
	}

	const getRowClass = (item: T): string => {
		let rowClassName = 'row'
		if (props.cssRowClass) rowClassName += ` ${props.cssRowClass(item)}`
		if (props.onRowClick) rowClassName += ` clickable`

		return rowClassName
	}
	const handleRowClick = (item: T) => {
		if (!props.onRowClick) return

		props.onRowClick(item)
	}

	const getTdKey = (item: T, columnInd: number): string => {
		const controlledItem = item as any

		if (controlledItem.name) return `${controlledItem.name}-${columnInd}`
		else if (controlledItem.key) return `${controlledItem.key}-${columnInd}`
		else if (controlledItem.desc) return `${controlledItem.desc}-${columnInd}`
		else if (controlledItem.description) return `${controlledItem.description}-${columnInd}`
		else if (controlledItem.label) return `${controlledItem.label}-${columnInd}`
		else if (controlledItem.title) return `${controlledItem.title}-${columnInd}`
		else return `${columnInd}-${Math.random().toString(15)}`
	}
	return (
		<tbody>
			{props.data.map((row, rowIndex) => (
				<tr key={rowIndex} className={getRowClass(row)} onClick={() => handleRowClick(row)}>
					{props.columns.map((column, columnIndex) => (
						<td key={getTdKey(row, columnIndex)} data-label={column.label}>
							{renderCell(row, column)}
						</td>
					))}
				</tr>
			))}
		</tbody>
	)
}

export default TableBody
