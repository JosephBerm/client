/**
 * OrderTimeline Component - MAANG-Level Order Status Stepper
 *
 * Visual order status timeline showing progress through the order lifecycle.
 * Implements industry best practices from Material Design, USWDS, Carbon Design System,
 * and Nielsen Norman Group guidelines.
 *
 * **Architecture:**
 * - Mobile-first responsive design (vertical on mobile, horizontal on desktop)
 * - WCAG 2.2 compliant (semantic HTML, ARIA attributes, touch targets)
 * - Theme-aware using DaisyUI semantic color tokens
 * - Uses existing codebase patterns (Badge, Card components)
 *
 * **Timeline Steps:**
 * 1. Placed - Order confirmed
 * 2. Paid - Payment confirmed
 * 3. Processing - Being prepared
 * 4. Shipped - In transit
 * 5. Delivered - Complete
 *
 * **Accessibility Features:**
 * - Semantic `<nav>` + `<ol>` structure
 * - `aria-current="step"` on current step
 * - `aria-label` for navigation context
 * - Screen reader announcements for state
 * - 44px minimum touch targets (WCAG 2.5.5)
 * - Reduced motion support
 *
 * **Best Practices Applied:**
 * - Material Design Steppers (24-32dp icons, connector lines)
 * - USWDS Step Indicator (semantic HTML, ARIA)
 * - Carbon Design Progress Indicator (state colors)
 * - Nielsen Norman Group (plain language, scannable layouts)
 *
 * Special handling for Cancelled status.
 *
 * @see prd_orders.md - Order Management PRD
 * @see https://m1.material.io/components/steppers.html
 * @see https://designsystem.digital.gov/components/step-indicator/
 * @module app/orders/[id]/_components/OrderTimeline
 */

'use client'

import type { JSX } from 'react'

import classNames from 'classnames'
import {
	CheckCircle2,
	Circle,
	Clock,
	XCircle,
	CreditCard,
	Truck,
	Home,
	type LucideIcon,
} from 'lucide-react'

import { formatDate } from '@_shared'

import { OrderStatus } from '@_classes/Enums'
import OrderStatusHelper from '@_classes/Helpers/OrderStatusHelper'
import type Order from '@_classes/Order'

import Badge from '@_components/ui/Badge'
import Card from '@_components/ui/Card'

// ============================================================================
// TYPES
// ============================================================================

/**
 * OrderTimeline component props interface.
 */
export interface OrderTimelineProps {
	/** The order to display timeline for */
	order: Order
	/** Compact mode for horizontal stepper display */
	compact?: boolean
	/** Additional CSS classes for the container */
	className?: string
}

/**
 * Internal timeline step representation.
 * Maps order status to visual properties.
 */
interface TimelineStep {
	/** Order status enum value */
	status: OrderStatus
	/** Display label for the step */
	label: string
	/** Description text for the step */
	description: string
	/** Lucide icon component for the step */
	icon: LucideIcon
	/** Whether this step is complete */
	isComplete: boolean
	/** Whether this is the current active step */
	isCurrent: boolean
	/** Timestamp when this step was reached (if available) */
	timestamp?: Date | null
}

/**
 * Step state for styling purposes.
 * - complete: Step has been finished (green with checkmark)
 * - current: Currently active step (green with ring + step icon)
 * - terminal: Final completed state (green checkmark + emphasized label)
 * - pending: Not yet reached (gray with empty circle)
 */
type StepState = 'complete' | 'current' | 'terminal' | 'pending'


// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Icon mapping for each OrderStatus.
 * Single source of truth for step icons.
 * Uses OrderStatus enum as key for type-safety.
 */
const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
	[OrderStatus.Cancelled]: XCircle,
	[OrderStatus.Pending]: Clock,
	[OrderStatus.WaitingCustomerApproval]: Clock,
	[OrderStatus.Placed]: CheckCircle2,
	[OrderStatus.Paid]: CreditCard,
	[OrderStatus.Processing]: Clock,
	[OrderStatus.Shipped]: Truck,
	[OrderStatus.Delivered]: Home,
} as const

