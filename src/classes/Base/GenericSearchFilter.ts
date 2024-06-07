export class GenericSearchFilter {
    public constructor(
        public page: number = 1, 
        public pageSize: number = 10, 
        public sortBy?: string, 
        public sortOrder: string = "asc", 
        public filters: Record<string, string> = {}, 
        public includes: string[] = [] // Must match property in the server class. Exactly (case sensitive.)
    ) {}

    public add(key: string, value: string): void {
        this.filters[key] = value;
    }
}