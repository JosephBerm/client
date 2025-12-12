/**
 * Server-side store data fetching exports
 * 
 * These functions are marked with 'server-only' and can only
 * be imported in Server Components.
 */
export {
	fetchProductsServer,
	fetchCategoriesServer,
	fetchInitialStoreData,
	type StoreSearchParams,
	type InitialStoreData,
	type SerializedProduct,
	type SerializedPagedResult,
	type SerializedCategory,
} from './fetchStoreData'

// Featured products for home page (cached)
export { fetchFeaturedProducts } from './fetchFeaturedProducts'

