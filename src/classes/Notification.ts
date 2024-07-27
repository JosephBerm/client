import User, { IUser } from '@/classes/User'
import { NotificationType } from '@/classes/Enums'

export default class Notification {
	public readonly id: string = ''
	public message: string = ''
	public type: NotificationType = NotificationType.Info
	public linkUrl?: string = ''
	public read: boolean = false
	public readAt?: Date | null = null
	public createdAt: Date = new Date()
	public updatedAt?: Date | null = null
	public userId: number = 0

	constructor(param?: Partial<Notification>) {
		if (param) {
			Object.assign(this, param)
			// Handle deep copying for Date objects
			if (param.readAt) {
				this.readAt = new Date(param.readAt)
			}
			if (param.createdAt) {
				this.createdAt = new Date(param.createdAt)
			}
			if (param.updatedAt) {
				this.updatedAt = new Date(param.updatedAt)
			}
		}
	}
}
