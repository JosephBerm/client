import Notification from '@/src/classes/Notification'
import Company from '@/classes/Company'
import Order from './Order'
import Address from './Address'
import Name from '@/classes/common/Name'

/**
 * Implementation of the server user class.
 */
export default class User {
	public readonly id: string | null = null
	public username: string = ''
	public password: string = ''

	public notifications: Notification[] = []
	public email: string = ''
	public name: Name = new Name()
	public dateOfBirth: Date | null = null
	public createdAt: Date = new Date()

	public shippingDetails: Address = new Address()

	public phone?: string
	public mobile?: string

	public role: number | null = null
	public customerId: number = -99
	public customer?: Company | null
	public orders?: Order[] = []
	public profilePicturePath?: string

	constructor(user: Partial<IUser>) {
		Object.assign(this, user)
	}
	// Method to update user details
	public updateDetails(details: Partial<IUser>): void {
		Object.assign(this, details)
	}

	// Method to add a notification
	public addNotification(notification: Notification): void {
		this.notifications.push(notification)
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
