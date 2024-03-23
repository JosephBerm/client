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
}
