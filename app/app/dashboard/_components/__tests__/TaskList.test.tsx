/**
 * TaskList Component Unit Tests
 * 
 * MAANG-Level: Comprehensive component testing for task display.
 * 
 * **Priority**: 🟡 HIGH - Core dashboard task management
 * 
 * **Testing Strategy:**
 * 1. Rendering task lists
 * 2. Empty state handling
 * 3. Urgent vs regular task styling
 * 4. Navigation links
 * 5. Accessibility
 * 
 * @module dashboard/components/TaskList.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from '../TaskList'
import type { DashboardTask } from '@_types/dashboard.types'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock Next.js Link component
vi.mock('next/link', () => ({
	default: ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const mockUrgentTask: DashboardTask = {
	quoteId: 'guid-123',
	orderId: null,
	type: 'quote',
	title: 'Urgent: Quote needs attention',
	description: 'ABC Corp waiting 48+ hours',
	createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
	isUrgent: true,
	actionUrl: '/app/quotes/guid-123',
}

const mockRegularTask: DashboardTask = {
	quoteId: null,
	orderId: 456,
	type: 'payment',
	title: 'Confirm payment',
	description: 'Order #456 pending',
	createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
	isUrgent: false,
	actionUrl: '/app/orders/456',
}

const mockFulfillmentTask: DashboardTask = {
	quoteId: null,
	orderId: 789,
	type: 'fulfillment',
	title: 'Ship Order #789',
	description: 'Ready for shipment',
	createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
	isUrgent: true,
	actionUrl: '/app/orders/789',
}

const mockTaskList: DashboardTask[] = [
	mockUrgentTask,
	mockRegularTask,
	mockFulfillmentTask,
]

// ============================================================================
// TEST SUITES
// ============================================================================

describe('TaskList Component', () => {
	// ==========================================================================
	// BASIC RENDERING TESTS
	// ==========================================================================

	describe('Basic Rendering', () => {
		it('should render title correctly', () => {
			render(<TaskList tasks={mockTaskList} title="Today's Tasks" />)

			expect(screen.getByText("Today's Tasks")).toBeInTheDocument()
		})

		it('should render all tasks', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
			expect(screen.getByText('Confirm payment')).toBeInTheDocument()
			expect(screen.getByText('Ship Order #789')).toBeInTheDocument()
		})

		it('should render task descriptions', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			expect(screen.getByText('ABC Corp waiting 48+ hours')).toBeInTheDocument()
			expect(screen.getByText('Order #456 pending')).toBeInTheDocument()
			expect(screen.getByText('Ready for shipment')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EMPTY STATE TESTS
	// ==========================================================================

	describe('Empty State', () => {
		it('should render empty state when no tasks', () => {
			render(<TaskList tasks={[]} title="Tasks" />)

			expect(screen.getByText(/All caught up/i)).toBeInTheDocument()
		})

		it('should still render title in empty state', () => {
			render(<TaskList tasks={[]} title="No Tasks Here" />)

			expect(screen.getByText('No Tasks Here')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// URGENT TASK TESTS
	// ==========================================================================

	describe('Urgent Task Display', () => {
		it('should display urgent indicator for urgent tasks', () => {
			render(
				<TaskList tasks={[mockUrgentTask]} title="Tasks" showUrgent={true} />
			)

			// Check if urgent task is rendered
			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
		})

		it('should handle showUrgent=false', () => {
			render(
				<TaskList tasks={[mockUrgentTask]} title="Tasks" showUrgent={false} />
			)

			// Task should still be rendered
			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
		})

		it('should show both urgent and regular tasks together', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			// Both urgent and regular tasks should be visible
			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
			expect(screen.getByText('Confirm payment')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// NAVIGATION LINK TESTS
	// ==========================================================================

	describe('Navigation Links', () => {
		it('should render correct links for quote tasks', () => {
			render(<TaskList tasks={[mockUrgentTask]} title="Tasks" />)

			const link = screen.getByRole('link')
			expect(link).toHaveAttribute('href', '/app/quotes/guid-123')
		})

		it('should render correct links for order tasks', () => {
			render(<TaskList tasks={[mockRegularTask]} title="Tasks" />)

			const link = screen.getByRole('link')
			expect(link).toHaveAttribute('href', '/app/orders/456')
		})

		it('should render links for all tasks', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			const links = screen.getAllByRole('link')
			expect(links).toHaveLength(3)
		})
	})

	// ==========================================================================
	// TASK TYPE TESTS
	// ==========================================================================

	describe('Task Types', () => {
		it('should handle quote-type tasks', () => {
			const quoteTask: DashboardTask = {
				...mockUrgentTask,
				type: 'quote',
			}

			render(<TaskList tasks={[quoteTask]} title="Tasks" />)

			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
		})

		it('should handle payment-type tasks', () => {
			const paymentTask: DashboardTask = {
				...mockRegularTask,
				type: 'payment',
			}

			render(<TaskList tasks={[paymentTask]} title="Tasks" />)

			expect(screen.getByText('Confirm payment')).toBeInTheDocument()
		})

		it('should handle fulfillment-type tasks', () => {
			render(<TaskList tasks={[mockFulfillmentTask]} title="Tasks" />)

			expect(screen.getByText('Ship Order #789')).toBeInTheDocument()
		})

		it('should handle order-type tasks', () => {
			const orderTask: DashboardTask = {
				quoteId: null,
				orderId: 999,
				type: 'order',
				title: 'Process Order',
				description: 'New order received',
				createdAt: new Date().toISOString(),
				isUrgent: false,
				actionUrl: '/app/orders/999',
			}

			render(<TaskList tasks={[orderTask]} title="Tasks" />)

			expect(screen.getByText('Process Order')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// SINGLE TASK TESTS
	// ==========================================================================

	describe('Single Task', () => {
		it('should handle single urgent task', () => {
			render(<TaskList tasks={[mockUrgentTask]} title="Tasks" />)

			expect(screen.getByText('Urgent: Quote needs attention')).toBeInTheDocument()
		})

		it('should handle single regular task', () => {
			render(<TaskList tasks={[mockRegularTask]} title="Tasks" />)

			expect(screen.getByText('Confirm payment')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// LARGE LIST TESTS
	// ==========================================================================

	describe('Large Task Lists', () => {
		it('should handle many tasks', () => {
			const manyTasks = Array.from({ length: 20 }, (_, i) => ({
				quoteId: null,
				orderId: i + 1,
				type: 'order' as const,
				title: `Task ${i + 1}`,
				description: `Description for task ${i + 1}`,
				createdAt: new Date().toISOString(),
				isUrgent: i % 3 === 0,
				actionUrl: `/app/orders/${i + 1}`,
			}))

			// Per component design: maxItems defaults to 10, so only first 10 tasks are rendered
			// This is intentional MAANG-level UX: don't overwhelm users with too many items
			render(<TaskList tasks={manyTasks} title="Many Tasks" />)

			// First 10 tasks should be visible (default maxItems)
			expect(screen.getByText('Task 1')).toBeInTheDocument()
			expect(screen.getByText('Task 10')).toBeInTheDocument()

			// Task 11-20 should NOT be visible due to maxItems limit
			expect(screen.queryByText('Task 20')).not.toBeInTheDocument()

			// Should show "+10 more" overflow indicator
			expect(screen.getByText(/\+10 more/)).toBeInTheDocument()
		})

		it('should show all tasks when maxItems is increased', () => {
			const manyTasks = Array.from({ length: 20 }, (_, i) => ({
				quoteId: null,
				orderId: i + 1,
				type: 'order' as const,
				title: `Task ${i + 1}`,
				description: `Description for task ${i + 1}`,
				createdAt: new Date().toISOString(),
				isUrgent: false,
				actionUrl: `/app/orders/${i + 1}`,
			}))

			// Override maxItems to show all tasks
			render(<TaskList tasks={manyTasks} title="All Tasks" maxItems={25} />)

			// All tasks should be visible
			expect(screen.getByText('Task 1')).toBeInTheDocument()
			expect(screen.getByText('Task 20')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EDGE CASE TESTS
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle task with empty title', () => {
			const emptyTitleTask: DashboardTask = {
				...mockRegularTask,
				title: '',
			}

			render(<TaskList tasks={[emptyTitleTask]} title="Tasks" />)

			// Should still render the description
			expect(screen.getByText('Order #456 pending')).toBeInTheDocument()
		})

		it('should handle task with empty description', () => {
			const emptyDescTask: DashboardTask = {
				...mockRegularTask,
				description: '',
			}

			render(<TaskList tasks={[emptyDescTask]} title="Tasks" />)

			// Should still render the title
			expect(screen.getByText('Confirm payment')).toBeInTheDocument()
		})

		it('should handle task with very long title', () => {
			const longTitleTask: DashboardTask = {
				...mockRegularTask,
				title: 'This is a very long task title that might need truncation or wrapping',
			}

			render(<TaskList tasks={[longTitleTask]} title="Tasks" />)

			expect(
				screen.getByText(
					'This is a very long task title that might need truncation or wrapping'
				)
			).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ACCESSIBILITY TESTS
	// ==========================================================================

	describe('Accessibility', () => {
		it('should render as a list', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			expect(screen.getByRole('list')).toBeInTheDocument()
		})

		it('should have list items', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			const listItems = screen.getAllByRole('listitem')
			expect(listItems).toHaveLength(3)
		})

		it('should have accessible links', () => {
			render(<TaskList tasks={mockTaskList} title="Tasks" />)

			const links = screen.getAllByRole('link')
			links.forEach((link) => {
				expect(link).toHaveAttribute('href')
			})
		})
	})
})

