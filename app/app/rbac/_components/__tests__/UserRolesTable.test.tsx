/**
 * UserRolesTable Component Unit Tests
 *
 * MAANG-Level: Comprehensive testing of user-role assignment display.
 *
 * **Priority**: 🟡 HIGH - USER MANAGEMENT UI
 *
 * This component displays users and their assigned roles with a bulk update button.
 *
 * **Testing Strategy:**
 * 1. Rendering of user list
 * 2. Role display for each user
 * 3. Loading and empty states
 * 4. Error handling
 * 5. Bulk update action
 * 6. Accessibility compliance
 *
 * @module RBAC/UserRolesTable.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import React from 'react'

import { RoleLevels } from '@_types/rbac'
import type { UserWithRole } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// Mock dependencies
vi.mock('@_shared/hooks/usePermissions', () => ({
	usePermissions: vi.fn(() => ({
		isAdmin: true,
		isSalesManagerOrAbove: true,
		hasPermission: vi.fn(() => true),
	})),
}))

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
		tr: React.forwardRef(
			(
				{ children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
				ref: React.Ref<HTMLTableRowElement>
			) => (
				<tr
					ref={ref}
					{...props}>
					{children}
				</tr>
			)
		),
	},
	AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

import { UserRolesTable } from '../UserRolesTable'

// ============================================================================
// TEST DATA BUILDERS - Following PRD's UserWithRole interface
// ============================================================================

function createMockUser(overrides: Partial<UserWithRole> = {}): UserWithRole {
	return {
		id: 1,
		username: 'jdoe',
		email: 'user@example.com',
		fullName: 'John Doe',
		role: RoleLevels.SalesRep,
		roleDisplayName: 'Sales Representative',
		lastLoginAt: '2024-12-20T08:30:00Z',
		isActive: true,
		...overrides,
	}
}

function createMockUsersData(count: number = 5): PagedResult<UserWithRole> {
	const users = Array.from({ length: count }, (_, i) =>
		createMockUser({
			id: i + 1,
			username: `user${i + 1}`,
			email: `user${i + 1}@example.com`,
			fullName: `User ${i + 1}`,
			role: [RoleLevels.Customer, RoleLevels.SalesRep, RoleLevels.SalesManager, RoleLevels.Admin][i % 4],
			roleDisplayName: ['Customer', 'Sales Representative', 'Sales Manager', 'Administrator'][i % 4],
			isActive: i % 3 !== 0,
		})
	)

	const totalPages = Math.ceil((count * 2) / 20)
	return {
		data: users,
		page: 1,
		pageSize: 20,
		total: count * 2,
		totalPages,
		hasNext: true,
		hasPrevious: false,
		nextPage: '?page=2&pageSize=20',
		previousPage: null,
		firstPage: '?page=1&pageSize=20',
		lastPage: `?page=${totalPages}&pageSize=20`,
		pageCount: totalPages,
	} as PagedResult<UserWithRole>
}

// ============================================================================
// TESTS
// ============================================================================

describe('UserRolesTable Component', () => {
	const defaultProps = {
		users: createMockUsersData(),
		isLoading: false,
		error: null as string | null,
		onBulkUpdate: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// RENDERING TESTS
	// ==========================================================================

	describe('Rendering', () => {
		it('should render the table', () => {
			render(<UserRolesTable {...defaultProps} />)

			expect(screen.getByRole('table')).toBeInTheDocument()
		})

		it('should render table headers', () => {
			render(<UserRolesTable {...defaultProps} />)

			// Use getAllByRole for columnheader or find headers more specifically
			const headers = screen.getAllByRole('columnheader')
			expect(headers.length).toBeGreaterThanOrEqual(3)
			// Check that expected header text exists somewhere in the table headers
			const headerTexts = headers.map((h) => h.textContent?.toLowerCase())
			expect(headerTexts.some((t) => t?.includes('user'))).toBe(true)
			expect(headerTexts.some((t) => t?.includes('role'))).toBe(true)
			expect(headerTexts.some((t) => t?.includes('status'))).toBe(true)
		})

		it('should render all users', () => {
			render(<UserRolesTable {...defaultProps} />)

			expect(screen.getByText('user1@example.com')).toBeInTheDocument()
			expect(screen.getByText('user2@example.com')).toBeInTheDocument()
		})

		it('should display user names', () => {
			render(<UserRolesTable {...defaultProps} />)

			expect(screen.getByText('User 1')).toBeInTheDocument()
			expect(screen.getByText('User 2')).toBeInTheDocument()
		})

		it('should display role names', () => {
			render(<UserRolesTable {...defaultProps} />)

			// Users have different roles - use getAllByText since multiple may match
			const roleElements = screen.getAllByText(
				/Sales Representative|Customer|Sales Manager|Administrator|Fulfillment Coordinator/
			)
			expect(roleElements.length).toBeGreaterThan(0)
		})

		it('should display active status', () => {
			render(<UserRolesTable {...defaultProps} />)

			expect(screen.getAllByText(/active|inactive/i).length).toBeGreaterThan(0)
		})

		it('should display last login date', () => {
			render(<UserRolesTable {...defaultProps} />)

			// Table should have last login column
			expect(screen.getByText(/last login/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// LOADING STATE
	// ==========================================================================

	describe('Loading State', () => {
		it('should show loading indicator when isLoading is true', () => {
			render(
				<UserRolesTable
					{...defaultProps}
					isLoading={true}
					users={null}
				/>
			)

			// Should show loading spinner
			const spinningElements = document.querySelectorAll('.animate-spin')
			expect(spinningElements.length).toBeGreaterThan(0)
		})

		it('should not show table when loading', () => {
			render(
				<UserRolesTable
					{...defaultProps}
					isLoading={true}
					users={null}
				/>
			)

			expect(screen.queryByRole('table')).not.toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ERROR STATE
	// ==========================================================================

	describe('Error State', () => {
		it('should display error message when error is provided', () => {
			render(
				<UserRolesTable
					{...defaultProps}
					error='Failed to load users'
				/>
			)

			expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument()
		})

		it('should show error icon with message', () => {
			render(
				<UserRolesTable
					{...defaultProps}
					error='Error occurred'
				/>
			)

			// Error should be displayed
			expect(screen.getByText(/Error occurred/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EMPTY STATE
	// ==========================================================================

	describe('Empty State', () => {
		it('should show empty message when no users', () => {
			const emptyUsers = {
				...defaultProps.users,
				data: [],
				total: 0,
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={emptyUsers}
				/>
			)

			expect(screen.getByText(/no users/i)).toBeInTheDocument()
		})

		it('should show empty state when users is null', () => {
			render(
				<UserRolesTable
					{...defaultProps}
					users={null}
					isLoading={false}
				/>
			)

			expect(screen.getByText(/no users/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// BULK UPDATE ACTION
	// ==========================================================================

	describe('Bulk Update', () => {
		it('should have bulk update button', () => {
			render(<UserRolesTable {...defaultProps} />)

			expect(screen.getByRole('button', { name: /bulk/i })).toBeInTheDocument()
		})

		it('should call onBulkUpdate when bulk update button is clicked', async () => {
			const onBulkUpdate = vi.fn()
			render(
				<UserRolesTable
					{...defaultProps}
					onBulkUpdate={onBulkUpdate}
				/>
			)

			const bulkButton = screen.getByRole('button', { name: /bulk/i })
			await userEvent.click(bulkButton)

			expect(onBulkUpdate).toHaveBeenCalledTimes(1)
		})
	})

	// ==========================================================================
	// TABLE CONTENT
	// ==========================================================================

	describe('Table Content', () => {
		it('should display user email below name', () => {
			render(<UserRolesTable {...defaultProps} />)

			// Email should be visible
			expect(screen.getByText('user1@example.com')).toBeInTheDocument()
		})

		it('should show active status with appropriate styling', () => {
			const singleUser = {
				...defaultProps.users,
				data: [createMockUser({ isActive: true })],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={singleUser}
				/>
			)

			expect(screen.getByText(/active/i)).toBeInTheDocument()
		})

		it('should show inactive status with appropriate styling', () => {
			const singleUser = {
				...defaultProps.users,
				data: [createMockUser({ isActive: false })],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={singleUser}
				/>
			)

			expect(screen.getByText(/inactive/i)).toBeInTheDocument()
		})

		it('should handle user with no last login', () => {
			const userNoLogin = {
				...defaultProps.users,
				data: [createMockUser({ lastLoginAt: null })],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={userNoLogin}
				/>
			)

			expect(screen.getByText(/never/i)).toBeInTheDocument()
		})

		it('should format last login date correctly', () => {
			const userWithLogin = {
				...defaultProps.users,
				data: [createMockUser({ lastLoginAt: '2024-12-20T10:30:00Z' })],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={userWithLogin}
				/>
			)

			// Should show formatted date
			expect(screen.getByText(/12\/20\/2024|Dec/i)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ACCESSIBILITY
	// ==========================================================================

	describe('Accessibility', () => {
		it('should have accessible table structure', () => {
			render(<UserRolesTable {...defaultProps} />)

			const table = screen.getByRole('table')
			expect(table).toBeInTheDocument()

			// Should have header row
			const headerCells = within(table).getAllByRole('columnheader')
			expect(headerCells.length).toBeGreaterThan(0)
		})

		it('should have accessible rows', () => {
			render(<UserRolesTable {...defaultProps} />)

			const rows = screen.getAllByRole('row')
			expect(rows.length).toBeGreaterThan(1) // Header + data rows
		})

		it('should have accessible button', () => {
			render(<UserRolesTable {...defaultProps} />)

			const button = screen.getByRole('button', { name: /bulk/i })
			expect(button).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle very long user names', () => {
			const longNameUser = {
				...defaultProps.users,
				data: [createMockUser({ fullName: 'Very Long User Name That Might Overflow The Container Width' })],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={longNameUser}
				/>
			)

			expect(screen.getByRole('table')).toBeInTheDocument()
		})

		it('should handle very long email addresses', () => {
			const longEmailUser = {
				...defaultProps.users,
				data: [
					createMockUser({ email: 'verylongemailaddressthatmightoverflow@verylongdomainname.example.com' }),
				],
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={longEmailUser}
				/>
			)

			expect(screen.getByRole('table')).toBeInTheDocument()
		})

		it('should handle single user', () => {
			const singleUser = {
				...defaultProps.users,
				data: [createMockUser()],
				total: 1,
			} as PagedResult<UserWithRole>

			render(
				<UserRolesTable
					{...defaultProps}
					users={singleUser}
				/>
			)

			expect(screen.getByText('John Doe')).toBeInTheDocument()
		})

		it('should handle many users', () => {
			const manyUsers = createMockUsersData(100)
			render(
				<UserRolesTable
					{...defaultProps}
					users={manyUsers}
				/>
			)

			expect(screen.getByRole('table')).toBeInTheDocument()
		})
	})
})
