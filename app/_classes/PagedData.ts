/**
 * PagedData Entity Class
 * 
 * Represents pagination parameters for legacy API endpoints.
 * Simple data model with page number, page size, and search query.
 * 
 * **Note:**
 * For new implementations, use `GenericSearchFilter` which provides
 * more robust pagination, sorting, and filtering capabilities.
 * 
 * **Features:**
 * - Page number (1-based)
 * - Page size (items per page)
 * - Search query string
 * 
 * **Related Classes:**
 * - GenericSearchFilter: Modern alternative with sorting and filters
 * - PagedResult: Response wrapper for paginated data
 * 
 * @example
 * ```typescript
 * // Basic pagination
 * const pagedData = new PagedData({
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // With search query
 * const searchData = new PagedData({
 *   page: 2,
 *   pageSize: 50,
 *   searchQuery: 'surgical mask'
 * });
 * 
 * // Use with legacy API endpoint
 * const response = await API.Store.Products.getList(pagedData);
 * const products = response.data.payload;
 * 
 * // Modern alternative (recommended for new code)
 * const filter = new GenericSearchFilter({
 *   page: 1,
 *   pageSize: 20,
 *   searchQuery: 'surgical mask',
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * const modernResponse = await API.Store.Products.search(filter);
 * ```
 * 
 * @module PagedData
 */

/**
 * PagedData Entity Class
 * 
 * Simple pagination model for legacy API endpoints.
 * Contains page number, page size, and optional search query.
 */
export class PagedData {
	/** Current page number (1-based indexing) */
	page: number = 1
	
	/** Number of items per page (default: 50) */
	pageSize: number = 50
	
	/** Optional search query string to filter results */
	searchQuery: string = ''

	/**
	 * Creates a new PagedData instance.
	 * Performs shallow copy of properties.
	 * 
	 * @param {Partial<PagedData>} partial - Partial paged data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Default pagination (page 1, 50 items)
	 * const data1 = new PagedData();
	 * 
	 * // Custom page and size
	 * const data2 = new PagedData({
	 *   page: 3,
	 *   pageSize: 100
	 * });
	 * 
	 * // With search query
	 * const data3 = new PagedData({
	 *   page: 1,
	 *   pageSize: 25,
	 *   searchQuery: 'N95 mask'
	 * });
	 * 
	 * // Pagination from user input
	 * const handlePageChange = (newPage: number) => {
	 *   const pagedData = new PagedData({
	 *     page: newPage,
	 *     pageSize: currentPageSize,
	 *     searchQuery: currentSearchQuery
	 *   });
	 *   fetchData(pagedData);
	 * };
	 * ```
	 */
	constructor(partial?: Partial<PagedData>) {
		if (partial) Object.assign(this, partial)
	}
}
