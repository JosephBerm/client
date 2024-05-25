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

    constructor(data: T[], page: number, pageSize: number, total: number) {
        this.page = page;
        this.pageSize = pageSize;
        this.total = total;
        this.totalPages = Math.ceil(total / pageSize);
        this.hasNext = page < this.totalPages;
        this.hasPrevious = page > 1;
        this.nextPage = this.hasNext ? `?page=${page + 1}&pageSize=${pageSize}` : null;
        this.previousPage = this.hasPrevious ? `?page=${page - 1}&pageSize=${pageSize}` : null;
        this.firstPage = `?page=1&pageSize=${pageSize}`;
        this.lastPage = `?page=${this.totalPages}&pageSize=${pageSize}`;
        this.pageCount = Math.ceil(total / pageSize);
        this.data = [...data];
    }
}