/**
 * Short descriptions for timeline steps.
 * These are intentionally concise for timeline display.
 * For detailed descriptions, use OrderStatusHelper.getDescription().
 */
const TIMELINE_DESCRIPTIONS: Record<OrderStatus, string> = {
	[OrderStatus.Cancelled]: 'Order cancelled',
	[OrderStatus.Pending]: 'Awaiting review',
	[OrderStatus.WaitingCustomerApproval]: 'Awaiting approval',
	[OrderStatus.Placed]: 'Order confirmed',
	[OrderStatus.Paid]: 'Payment confirmed',
	[OrderStatus.Processing]: 'Being prepared',
	[OrderStatus.Shipped]: 'In transit',
	[OrderStatus.Delivered]: 'Order complete',
} as const

/**
 * CSS classes for step indicator by state.
 * Uses DaisyUI semantic color tokens for theme compatibility.
 *
 * Design Decision: All completed steps (including terminal "Delivered")
 * use success color for visual consistency. The current step indicator
 * uses a ring effect for emphasis without changing the completion color.
 */
const STEP_INDICATOR_CLASSES: Record<StepState, string> = {
	complete: 'bg-success text-success-content',
	current: 'bg-success text-success-content ring-4 ring-success/20',
	terminal: 'bg-success text-success-content', // Same as complete (checkmark, no ring)
	pending: 'bg-base-200 text-base-content/40',
} as const

/**
 * CSS classes for step labels by state.
 */
const STEP_LABEL_CLASSES: Record<StepState, string> = {
	complete: 'text-base-content font-medium',
	current: 'text-success font-semibold',
	terminal: 'text-success font-semibold', // Emphasized like current (it's the destination)
	pending: 'text-base-content/40',
} as const

/**
 * CSS classes for connector lines by next step state.
 */
