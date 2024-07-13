export class PagedData {
	page: number = 1
	pageSize: number = 50
	searchQuery: string = ''

	constructor(partial?: Partial<PagedData>) {
		if (partial) Object.assign(this, partial)
	}
}
