import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { getCookies, deleteCookie } from 'cookies-next'

const baseInstance: AxiosInstance = axios.create({
	baseURL: process.env.API_URL,
	timeout: 5000,
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

export default baseInstance

export class HttpService {
	private readonly instance: AxiosInstance

	constructor(instance: AxiosInstance) {
		this.instance = instance
	}

	public async get<T>(url: string): Promise<AxiosResponse<T>> {
		return this.instance.get<T>(url)
	}

	public async post<T>(url: string, data: any): Promise<AxiosResponse<T>> {
		return this.instance.post<T>(url, data)
	}

	// Add other HTTP methods as needed
}
