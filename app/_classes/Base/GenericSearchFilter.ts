/**
 * Generic search filter for server-side queries with pagination, sorting, and filtering.
 * Used across the application for standardized API search requests.
 * 
 * @example
 * ```typescript
 * // Create a basic search filter
 * const filter = new GenericSearchFilter({
 *   page: 1,
 *   pageSize: 20,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * });
 * 
 * // Add custom filters
 * filter.add('status', 'active');
 * filter.add('category', 'medical');
 * 
 * // Include related entities
 * filter.includes = ['orders', 'customer'];
 * ```
 */
export class GenericSearchFilter {
	/** Current page number (1-based index, default: 1) */
	public page: number = 1
	
	/** Number of items per page (default: 10) */
	public pageSize: number = 10
	
	/** Field name to sort by (e.g., 'createdAt', 'name') */
	public sortBy?: string | null = null
	
	/** Sort order: ascending or descending (default: 'asc') */
	public sortOrder: 'asc' | 'desc' = 'asc'
	
	/** Dictionary of custom filters (key-value pairs sent to backend) */
	public filters: Record<string, string> = {}
	
	/** Array of related entities to include in the response (e.g., ['orders', 'customer']) */
	public includes: string[] = []
	
	/**
	 * Creates a new GenericSearchFilter instance.
	 * 
	 * @param {Partial<GenericSearchFilter>} partial - Optional partial initialization object
	 * 
	 * @example
	 * ```typescript
	 * const filter = new GenericSearchFilter({
	 *   page: 2,
	 *   pageSize: 50,
	 *   sortBy: 'name',
	 *   sortOrder: 'asc'
	 * });
	 * ```
	 */
	constructor(partial?: Partial<GenericSearchFilter>) {
		Object.assign(this, partial)
	}

	/**
	 * Adds a custom filter to the search query.
	 * Multiple filters can be added and will be sent to the backend as query parameters.
	 * 
	 * @param {string} key - The filter key/field name
	 * @param {string} value - The filter value
	 * 
	 * @example
	 * ```typescript
	 * filter.add('status', 'pending');
	 * filter.add('customerId', '123');
	 * // Filters: { status: 'pending', customerId: '123' }
	 * ```
	 */
	public add(key: string, value: string): void {
		this.filters[key] = value
	}

	/**
	 * Removes a filter from the search query.
	 * 
	 * @param {string} key - The filter key to remove
	 * 
	 * @example
	 * ```typescript
	 * filter.add('status', 'pending');
	 * filter.clear('status'); // Removes the status filter
	 * ```
	 */
	public clear(key: string): void {
		delete this.filters[key]
	}
}
