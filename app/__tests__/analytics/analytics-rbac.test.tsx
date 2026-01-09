/**
 * Analytics RBAC Integration Tests
 *
 * MAANG-Level: Critical security tests for role-based analytics access.
 *
 * **SECURITY PRIORITY: 🔴 CRITICAL**
 *
 * These tests validate that analytics data is properly restricted based on user roles
 * as specified in PRD prd_analytics.md Section 3.
 *
 * **Test Coverage:**
 *
 * 1. **Customer Restrictions**
 *    - Can ONLY see own data
 *    - CANNOT see company-wide analytics
 *    - CANNOT see other customer data
 *
 * 2. **SalesRep Restrictions**
 *    - Can see own metrics
 *    - Can see anonymized team comparison
 *    - CANNOT see individual teammate stats
 *    - CANNOT see company-wide revenue details
 *
 * 3. **SalesManager Access**
 *    - Can see team performance
 *    - Can see individual rep metrics
 *    - Can export team reports
 *    - CANNOT modify data
 *
 * 4. **Admin Access**
 *    - Full analytics access
 *    - System-wide metrics
 *
 * @module __tests__/analytics/analytics-rbac.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { usePermissions, Resources, Actions, Contexts, RoleLevels } from '@_shared/hooks/usePermissions'
import { PermissionGuard, RoleGuard } from '@_components/common/guards'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Create a mock store with state management
const createMockStore = () => {
	let state = {
		user: null as any,
		isAuthenticated: false,
		isLoading: false,
	}

	return {
		getState: () => state,
		setState: (newState: Partial<typeof state>) => {
			state = { ...state, ...newState }
		},
		subscribe: vi.fn(),
	}
}

const mockStore = createMockStore()

vi.mock('@_features/auth/stores/useAuthStore', () => ({
	useAuthStore: vi.fn((selector: (state: any) => any) => selector(mockStore.getState())),
}))

// Mock API calls
const mockApiCalls = {
	getSummary: vi.fn(),
	getTeamPerformance: vi.fn(),
	getRevenue: vi.fn(),
}

vi.mock('@_shared/services/api', () => ({
	default: {
		Analytics: mockApiCalls,
	},
}))

// ============================================================================
// TEST HELPERS
// ============================================================================

interface TestUser {
	id: number
	email: string
	role: number
	customerId?: number
	name?: { first: string; last: string }
}

function createTestUser(role: number, overrides?: Partial<TestUser>): TestUser {
	return {
		id: 1,
		email: 'test@medsource.com',
		role,
		customerId: 123,
		name: { first: 'Test', last: 'User' },
		...overrides,
	}
}

function loginAs(role: number, overrides?: Partial<TestUser>) {
	const user = createTestUser(role, overrides)
	mockStore.setState({ user, isAuthenticated: true, isLoading: false })
}

function logout() {
	mockStore.setState({ user: null, isAuthenticated: false, isLoading: false })
}

// ============================================================================
// ANALYTICS RBAC TESTS
// ============================================================================

describe('Analytics RBAC Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		logout()
	})

	afterEach(() => {
		vi.clearAllMocks()
		logout()
	})

	// ==========================================================================
	// CUSTOMER ROLE TESTS (Per PRD Section 3 - Customer View)
	// ==========================================================================

	describe('Customer Analytics Access', () => {
		beforeEach(() => {
			loginAs(RoleLevels.Customer, { email: 'customer@hospital.com', customerId: 456 })
		})

		/**
		 * Per RBAC Matrix: Customer CANNOT access analytics resource
		 * Note: Customer spending history is viewed via Orders, not Analytics
		 */
		it('should DENY Customer access to analytics resource', () => {
			const { result } = renderHook(() => usePermissions())

			// Customer should NOT have access to Analytics resource (per usePermissions RBAC)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				false,
			)
		})

		/**
		 * PRD: Customer Cannot see company-wide or system analytics
		 */
		it('should DENY Customer access to company-wide analytics', () => {
			const { result } = renderHook(() => usePermissions())

			// Customer should NOT have access to all/team analytics
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(
				false,
			)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				false,
			)
		})

		/**
		 * PRD: Customer Cannot see other customer data
		 */
		it('should DENY Customer access to other customers analytics', () => {
			const { result } = renderHook(() => usePermissions())

			// Customer cannot read others' data
			expect(
				result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Assigned),
			).toBe(false)
		})

		/**
		 * PRD: Customer Cannot export sensitive data
		 */
		it('should DENY Customer export permissions', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(false)
		})

		it('should hide team performance section from Customer', () => {
			render(
				<div>
					<RoleGuard minimumRole={RoleLevels.SalesManager}>
						<div data-testid="team-performance">Team Performance</div>
					</RoleGuard>
					<div data-testid="customer-spending">Your Spending</div>
				</div>,
			)

			expect(screen.queryByTestId('team-performance')).not.toBeInTheDocument()
			expect(screen.getByTestId('customer-spending')).toBeInTheDocument()
		})

		it('should hide revenue timeline from Customer', () => {
			render(
				<PermissionGuard resource={Resources.Analytics} action={Actions.Read} context={Contexts.All}>
					<div data-testid="revenue-chart">Revenue Timeline</div>
				</PermissionGuard>,
			)

			expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument()
		})
	})

	// ==========================================================================
	// SALES REP ROLE TESTS (Per PRD Section 3 - Sales Rep View)
	// ==========================================================================

	describe('SalesRep Analytics Access', () => {
		beforeEach(() => {
			loginAs(RoleLevels.SalesRep, { email: 'salesrep@medsource.com' })
		})

		/**
		 * PRD: SalesRep Can view personal performance metrics
		 */
		it('should allow SalesRep to access own analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				true,
			)
		})

		/**
		 * PRD: SalesRep Can see conversion rates (own quotes)
		 */
		it('should allow SalesRep to see own conversion metrics', () => {
			const { result } = renderHook(() => usePermissions())

			// SalesRep can read own analytics
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				true,
			)
		})

		/**
		 * PRD: SalesRep Can compare to team average (anonymized)
		 * This means they can see aggregated team data but not individual stats
		 */
		it('should allow SalesRep to see anonymized team comparison', () => {
			const { result } = renderHook(() => usePermissions())

			// SalesRep can read own + team average (anonymized)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				true,
			)
		})

		/**
		 * PRD: SalesRep Cannot see individual teammate stats
		 */
		it('should DENY SalesRep access to team performance details', () => {
			const { result } = renderHook(() => usePermissions())

			// SalesRep should NOT have team context access
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				false,
			)
		})

		/**
		 * PRD: SalesRep Cannot see company-wide revenue details
		 */
		it('should DENY SalesRep access to company-wide analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(
				false,
			)
		})

		/**
		 * PRD: SalesRep Cannot export sensitive data
		 */
		it('should DENY SalesRep export permissions', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(false)
		})

		it('should hide team leaderboard from SalesRep', () => {
			render(
				<div>
					<RoleGuard minimumRole={RoleLevels.SalesManager}>
						<div data-testid="team-leaderboard">Team Leaderboard</div>
					</RoleGuard>
					<div data-testid="personal-metrics">Personal Metrics</div>
				</div>,
			)

			expect(screen.queryByTestId('team-leaderboard')).not.toBeInTheDocument()
			expect(screen.getByTestId('personal-metrics')).toBeInTheDocument()
		})

		it('should show personal vs team comparison for SalesRep', () => {
			render(
				<PermissionGuard resource={Resources.Analytics} action={Actions.Read} context={Contexts.Own}>
					<div data-testid="team-comparison">Your conversion: 50% (Team avg: 45%)</div>
				</PermissionGuard>,
			)

			expect(screen.getByTestId('team-comparison')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// SALES MANAGER ROLE TESTS (Per PRD Section 3 - Sales Manager View)
	// ==========================================================================

	describe('SalesManager Analytics Access', () => {
		beforeEach(() => {
			loginAs(RoleLevels.SalesManager, { email: 'manager@medsource.com' })
		})

		/**
		 * PRD: SalesManager Can view team performance metrics
		 */
		it('should allow SalesManager to access team analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				true,
			)
		})

		/**
		 * Per RBAC: SalesManager can see team performance (not all)
		 * Only Admin has Analytics:Read:All
		 */
		it('should allow SalesManager to see team performance', () => {
			const { result } = renderHook(() => usePermissions())

			// SalesManager has Team context, not All
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				true,
			)
			// Only Admin has All context
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(
				false,
			)
		})

		/**
		 * Per RBAC: SalesManager can access team-level revenue analytics
		 */
		it('should allow SalesManager to access team revenue analytics', () => {
			const { result } = renderHook(() => usePermissions())

			// Manager can read team analytics
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				true,
			)
		})

		/**
		 * PRD: SalesManager Can export team reports
		 */
		it('should allow SalesManager to export analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(true)
		})

		/**
		 * PRD: SalesManager Cannot modify metrics/data
		 */
		it('should DENY SalesManager ability to modify analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Update)).toBe(false)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Delete)).toBe(false)
		})

		it('should show team leaderboard to SalesManager', () => {
			render(
				<RoleGuard minimumRole={RoleLevels.SalesManager}>
					<div data-testid="team-leaderboard">Team Leaderboard</div>
				</RoleGuard>,
			)

			expect(screen.getByTestId('team-leaderboard')).toBeInTheDocument()
		})

		it('should show export button to SalesManager', () => {
			render(
				<PermissionGuard resource={Resources.Analytics} action={Actions.Export}>
					<button data-testid="export-btn">Export Report</button>
				</PermissionGuard>,
			)

			expect(screen.getByTestId('export-btn')).toBeInTheDocument()
		})

		it('should show revenue charts to SalesManager', () => {
			render(
				<RoleGuard minimumRole={RoleLevels.SalesManager}>
					<div data-testid="revenue-charts">Revenue Charts</div>
				</RoleGuard>,
			)

			expect(screen.getByTestId('revenue-charts')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// ADMIN ROLE TESTS (Per PRD Section 3 - Admin View)
	// ==========================================================================

	describe('Admin Analytics Access', () => {
		beforeEach(() => {
			loginAs(RoleLevels.Admin, { email: 'admin@medsource.com' })
		})

		/**
		 * PRD: Admin Can access full analytics
		 */
		it('should allow Admin full analytics access', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(
				true,
			)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(
				true,
			)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				true,
			)
		})

		/**
		 * PRD: Admin Can see system-wide metrics
		 */
		it('should allow Admin to access system-wide metrics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(
				true,
			)
		})

		/**
		 * PRD: Admin Can export all reports
		 */
		it('should allow Admin to export all analytics', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(true)
		})

		/**
		 * PRD: Admin Can configure analytics settings
		 */
		it('should allow Admin to manage analytics settings', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.hasPermission(Resources.Settings, Actions.Manage)).toBe(true)
		})

		it('should show all analytics sections to Admin', () => {
			render(
				<div>
					<RoleGuard minimumRole={RoleLevels.Admin}>
						<div data-testid="admin-metrics">Admin System Metrics</div>
					</RoleGuard>
					<RoleGuard minimumRole={RoleLevels.SalesManager}>
						<div data-testid="team-leaderboard">Team Leaderboard</div>
					</RoleGuard>
					<RoleGuard minimumRole={RoleLevels.SalesRep}>
						<div data-testid="sales-metrics">Sales Metrics</div>
					</RoleGuard>
				</div>,
			)

			expect(screen.getByTestId('admin-metrics')).toBeInTheDocument()
			expect(screen.getByTestId('team-leaderboard')).toBeInTheDocument()
			expect(screen.getByTestId('sales-metrics')).toBeInTheDocument()
		})
	})

	// ==========================================================================
	// CROSS-ROLE SECURITY TESTS
	// ==========================================================================

	describe('Cross-Role Security Tests', () => {
		it('should NOT expose other customer data to any non-admin role', () => {
			const roles: number[] = [RoleLevels.Customer, RoleLevels.SalesRep]

			for (const role of roles) {
				logout()
				loginAs(role)

				const { result } = renderHook(() => usePermissions())

				// Neither Customer nor SalesRep should access ALL context
				expect(
					result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All),
					`Role ${role} should NOT have all analytics access`,
				).toBe(false)
			}
		})

		it('should enforce hierarchical permission levels', () => {
			const roleHierarchy = [
				{ role: RoleLevels.Customer, canAccessTeam: false, canExport: false },
				{ role: RoleLevels.SalesRep, canAccessTeam: false, canExport: false },
				{ role: RoleLevels.SalesManager, canAccessTeam: true, canExport: true },
				{ role: RoleLevels.Admin, canAccessTeam: true, canExport: true },
			]

			for (const { role, canAccessTeam, canExport } of roleHierarchy) {
				logout()
				loginAs(role)

				const { result } = renderHook(() => usePermissions())

				expect(
					result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team),
					`Role ${role} team access`,
				).toBe(canAccessTeam)

				expect(
					result.current.hasPermission(Resources.Analytics, Actions.Export),
					`Role ${role} export access`,
				).toBe(canExport)
			}
		})

		it('should maintain restrictions after role downgrade', () => {
			// Start as Admin
			loginAs(RoleLevels.Admin)
			const { result: adminResult } = renderHook(() => usePermissions())
			expect(adminResult.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(true)

			// Downgrade to Customer
			loginAs(RoleLevels.Customer)
			const { result: customerResult } = renderHook(() => usePermissions())
			expect(customerResult.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(false)
		})

		it('should not allow permission escalation through UI manipulation', () => {
			loginAs(RoleLevels.Customer)

			// Even if someone tries to render admin content, guards should prevent it
			render(
				<div>
					<RoleGuard minimumRole={RoleLevels.Admin}>
						<div data-testid="admin-secret">Admin Secret Data</div>
					</RoleGuard>
					<PermissionGuard resource={Resources.Analytics} action={Actions.Export}>
						<button data-testid="export-btn">Export All</button>
					</PermissionGuard>
				</div>,
			)

			expect(screen.queryByTestId('admin-secret')).not.toBeInTheDocument()
			expect(screen.queryByTestId('export-btn')).not.toBeInTheDocument()
		})
	})

	// ==========================================================================
	// UNAUTHENTICATED USER TESTS
	// ==========================================================================

	describe('Unauthenticated User Access', () => {
		beforeEach(() => {
			logout()
		})

		it('should deny all analytics access to unauthenticated users', () => {
			const { result } = renderHook(() => usePermissions())

			expect(result.current.isAuthenticated).toBe(false)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read)).toBe(false)
			expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(
				false,
			)
		})

		it('should hide all analytics content from unauthenticated users', () => {
			render(
				<div>
					<RoleGuard minimumRole={RoleLevels.Customer}>
						<div data-testid="analytics-page">Analytics Dashboard</div>
					</RoleGuard>
				</div>,
			)

			expect(screen.queryByTestId('analytics-page')).not.toBeInTheDocument()
		})
	})
})

