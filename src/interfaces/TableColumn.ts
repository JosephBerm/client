export interface TableColumn<T> {
	path?: keyof T
	label?: string
	content?: (item: T) => JSX.Element
	key?: string
}

export interface TableProps {
	columns: TableColumn<any>[]
	data: any[]
	title?: string
	isSearchable?: Boolean
	isSortable?: Boolean
	isPaged?: Boolean
	onSort?: (sortColumn: SortColumn<any>) => void
	sortColumn?: SortColumn<any>
}

export type SortColumn<T> = {
	path: keyof T
	order: 'asc' | 'desc'
}
