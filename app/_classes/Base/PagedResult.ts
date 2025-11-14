/**
 * Generic class for handling paginated data from server-side endpoints.
 * Provides pagination metadata and navigation links for efficient data fetching.
 * 
 * @template T - The type of data items in the paginated result
 * 
 * @example
 * ```typescript
 * // Create a paged result for products
 * const result = new PagedResult<Product>({
 *   page: 1,
 *   pageSize: 10,
 *   total: 150,
 *   data: productsArray
 * });
 * 
 * console.log(result.hasNext); // true (more pages available)
 * console.log(result.nextPage); // "?page=2&pageSize=10"
 * ```
 */
export class PagedResult<T> {
    /** Current page number (1-based index) */
    public page: number;
    
    /** Number of items per page */
    public pageSize: number;
    
    /** Total number of items across all pages */
    public total: number;
    
    /** Total number of pages available */
    public totalPages: number;
    
    /** Whether there is a next page available */
    public hasNext: boolean;
    
    /** Whether there is a previous page available */
    public hasPrevious: boolean;
    
    /** Query string for the next page, or null if no next page */
    public nextPage: string | null;
    
    /** Query string for the previous page, or null if no previous page */
    public previousPage: string | null;
    
    /** Query string for the first page */
    public firstPage: string;
    
    /** Query string for the last page */
    public lastPage: string;
    
    /** Total number of pages (duplicate of totalPages for legacy support) */
    public pageCount: number = 0;
    
    /** Array of data items for the current page */
    public data: T[] = [];

    /**
     * Creates a new PagedResult instance with pagination metadata.
     * Automatically calculates pagination properties based on page, pageSize, and total.
     * 
     * @param {Partial<PagedResult<T>>} init - Partial initialization object
     * @param {number} init.page - Current page number (defaults to 1)
     * @param {number} init.pageSize - Items per page (defaults to 10)
     * @param {number} init.total - Total number of items (defaults to 0)
     * @param {T[]} init.data - Array of data items (defaults to empty array)
     * 
     * @example
     * ```typescript
     * // Create with default values
     * const result1 = new PagedResult<Product>();
     * 
     * // Create with custom values
     * const result2 = new PagedResult<Order>({
     *   page: 2,
     *   pageSize: 20,
     *   total: 500,
     *   data: ordersArray
     * });
     * ```
     */
    constructor(init: Partial<PagedResult<T>> = {}) {
        // Set page number (1-based), default to first page
        this.page = init.page ?? 1;
        
        // Set page size, default to 10 items per page
        this.pageSize = init.pageSize ?? 10;
        
        // Set total number of items
        this.total = init.total ?? 0;
        
        // Calculate total pages by dividing total items by page size (rounded up)
        this.totalPages = Math.ceil(this.total / this.pageSize);
        
        // Check if there are more pages after the current one
        this.hasNext = this.page < this.totalPages;
        
        // Check if there are pages before the current one
        this.hasPrevious = this.page > 1;
        
        // Generate next page query string if available
        this.nextPage = this.hasNext ? `?page=${this.page + 1}&pageSize=${this.pageSize}` : null;
        
        // Generate previous page query string if available
        this.previousPage = this.hasPrevious ? `?page=${this.page - 1}&pageSize=${this.pageSize}` : null;
        
        // Generate first page query string
        this.firstPage = `?page=1&pageSize=${this.pageSize}`;
        
        // Generate last page query string
        this.lastPage = `?page=${this.totalPages}&pageSize=${this.pageSize}`;
        
        // Set pageCount (duplicate for legacy compatibility)
        this.pageCount = Math.ceil(this.total / this.pageSize);
        
        // Set data array
        this.data = init.data ?? [];
    }
}
