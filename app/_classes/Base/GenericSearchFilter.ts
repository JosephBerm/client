export class GenericSearchFilter {
	public page: number = 1
	public pageSize: number = 10
	public sortBy?: string | null = null
	public sortOrder: 'asc' | 'desc' = 'asc'
	public filters: Record<string, string> = {}
	public includes: string[] = []
	constructor(partial?: Partial<GenericSearchFilter>) {
		Object.assign(this, partial)
	}

	public add(key: string, value: string): void {
		this.filters[key] = value
	}

	public clear(key: string): void {
		delete this.filters[key]
	}
}
