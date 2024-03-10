/**
 * Implementation of the server user class.
 */
export class User {
	public readonly id: number = 0
	public username: string = ''
	public password: string = ''

	public email: string = ''
	public firstName: string = ''
	public lastName: string = ''
	public dateOfBirth: Date | null = null
	public createdAt: Date | null = null

	public address?: string
	public city?: string
	public state?: string
	public zipCode?: string
	public country?: string

	public phone?: string
	public mobile?: string

	constructor(user: Partial<IUser>) {
		Object.assign(this, user)
	}
}

export interface IUser extends User {}