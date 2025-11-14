/**
 * Main API Client Service
 * 
 * Centralized API client that provides type-safe methods for all backend endpoints.
 * Organized by domain (Accounts, Products, Orders, Quotes, etc.) for easy navigation.
 * All methods use HttpService underneath for consistent authentication and error handling.
 * 
 * **Architecture Pattern:**
 * - Domain-driven organization (Accounts, Store, Orders, Quotes, etc.)
 * - Generic return types for flexibility
 * - Consistent method naming (get, getAll, create, update, delete, search)
 * - Type-safe with TypeScript
 * - Automatic JWT token injection via HttpService
 * 
 * **Domains:**
 * - **Accounts**: User management, authentication, profile updates
 * - **Store.Products**: Product catalog, images, categories
 * - **Quotes**: Quote/RFQ management
 * - **Orders**: Order processing and management
 * - **Notifications**: User notifications
 * - **Providers**: Supplier/provider management
 * - **Customers**: Customer/company management
 * - **Finance**: Financial analytics and reports
 * - **Public**: Public-facing endpoints (no auth required)
 * 
 * @example
 * ```typescript
 * import { API } from '@_shared';
 * 
 * // Get all products
 * const response = await API.Store.Products.getAllProducts();
 * const products = response.data.payload;
 * 
 * // Search users with pagination
 * const users = await API.Accounts.search({
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * 
 * // Create a new quote
 * const newQuote = await API.Quotes.create(quoteData);
 * ```
 * 
 * @module api
 */

import { HttpService } from './httpService'
import { AxiosRequestConfig } from 'axios'

import User, { RegisterModel } from '@_classes/User'
import Order from '@_classes/Order'
import Quote from '@_classes/Quote'
import Company from '@_classes/Company'
import UploadedFile from '@_classes/UploadedFile'
import FinanceNumbers from '@_classes/FinanceNumbers'
import ContactRequest from '@_classes/ContactRequest'
import ProductsCategory from '@_classes/ProductsCategory'
import LoginCredentials from '@_classes/LoginCredentials'
import CustomerSummary from '@_classes/Base/CustomerSummary'

import { Product } from '@_classes/Product'
import { PagedResult } from '@_classes/Base/PagedResult'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedData } from '@_classes/PagedData'
import { SubmitOrderRequest } from '@_classes/RequestClasses'
import FinanceSearchFilter from '@_classes/FinanceSearchFilter'

/**
 * Main API object with domain-organized endpoints.
 * Use AuthService for login/signup/logout operations.
 */
