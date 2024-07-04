import Name from '@/classes/common/Name'

export default class ContactRequest {
	name: Name = new Name()
	phoneNumber: string = ''
	emailAddress: string = ''
	companyName: string = ''
	message: string = ''
}