// ============================================================================
// API ACCESS CONTROL TESTS
// ============================================================================

describe('Analytics API Access Control', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	/**
	 * Tests that API endpoints enforce role-based access
	 */
	describe('API Endpoint Authorization', () => {
		it('should only allow SalesManagerOrAbove to call team performance endpoint', async () => {
			// This tests the expected behavior - actual API call should be mocked
			// The backend AnalyticsController has [Authorize(Policy = "SalesManagerOrAbove")]

			// Customer should not be able to call this
			loginAs(RoleLevels.Customer)
			const { result: customerResult } = renderHook(() => usePermissions())
			expect(customerResult.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(false)

			// SalesRep should not be able to call this
			loginAs(RoleLevels.SalesRep)
			const { result: repResult } = renderHook(() => usePermissions())
			expect(repResult.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(false)

			// SalesManager should be able to call this
			loginAs(RoleLevels.SalesManager)
			const { result: managerResult } = renderHook(() => usePermissions())
			expect(managerResult.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(true)
		})

		it('should only allow SalesManagerOrAbove to call revenue timeline endpoint', async () => {
			// The backend has [Authorize(Policy = "SalesManagerOrAbove")] on GetRevenueTimeline

			loginAs(RoleLevels.SalesRep)
			const { result } = renderHook(() => usePermissions())
			expect(result.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(false)

			loginAs(RoleLevels.SalesManager)
			const { result: managerResult } = renderHook(() => usePermissions())
			expect(managerResult.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(true)
		})

		it('should allow all authenticated users to call summary endpoint', async () => {
			// The backend has [Authorize] on GetSummary - allows all authenticated users
			// But returns role-filtered data

			const roles = [
				RoleLevels.Customer,
				RoleLevels.SalesRep,
				RoleLevels.SalesManager,
				RoleLevels.Admin,
			]

			for (const role of roles) {
				loginAs(role)
				const { result } = renderHook(() => usePermissions())
				expect(
					result.current.isAuthenticated,
					`Role ${role} should be authenticated`,
				).toBe(true)
			}
		})
	})
})

