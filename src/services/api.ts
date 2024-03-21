import { HttpService } from './httpService'

import LoginCredentials from '@/classes/LoginCredentials'
import SignupForm from '@/classes/SignupForm'
import { User } from '../classes/User'

const API = {
	login: async (credentials: LoginCredentials) => await HttpService.post<any>('/account/login', credentials),
	signup: async (form: SignupForm) => await HttpService.post<any>('/account/signup', form),
	account: {
		get: async <T>(id: string | null | undefined) => await HttpService.get<User>(`/account${id ? "/" + id : ''}`),
		update: async <T>(account: User) => await HttpService.put<T>('/account', account),
		changePassword: async <T>(oldPassword: string, newPassword: string) => await HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),
		getAll: () => HttpService.get<User[]>('/account/all'),
	},
	store: {
		products: {
			getList: async <T>() => await HttpService.get<T>('/products'),
			get: async <T>(productId: string) => await HttpService.get<T>(`/products/${productId}`),
			create: async <T>(product: T) => await HttpService.post<T>(`/products`, product),
			update: async <T>(product: T) => await HttpService.put<T>(`/products`, product),
			delete: async <T>(productId: string) => await HttpService.delete<T>(`/products/${productId}`),
		},
	},
	quote: {
		get: async <T>(id: string | null) => {
			if (id !== null) {
				return await HttpService.get<T>(`/quote/${id}`);
			} else {
				return await HttpService.get<T>('/quote');
			}
		},
		create: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
		update: async <T>(quote: T) => await HttpService.put<T>('/quote', quote),
		delete: async <T>(quoteId: string) => await HttpService.delete<T>(`/quote/${quoteId}`),
	},
	public: {
		sendQuote: async <T>(quote: T) => await HttpService.post<T>('/quote', quote),
	}
}

export default API
