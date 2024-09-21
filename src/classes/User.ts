import Notification from '@/src/classes/Notification'
import Company from '@/classes/Company'
import Order from './Order'
import Address from '@/classes/common/Address'
import Name from '@/classes/common/Name'
import { RichConstructor } from '@/decorators/RichConstructor'

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

	public phone?: string
	public mobile?: string

	public role: number | null = null
	public customerId: number = -99
	public customer?: Company | null
	public orders?: Order[] = []
	public profilePicturePath?: string

	constructor(partial?: Partial<IUser>) {
		if (partial) {
			Object.assign(this, partial)
			// Handle deep copying for nested objects
			if (partial.notifications) {
				this.notifications = partial.notifications.map((n) => new Notification(n))
			}
			if (partial.name) {
				this.name = new Name(partial.name)
			}
			if (partial.dateOfBirth) {
				this.dateOfBirth = new Date(partial.dateOfBirth)
			}
			if (partial.customer) {
				this.customer = new Company(partial.customer)
			}
			if (partial.orders) {
				this.orders = partial.orders.map((o) => new Order(o))
			}
		}
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

	constructor(param?: Partial<PasswordForm>) {
		if (param) {
			Object.assign(this, param)
		}
	}
}

export class RegisterModel {
	public username: string = ''
	public email: string = ''
	public password: string = ''
	public name: Name = new Name()
	public dateOfBirth?: Date

	constructor(param?: Partial<RegisterModel>) {
		if (param) {
			Object.assign(this, param)
			if (param.name) {
				this.name = new Name(param.name)
			}
			if (param.dateOfBirth) {
				this.dateOfBirth = new Date(param.dateOfBirth)
			}
		}
	}
}

export interface IUser extends User {}
