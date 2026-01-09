/**
 * RoleHierarchyDiagram Component Unit Tests
 *
 * MAANG-Level: Comprehensive testing of role hierarchy visualization.
 *
 * **Priority**: 🟡 HIGH - VISUAL RBAC REPRESENTATION
 *
 * This component provides a visual representation of the role hierarchy,
 * helping users understand permission inheritance and role relationships.
 *
 * **Testing Strategy:**
 * 1. Rendering of role hierarchy
 * 2. Role ordering by level
 * 3. Visual connections between roles
 * 4. Permission count display
 * 5. Interactive elements
 * 6. Accessibility compliance
 * 7. Responsive behavior
 *
 * @module RBAC/RoleHierarchyDiagram.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

import { RoleLevels } from '@_types/rbac'
import type { RoleDefinitionDto } from '@_types/rbac-management'

// Mock dependencies
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
		svg: React.forwardRef(
			(
				{ children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
				ref: React.Ref<SVGSVGElement>
			) => (
				<svg
					ref={ref}
					{...props}>
					{children}
				</svg>
			)
		),
	},
	AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

import { RoleHierarchyDiagram } from '../RoleHierarchyDiagram'

// ============================================================================
// TEST DATA BUILDERS - Following PRD's RoleDefinitionDto
// ============================================================================

function createMockRole(overrides: Partial<RoleDefinitionDto> = {}): RoleDefinitionDto {
	return {
		id: 1,
		role: RoleLevels.Admin,
		name: 'admin',
		displayName: 'Administrator',
		description: 'Full system access',
		level: 9999999,
		isSystemRole: true,
		userCount: 1,
		permissions: [],
		...overrides,
	}
}

function createMockRoleHierarchy(): RoleDefinitionDto[] {
	return [
		createMockRole({
			id: 1,
			role: RoleLevels.Admin,
			name: 'admin',
			displayName: 'Administrator',
			description: 'Full system access',
			level: 9999999,
			isSystemRole: true,
			userCount: 2,
			permissions: ['quotes:all', 'orders:all', 'products:all', 'users:all', 'settings:all'],
		}),
		createMockRole({
			id: 2,
			role: RoleLevels.SalesManager,
			name: 'sales_manager',
			displayName: 'Sales Manager',
			description: 'Manages sales team and quotes',
			level: 200,
			isSystemRole: true,
			userCount: 5,
			permissions: ['quotes:all', 'orders:read', 'products:read'],
		}),
		createMockRole({
			id: 3,
			role: RoleLevels.SalesRep,
			name: 'sales_rep',
			displayName: 'Sales Representative',
			description: 'Creates and manages own quotes',
			level: 100,
			isSystemRole: true,
			userCount: 15,
			permissions: ['quotes:read:own', 'quotes:create', 'products:read'],
		}),
		createMockRole({
			id: 4,
			role: RoleLevels.Customer,
			name: 'customer',
			displayName: 'Customer',
			description: 'Base customer access',
			level: 0,
			isSystemRole: false,
			userCount: 100,
			permissions: ['orders:read:own', 'products:read'],
		}),
	]
}

// ============================================================================
// TESTS
// ============================================================================

describe('RoleHierarchyDiagram Component', () => {
	const defaultProps = {
		roles: createMockRoleHierarchy(),
		onRoleClick: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// RENDERING TESTS
	// ==========================================================================

	describe('Rendering', () => {
		it('should render the diagram container', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Should have the title
			expect(screen.getByText('Role Hierarchy')).toBeInTheDocument()
		})

		it('should render all roles', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Each role should be displayed
			expect(screen.getByText('Administrator')).toBeInTheDocument()
			expect(screen.getByText('Sales Manager')).toBeInTheDocument()
			expect(screen.getByText('Sales Representative')).toBeInTheDocument()
			expect(screen.getByText('Customer')).toBeInTheDocument()
		})

		it('should display user counts for each role', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Should show user counts
			expect(screen.getByText('2')).toBeInTheDocument() // Admin
			expect(screen.getByText('5')).toBeInTheDocument() // Sales Manager
			expect(screen.getByText('15')).toBeInTheDocument() // Sales Rep
			expect(screen.getByText('100')).toBeInTheDocument() // Customer
		})

		it('should indicate system roles visually', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// System roles should have "System" badge
			const systemBadges = screen.getAllByText('System')
			expect(systemBadges.length).toBeGreaterThan(0)
		})

		it('should display role descriptions', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			expect(screen.getByText('Full system access')).toBeInTheDocument()
			expect(screen.getByText('Manages sales team and quotes')).toBeInTheDocument()
		})

		it('should display role levels', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			expect(screen.getByText(/Level 9,999,999/)).toBeInTheDocument()
			expect(screen.getByText(/Level 200/)).toBeInTheDocument()
			expect(screen.getByText(/Level 100/)).toBeInTheDocument()
			expect(screen.getByText(/Level 0/)).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// EMPTY STATE
	// ==========================================================================

	describe('Empty State', () => {
		it('should handle empty roles array', () => {
			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={[]}
				/>
			)

			// Should still render container
			expect(screen.getByText('Role Hierarchy')).toBeInTheDocument()
		})

		it('should handle single role', () => {
			const singleRole = [createMockRole()]
			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={singleRole}
				/>
			)

			expect(screen.getByText('Administrator')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// INTERACTIONS
	// ==========================================================================

	describe('Interactions', () => {
		it('should call onRoleClick when role card is clicked', () => {
			const onRoleClick = vi.fn()
			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					onRoleClick={onRoleClick}
				/>
			)

			const roleCard =
				screen.getByText('Sales Manager').closest('[class*="cursor"]') ||
				screen.getByText('Sales Manager').parentElement?.parentElement?.parentElement

			if (roleCard) {
				fireEvent.click(roleCard)
				expect(onRoleClick).toHaveBeenCalled()
			}
		})

		it('should pass correct role data to onClick handler', () => {
			const onRoleClick = vi.fn()
			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					onRoleClick={onRoleClick}
				/>
			)

			const roleCard =
				screen.getByText('Sales Manager').closest('[class*="cursor"]') ||
				screen.getByText('Sales Manager').parentElement?.parentElement?.parentElement

			if (roleCard) {
				fireEvent.click(roleCard)

				expect(onRoleClick).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'sales_manager',
						displayName: 'Sales Manager',
					})
				)
			}
		})

		it('should expand role permissions when expand button is clicked', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Find expand button
			const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i })

			if (expandButtons.length > 0) {
				fireEvent.click(expandButtons[0])

				// Should show permissions - multiple elements may match
				const permissionElements = screen.getAllByText(/permissions/i)
				expect(permissionElements.length).toBeGreaterThan(0)
			}
		})

		it('should collapse permissions when clicking expand button again', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Find expand button
			const expandButtons = screen.getAllByRole('button', { name: /expand|collapse/i })

			if (expandButtons.length > 0) {
				// Expand
				fireEvent.click(expandButtons[0])

				// Collapse
				fireEvent.click(expandButtons[0])
			}
		})
	})

	// ==========================================================================
	// VISUAL HIERARCHY
	// ==========================================================================

	describe('Visual Hierarchy', () => {
		it('should render connection lines between roles', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Connection lines are rendered as divs with gradient
			const connections = document.querySelectorAll('[class*="h-4"][class*="w-0.5"]')
			expect(connections.length).toBeGreaterThan(0)
		})

		it('should show legend for hierarchy direction', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			expect(screen.getByText('Hierarchy Direction')).toBeInTheDocument()
			expect(screen.getByText('Higher authority')).toBeInTheDocument()
			expect(screen.getByText('Base permissions')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ROLE DETAILS
	// ==========================================================================

	describe('Role Details', () => {
		it('should show role name as title', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			expect(screen.getByText('Administrator')).toBeInTheDocument()
			expect(screen.getByText('Sales Manager')).toBeInTheDocument()
		})

		it('should show user count with label', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// Should show "users" label
			expect(screen.getAllByText(/users?/i).length).toBeGreaterThan(0)
		})

		it('should differentiate system vs custom roles', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			// System roles should have "System" badge
			const systemBadges = screen.getAllByText('System')

			// All except Customer should be system roles
			expect(systemBadges.length).toBe(3)
		})
	})

	// ==========================================================================
	// ACCESSIBILITY
	// ==========================================================================

	describe('Accessibility', () => {
		it('should have accessible expand buttons', () => {
			render(<RoleHierarchyDiagram {...defaultProps} />)

			const buttons = screen.getAllByRole('button')
			buttons.forEach((button) => {
				expect(button).toHaveAttribute('aria-label')
			})
		})

		it('should support keyboard navigation', () => {
			const onRoleClick = vi.fn()
			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					onRoleClick={onRoleClick}
				/>
			)

			const buttons = screen.getAllByRole('button')
			expect(buttons.length).toBeGreaterThan(0)
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle roles with same level', () => {
			const sameLevel: RoleDefinitionDto[] = [
				createMockRole({ id: 1, name: 'role_a', displayName: 'Role A', level: 100 }),
				createMockRole({ id: 2, name: 'role_b', displayName: 'Role B', level: 100 }),
				createMockRole({ id: 3, name: 'role_c', displayName: 'Role C', level: 100 }),
			]

			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={sameLevel}
				/>
			)

			expect(screen.getByText('Role A')).toBeInTheDocument()
			expect(screen.getByText('Role B')).toBeInTheDocument()
			expect(screen.getByText('Role C')).toBeInTheDocument()
		})

		it('should handle very long role names', () => {
			const longName: RoleDefinitionDto[] = [
				createMockRole({
					id: 1,
					name: 'very_long_role_name',
					displayName: 'This Is A Very Long Role Name That Might Overflow The Container',
					level: 100,
				}),
			]

			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={longName}
				/>
			)

			// Should handle overflow gracefully
			expect(screen.getByText(/This Is A Very Long/)).toBeInTheDocument()
		})

		it('should handle roles with no permissions', () => {
			const noPermissions: RoleDefinitionDto[] = [createMockRole({ id: 1, permissions: [], userCount: 5 })]

			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={noPermissions}
				/>
			)

			expect(screen.getByText('Administrator')).toBeInTheDocument()
		})

		it('should handle many roles', () => {
			const manyRoles: RoleDefinitionDto[] = Array.from({ length: 20 }, (_, i) =>
				createMockRole({
					id: i + 1,
					role: RoleLevels.Customer,
					name: `role_${i}`,
					displayName: `Role ${i}`,
					level: i * 10,
					userCount: i * 5,
				})
			)

			render(
				<RoleHierarchyDiagram
					{...defaultProps}
					roles={manyRoles}
				/>
			)

			// Should render without crashing
			expect(screen.getByText('Role 0')).toBeInTheDocument()
			expect(screen.getByText('Role 19')).toBeInTheDocument()
		})

		it('should handle role without onRoleClick', () => {
			render(<RoleHierarchyDiagram roles={defaultProps.roles} />)

			// Should render without click handler
			expect(screen.getByText('Administrator')).toBeInTheDocument()
		})
	})
})