const CONNECTOR_CLASSES = {
	filled: 'bg-success',
	empty: 'bg-base-300',
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determines the visual state of a step for styling purposes.
 *
 * **Logic:**
 * - Terminal statuses (Delivered) that are current → show as 'terminal' (checkmark + emphasized label)
 * - Non-terminal current step → show as 'current' (step icon + ring)
 * - Completed past steps → show as 'complete' (checkmark)
 * - Future steps → show as 'pending' (empty circle)
 *
 * @param step - The timeline step to evaluate
 * @returns The step state ('complete' | 'current' | 'terminal' | 'pending')
 */
function getStepState(step: TimelineStep): StepState {
	// Terminal statuses should show as 'terminal' when current
	// This ensures "Delivered" shows a checkmark but keeps emphasized label
	if (step.isCurrent && OrderStatusHelper.isTerminal(step.status)) {
		return 'terminal'
	}
	if (step.isCurrent) {
		return 'current'
	}
	if (step.isComplete) {
		return 'complete'
	}
	return 'pending'
}

/**
 * Screen reader announcement text for step state.
 * Provides accessible context for assistive technologies.
 *
 * @param state - The visual state of the step
 * @returns Screen reader announcement text
 */
function getStepAnnouncement(state: StepState): string {
	switch (state) {
		case 'terminal':
			return 'Complete'
		case 'complete':
			return 'Completed'
		case 'current':
			return 'Current step'
		case 'pending':
			return 'Pending'
	}
}

/**
 * Builds the timeline steps based on order status.
 * Handles normal workflow and cancelled orders separately.
 *
 * @param order - The order to build timeline for
 * @returns Array of timeline steps
 */
/**
 * Creates a timeline step from an OrderStatus enum value.
 * Uses OrderStatusHelper for display labels (DRY pattern).
 *
 * @param status - The OrderStatus for this step
 * @param currentStatus - The order's current status
 * @param timestamp - Optional timestamp for when this step was reached
 */
function createTimelineStep(
	status: OrderStatus,
	currentStatus: OrderStatus,
	timestamp?: Date | null
): TimelineStep {
	return {
		status,
		label: OrderStatusHelper.getDisplay(status),
		description: TIMELINE_DESCRIPTIONS[status],
		icon: STATUS_ICONS[status],
		isComplete: currentStatus >= status,
		isCurrent: currentStatus === status,
		timestamp: timestamp ?? null,
	}
}

function buildTimelineSteps(order: Order): TimelineStep[] {
	const currentStatus = order.status

	// Handle cancelled orders - show single cancelled state
	if (currentStatus === OrderStatus.Cancelled) {
		return [createTimelineStep(OrderStatus.Cancelled, currentStatus, order.createdAt)]
	}

	// Normal workflow timeline (Placed → Paid → Processing → Shipped → Delivered)
	const workflowStatuses: OrderStatus[] = [
		OrderStatus.Placed,
		OrderStatus.Paid,
		OrderStatus.Processing,
		OrderStatus.Shipped,
		OrderStatus.Delivered,
	]

	const timeline: TimelineStep[] = workflowStatuses.map((status) => {
		// Use order.createdAt for Placed step if complete
		const timestamp = status === OrderStatus.Placed && currentStatus >= status ? order.createdAt : null
		return createTimelineStep(status, currentStatus, timestamp)
	})

	// For pending/waiting status, prepend Pending step
	if (currentStatus < OrderStatus.Placed) {
		return [
			createTimelineStep(OrderStatus.Pending, currentStatus, order.createdAt),
			...timeline,
		]
	}

	return timeline
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Step indicator circle with icon.
 * Renders the circular indicator for each timeline step.
 *
 * **Icon Logic (Material Design / USWDS Pattern):**
 * - Complete (not current): Checkmark icon (universal "done" indicator)
 * - Current: Step-specific icon (shows what's happening now)
 * - Pending: Empty circle (not yet reached)
 *
 * @param props - Step, state, and size configuration
 */
function StepIndicator({
	step,
	state,
	size = 'default',
}: {
	step: TimelineStep
	state: StepState
	size?: 'compact' | 'default'
}) {
	const StepIcon = step.icon
	// WCAG 2.5.5: Minimum 44px touch target (size-11 = 44px, size-12 = 48px)
	const sizeClasses = size === 'compact' ? 'size-11' : 'size-12'
	const iconSizeClasses = size === 'compact' ? 'size-5' : 'size-6'

	// Determine which icon to show based on state
	// - Complete/Terminal: Show checkmark for clarity
	// - Current: Show step-specific icon
	// - Pending: Show empty circle
	const renderIcon = () => {
		if (state === 'complete' || state === 'terminal') {
			// Completed and terminal steps show checkmark (industry standard)
			return <CheckCircle2 className={iconSizeClasses} strokeWidth={2.5} />
		}
		if (state === 'current') {
			// Current step shows its specific icon
			return <StepIcon className={iconSizeClasses} strokeWidth={2} />
		}
		// Pending steps show empty circle
		return <Circle className={iconSizeClasses} strokeWidth={1.5} />
	}

	return (
		<div
			className={classNames(
				'flex shrink-0 items-center justify-center rounded-full transition-all duration-200 motion-reduce:transition-none',
				sizeClasses,
				STEP_INDICATOR_CLASSES[state]
			)}
			aria-hidden="true"
		>
			{renderIcon()}
		</div>
	)
}

/**
 * Horizontal connector line between steps.
 * Used in compact (horizontal) mode.
 *
 * @param props - Whether the next step is complete
 */
function HorizontalConnector({ isNextComplete }: { isNextComplete: boolean }) {
	return (
		<div
			className={classNames(
				'mx-1 h-1 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none',
				isNextComplete ? CONNECTOR_CLASSES.filled : CONNECTOR_CLASSES.empty
			)}
			aria-hidden="true"
		/>
	)
}

/**
 * Vertical connector line between steps.
 * Used in full (vertical) mode.
 *
 * @param props - Whether the next step is complete
 */
function VerticalConnector({ isNextComplete }: { isNextComplete: boolean }) {
	return (
		<div
			className={classNames(
				'mt-2 w-0.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none',
				isNextComplete ? CONNECTOR_CLASSES.filled : CONNECTOR_CLASSES.empty
			)}
			aria-hidden="true"
		/>
	)
}

/**
 * Cancelled order state display.
 * Shows a prominent error card for cancelled orders.
 */
function CancelledOrderDisplay() {
	return (
		<Card className="border border-error/30 bg-error/5 p-6 shadow-sm">
			<div className="flex items-center gap-4">
				<div className="flex size-12 items-center justify-center rounded-full bg-error/20">
					<XCircle className="size-6 text-error" aria-hidden="true" />
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

/**
 * Completed order success message.
 * Displayed at the bottom of the timeline for delivered orders.
 */
function CompletedOrderMessage() {
	return (
		<div className="mt-4 flex items-center gap-2 border-t border-base-200 pt-4 text-success">
			<CheckCircle2 className="size-5" aria-hidden="true" />
			<span className="font-medium">Order completed successfully!</span>
		</div>
	)
}

// ============================================================================
// COMPACT TIMELINE (Horizontal - Desktop)
// ============================================================================

/**
 * Compact horizontal timeline stepper.
 * Displays steps in a row with connector lines.
 * Mobile-first: Stacks vertically on small screens.
 *
 * **Layout Structure (Desktop):**
 * ```
 * [Circle]----[Circle]----[Circle]----[Circle]----[Circle]
 *  Placed       Paid     Processing   Shipped    Delivered
 * ```
 * Each step is a flex column (circle + label), with connectors between.
 * Connectors use self-center to align to the circle's vertical center.
 *
 * @param props - Steps array and order
 */
function CompactTimeline({
	steps,
	order,
}: {
	steps: TimelineStep[]
	order: Order
}) {
	return (
		<Card className="border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
			{/* Accessible navigation wrapper */}
			<nav aria-label={`Order ${order.id} progress`}>
				<ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
					{steps.map((step, index) => {
						const state = getStepState(step)
						const isLast = index === steps.length - 1

						return (
							<li
								key={step.status}
								className={classNames(
									'flex items-center sm:flex-col sm:items-center',
									// Desktop: All but last step should grow to fill space
									!isLast && 'sm:flex-1'
								)}
								aria-current={step.isCurrent ? 'step' : undefined}
							>
								{/* Row container for indicator + connector (desktop only) */}
								<div className="flex w-full items-center">
									{/* Step indicator */}
									<div className="shrink-0">
										<StepIndicator step={step} state={state} size="compact" />
									</div>

									{/* Connector line - Desktop only, aligned to indicator center */}
									{!isLast && (
										<div className="hidden flex-1 sm:block">
											<HorizontalConnector isNextComplete={steps[index + 1].isComplete} />
										</div>
									)}
								</div>

								{/* Label - beside on mobile, below on desktop */}
								<span
									className={classNames(
										'ml-3 text-sm sm:ml-0 sm:mt-2 sm:text-center sm:text-xs',
										STEP_LABEL_CLASSES[state]
									)}
								>
									{step.label}
									{/* Screen reader announcement for state */}
									<span className="sr-only"> - {getStepAnnouncement(state)}</span>
								</span>
							</li>
						)
					})}
				</ol>
			</nav>

			{/* Current step badge - Mobile only */}
			<div className="mt-4 sm:hidden">
				<Badge variant="success" size="sm" className="w-full justify-center">
					Current: {steps.find((s) => s.isCurrent)?.label ?? 'Unknown'}
				</Badge>
			</div>
		</Card>
	)
}

// ============================================================================
// FULL TIMELINE (Vertical)
// ============================================================================

/**
 * Full vertical timeline with descriptions.
 * Used in sidebars or detail views for more context.
 *
 * @param props - Steps array and order
 */
function FullTimeline({ steps, order }: { steps: TimelineStep[]; order: Order }) {
	const isDelivered = order.status === OrderStatus.Delivered

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			{/* Header */}
			<h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-base-content/60">
				Order Progress
			</h3>

			{/* Accessible navigation wrapper */}
			<nav aria-label={`Order ${order.id} progress details`}>
				<ol className="relative">
					{steps.map((step, index) => {
						const state = getStepState(step)
						const isLast = index === steps.length - 1

						return (
							<li
								key={step.status}
								className="flex gap-4 pb-6 last:pb-0"
								aria-current={step.isCurrent ? 'step' : undefined}
							>
								{/* Timeline rail (indicator + connector) */}
								<div className="flex flex-col items-center">
									<StepIndicator step={step} state={state} />

									{/* Vertical connector (not on last step) */}
									{!isLast && (
										<VerticalConnector
											isNextComplete={steps[index + 1].isComplete}
										/>
									)}
								</div>

								{/* Step content */}
								<div className="flex-1 pt-2">
									{/* Label row with optional "Current" badge */}
									<div className="flex flex-wrap items-center gap-2">
										<h4 className={classNames('font-semibold', STEP_LABEL_CLASSES[state])}>
											{step.label}
										</h4>
										{step.isCurrent && (
											<Badge variant="success" size="sm">
												Current
											</Badge>
										)}
									</div>

									{/* Description */}
									<p
										className={classNames(
											'mt-1 text-sm',
											state !== 'pending'
												? 'text-base-content/70'
												: 'text-base-content/40'
										)}
									>
										{step.description}
									</p>

									{/* Timestamp if available */}
									{step.timestamp && (
										<p className="mt-1 text-xs text-base-content/50">
											<time dateTime={step.timestamp.toISOString()}>
												{formatDate(step.timestamp)}
											</time>
										</p>
									)}

									{/* Screen reader announcement */}
									<span className="sr-only">{getStepAnnouncement(state)}</span>
								</div>
							</li>
						)
					})}
				</ol>
			</nav>

			{/* Success message for delivered orders */}
			{isDelivered && <CompletedOrderMessage />}
		</Card>
	)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * OrderTimeline Component
 *
 * MAANG-level order status timeline/stepper component.
 * Displays order progress through the fulfillment lifecycle.
 *
 * **Modes:**
 * - `compact={true}`: Horizontal stepper (responsive - vertical on mobile)
 * - `compact={false}`: Vertical timeline with descriptions (default)
 *
 * **Accessibility:**
 * - Uses semantic `<nav>` + `<ol>` structure
 * - `aria-current="step"` on active step
 * - Screen reader announcements for step states
 * - 44px touch targets (WCAG 2.5.5)
 * - Respects `prefers-reduced-motion`
 *
 * @example
 * ```tsx
 * // Compact horizontal stepper (at top of page)
 * <OrderTimeline order={order} compact />
 *
 * // Full vertical timeline (in sidebar)
 * <OrderTimeline order={order} />
 *
 * // With custom className
 * <OrderTimeline order={order} className="mb-6" />
 * ```
 *
 * @param props - Component props
 * @returns OrderTimeline component
 */
export function OrderTimeline({
	order,
	compact = false,
	className,
}: OrderTimelineProps): JSX.Element {
	// Build timeline steps (pure function, no memo needed per React 19 guidelines)
	const steps = buildTimelineSteps(order)

	// Cancelled orders get special treatment
	if (order.status === OrderStatus.Cancelled) {
		return (
			<div className={className}>
				<CancelledOrderDisplay />
			</div>
		)
	}

	// Render appropriate timeline variant
	return (
		<div className={className}>
			{compact ? (
				<CompactTimeline steps={steps} order={order} />
			) : (
				<FullTimeline steps={steps} order={order} />
			)}
		</div>
	)
}

export default OrderTimeline
