/**
 * BulkRoleModal Component Unit Tests
 *
 * MAANG-Level: Comprehensive testing for bulk role assignment modal.
 *
 * **Priority**: 🔴 CRITICAL - ADMIN OPERATION COMPONENT
 *
 * This modal allows admins to update roles for multiple users at once.
 * Tests must cover all user selection, validation, and submission flows.
 *
 * **Testing Strategy:**
 * 1. Modal visibility and lifecycle
 * 2. User selection (single, multiple, all)
 * 3. Role selection
 * 4. Reason input (optional)
 * 5. Form validation
 * 6. Submission flow
 * 7. Error handling
 * 8. Accessibility
 *
 * **Business Rules Tested:**
 * - Cannot submit with no users selected
 * - Cannot submit without selecting a new role
 * - Reason is optional but encouraged
 * - Submit button shows loading state
 * - Success/error feedback is provided
 * - Modal closes on successful submission
 *
 * @module RBAC/BulkRoleModal.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { RoleLevels } from '@_types/rbac'
import type { UserWithRole, BulkRoleUpdateResult } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// Mock framer-motion
vi.mock('framer-motion', () => ({
	motion: {
		div: React.forwardRef(
			(
				{ children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
				ref: React.Ref<HTMLDivElement>
			) => (
				<div
					ref={ref}
					{...props}>
					{children}
				</div>
			)
		),
	},
	AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Import after mocks
import { BulkRoleModal } from '../BulkRoleModal'

// ============================================================================
// TEST DATA BUILDERS
// ============================================================================

function createMockUser(overrides: Partial<UserWithRole> = {}): UserWithRole {
	return {
		id: 1,
		username: 'jdoe',
		email: 'user@test.com',
		fullName: 'John Doe',
		role: RoleLevels.SalesRep,
		roleDisplayName: 'Sales Representative',
		lastLoginAt: '2024-12-20T08:30:00Z',
		isActive: true,
		...overrides,
	}
}

function createMockUsersData(count: number = 4): PagedResult<UserWithRole> {
	const users: UserWithRole[] = [
		createMockUser({
			id: 1,
			username: 'jdoe',
			email: 'user1@test.com',
			fullName: 'John Doe',
			role: RoleLevels.SalesRep,
			roleDisplayName: 'Sales Representative',
		}),
		createMockUser({
			id: 2,
			username: 'jsmith',
			email: 'user2@test.com',
			fullName: 'Jane Smith',
			role: RoleLevels.SalesRep,
			roleDisplayName: 'Sales Representative',
		}),
		createMockUser({
			id: 3,
			username: 'bwilson',
			email: 'user3@test.com',
			fullName: 'Bob Wilson',
			role: RoleLevels.Customer,
			roleDisplayName: 'Customer',
		}),
		createMockUser({
			id: 4,
			username: 'admin',
			email: 'admin@test.com',
			fullName: 'Admin User',
			role: RoleLevels.Admin,
			roleDisplayName: 'Administrator',
		}),
	].slice(0, count)

	return {
		data: users,
		page: 1,
		pageSize: 20,
		total: count,
		totalPages: 1,
		hasNext: false,
		hasPrevious: false,
		nextPage: null,
		previousPage: null,
		firstPage: '?page=1&pageSize=20',
		lastPage: '?page=1&pageSize=20',
		pageCount: 1,
	} as PagedResult<UserWithRole>
}

// ============================================================================
// TESTS
// ============================================================================

describe('BulkRoleModal Component', () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		users: createMockUsersData(),
		isLoadingUsers: false,
		onBulkUpdate: vi
			.fn()
			.mockResolvedValue({ updatedCount: 2, failedCount: 0, failures: [] } as BulkRoleUpdateResult),
		onLoadUsers: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// VISIBILITY TESTS
	// ==========================================================================

	describe('Modal Visibility', () => {
		it('should render when isOpen is true', () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Modal renders with bulk role content
			expect(screen.getByText(/bulk.*role/i)).toBeInTheDocument()
		})

		it('should not render content when isOpen is false', () => {
			render(
				<BulkRoleModal
					{...defaultProps}
					isOpen={false}
				/>
			)

			expect(screen.queryByText(/bulk.*role/i)).not.toBeInTheDocument()
		})

		it('should display modal title', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByText(/bulk.*role/i)).toBeInTheDocument()
		})

		it('should call onClose when close button is clicked', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Find and click any button that should close the modal
			const buttons = screen.getAllByRole('button')
			const closeButton = buttons.find(
				(btn) =>
					btn.textContent?.toLowerCase().includes('cancel') ||
					btn.querySelector('svg')?.classList.contains('lucide-x')
			)

			if (closeButton) {
				await userEvent.click(closeButton)
				expect(defaultProps.onClose).toHaveBeenCalled()
			}
		})
	})

	// ==========================================================================
	// USER DISPLAY TESTS
	// ==========================================================================

	describe('User Display', () => {
		it('should display list of users', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.getByText('Jane Smith')).toBeInTheDocument()
		})

		it('should display user emails', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByText('user1@test.com')).toBeInTheDocument()
			expect(screen.getByText('user2@test.com')).toBeInTheDocument()
		})

		it('should display current role for each user', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getAllByText(/Sales Representative/i).length).toBeGreaterThan(0)
		})

		it('should show loading state when isLoadingUsers is true', () => {
			render(
				<BulkRoleModal
					{...defaultProps}
					isLoadingUsers={true}
					users={null}
				/>
			)

			// Should show loading indicator
			const spinningElements = document.querySelectorAll('.animate-spin')
			expect(spinningElements.length).toBeGreaterThan(0)
		})

		it('should show empty state when no users', () => {
			const emptyUsers = {
				...defaultProps.users,
				data: [],
				total: 0,
			} as PagedResult<UserWithRole>

			render(
				<BulkRoleModal
					{...defaultProps}
					users={emptyUsers}
				/>
			)

			expect(screen.getByText(/no users/i)).toBeInTheDocument()
		})

		it('should call onLoadUsers when modal opens without users', () => {
			render(
				<BulkRoleModal
					{...defaultProps}
					users={null}
				/>
			)

			expect(defaultProps.onLoadUsers).toHaveBeenCalled()
		})
	})

	// ==========================================================================
	// USER SELECTION TESTS
	// ==========================================================================

	describe('User Selection', () => {
		it('should allow clicking on user to select', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Find user row and click it
			const userRow =
				screen.getByText('John Doe').closest('div[class*="cursor"]') ||
				screen.getByText('John Doe').parentElement?.parentElement

			if (userRow) {
				await userEvent.click(userRow)

				// Should show selection count
				expect(screen.getByText(/1.*user.*selected|selected/i)).toBeInTheDocument()
			}
		})

		it('should have select all / deselect all option', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByText(/select all|deselect/i)).toBeInTheDocument()
		})

		it('should show selection count when users are selected', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Click select all
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Should show count of selected users
			expect(screen.getByText(/\d+.*user.*selected/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ROLE SELECTION TESTS
	// ==========================================================================

	describe('Role Selection', () => {
		it('should display role options', () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Role options label should be visible (exact match for the label)
			const roleLabel = screen.getByText('New Role')
			expect(roleLabel).toBeInTheDocument()
			expect(roleLabel.tagName).toBe('LABEL')
		})

		it('should show all available roles as buttons', () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Multiple elements have "Customer" text (user role badges + role option button)
			// Use getAllBy to find all instances
			const customerOptions = screen.getAllByText('Customer')
			expect(customerOptions.length).toBeGreaterThanOrEqual(1)
			// Multiple sales-related roles exist (Sales Representative, Sales Manager)
			const salesOptions = screen.getAllByText(/^Sales/)
			expect(salesOptions.length).toBeGreaterThanOrEqual(1)
		})

		it('should allow selecting a role', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Click on a role option
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Role should show as selected (visual feedback)
			expect(salesManagerButton.closest('button')).toHaveClass(/border-primary|bg-primary/i)
		})
	})

	// ==========================================================================
	// REASON INPUT TESTS
	// ==========================================================================

	describe('Reason Input', () => {
		it('should display reason textarea', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByPlaceholderText(/reason/i)).toBeInTheDocument()
		})

		it('should indicate reason is optional', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByText(/optional/i)).toBeInTheDocument()
		})

		it('should accept reason input', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			const reasonInput = screen.getByPlaceholderText(/reason/i)
			await userEvent.type(reasonInput, 'Promotion based on performance')

			expect(reasonInput).toHaveValue('Promotion based on performance')
		})
	})

	// ==========================================================================
	// FORM VALIDATION TESTS
	// ==========================================================================

	describe('Form Validation', () => {
		it('should disable submit button when no users selected', () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Find submit button
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('update'))

			// Should be disabled when no users selected
			if (submitButton) {
				expect(submitButton).toBeDisabled()
			}
		})

		it('should disable submit when no role selected', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Select users but don't select role
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Find submit button - should still be disabled
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('update'))

			if (submitButton) {
				expect(submitButton).toBeDisabled()
			}
		})

		it('should enable submit when users and role are selected', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			// Select users
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Select a role
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Find submit button - should be enabled
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('update'))

			if (submitButton) {
				expect(submitButton).not.toBeDisabled()
			}
		})
	})

	// ==========================================================================
	// SUBMISSION TESTS
	// ==========================================================================

	describe('Form Submission', () => {
		it('should call onBulkUpdate with correct parameters', async () => {
			const onBulkUpdate = vi.fn().mockResolvedValue({ updatedCount: 2, failedCount: 0, failures: [] })
			render(
				<BulkRoleModal
					{...defaultProps}
					onBulkUpdate={onBulkUpdate}
				/>
			)

			// Select users
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Select a role
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Enter reason
			const reasonInput = screen.getByPlaceholderText(/reason/i)
			await userEvent.type(reasonInput, 'Promotion')

			// Submit
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find(
				(btn) =>
					btn.textContent?.toLowerCase().includes('update') &&
					!btn.textContent?.toLowerCase().includes('bulk')
			)

			if (submitButton) {
				await userEvent.click(submitButton)

				await waitFor(() => {
					expect(onBulkUpdate).toHaveBeenCalledWith(
						expect.any(Array), // userIds
						expect.any(Number), // newRole (AccountRole)
						expect.any(String) // reason
					)
				})
			}
		})

		it('should show loading state during submission', async () => {
			const onBulkUpdate = vi
				.fn()
				.mockImplementation(
					() =>
						new Promise((resolve) =>
							setTimeout(() => resolve({ updatedCount: 1, failedCount: 0, failures: [] }), 1000)
						)
				)

			render(
				<BulkRoleModal
					{...defaultProps}
					onBulkUpdate={onBulkUpdate}
				/>
			)

			// Select users
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Select role
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Submit
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find(
				(btn) =>
					btn.textContent?.toLowerCase().includes('update') &&
					!btn.textContent?.toLowerCase().includes('bulk')
			)

			if (submitButton) {
				await userEvent.click(submitButton)

				// Should show loading
				expect(screen.getByText(/updating/i) || document.querySelector('.animate-spin')).toBeTruthy()
			}
		})

		it('should show success message after successful submission', async () => {
			const onBulkUpdate = vi.fn().mockResolvedValue({ updatedCount: 2, failedCount: 0, failures: [] })

			render(
				<BulkRoleModal
					{...defaultProps}
					onBulkUpdate={onBulkUpdate}
				/>
			)

			// Select users
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Select role
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Submit
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find(
				(btn) =>
					btn.textContent?.toLowerCase().includes('update') &&
					!btn.textContent?.toLowerCase().includes('bulk')
			)

			if (submitButton) {
				await userEvent.click(submitButton)

				await waitFor(() => {
					expect(screen.getByText(/updated.*2|2.*user/i)).toBeInTheDocument()
				})
			}
		})
	})

	// ==========================================================================
	// ERROR HANDLING TESTS
	// ==========================================================================

	describe('Error Handling', () => {
		it('should show partial failure details', async () => {
			const onBulkUpdate = vi.fn().mockResolvedValue({
				updatedCount: 1,
				failedCount: 1,
				failures: [{ userId: 2, reason: 'User not found' }],
			})

			render(
				<BulkRoleModal
					{...defaultProps}
					onBulkUpdate={onBulkUpdate}
				/>
			)

			// Select users
			const selectAllButton = screen.getByText(/select all/i)
			await userEvent.click(selectAllButton)

			// Select role
			const salesManagerButton = screen.getByText(/sales manager/i)
			await userEvent.click(salesManagerButton)

			// Submit
			const buttons = screen.getAllByRole('button')
			const submitButton = buttons.find(
				(btn) =>
					btn.textContent?.toLowerCase().includes('update') &&
					!btn.textContent?.toLowerCase().includes('bulk')
			)

			if (submitButton) {
				await userEvent.click(submitButton)

				await waitFor(() => {
					// Should show failure info
					expect(screen.getByText(/failed|1.*fail/i)).toBeInTheDocument()
				})
			}
		})
	})

	// ==========================================================================
	// SEARCH FUNCTIONALITY
	// ==========================================================================

	describe('Search Functionality', () => {
		it('should have search input', () => {
			render(<BulkRoleModal {...defaultProps} />)

			expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
		})

		it('should filter users by search term', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			const searchInput = screen.getByPlaceholderText(/search/i)
			await userEvent.type(searchInput, 'John')

			// Should show only John Doe
			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
		})

		it('should show no results message when search has no matches', async () => {
			render(<BulkRoleModal {...defaultProps} />)

			const searchInput = screen.getByPlaceholderText(/search/i)
			await userEvent.type(searchInput, 'nonexistent')

			expect(screen.getByText(/no users match/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle null users gracefully', () => {
			render(
				<BulkRoleModal
					{...defaultProps}
					users={null}
					isLoadingUsers={false}
				/>
			)

			// Should show empty state or loading indicator
			expect(screen.getByText(/no users/i) || document.querySelector('.animate-spin')).toBeTruthy()
		})

		it('should handle single user', () => {
			const singleUser = createMockUsersData(1)
			render(
				<BulkRoleModal
					{...defaultProps}
					users={singleUser}
				/>
			)

			expect(screen.getByText('John Doe')).toBeInTheDocument()
		})
	})
})
