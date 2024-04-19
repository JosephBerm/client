import { HttpService } from './httpService'

import LoginCredentials from '@/classes/LoginCredentials'
import User, { SignupForm } from '@/classes/User'

const API = {
	login: async (credentials: LoginCredentials) => await HttpService.post<any>('/account/login', credentials),
	signup: async (form: SignupForm) => await HttpService.post<any>('/account/signup', form),
	Accounts: {
		get: async <T>(id: string | null | undefined) => await HttpService.get<User>(`/account${id ? '/' + id : ''}`),
		update: async <T>(account: User) => await HttpService.put<T>('/account', account),
		changePassword: async <T>(oldPassword: string, newPassword: string) =>
			await HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),
		getAll: () => HttpService.get<User[]>('/account/all'),
	},
	Store: {
		Products: {
			getList: async <T>() => await HttpService.get<T>('/products'),
			get: async <T>(productId: string) => await HttpService.get<T>(`/products/${productId}`),
			create: async <T>(product: T) => await HttpService.post<T>(`/products`, product),
			update: async <T>(product: T) => await HttpService.put<T>(`/products`, product),
			delete: async <T>(productId: string) => await HttpService.delete<T>(`/products/${productId}`),
		},
	},
	Quote: {
		get: async <T>(id: string | null) => {
			if (id !== null) {
				return await HttpService.get<T>(`/quote/${id}`)
			} else {
				return await HttpService.get<T>('/quote')
			}
		},
		create: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
		update: async <T>(quote: T) => await HttpService.put<T>('/quote', quote),
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/quote/${quoteId}`),
	},
	Orders: {
		get: async <Order>(id: number | null) => {
			if (id !== null) {
				return await HttpService.get<Order>(`/orders/${id}`)
			} else {
				return await HttpService.get<Order>('/orders')
			}
		},
		create: async <Order>(quote: Order) => await HttpService.post<Order>('/orders', quote),
		createFromQuote: async <Order>(quoteId: string) => await HttpService.post<Order>(`/orders/fromquote/${quoteId}`, null),
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
		sendQuote: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
	},
	Customers: {
		get: async <Customer>(id: number) => await HttpService.get<Customer>(`/customer/${id}`),
		getAll: async <Customer>() => await HttpService.get<Customer[]>('/customers'),
		create: async <Customer>(customer: Customer) => await HttpService.post<Customer>('/customer', customer),
		update: async <Customer>(quote: Customer) => await HttpService.put<Customer>('/customer', quote),
		delete: async (customerId: number) => await HttpService.delete<number>(`/customer/${customerId}`),
	}
}

export default API
