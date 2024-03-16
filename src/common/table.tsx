import React, { useState, useEffect } from 'react'
import TableHeader from '@/common/tableHeader'
import TableBody from '@/common/tableBody'
import { TableProps, SortColumn } from '@/interfaces/TableColumn'
import InputTextBox from '@/components/InputTextBox'

import paginate from '@/services/paginate'

import _ from 'lodash'

const Table = <T extends { id: string | null; name: string }>(props: TableProps<T>) => {
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

		if (props.isPaginated) {
			filtered = paginate<T>(filtered, currentPage, pageSize)
		}

		setFilteredItems(filtered)
	}, [
		searchQuery,
		sortColumn,
		currentPage,
		pageSize,
		props.data,
		props.isPaginated,
		props.isSearchable,
		props.isSortable,
	])

	const handleSort = (sortColumn: SortColumn<T>) => {
		setSortColumn(sortColumn)
	}

	const handleSearchQuery = (searchValue: string) => {
		setSearchQuery(searchValue)
	}

	return (
		<table className='table table-striped table-dark relative'>
			{props.isSearchable ? (
				<InputTextBox type='text' value={searchQuery} label='Search' handleChange={handleSearchQuery} />
			) : (
				<></>
			)}
			<TableHeader<T> {...props} onSort={handleSort} sortColumn={sortColumn} />
			<TableBody<T> {...props} data={filteredItems} />
		</table>
	)
}

export default Table
