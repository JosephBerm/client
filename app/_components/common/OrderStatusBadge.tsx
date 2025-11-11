import Badge from '@_components/ui/Badge'

// Order status enum (should match backend)
export enum OrderStatus {
	Pending = 0,
	Processing = 1,
	Shipped = 2,
	Delivered = 3,
	Cancelled = 4,
}

interface OrderStatusBadgeProps {
	status: OrderStatus | number
	className?: string
}

/**
 * Badge component for order status with appropriate colors
 */
export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	const getStatusConfig = (status: number) => {
		switch (status) {
			case OrderStatus.Pending:
				return { label: 'Pending', variant: 'warning' as const }
			case OrderStatus.Processing:
				return { label: 'Processing', variant: 'info' as const }
			case OrderStatus.Shipped:
				return { label: 'Shipped', variant: 'primary' as const }
			case OrderStatus.Delivered:
				return { label: 'Delivered', variant: 'success' as const }
			case OrderStatus.Cancelled:
				return { label: 'Cancelled', variant: 'error' as const }
			default:
				return { label: 'Unknown', variant: 'neutral' as const }
		}
	}

	const config = getStatusConfig(status)

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	)
}


