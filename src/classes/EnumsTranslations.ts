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

export const OrderStatusVariants = {
    [OrderStatus.Pending]: 'info',
    [OrderStatus.WaitingCustomerApproval]: 'warning',
    [OrderStatus.Placed]: 'info',
    [OrderStatus.Processing]: 'info', // Changed from 'primary' to 'info' to match the defined variants
    [OrderStatus.Shipped]: 'success',
    [OrderStatus.Delivered]: 'success',
    [OrderStatus.Cancelled]: 'error', // Changed from 'danger' to 'error' to match the defined variants
};