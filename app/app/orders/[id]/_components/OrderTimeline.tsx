/**
 * OrderTimeline Component
 * 
 * Visual order status timeline showing progress through the order lifecycle.
 * Highlights current status and completed steps.
 * 
 * **Timeline Steps:**
 * 1. Placed - Order confirmed
 * 2. Paid - Payment confirmed
 * 3. Processing - Being prepared
 * 4. Shipped - In transit
 * 5. Delivered - Complete
 * 
 * Special handling for Cancelled status.
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderTimeline
 */

'use client'

import { useMemo } from 'react'

import {
	CheckCircle2,
	Circle,
	Clock,
	XCircle,
	CreditCard,
	Package,
	Truck,
	Home,
} from 'lucide-react'

import { formatDate } from '@_shared'

import { OrderStatus } from '@_classes/Enums'
import { OrderStatusHelper } from '@_classes/Helpers'

import Card from '@_components/ui/Card'

import type Order from '@_classes/Order'

export interface OrderTimelineProps {
	/** The order to display timeline for */
	order: Order
	/** Compact mode for smaller displays */
	compact?: boolean
}

interface TimelineStep {
	status: OrderStatus
	label: string
	description: string
	icon: React.ComponentType<{ className?: string }>
	isComplete: boolean
	isCurrent: boolean
	timestamp?: Date | null
}

/**
 * Order timeline component showing workflow progress.
 * 
 * @example
 * ```tsx
 * <OrderTimeline order={order} />
 * <OrderTimeline order={order} compact />
 * ```
 */
