import { RichConstructor } from '@/decorators/RichConstructor'

export default class LoginCredentials {
	public username: string = ''
	public password: string = ''
	public rememberUser: boolean = false

	constructor(partial?: Partial<LoginCredentials>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
