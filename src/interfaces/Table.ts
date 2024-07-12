import { PagedResult } from "../classes/Base/PagedResult"

export interface TableColumn<T> {
	name?: keyof T
	label?: string
	content?: (item: T) => JSX.Element
	key?: string
}

export interface TableProps<T> {
	columns: TableColumn<T>[]
	data: T[]
	title?: string
	isSearchable?: Boolean
	isSortable?: Boolean
	isPaged?: Boolean
	onSort?: (sortColumn: SortColumn<T>) => void
	sortColumn?: SortColumn<T>
	cssRowClass?: (item: T) => string
	onRowClick?: (item: T) => void
	pagedResult?: PagedResult<T>
}

export interface SearchTableProps<T> {
	columns: TableColumn<T>[]
	title?: string
	onSort?: (sortColumn: SortColumn<T>) => void
	sortColumn?: SortColumn<T>
	cssRowClass?: (item: T) => string
	onRowClick?: (item: T) => void
	methodToQuery: Function
}


export type SortColumn<T> = {
	path: keyof T
	order: 'asc' | 'desc'
}
