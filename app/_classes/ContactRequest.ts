import Name from '@_classes/common/Name'

export default class ContactRequest {
	public name: Name = new Name()
	public phoneNumber: string = ''
	public emailAddress: string = ''
	public companyName: string = ''
	public message: string = ''

	constructor(partial?: Partial<ContactRequest>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties

			// Handle deep copying for nested objects
			if (partial.name) {
				this.name = new Name(partial.name)
			}
		}
	}
}
