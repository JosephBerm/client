import { HttpService } from '@/services/httpService'
import { AxiosRequestConfig } from 'axios'

import User, { SignupForm } from '@/classes/User'
import Order from '@/classes/Order'
import Quote from '@/classes/Quote'
import Company from '@/classes/Company'
import UploadedFile from '@/classes/UploadedFile'
import ContactRequest from '@/classes/ContactRequest'
import ProductsCategory from '@/classes/ProductsCategory'
import LoginCredentials from '@/classes/LoginCredentials'
import CustomerSummary from '@/classes/Base/CustomerSummary'

import { Product } from '@/classes/Product'
import { PagedResult } from '@/classes/Base/PagedResult'
import { GenericSearchFilter } from '@/classes/Base/GenericSearchFilter'
import { PagedData } from '@/classes/PagedData'

const API = {
	login: async (credentials: LoginCredentials) => await HttpService.post<any>('/account/login', credentials),
	signup: async (form: SignupForm) => await HttpService.post<any>('/account/signup', form),
	Accounts: {
		get: async <T>(id: string | null | undefined) => await HttpService.get<User>(`/account${id ? '/' + id : ''}`),
		update: async <T>(account: User) => await HttpService.put<T>('/account', account),
		changePassword: async <T>(oldPassword: string, newPassword: string) =>
			await HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),
		getAll: () => HttpService.get<User[]>('/account/all'),
		search: async (search: GenericSearchFilter) =>
			await HttpService.post<PagedResult<User>>(`/account/search`, search),
		getDashboardSummary: async () => await HttpService.get<CustomerSummary>('/account/analytics'),
	},
	Store: {
		Products: {
			getAllProducts: async <T>() => await HttpService.get<T>('/products'),
			getList: async <T>(pagedData: PagedData) => await HttpService.post<T>('/products/paged', pagedData),
			get: async (productId: string) => await HttpService.get<Product>(`/products/${productId}`),
			create: async (product: FormData) =>
				await HttpService.post<Product>(`/products`, product, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			update: async <T>(product: T) => await HttpService.put<T>(`/products`, product),
			delete: async <T>(productId: string) => await HttpService.delete<T>(`/products/${productId}`),
			getLastest: async (quantity: number = 6) =>
				await HttpService.get<Product[]>(`/products/lastest?quantity=${quantity}`),
			image: async (id: string, name: string) =>
				await HttpService.get(`/products/image?productId=${id}&image=${name}`),
			uploadImage: async (productId: string, formData: FormData) =>
				await HttpService.post<UploadedFile[]>(`/products/${productId}/images`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			deleteImage: async (id: string, name: string) =>
				await HttpService.delete<boolean>(`/products/${id}/image/${name}`),
			images: async (id: string) => await HttpService.get<File[]>(`/products/images?productId=${id}`),
			search: async (search: GenericSearchFilter) =>
				await HttpService.post<PagedResult<Product>>(`/Products/search`, search),
			searchPublic: async (search: GenericSearchFilter) =>
				await HttpService.post<PagedResult<Product>>(`/Products/search/public`, search),
			getAllCategories: async () => await HttpService.get<ProductsCategory[]>('/Products/categories/clean'),
		},
	},
	Quotes: {
		get: async <T>(id: string) => {
			return await HttpService.get<T>(`/quote/${id}`)
		},
		getAll: async <T>() => {
			return await HttpService.get<T>('/quote')
		},
		search: async (search: GenericSearchFilter) => {
			return await HttpService.post<PagedResult<Quote>>('/quote/search', search)
		},
		create: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
		update: async <T>(quote: T) => await HttpService.put<T>('/quote', quote),
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/quote/${quoteId}`),
	},
	Orders: {
		get: async <Order>(customerId?: number | null) => {
			return await HttpService.get<Order>(`/orders${customerId ? `/${customerId}` : ''}`)
		},
		getFromCustomer: async (customerId: number) => {
			return await HttpService.get<Order[]>(`/orders/fromcustomer/${customerId}`)
		},
		search: async (search: GenericSearchFilter) => {
			return await HttpService.post<PagedResult<Order>>('/orders/search', search)
		},
		create: async <Order>(quote: Order) => await HttpService.post<Order>('/orders', quote),
		createFromQuote: async <Order>(quoteId: string) =>
			await HttpService.post<Order>(`/orders/fromquote/${quoteId}`, null),
		update: async <Order>(quote: Order) => await HttpService.put<Order>('/orders', quote),
		delete: async <Boolean>(quoteId: number) => await HttpService.delete<Boolean>(`/orders/${quoteId}`),
	},
	Notifications: {
		get: async <T>(id: string) => {
			if (id !== null) {
				return await HttpService.get<T>(`/notifications/${id}`)
			} else {
				return await HttpService.get<T>('/notifications')
			}
		},
		create: async <T>(quote: T) => await HttpService.post<T>('/notifications', quote),
		update: async <T>(quote: T) => await HttpService.put<T>('/notifications', quote),
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/notifications/${quoteId}`),
	},
	Providers: {
		get: async <Provider>(id: number) => await HttpService.get<Provider>(`/provider/${id}`),
		getAll: async <Provider>() => await HttpService.get<Provider[]>('/providers'),
		create: async <Provider>(provider: Provider) => await HttpService.post<Provider>('/provider', provider),
		update: async <Provider>(quote: Provider) => await HttpService.put<Provider>('/provider', quote),
		delete: async (providerId: number) => await HttpService.delete<number>(`/provider/${providerId}`),
	},
	Public: {
		sendQuote: async (quote: Quote) => await HttpService.post<Quote>('/quote', quote),
		sendContactRequest: async (contactRequest: ContactRequest) =>
			await HttpService.post<any>('/contact', contactRequest),
	},
	Customers: {
		get: async <Customer>(id: number) => await HttpService.get<Customer>(`/customer/${id}`),
		getAll: async <Customer>() => await HttpService.get<Customer[]>('/customers'),
		create: async <Customer>(customer: Customer) => await HttpService.post<Customer>('/customer', customer),
		update: async <Customer>(quote: Customer) => await HttpService.put<Customer>('/customer', quote),
		delete: async (customerId: number) => await HttpService.delete<number>(`/customer/${customerId}`),
		search: async (search: GenericSearchFilter) =>
			await HttpService.post<PagedResult<Company>>(`/customers/search`, { data: { ...search } }),
	},
}

export default API
