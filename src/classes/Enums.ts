export enum TypeOfBusiness {
	Dentist,
	SurgeryCenter,
	Hospital,
	Veterinarian,
	Restaurant,
	Construction,
	Other,
}

export enum QuoteStatus {
	Unread,
	Read,
}

export enum NotificationType {
	Info,
	Warning,
	Error,
}

export enum AccountRole {
	Customer,
	Admin = 9999999,
}

export enum OrderStatus {
	Pending = 10,
	WaitingCustomerApproval = 12,
	Placed = 13,
	Processing = 20,
	Shipped = 30,
	Delivered = 40,
	Cancelled = 9999
}
