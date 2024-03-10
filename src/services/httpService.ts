import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { getCookies, deleteCookie } from 'cookies-next'

const baseInstance: AxiosInstance = axios.create({
	baseURL: process.env.API_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
})

baseInstance.interceptors.request.use((config) => {
	const cookies = getCookies()
	const token = cookies['at']

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

baseInstance.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response) {
			// const { status } = error.response
			// if (status === 401) {
			// 	deleteCookie('at')
			// 	window.location.reload()
			// }
		} else {
			console.error('Network Error:', error)
			// Log to the logger
			// Toast network error
		}
		return Promise.reject(error)
	}
)

export default baseInstance

interface Response<T> {
	payload: T | null
	message: string | null
	statusCode: number
}

export class HttpService {
	private static readonly instance: AxiosInstance = baseInstance

	public static get<T>(url: string): Promise<AxiosResponse<Response<T>>> {
		return HttpService.instance.get<Response<T>>(url)
	}

	public static post<T>(url: string, data: any): Promise<AxiosResponse<Response<T>>> {
		return HttpService.instance.post<Response<T>>(url, data)
	}

	public static put<T>(url: string, data: any): Promise<AxiosResponse<Response<T>>> {
		return HttpService.instance.put<Response<T>>(url, data)
	}

	public static delete<T>(url: string, data: any = null): Promise<AxiosResponse<Response<T>>> {
		return HttpService.instance.delete<Response<T>>(url, data)
	}

	// Add other HTTP methods as needed
}