const API = {
	/** 
	 * Legacy login endpoint (prefer AuthService.login instead).
	 * @deprecated Use AuthService.login for better error handling
	 */
	login: async (credentials: LoginCredentials) => await HttpService.post<any>('/account/login', credentials),
	
	/** 
	 * Legacy signup endpoint (prefer AuthService.signup instead).
	 * @deprecated Use AuthService.signup for better error handling
	 */
	signup: async (form: RegisterModel) => await HttpService.post<any>('/account/signup', form),
	
	/**
	 * Account Management API
	 * Handles user accounts, profiles, passwords, and analytics.
	 */
	Accounts: {
		/**
		 * Gets current user account or specific account by ID.
		 * @param id - User ID (omit for current user)
		 * @returns User data
		 * @example
		 * API.Accounts.get(); // Current user
		 * API.Accounts.get('123'); // User by ID
		 */
		get: async <T>(id: string | null | undefined) => await HttpService.get<User>(`/account${id ? '/' + id : ''}`),
		
		/**
		 * Updates user account information.
		 * @param account - User object with updated data
		 */
		update: async <T>(account: User) => await HttpService.put<T>('/account', account),
		
		/**
		 * Changes password for current user.
		 * @param oldPassword - Current password
		 * @param newPassword - New password
		 */
		changePassword: async <T>(oldPassword: string, newPassword: string) =>
			await HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),
		
		/**
		 * Changes password for specific user (admin only).
		 * @param id - User ID
		 * @param oldPassword - Current password
		 * @param newPassword - New password
		 */
		changePasswordById: async <T>(id: string, oldPassword: string, newPassword: string) =>
			await HttpService.put<T>(`/account/changepasswordById`, { id, oldPassword, newPassword }),
		
		/**
		 * Gets all user accounts (admin only).
		 * @returns Array of all users
		 */
		getAll: () => HttpService.get<User[]>('/account/all'),
		
		/**
		 * Searches users with pagination and filtering.
		 * @param search - Search filter with page, pageSize, sortBy, etc.
		 * @returns Paginated user results
		 */
		search: async (search: GenericSearchFilter) =>
			await HttpService.post<PagedResult<User>>(`/account/search`, search),
		
		/**
		 * Gets dashboard analytics summary for current user.
		 * @returns Customer summary with orders, quotes, etc.
		 */
		getDashboardSummary: async () => await HttpService.get<CustomerSummary>('/account/analytics'),
		
		/**
		 * Deletes a user account (admin only).
		 * @param id - User ID to delete
		 * @returns Success status
		 */
		delete: async (id: string) => await HttpService.delete<boolean>(`/account/${id}`),
	},
	
	/**
	 * Store Management API
	 * Contains product catalog and inventory management.
	 */
	Store: {
		/**
		 * Product Management API
		 * CRUD operations for medical supply products.
		 */
		Products: {
			/**
			 * Gets all products (no pagination).
			 * Use search() for paginated results.
			 */
			getAllProducts: async () => await HttpService.get<Product[]>('/products'),
			
			/**
			 * Gets paginated product list.
			 * @param pagedData - Pagination parameters
			 */
			getList: async (pagedData: PagedData) => await HttpService.post<Product[]>('/products/paged', pagedData),
			
			/**
			 * Gets a single product by ID.
			 * @param productId - Product ID
			 */
			get: async (productId: string) => await HttpService.get<Product>(`/products/${productId}`),
			
			/**
			 * Creates a new product with image upload.
			 * @param product - FormData containing product data and images
			 * @example
			 * const formData = new FormData();
			 * formData.append('name', 'Surgical Mask');
			 * formData.append('price', '9.99');
			 * formData.append('file', imageFile);
			 * await API.Store.Products.create(formData);
			 */
			create: async (product: FormData) =>
				await HttpService.post<Product>(`/products`, product, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			
			/**
			 * Updates an existing product.
			 * @param product - Product object with updated data
			 */
			update: async <T>(product: T) => await HttpService.put<T>(`/products`, product),
			
			/**
			 * Deletes a product.
			 * @param productId - Product ID to delete
			 */
			delete: async <T>(productId: string) => await HttpService.delete<T>(`/products/${productId}`),
			
			/**
			 * Gets latest products for home page display.
			 * @param quantity - Number of products to return (default: 6)
			 */
			getLatest: async (quantity: number = 6) =>
				await HttpService.get<Product[]>(`/products/latest?quantity=${quantity}`),
			
			/**
			 * Gets a product image by ID and filename.
			 * @param id - Product ID
			 * @param name - Image filename
			 */
			image: async (id: string, name: string) =>
				await HttpService.get(`/products/image?productId=${id}&image=${name}`),
			
			/**
			 * Uploads additional images to an existing product.
			 * @param productId - Product ID
			 * @param formData - FormData containing image files
			 */
			uploadImage: async (productId: string, formData: FormData) =>
				await HttpService.post<UploadedFile[]>(`/products/${productId}/images`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			
			/**
			 * Deletes a product image.
			 * @param id - Product ID
			 * @param name - Image filename to delete
			 */
			deleteImage: async (id: string, name: string) =>
				await HttpService.delete<boolean>(`/products/${id}/image/${name}`),
			
			/**
			 * Gets all images for a product.
			 * @param id - Product ID
			 */
			images: async (id: string) => await HttpService.get<File[]>(`/products/images?productId=${id}`),
			
			/**
			 * Searches products with pagination and filtering (admin).
			 * @param search - Search filter with page, pageSize, filters, etc.
			 */
			search: async (search: GenericSearchFilter) =>
				await HttpService.post<PagedResult<Product>>(`/Products/search`, search),
			
			/**
			 * Searches products with pagination and filtering (public).
			 * No authentication required.
			 * @param search - Search filter
			 */
			searchPublic: async (search: GenericSearchFilter) =>
				await HttpService.post<PagedResult<Product>>(`/Products/search/public`, search),
			
			/**
			 * Gets all product categories.
			 * @returns Array of product categories
			 */
			getAllCategories: async () => await HttpService.get<ProductsCategory[]>('/Products/categories/clean'),
		},
	},
	
	/**
	 * Quote Management API
	 * Handles quote requests (RFQs) from customers.
	 */
	Quotes: {
		/**
		 * Gets a single quote by ID.
		 * @param id - Quote ID
		 */
		get: async <T>(id: string) => {
			return await HttpService.get<T>(`/quote/${id}`)
		},
		
		/**
		 * Gets all quotes.
		 */
		getAll: async <T>() => {
			return await HttpService.get<T>('/quote')
		},
		
		/**
		 * Gets latest quotes for dashboard display.
		 * @param quantity - Number of quotes to return (default: 6)
		 */
		getLatest: async (quantity: number = 6) => {
			return await HttpService.get<Quote[]>(`/quote/latest?quantity=${quantity}`)
		},
		
		/**
		 * Searches quotes with pagination and filtering.
		 * @param search - Search filter
		 */
		search: async (search: GenericSearchFilter) => {
			return await HttpService.post<PagedResult<Quote>>('/quote/search', search)
		},
		
		/**
		 * Creates a new quote request.
		 * @param quote - Quote data
		 */
		create: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
		
		/**
		 * Updates an existing quote.
		 * @param quote - Quote with updated data
		 */
		update: async <T>(quote: T) => await HttpService.put<T>('/quote', quote),
		
		/**
		 * Deletes a quote.
		 * @param quoteId - Quote ID to delete
		 */
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/quote/${quoteId}`),
	},
	
	/**
	 * Order Management API
	 * Handles order processing, approval, and fulfillment.
	 */
	Orders: {
		/**
		 * Gets a single order by ID or current user's orders.
		 * @param orderId - Order ID (omit for current user's orders)
		 */
		get: async <Order>(orderId?: number | null) => {
			return await HttpService.get<Order>(`/orders${orderId ? `/${orderId}` : ''}`)
		},
		
		/**
		 * Gets all orders for a specific customer.
		 * @param customerId - Customer ID
		 */
		getFromCustomer: async (customerId: number) => {
			return await HttpService.get<Order[]>(`/orders/fromcustomer/${customerId}`)
		},
		
		/**
		 * Searches orders with pagination and filtering.
		 * @param search - Search filter
		 */
		search: async (search: GenericSearchFilter) => {
			return await HttpService.post<PagedResult<Order>>('/orders/search', search)
		},
		
		/**
		 * Creates a new order.
		 * @param quote - Order data
		 */
		create: async <Order>(quote: Order) => await HttpService.post<Order>('/orders', quote),
		
		/**
		 * Creates an order from an existing quote.
		 * @param quoteId - Quote ID to convert to order
		 */
		createFromQuote: async <Order>(quoteId: string) =>
			await HttpService.post<Order>(`/orders/fromquote/${quoteId}`, null),
		
		/**
		 * Updates an existing order.
		 * @param quote - Order with updated data
		 */
		update: async <Order>(quote: Order) => await HttpService.put<Order>('/orders', quote),
		
		/**
		 * Deletes an order.
		 * @param quoteId - Order ID to delete
		 */
		delete: async <Boolean>(quoteId: number) => await HttpService.delete<Boolean>(`/orders/${quoteId}`),
		
		/**
		 * Submits a quote to customer.
		 * @param req - Submit request data
		 */
		submitQuote: async <Boolean>(req: SubmitOrderRequest) =>
			await HttpService.post<Boolean>(`/orders/submit/quote`, req),
		
		/**
		 * Submits an invoice to customer.
		 * @param req - Submit request data
		 */
		submitInvoice: async <Boolean>(req: SubmitOrderRequest) =>
			await HttpService.post<Boolean>(`/orders/submit/invoice`, req),
		
		/**
		 * Approves an order (moves to processing).
		 * @param orderId - Order ID to approve
		 */
		approveOrder: async (orderId: string) => await HttpService.post<boolean>(`/orders/approve/${orderId}`, null),
		
		/**
		 * Removes a product from an order.
		 * @param orderId - Order ID
		 * @param productId - Product ID to remove
		 */
		deleteProduct: async (orderId: string, productId: number) =>
			await HttpService.delete<boolean>(`/orders/${orderId}/product/${productId}`),
	},
	
	/**
	 * Notification Management API
	 * User notifications and alerts.
	 */
	Notifications: {
		/**
		 * Gets notifications (all or by ID).
		 * @param id - Notification ID (omit for all notifications)
		 */
		get: async <T>(id: string) => {
			if (id !== null) {
				return await HttpService.get<T>(`/notifications/${id}`)
			} else {
				return await HttpService.get<T>('/notifications')
			}
		},
		
		/**
		 * Creates a new notification.
		 * @param quote - Notification data
		 */
		create: async <T>(quote: T) => await HttpService.post<T>('/notifications', quote),
		
		/**
		 * Updates a notification.
		 * @param quote - Notification with updated data
		 */
		update: async <T>(quote: T) => await HttpService.put<T>('/notifications', quote),
		
		/**
		 * Deletes a notification.
		 * @param quoteId - Notification ID to delete
		 */
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/notifications/${quoteId}`),
	},
	
	/**
	 * Provider/Supplier Management API
	 * Manages medical supply providers and suppliers.
	 */
	Providers: {
		/**
		 * Gets a single provider by ID.
		 * @param id - Provider ID
		 */
		get: async <Provider>(id: number) => await HttpService.get<Provider>(`/provider/${id}`),
		
		/**
		 * Gets all providers.
		 */
		getAll: async <Provider>() => await HttpService.get<Provider[]>('/providers'),
		
		/**
		 * Creates a new provider.
		 * @param provider - Provider data
		 */
		create: async <Provider>(provider: Provider) => await HttpService.post<Provider>('/provider', provider),
		
		/**
		 * Updates an existing provider.
		 * @param quote - Provider with updated data
		 */
		update: async <Provider>(quote: Provider) => await HttpService.put<Provider>('/provider', quote),
		
		/**
		 * Deletes a provider.
		 * @param providerId - Provider ID to delete
		 */
		delete: async (providerId: number) => await HttpService.delete<number>(`/provider/${providerId}`),
	},
	
	/**
	 * Public API Endpoints
	 * No authentication required. Used for public-facing forms.
	 */
	Public: {
		/**
		 * Submits a quote request from public website.
		 * @param quote - Quote request data
		 */
		sendQuote: async (quote: Quote) => await HttpService.post<Quote>('/quote', quote),
		
		/**
		 * Submits a contact form request from public website.
		 * @param contactRequest - Contact form data
		 */
		sendContactRequest: async (contactRequest: ContactRequest) =>
			await HttpService.post<any>('/contact', contactRequest),
	},
	
	/**
	 * Customer/Company Management API
	 * Manages customer accounts and companies.
	 */
	Customers: {
		/**
		 * Gets a single customer by ID.
		 * @param id - Customer ID
		 */
		get: async <Customer>(id: number) => await HttpService.get<Customer>(`/customer/${id}`),
		
		/**
		 * Gets all customers.
		 */
		getAll: async <Customer>() => await HttpService.get<Customer[]>('/customers'),
		
		/**
		 * Creates a new customer.
		 * @param customer - Customer data
		 */
		create: async <Customer>(customer: Customer) => await HttpService.post<Customer>('/customer', customer),
		
		/**
		 * Updates an existing customer.
		 * @param quote - Customer with updated data
		 */
		update: async <Customer>(quote: Customer) => await HttpService.put<Customer>('/customer', quote),
		
		/**
		 * Deletes a customer.
		 * @param customerId - Customer ID to delete
		 */
		delete: async (customerId: number) => await HttpService.delete<number>(`/customer/${customerId}`),
		
		/**
		 * Searches customers with pagination and filtering.
		 * @param search - Search filter
		 */
		search: async (search: GenericSearchFilter) =>
			await HttpService.post<PagedResult<Company>>(`/customers/search`, { data: { ...search } }),
	},
	
	/**
	 * Finance and Analytics API
	 * Financial reports, analytics, and data exports.
	 */
	Finance: {
		/**
		 * Gets current finance analytics numbers.
		 * @returns Financial summary data
		 */
		getFinanceNumbers: async () => await HttpService.get<FinanceNumbers>('/finance/analytics'),
		
		/**
		 * Searches finance numbers with date range filtering.
		 * @param search - Finance search filter with date range
		 */
		searchFinnanceNumbers: async (search: FinanceSearchFilter) =>
			await HttpService.post<FinanceNumbers>('/finance/analytics/search', search),
		
		/**
		 * Downloads finance data as Excel/CSV file.
		 * @param search - Finance search filter for export
		 * @returns Blob for file download
		 * @example
		 * const response = await API.Finance.downloadFinanceNumbers(filter);
		 * const url = window.URL.createObjectURL(response.data);
		 * const link = document.createElement('a');
		 * link.href = url;
		 * link.download = 'finance-report.xlsx';
		 * link.click();
		 */
		downloadFinanceNumbers: async (search: FinanceSearchFilter) =>
			await HttpService.download<Blob>('/finance/orders/download', search, { responseType: 'blob' }),
	},
}

export default API

