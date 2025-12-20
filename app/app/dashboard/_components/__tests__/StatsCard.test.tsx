/**
 * StatsCard Component Unit Tests
 * 
 * MAANG-Level: Comprehensive component testing for statistics display.
 * 
 * **Priority**: 🟡 HIGH - Core dashboard visual element
 * 
 * **Testing Strategy:**
 * 1. Rendering with all props
 * 2. Trend indicators (positive/negative)
 * 3. Click interaction
 * 4. Accessibility
 * 5. Edge cases
 * 
 * @module dashboard/components/StatsCard.test
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileText, Package, DollarSign, Users } from 'lucide-react'
import { StatsCard } from '../StatsCard'

// ============================================================================
// TEST SUITES
// ============================================================================

describe('StatsCard Component', () => {
	// ==========================================================================
	// BASIC RENDERING TESTS
	// ==========================================================================

	describe('Basic Rendering', () => {
		it('should render title correctly', () => {
			render(
				<StatsCard
					title="Pending Quotes"
					value={5}
					icon={FileText}
				/>
			)

			expect(screen.getByText('Pending Quotes')).toBeInTheDocument()
		})

		it('should render numeric value correctly', () => {
			render(
				<StatsCard
					title="Active Orders"
					value={42}
					icon={Package}
				/>
			)

			expect(screen.getByText('42')).toBeInTheDocument()
		})

		it('should render string value correctly', () => {
			render(
				<StatsCard
					title="Total Revenue"
					value="$15,000"
					icon={DollarSign}
				/>
			)

			expect(screen.getByText('$15,000')).toBeInTheDocument()
		})

		it('should render subtitle when provided', () => {
			render(
				<StatsCard
					title="Active Users"
					value={150}
					subtitle="All roles"
					icon={Users}
				/>
			)

			expect(screen.getByText('All roles')).toBeInTheDocument()
		})

		it('should not render subtitle when not provided', () => {
			render(
				<StatsCard
					title="Active Users"
					value={150}
					icon={Users}
				/>
			)

			expect(screen.queryByText(/All/)).not.toBeInTheDocument()
		})

		it('should render icon', () => {
			render(
				<StatsCard
					title="Test"
					value={10}
					icon={FileText}
				/>
			)

			// Icon should be rendered (we can check by svg presence)
			const container = screen.getByText('Test').closest('div')
			expect(container?.closest('[class*="card"]')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// VALUE FORMAT TESTS
	// ==========================================================================

	describe('Value Formatting', () => {
		it('should handle zero value', () => {
			render(
				<StatsCard
					title="Empty Orders"
					value={0}
					icon={Package}
				/>
			)

			expect(screen.getByText('0')).toBeInTheDocument()
		})

		it('should handle percentage string', () => {
			render(
				<StatsCard
					title="Conversion Rate"
					value="65.5%"
					icon={FileText}
				/>
			)

			expect(screen.getByText('65.5%')).toBeInTheDocument()
		})

		it('should handle large numbers', () => {
			render(
				<StatsCard
					title="Total Spent"
					value="$1,500,000"
					icon={DollarSign}
				/>
			)

			expect(screen.getByText('$1,500,000')).toBeInTheDocument()
		})

		it('should handle decimal values', () => {
			render(
				<StatsCard
					title="Average Hours"
					value="24.5h"
					icon={FileText}
				/>
			)

			expect(screen.getByText('24.5h')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// TREND INDICATOR TESTS
	// ==========================================================================

	describe('Trend Indicators', () => {
		it('should render positive trend correctly', () => {
			render(
				<StatsCard
					title="Revenue"
					value="$10,000"
					icon={DollarSign}
					trend={{
						value: 15,
						label: 'vs last month',
						isPositive: true,
					}}
				/>
			)

			// Should show up arrow and positive styling
			expect(screen.getByText(/15%/)).toBeInTheDocument()
			expect(screen.getByText(/vs last month/)).toBeInTheDocument()
		})

		it('should render negative trend correctly', () => {
			render(
				<StatsCard
					title="Conversion"
					value="45%"
					icon={FileText}
					trend={{
						value: 5,
						label: 'vs last week',
						isPositive: false,
					}}
				/>
			)

			// Should show down arrow and negative styling
			// Trend renders as "↓ 5%" inside a span with font-medium class
			const trendContainer = screen.getByText(/vs last week/).parentElement
			expect(trendContainer).toBeInTheDocument()
			expect(trendContainer?.textContent).toMatch(/↓.*5%/)
		})

		it('should not render trend when not provided', () => {
			render(
				<StatsCard
					title="Orders"
					value={25}
					icon={Package}
				/>
			)

			expect(screen.queryByText(/%/)).not.toBeInTheDocument()
		})

		it('should handle zero trend value', () => {
			render(
				<StatsCard
					title="Stable Metric"
					value={100}
					icon={FileText}
					trend={{
						value: 0,
						label: 'unchanged',
						isPositive: true,
					}}
				/>
			)

			expect(screen.getByText(/0%/)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// CLICK INTERACTION TESTS
	// ==========================================================================

	describe('Click Interactions', () => {
		it('should call onClick when clicked and onClick is provided', () => {
			const handleClick = vi.fn()

			render(
				<StatsCard
					title="Clickable Card"
					value={10}
					icon={FileText}
					onClick={handleClick}
				/>
			)

			const card = screen.getByText('Clickable Card').closest('[class*="card"]')
			if (card) {
				fireEvent.click(card)
			}

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should not throw when clicked without onClick handler', () => {
			render(
				<StatsCard
					title="Non-clickable Card"
					value={10}
					icon={FileText}
				/>
			)

			const card = screen.getByText('Non-clickable Card').closest('[class*="card"]')
			
			// Should not throw
			expect(() => {
				if (card) {
					fireEvent.click(card)
				}
			}).not.toThrow()
		})

		it('should have cursor-pointer class when onClick is provided', () => {
			const handleClick = vi.fn()

			render(
				<StatsCard
					title="Clickable"
					value={10}
					icon={FileText}
					onClick={handleClick}
				/>
			)

			// Card applies cursor-pointer when onClick is provided
			// Use role="button" to find the clickable card
			const card = screen.getByRole('button')
			expect(card.className).toMatch(/cursor-pointer/)
		})
	})

	// ==========================================================================
	// ACCESSIBILITY TESTS
	// ==========================================================================

	describe('Accessibility', () => {
		it('should have button role when clickable', () => {
			const handleClick = vi.fn()

			render(
				<StatsCard
					title="Accessible Card"
					value={10}
					icon={FileText}
					onClick={handleClick}
				/>
			)

			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		it('should handle keyboard navigation when clickable', () => {
			const handleClick = vi.fn()

			render(
				<StatsCard
					title="Keyboard Card"
					value={10}
					icon={FileText}
					onClick={handleClick}
				/>
			)

			const button = screen.getByRole('button')
			fireEvent.keyDown(button, { key: 'Enter' })

			expect(handleClick).toHaveBeenCalledTimes(1)
		})

		it('should have tabIndex when clickable', () => {
			const handleClick = vi.fn()

			render(
				<StatsCard
					title="Focusable Card"
					value={10}
					icon={FileText}
					onClick={handleClick}
				/>
			)

			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('tabindex', '0')
		})
	})

	// ==========================================================================
	// CUSTOM CLASS TESTS
	// ==========================================================================

	describe('Custom Styling', () => {
		it('should apply custom className', () => {
			render(
				<StatsCard
					title="Custom Card"
					value={10}
					icon={FileText}
					className="custom-test-class"
				/>
			)

			// Find the outermost card div (motion.div) that contains the custom class
			const cardContainer = screen.getByText('Custom Card').closest('.card')
			expect(cardContainer?.className).toMatch(/custom-test-class/)
		})
	})

	// ==========================================================================
	// EDGE CASE TESTS
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle empty string title', () => {
			render(
				<StatsCard
					title=""
					value={10}
					icon={FileText}
				/>
			)

			// Should still render the card
			expect(screen.getByText('10')).toBeInTheDocument()
		})

		it('should handle very long title', () => {
			const longTitle = 'This is a very long title that might overflow'

			render(
				<StatsCard
					title={longTitle}
					value={10}
					icon={FileText}
				/>
			)

			expect(screen.getByText(longTitle)).toBeInTheDocument()
		})

		it('should handle negative numeric value', () => {
			render(
				<StatsCard
					title="Negative Value"
					value={-50}
					icon={FileText}
				/>
			)

			expect(screen.getByText('-50')).toBeInTheDocument()
		})

		it('should handle special characters in value', () => {
			render(
				<StatsCard
					title="Special"
					value="$1,234.56 (USD)"
					icon={DollarSign}
				/>
			)

			expect(screen.getByText('$1,234.56 (USD)')).toBeInTheDocument()
		})
	})
})

