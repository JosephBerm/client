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
	Cancelled = 0,
	Pending = 100,
	WaitingCustomerApproval = 200,
	Placed = 300,
	Processing = 400,
	Shipped = 500,
	Delivered = 600,
}

export enum PublicRouteType
{
	Home,
	AboutUs,
	Store,
	Contact,
}
export enum InternalRouteType
{
	Dashboard,
	Orders,
	Store,
	Quotes,
	Providers,
	Accounts,
	Customers,
	Analytics,
	Profile,
}