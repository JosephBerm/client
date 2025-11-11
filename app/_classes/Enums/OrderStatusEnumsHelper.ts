import { OrderStatus } from '../Enums'
// EnumsHelper not needed - using modern TypeScript patterns

export interface OrderStatusListItem {
	display: string
	value: OrderStatus
}

export default class OrderStatusEnumsHelper {
	static enumList: OrderStatusListItem[] = [
		{
			display: 'Cancelled',
			value: OrderStatus.Cancelled,
		},
		{
			display: 'Pending',
			value: OrderStatus.Pending,
		},
		{
			display: 'Waiting For Customer Approval',
			value: OrderStatus.WaitingCustomerApproval,
		},
		{
			display: 'Placed',
			value: OrderStatus.Placed,
		},
		{
			display: 'Processing',
			value: OrderStatus.Processing,
		},
		{
			display: 'Shipped',
			value: OrderStatus.Shipped,
		},
		{
			display: 'Delivered',
			value: OrderStatus.Delivered,
		},
	]
}
