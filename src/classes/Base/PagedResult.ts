export class PagedResult<T> {
    public page: number;
    public pageSize: number;
    public total: number;
    public totalPages: number;
    public hasNext: boolean;
    public hasPrevious: boolean;
    public nextPage: string | null;
    public previousPage: string | null;
    public firstPage: string;
    public lastPage: string;
    public pageCount: number = 0;
    public data: T[] = [];

    constructor(init: Partial<PagedResult<T>> = {}) {
        this.page = init.page ?? 1;
        this.pageSize = init.pageSize ?? 10;
        this.total = init.total ?? 0;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.hasNext = this.page < this.totalPages;
        this.hasPrevious = this.page > 1;
        this.nextPage = this.hasNext ? `?page=${this.page + 1}&pageSize=${this.pageSize}` : null;
        this.previousPage = this.hasPrevious ? `?page=${this.page - 1}&pageSize=${this.pageSize}` : null;
        this.firstPage = `?page=1&pageSize=${this.pageSize}`;
        this.lastPage = `?page=${this.totalPages}&pageSize=${this.pageSize}`;
        this.pageCount = Math.ceil(this.total / this.pageSize);
        this.data = init.data ?? [];
    }
}