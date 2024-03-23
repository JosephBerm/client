import React, { ReactNode } from 'react'
import { TableProps, TableColumn } from '@/interfaces/TableColumn'

import _ from 'lodash'

function TableBody(props: TableProps) {
	
	const createKey = (item: any, column: TableColumn<any>): string => {
		if (item.id != null) return item.id + ((column.path as string) || column.key)
		else return (column.path as string) || column.key || ''
	}

	const renderCell = (item: any, column: TableColumn<any>): ReactNode => {
		if (typeof column.content === 'function') {
			const content = column.content(item)
			return React.isValidElement(content) ? content : null
		} else if (column.path) return _.get(item, column.path) as ReactNode

		return <></>
	}

	return (
		<tbody>
			{props.data.map((item) => (
				<tr key={item.id}>
					{props.columns.map((column) => (
						<td key={createKey(item, column)} data-label={column.label}>
							{renderCell(item, column)}
						</td>
					))}
				</tr>
			))}
		</tbody>
	)
}

export default TableBody
