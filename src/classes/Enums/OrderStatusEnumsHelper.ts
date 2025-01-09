import { OrderStatus } from '../Enums'
import EnumsHelper, { ToListItems } from '@/helpers/EnumsHelper'

export default class OrderStatusEnumsHelper extends EnumsHelper<OrderStatus> {
	static enumList: ToListItems<OrderStatus>[] = [
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

	constructor() {
		super(OrderStatusEnumsHelper.enumList)
	}
}
