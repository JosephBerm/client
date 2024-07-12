export class GenericSearchFilter {
    constructor(
        partial?: Partial<GenericSearchFilter>
    ) {
        this.page = partial?.page ?? 1;
        this.pageSize = partial?.pageSize ?? 5;
        this.sortBy = partial?.sortBy;
        this.sortOrder = partial?.sortOrder ?? "asc";
        this.filters = partial?.filters ?? {};
        this.includes = partial?.includes ?? [];
    }

    public page: number;
    public pageSize: number;
    public sortBy?: string;
    public sortOrder: string;
    public filters: Record<string, string>;
    public includes: string[];

    public add(key: string, value: string): void {
        this.filters[key] = value;
    }
}