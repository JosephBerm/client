import baseInstance, { HttpService } from './httpService'
import axios, { AxiosResponse, AxiosError } from 'axios'

import LoginCredentials from '@/classes/LoginCredentials'
import SignupForm from '@/classes/SignupForm'

const API = {
	login: async (credentials: LoginCredentials) => await baseInstance.post<any>('/account/login', credentials),
	signup: async (form: SignupForm) => await baseInstance.post<any>('/account/signup', form),
	store: {
		products: {
			getList: async <T>() => await HttpService.get<T>('/products'),
			get: async <T>(productId: string) => await HttpService.get<T>(`/products/${productId}`),
			create: async <T>(product: T) => await HttpService.post<T>(`/products`, product),
			update: async <T>(product: T) => await HttpService.put<T>(`/products`, product),
			delete: async <T>(productId: string) => await HttpService.delete<T>(`/products/${productId}`),
		},
	},
}

export default API
