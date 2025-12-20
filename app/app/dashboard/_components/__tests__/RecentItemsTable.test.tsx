/**
 * RecentItemsTable Component Unit Tests
 * 
 * MAANG-Level: Comprehensive component testing for recent items display.
 * 
 * **Priority**: 🟡 HIGH - Core dashboard data display
 * 
 * **Testing Strategy:**
 * 1. Rendering orders and quotes
 * 2. Empty state handling
 * 3. Status badge styling
 * 4. Date formatting
 * 5. Amount formatting
 * 
 * @module dashboard/components/RecentItemsTable.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentItemsTable } from '../RecentItemsTable'
import type { RecentItem } from '@_types/dashboard.types'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock Next.js Link component
vi.mock('next/link', () => ({
	default: ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
	formatDistanceToNow: vi.fn((date: Date) => {
		const now = new Date()
		const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
		if (diffHours < 1) return 'less than an hour ago'
		if (diffHours < 24) return `${diffHours} hours ago`
		const diffDays = Math.floor(diffHours / 24)
		return `${diffDays} days ago`
	}),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const mockRecentOrder: RecentItem = {
	quoteId: null,
	orderId: 123,
	type: 'order',
	number: 'ORD-123',
	date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	status: 'Processing',
	amount: 2500.0,
	customerName: 'Acme Corp',
}

const mockRecentQuote: RecentItem = {
	quoteId: 'guid-456',
	orderId: null,
	type: 'quote',
	number: 'QT-456',
	date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
	status: 'Unread',
	amount: undefined,
	customerName: 'Beta Inc',
}

const mockOrdersList: RecentItem[] = [
	mockRecentOrder,
	{
		quoteId: null,
		orderId: 789,
		type: 'order',
		number: 'ORD-789',
		date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		status: 'Shipped',
		amount: 1800.5,
		customerName: 'Delta LLC',
	},
	{
		quoteId: null,
		orderId: 202,
		type: 'order',
		number: 'ORD-202',
		date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
		status: 'Delivered',
		amount: 3200.0,
		customerName: 'Gamma Industries',
	},
]

const mockQuotesList: RecentItem[] = [
	mockRecentQuote,
	{
		quoteId: 'guid-101',
		orderId: null,
		type: 'quote',
		number: 'QT-101',
		date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		status: 'Approved',
		amount: undefined,
		customerName: 'Epsilon Co',
	},
]

// ============================================================================
// TEST SUITES
// ============================================================================

describe('RecentItemsTable Component', () => {
	// ==========================================================================
	// BASIC RENDERING TESTS
	// ==========================================================================

	describe('Basic Rendering', () => {
		it('should render title correctly', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Recent Orders')).toBeInTheDocument()
		})

		it('should render all orders', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('ORD-123')).toBeInTheDocument()
			expect(screen.getByText('ORD-789')).toBeInTheDocument()
			expect(screen.getByText('ORD-202')).toBeInTheDocument()
		})

		it('should render all quotes', () => {
			render(
				<RecentItemsTable items={mockQuotesList} title="Recent Quotes" type="quote" />
			)

			expect(screen.getByText('QT-456')).toBeInTheDocument()
			expect(screen.getByText('QT-101')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// TABLE HEADER TESTS
	// ==========================================================================

	describe('Table Headers', () => {
		it('should show Order # header for orders', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Order #')).toBeInTheDocument()
		})

		it('should show Quote # header for quotes', () => {
			render(
				<RecentItemsTable items={mockQuotesList} title="Recent Quotes" type="quote" />
			)

			expect(screen.getByText('Quote #')).toBeInTheDocument()
		})

		it('should show Date header', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Date')).toBeInTheDocument()
		})

		it('should show Status header', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Status')).toBeInTheDocument()
		})

		it('should show Amount header for orders', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Amount')).toBeInTheDocument()
		})

		it('should not show Amount header for quotes', () => {
			render(
				<RecentItemsTable items={mockQuotesList} title="Recent Quotes" type="quote" />
			)

			expect(screen.queryByText('Amount')).not.toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EMPTY STATE TESTS
	// ==========================================================================

	describe('Empty State', () => {
		it('should render empty state for orders', () => {
			render(<RecentItemsTable items={[]} title="Recent Orders" type="order" />)

			expect(screen.getByText(/No recent orders/i)).toBeInTheDocument()
		})

		it('should render empty state for quotes', () => {
			render(<RecentItemsTable items={[]} title="Recent Quotes" type="quote" />)

			expect(screen.getByText(/No recent quotes/i)).toBeInTheDocument()
		})

		it('should still show title in empty state', () => {
			render(<RecentItemsTable items={[]} title="Empty Table" type="order" />)

			expect(screen.getByText('Empty Table')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// STATUS BADGE TESTS
	// ==========================================================================

	describe('Status Badges', () => {
		it('should render status badges', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('Processing')).toBeInTheDocument()
			expect(screen.getByText('Shipped')).toBeInTheDocument()
			expect(screen.getByText('Delivered')).toBeInTheDocument()
		})

		it('should render quote status badges', () => {
			render(
				<RecentItemsTable items={mockQuotesList} title="Recent Quotes" type="quote" />
			)

			expect(screen.getByText('Unread')).toBeInTheDocument()
			expect(screen.getByText('Approved')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// AMOUNT DISPLAY TESTS
	// ==========================================================================

	describe('Amount Display', () => {
		it('should show amounts for orders', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			// Check for formatted amounts (currency format with $ and commas)
			expect(screen.getByText('$2,500.00')).toBeInTheDocument()
			expect(screen.getByText('$1,800.50')).toBeInTheDocument()
			expect(screen.getByText('$3,200.00')).toBeInTheDocument()
		})

		it('should handle undefined amount', () => {
			const orderWithoutAmount: RecentItem = {
				...mockRecentOrder,
				amount: undefined,
			}

			render(
				<RecentItemsTable
					items={[orderWithoutAmount]}
					title="Recent Orders"
					type="order"
				/>
			)

			// Should show '-' or handle gracefully
			expect(screen.getByText('ORD-123')).toBeInTheDocument()
		})

		it('should handle zero amount', () => {
			const orderWithZeroAmount: RecentItem = {
				...mockRecentOrder,
				amount: 0,
			}

			render(
				<RecentItemsTable
					items={[orderWithZeroAmount]}
					title="Recent Orders"
					type="order"
				/>
			)

			expect(screen.getByText('$0.00')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// NAVIGATION LINK TESTS
	// ==========================================================================

	describe('Navigation Links', () => {
		it('should render links to orders', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			const links = screen.getAllByRole('link')
			expect(links.some((link) => link.getAttribute('href')?.includes('orders'))).toBe(
				true
			)
		})

		it('should render links to quotes', () => {
			render(
				<RecentItemsTable items={mockQuotesList} title="Recent Quotes" type="quote" />
			)

			const links = screen.getAllByRole('link')
			expect(links.some((link) => link.getAttribute('href')?.includes('quotes'))).toBe(
				true
			)
		})
	})

	// ==========================================================================
	// SINGLE ITEM TESTS
	// ==========================================================================

	describe('Single Item', () => {
		it('should handle single order', () => {
			render(
				<RecentItemsTable items={[mockRecentOrder]} title="Recent Orders" type="order" />
			)

			expect(screen.getByText('ORD-123')).toBeInTheDocument()
		})

		it('should handle single quote', () => {
			render(
				<RecentItemsTable items={[mockRecentQuote]} title="Recent Quotes" type="quote" />
			)

			expect(screen.getByText('QT-456')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ACCESSIBILITY TESTS
	// ==========================================================================

	describe('Accessibility', () => {
		it('should render as a table', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			expect(screen.getByRole('table')).toBeInTheDocument()
		})

		it('should have accessible column headers', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			const columnHeaders = screen.getAllByRole('columnheader')
			expect(columnHeaders.length).toBeGreaterThan(0)
		})

		it('should have row groups', () => {
			render(
				<RecentItemsTable items={mockOrdersList} title="Recent Orders" type="order" />
			)

			const rows = screen.getAllByRole('row')
			// Header row + data rows
			expect(rows.length).toBe(mockOrdersList.length + 1)
		})
	})

	// ==========================================================================
	// EDGE CASE TESTS
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle item with very long number', () => {
			const longNumberItem: RecentItem = {
				...mockRecentOrder,
				number: 'ORD-123456789012345',
			}

			render(
				<RecentItemsTable
					items={[longNumberItem]}
					title="Recent Orders"
					type="order"
				/>
			)

			expect(screen.getByText('ORD-123456789012345')).toBeInTheDocument()
		})

		it('should handle item with special characters in status', () => {
			const specialStatusItem: RecentItem = {
				...mockRecentOrder,
				status: 'In Progress (Urgent)',
			}

			render(
				<RecentItemsTable
					items={[specialStatusItem]}
					title="Recent Orders"
					type="order"
				/>
			)

			// Component may add spaces for display formatting - use flexible matcher
			expect(screen.getByText(/In.*Progress.*Urgent/i)).toBeInTheDocument()
		})

		it('should handle very large amount', () => {
			const largeAmountItem: RecentItem = {
				...mockRecentOrder,
				amount: 1234567.89,
			}

			render(
				<RecentItemsTable
					items={[largeAmountItem]}
					title="Recent Orders"
					type="order"
				/>
			)

			// Should format the large number as currency with commas
			expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
		})
	})
})

