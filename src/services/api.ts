import baseInstance, { HttpService } from './httpService'
import axios, { AxiosResponse, AxiosError } from 'axios'

import LoginCredentials from '@/classes/LoginCredentials'
import SignupForm from '@/classes/SignupForm'

const httpService = new HttpService(baseInstance)

const API = {
	login: async (credentials: LoginCredentials) => await baseInstance.post<any>('/account/login', credentials),
	signup: async (form: SignupForm) => await baseInstance.post<any>('/account/signup', form)
}

export default API
