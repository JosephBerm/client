export default class SignupForm {
	constructor(
		public username: string = '',
		public email: string = '',
		public password: string = '',
		public firstName: string = '',
		public lastName: string = '',
		public dateOfBirth?: Date
	) {}
}
