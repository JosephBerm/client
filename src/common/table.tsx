'use client'

import React, { useState, useEffect } from 'react'
import { TableProps, SortColumn } from '@/interfaces/Table'
import paginate from '@/services/paginate'
import _ from 'lodash'
import '@/styles/tables.css'

import TableHeader from '@/common/tableHeader'
import TableBody from '@/common/tableBody'
import Pagination from '@/common/pagination'
import InputTextBox from '@/components/InputTextBox'

const Table = <T extends {}>(props: TableProps<T>) => {
	const [pagedData, setPagedData] = useState<any[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(4)
	const [filteredItems, setFilteredItems] = useState<any[]>([])
	const [sortColumn, setSortColumn] = useState<SortColumn<any>>({
		path: 'name',
		order: 'asc',
	})

	useEffect(() => {
		let filtered = props.data

		// if (props.isSearchable && searchQuery) {
		// 	filtered = props.data.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
		// }

		if (props.isSortable) {
			filtered = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])
		}

		setFilteredItems(filtered)

		setPagedData(paginate<any>(filtered, currentPage, pageSize))
	}, [
		searchQuery,
		sortColumn,
		currentPage,
		pageSize,
		props.data,
		props.isPaged,
		props.isSearchable,
		props.isSortable,
	])

	const handleSort = (sortColumn: SortColumn<any>) => {
		setSortColumn(sortColumn)
	}

	const handleSearchQuery = (searchValue: string) => {
		setSearchQuery(searchValue)
	}

	const tableSearch = (): JSX.Element => {
		if (props.isSearchable) {
			return (
				<InputTextBox
					type='text'
					value={searchQuery}
					label='Search'
					handleChange={(e) => handleSearchQuery(e.currentTarget.value)}
				/>
			)
		}
		return <></>
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const tablePagination = (): JSX.Element => {
		if (props.isPaged) {
			return (
				<Pagination
					onPageChange={handlePageChange}
					itemsCount={filteredItems.length}
					currentPage={currentPage}
					pageSize={pageSize}
				/>
			)
		}
		return <></>
	}
	const tableTitle = (): JSX.Element => {
		if (props.title) {
			return <caption>{props.title}</caption>
		}
		return <></>
	}
	return (
		<div className='table-container relative flex flex-col items-end justify-center'>
			{tableSearch()}
			<table className='table-dark'>
				{tableTitle()}
				<TableHeader<T> {...props} onSort={handleSort} sortColumn={sortColumn} />
				<TableBody<T> {...props} data={props.isPaged ? pagedData : filteredItems} />
			</table>
			{tablePagination()}
		</div>
	)
}

export default Table
