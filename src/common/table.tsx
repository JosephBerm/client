import React, { Component } from 'react'
import TableHeader from '@/common/tableHeader'
import TableBody from '@/common/tableBody'
import { TableProps } from '@/interfaces/TableColumn'

const Table = <T extends { id: string | null }>(props: TableProps<T>) => {
	return (
		<table className='table table-striped table-dark'>
			<TableHeader<T> {...props} />
			<TableBody<T> {...props} />
		</table>
	)
}

export default Table
