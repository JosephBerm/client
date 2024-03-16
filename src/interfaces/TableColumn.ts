export interface TableColumn<T> {
	path?: keyof T
	label?: string
	content?: (item: T) => JSX.Element
	key?: string
}

export interface TableProps<T> {
	columns: TableColumn<T>[]
	data: T[]
	onSort?: (sortColumn: SortColumn<T>) => void
	onDelete?: (id: string) => {}
	sortColumn: SortColumn<T>
}

export type SortColumn<T> = {
	path: keyof T
	order: 'asc' | 'desc'
}
