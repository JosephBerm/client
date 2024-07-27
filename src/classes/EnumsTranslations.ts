import {OrderStatus} from '@/classes/Enums';
export const OrderStatusName = {
    [OrderStatus.Pending]: 'Pending',
    [OrderStatus.WaitingCustomerApproval]: 'Waiting Customer Approval',
    [OrderStatus.Placed]: 'Placed',
    [OrderStatus.Processing]: 'Processing',
    [OrderStatus.Shipped]: 'Shipped',
    [OrderStatus.Delivered]: 'Delivered',
    [OrderStatus.Cancelled]: 'Cancelled',
};