export function OrderTimeline({ order, compact = false }: OrderTimelineProps) {
	// Build timeline steps based on order status
	const steps = useMemo<TimelineStep[]>(() => {
		const currentStatus = order.status

		// Handle cancelled orders separately
		if (currentStatus === OrderStatus.Cancelled) {
			return [
				{
					status: OrderStatus.Cancelled,
					label: 'Cancelled',
					description: 'Order has been cancelled',
					icon: XCircle,
					isComplete: true,
					isCurrent: true,
					timestamp: order.createdAt, // Would use cancelledAt if available
				},
			]
		}

		// Normal workflow timeline
		const timeline: TimelineStep[] = [
			{
				status: OrderStatus.Placed,
				label: 'Placed',
				description: 'Order confirmed',
				icon: CheckCircle2,
				isComplete: currentStatus >= OrderStatus.Placed,
				isCurrent: currentStatus === OrderStatus.Placed,
				timestamp: currentStatus >= OrderStatus.Placed ? order.createdAt : null,
			},
			{
				status: OrderStatus.Paid,
				label: 'Paid',
				description: 'Payment confirmed',
				icon: CreditCard,
				isComplete: currentStatus >= OrderStatus.Paid,
				isCurrent: currentStatus === OrderStatus.Paid,
				timestamp: null, // Would use paymentConfirmedAt if available
			},
			{
				status: OrderStatus.Processing,
				label: 'Processing',
				description: 'Being prepared',
				icon: Clock,
				isComplete: currentStatus >= OrderStatus.Processing,
				isCurrent: currentStatus === OrderStatus.Processing,
				timestamp: null,
			},
			{
				status: OrderStatus.Shipped,
				label: 'Shipped',
				description: 'In transit',
				icon: Truck,
				isComplete: currentStatus >= OrderStatus.Shipped,
				isCurrent: currentStatus === OrderStatus.Shipped,
				timestamp: null, // Would use shippedAt if available
			},
			{
				status: OrderStatus.Delivered,
				label: 'Delivered',
				description: 'Order complete',
				icon: Home,
				isComplete: currentStatus >= OrderStatus.Delivered,
				isCurrent: currentStatus === OrderStatus.Delivered,
				timestamp: null, // Would use deliveredAt if available
			},
		]

		// Filter based on current position in workflow
		// For pending/waiting status, show from Placed onwards
		if (currentStatus < OrderStatus.Placed) {
			return [
				{
					status: OrderStatus.Pending,
					label: 'Pending',
					description: 'Awaiting processing',
					icon: Clock,
					isComplete: false,
					isCurrent: currentStatus === OrderStatus.Pending,
					timestamp: order.createdAt,
				},
				...timeline,
			]
		}

		return timeline
	}, [order])

	// Cancelled state rendering
	if (order.status === OrderStatus.Cancelled) {
		return (
			<Card className="border border-error/30 bg-error/5 p-6 shadow-sm">
				<div className="flex items-center gap-4">
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/20">
						<XCircle className="w-6 h-6 text-error" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">Order Cancelled</h3>
						<p className="text-sm text-base-content/60">
							This order has been cancelled and will not be fulfilled.
						</p>
					</div>
				</div>
			</Card>
		)
	}

	// Compact timeline (horizontal)
	if (compact) {
		return (
			<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => (
						<div key={step.status} className="flex items-center">
							{/* Step indicator */}
							<div
								className={`flex items-center justify-center w-8 h-8 rounded-full ${
									step.isComplete
										? step.isCurrent
											? 'bg-primary text-primary-content'
											: 'bg-success text-success-content'
										: 'bg-base-200 text-base-content/40'
								}`}
							>
								{step.isComplete ? (
									<step.icon className="w-4 h-4" />
								) : (
									<Circle className="w-4 h-4" />
								)}
							</div>
							
							{/* Connector line */}
							{index < steps.length - 1 && (
								<div
									className={`h-1 w-8 sm:w-12 md:w-16 mx-1 ${
										steps[index + 1].isComplete
											? 'bg-success'
											: 'bg-base-200'
									}`}
								/>
							)}
						</div>
					))}
				</div>
				
				{/* Labels below */}
				<div className="flex items-center justify-between mt-2">
					{steps.map((step) => (
						<div key={step.status} className="text-center" style={{ width: '60px' }}>
							<span
								className={`text-xs ${
									step.isCurrent
										? 'font-semibold text-primary'
										: step.isComplete
										? 'text-base-content'
										: 'text-base-content/40'
								}`}
							>
								{step.label}
							</span>
						</div>
					))}
				</div>
			</Card>
		)
	}

	// Full timeline (vertical)
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-6">
				Order Progress
			</h3>

			<div className="relative">
				{steps.map((step, index) => (
					<div key={step.status} className="flex gap-4 pb-6 last:pb-0">
						{/* Timeline line */}
						<div className="flex flex-col items-center">
							{/* Step indicator */}
							<div
								className={`flex items-center justify-center w-10 h-10 rounded-full z-10 ${
									step.isComplete
										? step.isCurrent
											? 'bg-primary text-primary-content ring-4 ring-primary/20'
											: 'bg-success text-success-content'
										: 'bg-base-200 text-base-content/40'
								}`}
							>
								{step.isComplete ? (
									<step.icon className="w-5 h-5" />
								) : (
									<Circle className="w-5 h-5" />
								)}
							</div>
							
							{/* Connector line */}
							{index < steps.length - 1 && (
								<div
									className={`w-0.5 flex-1 mt-2 ${
										steps[index + 1].isComplete
											? 'bg-success'
											: 'bg-base-200'
									}`}
								/>
							)}
						</div>

						{/* Step content */}
						<div className="flex-1 pt-1">
							<div className="flex items-center gap-2">
								<h4
									className={`font-semibold ${
										step.isCurrent
											? 'text-primary'
											: step.isComplete
											? 'text-base-content'
											: 'text-base-content/40'
									}`}
								>
									{step.label}
								</h4>
								{step.isCurrent && (
									<span className="badge badge-primary badge-sm">Current</span>
								)}
							</div>
							<p
								className={`text-sm mt-1 ${
									step.isComplete
										? 'text-base-content/70'
										: 'text-base-content/40'
								}`}
							>
								{step.description}
							</p>
							{step.timestamp && (
								<p className="text-xs text-base-content/50 mt-1">
									{formatDate(step.timestamp)}
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Status message for terminal states */}
			{OrderStatusHelper.isTerminal(order.status) && order.status === OrderStatus.Delivered && (
				<div className="mt-4 pt-4 border-t border-base-200">
					<div className="flex items-center gap-2 text-success">
						<CheckCircle2 className="w-5 h-5" />
						<span className="font-medium">Order completed successfully!</span>
					</div>
				</div>
			)}
		</Card>
	)
}

export default OrderTimeline

