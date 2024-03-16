'use client'

import React, { useState, useEffect } from 'react'
import { TableProps, SortColumn } from '@/interfaces/TableColumn'
import paginate from '@/services/paginate'
import _ from 'lodash'
import '@/styles/tables.css'

import TableHeader from '@/common/tableHeader'
import TableBody from '@/common/tableBody'
import Pagination from '@/common/pagination'
import InputTextBox from '@/components/InputTextBox'

const Table = <T extends { id: string | null; name: string }>(props: TableProps<T>) => {
	const [pagedData, setPagedData] = useState<T[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(4)
	const [filteredItems, setFilteredItems] = useState<T[]>([])
	const [sortColumn, setSortColumn] = useState<SortColumn<T>>({
		path: 'name',
		order: 'asc',
	})

	useEffect(() => {
		let filtered = props.data

		if (props.isSearchable && searchQuery) {
			filtered = props.data.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
		}

		if (props.isSortable) {
			filtered = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])
		}

		setFilteredItems(filtered)

		setPagedData(paginate<T>(filtered, currentPage, pageSize))
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

	const handleSort = (sortColumn: SortColumn<T>) => {
		setSortColumn(sortColumn)
	}

	const handleSearchQuery = (searchValue: string) => {
		setSearchQuery(searchValue)
	}

	const renderSearch = (): JSX.Element => {
		if (props.isSearchable) {
			return <InputTextBox type='text' value={searchQuery} label='Search' handleChange={handleSearchQuery} />
		}
		return <></>
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const renderPagination = (): JSX.Element => {
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
	return (
		<div className='table-container relative flex flex-col items-end justify-center'>
			{renderSearch()}
			<table className='table table-striped table-dark'>
				<TableHeader<T> {...props} onSort={handleSort} sortColumn={sortColumn} />
				<TableBody<T> {...props} data={props.isPaged ? pagedData : filteredItems} />
			</table>
			{renderPagination()}
		</div>
	)
}

export default Table
