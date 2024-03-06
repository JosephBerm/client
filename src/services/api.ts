import baseInstance, { HttpService } from './httpService'
import axios, { AxiosResponse, AxiosError } from 'axios'

import LoginCredentials from '@/classes/LoginCredentials'
import SignupForm from '@/classes/SignupForm'

const httpService = new HttpService(baseInstance)

const API = {
	login: async (credentials: LoginCredentials) => await httpService.post<any>('/login', credentials),
	signup: async (form: SignupForm) => await httpService.post<any>('/signup', form),
}

export default API
