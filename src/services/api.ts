import LoginCredentials from '@/classes/LoginCredentials'
import baseInstance, { HttpService } from './httpService'
import axios, { AxiosResponse, AxiosError } from 'axios'

const httpService = new HttpService(baseInstance)

const API = {
	login: async (credentials: LoginCredentials) => await httpService.post<any>('/dashboard/docs', credentials),
}

export default API
