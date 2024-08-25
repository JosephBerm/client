import { OrderStatus } from '@/classes/Enums'
export const OrderStatusName = {
	[OrderStatus.Pending]: 'Pending',
	[OrderStatus.WaitingCustomerApproval]: 'Awaiting Customer Approval',
	[OrderStatus.Placed]: 'Placed',
	[OrderStatus.Processing]: 'Processing',
	[OrderStatus.Shipped]: 'Shipped',
	[OrderStatus.Delivered]: 'Delivered',
	[OrderStatus.Cancelled]: 'Cancelled',
}

export const OrderStatusVariants = {
	[OrderStatus.Pending]: 'warning',
	[OrderStatus.WaitingCustomerApproval]: 'warning',
	[OrderStatus.Placed]: 'info',
	[OrderStatus.Processing]: 'warning', // Changed from 'primary' to 'info' to match the defined variants
	[OrderStatus.Shipped]: 'info',
	[OrderStatus.Delivered]: 'success',
	[OrderStatus.Cancelled]: 'error', // Changed from 'danger' to 'error' to match the defined variants
}
