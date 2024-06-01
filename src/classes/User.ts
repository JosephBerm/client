import Notification from '@/src/classes/Notification'
import Company from '@/classes/Company'
/**
 * Implementation of the server user class.
 */
export default class User {
	public readonly id: string | null = null
	public username: string = ''
	public password: string = ''

	public notifications: Notification[] = []
	public email: string = ''
	public firstName: string = ''
	public lastName: string = ''
	public dateOfBirth: Date | null = null
	public createdAt: Date = new Date()

	public address?: string
	public city?: string
	public state?: string
	public zipCode?: string
	public country?: string

	public phone?: string
	public mobile?: string

	public name: string = ''
	public role: number | null = null
	public customerId?: number | null
	public customer?: Company | null
	

	constructor(user: Partial<IUser>) {
		Object.assign(this, user)
	}
}

export class PasswordForm {
	oldPassword: string = ''
	newPassword: string = ''
	confirmNewPassword: string = ''
}

export class SignupForm {
	constructor(
		public username: string = '',
		public email: string = '',
		public password: string = '',
		public firstName: string = '',
		public lastName: string = '',
		public dateOfBirth?: Date
	) {}
}

export interface IUser extends User {}
