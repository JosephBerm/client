'use client'

import React, { useState, useEffect } from 'react'
import { SearchTableProps, SortColumn } from '@/interfaces/Table'
import _ from 'lodash'
import '@/styles/tables.css'

import ServerTableHeader from '@/common/ServerTableHeader'
import Pagination from '@/common/pagination'
import InputTextBox from '@/components/InputTextBox'
import ServerTableBody from './ServerTableBody'
import { GenericSearchFilter } from '@/classes/Base/GenericSearchFilter'
import { PagedResult } from '../classes/Base/PagedResult'
const ServerTable = <T extends {}>(props: SearchTableProps<T>) => {

	const [pagedResult, setPagedResult] = useState<PagedResult<T>>(new PagedResult<T>())
	const [searchCriteria, setSearchCriteria] = useState<GenericSearchFilter>(props.searchCriteria ?? new GenericSearchFilter())
	const [searchQuery, setSearchQuery] = useState('')
	const [sortColumn, setSortColumn] = useState<SortColumn<any>>({
		path: 'name',
		order: 'asc',
	})

	useEffect(() => {
		handleRequestData()
	}, [])

	const handleSort = (sortColumn: SortColumn<any>) => {
		setSortColumn(sortColumn)
	}

	const handleSearchQuery = (searchValue: string) => {
		setSearchQuery(searchValue)
	}

	const tableSearch = (): JSX.Element => {
		return (
			<InputTextBox
				type='text'
				value={searchQuery}
				label='Search'
				handleChange={(e) => handleSearchQuery(e.currentTarget.value)}
			/>
		)
	}

	const handlePageChange = async (page: number) => {
		setSearchCriteria((prevSearchCriteria: GenericSearchFilter) => {
			prevSearchCriteria.page = page;
			return prevSearchCriteria;
		});

		await handleRequestData();
	}

	const handleRequestData = async () => {
		const res = await props.methodToQuery(searchCriteria)
		setPagedResult(res.data.payload)
	}


	const tablePagination = (): JSX.Element => {
		return (
			<Pagination
				onPageChange={handlePageChange}
				itemsCount={pagedResult.total ?? 0}
				currentPage={pagedResult.page}
				pageSize={pagedResult.pageSize}
			/>
		)
	}

	const tableTitle = (): JSX.Element => {
		if (props.title) return <caption>{props.title}</caption>

		return <></>
	}
	return (
		<div className='table-container relative flex flex-col items-end justify-center'>
			{tableSearch()}
			<table className='table-dark'>
				{tableTitle()}
				<ServerTableHeader<T> {...props} onSort={handleSort} sortColumn={sortColumn} />
				<ServerTableBody<T> {...props} data={pagedResult.data}/>
			</table>
			{tablePagination()}
		</div>
	)
}

export default ServerTable
