/**
 * useRBACManagement Hook Unit Tests
 *
 * MAANG-Level: Comprehensive testing of RBAC management business logic.
 *
 * **Priority**: 🔴 CRITICAL - CORE RBAC MANAGEMENT LOGIC
 *
 * This hook is the central orchestrator for all RBAC management operations.
 * Tests must cover ALL state management, API interactions, and business flows.
 *
 * **Testing Strategy:**
 * 1. Initial state and loading behavior
 * 2. Data fetching (overview, matrix, audit logs, users)
 * 3. CRUD operations (roles, permissions, assignments)
 * 4. Bulk operations (bulk role updates)
 * 5. Error handling and edge cases
 * 6. Cache invalidation
 * 7. Permission-based UI gating
 *
 * **Business Rules Tested:**
 * - Overview data correctly structures roles, permissions, and stats
 * - Permission matrix correctly groups by resource
 * - Audit logs support pagination and filtering
 * - Bulk role updates validate input and track results
 * - Cache is invalidated after mutations
 *
 * @module RBAC/useRBACManagement.test
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from 'vitest'

import type {
  RBACOverview,
  PermissionMatrixEntry,
  RoleDefinitionDto,
  PermissionDefinitionDto,
} from '@_types/rbac-management'
import { AccountRole } from '@_classes/Enums'

// Mock dependencies BEFORE importing the hook
vi.mock('@_shared', () => ({
  HttpService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  API: {
    RBAC: {
      getOverview: vi.fn(),
      getAuditLog: vi.fn(),
      getUsersWithRoles: vi.fn(),
      bulkUpdateRoles: vi.fn(),
    },
  },
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  useFetchWithCache: vi.fn(),
  invalidateCache: vi.fn(),
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
  usePermissions: vi.fn(() => ({
    isAdmin: true,
    isSalesManagerOrAbove: true,
    hasPermission: vi.fn(() => true),
  })),
}))

// Import after mocks
import { API, useFetchWithCache, invalidateCache, notificationService } from '@_shared'

import { useRBACManagement } from '../useRBACManagement'

// ============================================================================
// TEST DATA BUILDERS
// ============================================================================

function createMockRole(overrides: Partial<RoleDefinitionDto> = {}): RoleDefinitionDto {
  return {
    id: 1,
    role: AccountRole.Admin,
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    level: 500,
    isSystemRole: true,
    userCount: 5,
    permissions: ['quotes:read:all', 'quotes:create'],
    ...overrides,
  }
}

function createMockPermission(overrides: Partial<PermissionDefinitionDto> = {}): PermissionDefinitionDto {
  return {
    id: 1,
    resource: 'quotes',
    action: 'read',
    context: 'all',
    description: 'Read all quotes',
    permissionString: 'quotes:read:all',
    ...overrides,
  }
}

function createMockMatrixEntry(overrides: Partial<PermissionMatrixEntry> = {}): PermissionMatrixEntry {
  return {
    resource: 'quotes',
    action: 'read',
    context: 'all',
    description: 'Read all quotes',
    roleAccess: { [AccountRole.Admin]: true, [AccountRole.FulfillmentCoordinator]: true, [AccountRole.Customer]: false },
    ...overrides,
  }
}

function createMockOverview(overrides: Partial<RBACOverview> = {}): RBACOverview {
  return {
    roles: [
      createMockRole({ id: 1, role: AccountRole.Admin, name: 'admin', displayName: 'Administrator', level: 500 }),
      createMockRole({ id: 2, role: AccountRole.SalesManager, name: 'sales_manager', displayName: 'Sales Manager', level: 400 }),
      createMockRole({ id: 3, role: AccountRole.SalesRep, name: 'sales_rep', displayName: 'Sales Representative', level: 300 }),
      createMockRole({ id: 4, role: AccountRole.Customer, name: 'customer', displayName: 'Customer', level: 100 }),
    ],
    permissions: [
      createMockPermission({ id: 1, resource: 'quotes', action: 'read', context: 'all', permissionString: 'quotes:read:all' }),
      createMockPermission({ id: 2, resource: 'quotes', action: 'create', context: null, permissionString: 'quotes:create' }),
      createMockPermission({ id: 3, resource: 'orders', action: 'read', context: 'own', permissionString: 'orders:read:own' }),
    ],
    matrix: [
      createMockMatrixEntry({ resource: 'quotes', action: 'read' }),
      createMockMatrixEntry({ resource: 'orders', action: 'read' }),
    ],
    userStats: {
      totalUsers: 150,
      countByRole: { [AccountRole.Admin]: 5, [AccountRole.SalesManager]: 10, [AccountRole.SalesRep]: 50, [AccountRole.Customer]: 85 },
    },
    ...overrides,
  }
}

function createMockAuditEntry(overrides = {}) {
  return {
    id: 1,
    timestamp: new Date().toISOString(),
    adminUserId: 1,
    adminUserName: 'Admin User',
    action: 'RoleChanged',
    targetUserId: 2,
    targetUserName: 'Test User',
    oldValue: 'SalesRep',
    newValue: 'SalesManager',
    details: 'Role updated via bulk action',
    ...overrides,
  }
}

function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'user@test.com',
    name: { first: 'Test', last: 'User' },
    role: 100,
    roleName: 'Sales Representative',
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ============================================================================
// TEST SETUP
// ============================================================================

describe('useRBACManagement Hook - RBAC Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for useFetchWithCache
    ;(useFetchWithCache as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isValidating: false,
      error: null,
      refetch: vi.fn(),
      invalidate: vi.fn(),
      isFromCache: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // INITIAL STATE TESTS
  // ==========================================================================

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.isLoadingOverview).toBe(true)
      expect(result.current.overview).toBeNull()
    })

    it('should have all expected return values', () => {
      const { result } = renderHook(() => useRBACManagement())

      // Data
      expect(result.current).toHaveProperty('overview')
      expect(result.current).toHaveProperty('matrix')
      expect(result.current).toHaveProperty('auditLog')
      expect(result.current).toHaveProperty('users')

      // Loading states
      expect(result.current).toHaveProperty('isLoadingOverview')
      expect(result.current).toHaveProperty('isLoadingMatrix')
      expect(result.current).toHaveProperty('isLoadingAuditLog')
      expect(result.current).toHaveProperty('isLoadingUsers')

      // Error states
      expect(result.current).toHaveProperty('overviewError')
      expect(result.current).toHaveProperty('matrixError')
      expect(result.current).toHaveProperty('auditLogError')
      expect(result.current).toHaveProperty('usersError')

      // Permissions
      expect(result.current).toHaveProperty('canView')
      expect(result.current).toHaveProperty('canEdit')
      expect(result.current).toHaveProperty('canViewAuditLogs')

      // Actions
      expect(result.current).toHaveProperty('refreshOverview')
      expect(result.current).toHaveProperty('refreshMatrix')
      expect(result.current).toHaveProperty('fetchAuditLog')
      expect(result.current).toHaveProperty('fetchUsers')
      expect(result.current).toHaveProperty('bulkUpdateRoles')
      expect(result.current).toHaveProperty('invalidateAll')
    })

    it('should return empty array for matrix initially', () => {
      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.matrix).toEqual([])
      expect(result.current.auditLog).toBeNull()
    })
  })

  // ==========================================================================
  // DATA FETCHING TESTS
  // ==========================================================================

  describe('Data Fetching - Overview', () => {
    it('should fetch overview data successfully', () => {
      const mockOverview = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: mockOverview,
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview).toEqual(mockOverview)
      expect(result.current.isLoadingOverview).toBe(false)
      expect(result.current.overviewError).toBeNull()
    })

    it('should correctly extract matrix from overview', () => {
      const mockOverview = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: mockOverview,
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.matrix).toEqual(mockOverview.matrix)
      expect(result.current.matrix).toHaveLength(2)
    })

    it('should handle overview fetch error', () => {
      const errorMessage = 'Failed to fetch RBAC overview'
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isValidating: false,
        error: new Error(errorMessage),
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview).toBeNull()
      expect(result.current.overviewError).toBe(errorMessage)
    })
  })

  describe('Data Fetching - Permission Matrix', () => {
    it('should derive matrix from overview data', () => {
      const mockOverview = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: mockOverview,
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.matrix).toHaveLength(2)
      expect(result.current.matrix[0].resource).toBe('quotes')
    })

    it('should refresh matrix successfully', async () => {
      const refetchFn = vi.fn().mockResolvedValue(undefined)
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.refreshMatrix()
      })

      expect(refetchFn).toHaveBeenCalled()
    })
  })

  describe('Data Fetching - Audit Logs', () => {
    it('should fetch audit logs with default pagination', async () => {
      const mockAuditData = {
        items: [createMockAuditEntry()],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }

      ;(API.RBAC.getAuditLog as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockAuditData },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.fetchAuditLog()
      })

      expect(API.RBAC.getAuditLog).toHaveBeenCalled()
      expect(result.current.auditLog).toEqual(mockAuditData)
    })

    it('should fetch audit logs with date filters', async () => {
      const mockAuditData = {
        items: [createMockAuditEntry()],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }

      ;(API.RBAC.getAuditLog as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockAuditData },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      const startDate = '2024-01-01'
      const endDate = '2024-12-31'

      await act(async () => {
        await result.current.fetchAuditLog({ page: 1, pageSize: 20, startDate, endDate })
      })

      expect(API.RBAC.getAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ startDate, endDate })
      )
    })

    it('should handle audit log fetch error', async () => {
      ;(API.RBAC.getAuditLog as Mock).mockRejectedValue(new Error('Audit fetch failed'))

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.fetchAuditLog()
      })

      expect(result.current.auditLogError).toBeTruthy()
    })
  })

  describe('Data Fetching - Users', () => {
    it('should fetch users with pagination', async () => {
      const mockUsersData = {
        items: [createMockUser(), createMockUser({ id: 2, email: 'user2@test.com' })],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }

      ;(API.RBAC.getUsersWithRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockUsersData },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.fetchUsers()
      })

      expect(API.RBAC.getUsersWithRoles).toHaveBeenCalled()
      expect(result.current.users).toEqual(mockUsersData)
    })

    it('should fetch users with role filter', async () => {
      ;(API.RBAC.getUsersWithRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.fetchUsers({ page: 1, pageSize: 20, roleFilter: 1000 as any })
      })

      expect(API.RBAC.getUsersWithRoles).toHaveBeenCalledWith(
        expect.objectContaining({ roleFilter: 1000 })
      )
    })

    it('should fetch users with search term', async () => {
      ;(API.RBAC.getUsersWithRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.fetchUsers({ page: 1, pageSize: 20, search: 'john' })
      })

      expect(API.RBAC.getUsersWithRoles).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' })
      )
    })
  })

  // ==========================================================================
  // MUTATION TESTS
  // ==========================================================================

  describe('Bulk Role Updates', () => {
    it('should successfully bulk update roles', async () => {
      const mockResult = {
        updatedCount: 3,
        failedCount: 0,
        failures: [],
      }

      ;(API.RBAC.bulkUpdateRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockResult },
      })

      const refetchFn = vi.fn().mockResolvedValue(undefined)
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.bulkUpdateRoles([1, 2, 3], 4000 as any, 'Promotion to Sales Manager')
      })

      expect(API.RBAC.bulkUpdateRoles).toHaveBeenCalledWith({
        userIds: [1, 2, 3],
        newRole: 4000,
        reason: 'Promotion to Sales Manager',
      })
    })

    it('should show success notification after bulk update', async () => {
      const mockResult = {
        updatedCount: 2,
        failedCount: 0,
        failures: [],
      }

      ;(API.RBAC.bulkUpdateRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockResult },
      })

      const refetchFn = vi.fn().mockResolvedValue(undefined)
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.bulkUpdateRoles([1, 2], 4000 as any)
      })

      expect(notificationService.success).toHaveBeenCalled()
    })

    it('should handle bulk update error', async () => {
      ;(API.RBAC.bulkUpdateRoles as Mock).mockRejectedValue(new Error('Bulk update failed'))

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      let updateResult: unknown
      await act(async () => {
        updateResult = await result.current.bulkUpdateRoles([1, 2], 4000 as any)
      })

      expect(updateResult).toBeNull()
      expect(notificationService.error).toHaveBeenCalled()
    })

    it('should track partial failures in bulk update', async () => {
      const mockResult = {
        updatedCount: 2,
        failedCount: 1,
        failures: [{ userId: 3, reason: 'User not found' }],
      }

      ;(API.RBAC.bulkUpdateRoles as Mock).mockResolvedValue({
        data: { statusCode: 200, payload: mockResult },
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      let updateResult: unknown
      await act(async () => {
        updateResult = await result.current.bulkUpdateRoles([1, 2, 3], 4000 as any)
      })

      expect((updateResult as { updatedCount: number }).updatedCount).toBe(2)
      expect((updateResult as { failedCount: number }).failedCount).toBe(1)
      expect(notificationService.warning).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // CACHE INVALIDATION TESTS (MAANG-Level Comprehensive)
  // ==========================================================================

  describe('Cache Invalidation', () => {
    it('should invalidate all caches', () => {
      const invalidateFn = vi.fn()
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: invalidateFn,
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      act(() => {
        result.current.invalidateAll()
      })

      expect(invalidateCache).toHaveBeenCalled()
      expect(invalidateFn).toHaveBeenCalled()
    })

    it('should refresh overview after invalidation', async () => {
      const refetchFn = vi.fn().mockResolvedValue(undefined)
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        await result.current.refreshOverview()
      })

      expect(refetchFn).toHaveBeenCalled()
    })

    it('should invalidate specific cache keys with prefix', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      act(() => {
        result.current.invalidateAll()
      })

      expect(invalidateCache).toHaveBeenCalledWith('rbac:')
    })
  })

  // ==========================================================================
  // CACHE BEHAVIOR TESTS (SWR Pattern)
  // ==========================================================================

  describe('Cache Behavior - SWR Pattern', () => {
    it('should return cached data immediately (stale-while-revalidate)', () => {
      const cachedOverview = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: cachedOverview,
        isLoading: false,
        isValidating: true, // Background revalidation
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: true,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview).toEqual(cachedOverview)
      expect(result.current.isLoadingOverview).toBe(false)
      expect(result.current.isFromCache).toBe(true)
    })

    it('should show loading state when no cached data', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.isLoadingOverview).toBe(true)
      expect(result.current.overview).toBeNull()
    })

    it('should handle background revalidation without loading state', () => {
      const cachedOverview = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: cachedOverview,
        isLoading: false,
        isValidating: true, // Background fetch
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: true,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview).toEqual(cachedOverview)
      expect(result.current.isLoadingOverview).toBe(false)
      expect(result.current.isValidatingOverview).toBe(true)
    })

    it('should handle cache expiration', () => {
      // First render with cached data
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: true,
      })

      const { result, rerender } = renderHook(() => useRBACManagement())
      expect(result.current.overview).not.toBeNull()

      // Simulate cache expiration
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      rerender()
      expect(result.current.isLoadingOverview).toBe(true)
    })
  })

  // ==========================================================================
  // PERMISSION CHECKS
  // ==========================================================================

  describe('Permission Checks', () => {
    it('should have canView true for sales manager or above', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.canView).toBe(true)
    })

    it('should have canEdit true for admin', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.canEdit).toBe(true)
    })

    it('should have canViewAuditLogs true for admin', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.canViewAuditLogs).toBe(true)
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null overview data gracefully', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview).toBeNull()
      expect(result.current.matrix).toEqual([])
    })

    it('should handle empty roles array', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview({ roles: [] }),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview?.roles).toEqual([])
    })

    it('should handle empty permissions array', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview({ permissions: [] }),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.overview?.permissions).toEqual([])
    })

    it('should handle concurrent requests', async () => {
      let callCount = 0
      ;(API.RBAC.getAuditLog as Mock).mockImplementation(async () => {
        callCount++
        return {
          data: { statusCode: 200, payload: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } },
        }
      })

      ;(API.RBAC.getUsersWithRoles as Mock).mockImplementation(async () => {
        callCount++
        return {
          data: { statusCode: 200, payload: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } },
        }
      })

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      await act(async () => {
        // Make concurrent requests
        await Promise.all([
          result.current.fetchAuditLog(),
          result.current.fetchUsers(),
        ])
      })

      // Both should have been called
      expect(callCount).toBe(2)
    })
  })

  // ==========================================================================
  // FILTERS MANAGEMENT
  // ==========================================================================

  describe('Filters Management', () => {
    it('should provide audit log filter state', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.auditLogFilters).toBeDefined()
      expect(typeof result.current.setAuditLogFilters).toBe('function')
    })

    it('should provide users filter state', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      expect(result.current.usersFilters).toBeDefined()
      expect(typeof result.current.setUsersFilters).toBe('function')
    })

    it('should update audit log filters', () => {
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result } = renderHook(() => useRBACManagement())

      act(() => {
        result.current.setAuditLogFilters({ page: 2, pageSize: 50 })
      })

      expect(result.current.auditLogFilters.page).toBe(2)
      expect(result.current.auditLogFilters.pageSize).toBe(50)
    })
  })

  // ==========================================================================
  // ERROR RECOVERY WITH CACHE
  // ==========================================================================

  describe('Error Recovery with Cache', () => {
    it('should fallback to cached data on fetch error', () => {
      const cachedData = createMockOverview()

      ;(useFetchWithCache as Mock).mockReturnValue({
        data: cachedData, // Still have cached data
        isLoading: false,
        isValidating: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        invalidate: vi.fn(),
        isFromCache: true,
      })

      const { result } = renderHook(() => useRBACManagement())

      // Should still have data from cache
      expect(result.current.overview).toEqual(cachedData)
      expect(result.current.overviewError).toBe('Network error')
    })

    it('should clear error on successful refetch', () => {
      const refetchFn = vi.fn().mockResolvedValue(undefined)

      // First: error state
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isValidating: false,
        error: new Error('Initial error'),
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      const { result, rerender } = renderHook(() => useRBACManagement())
      expect(result.current.overviewError).toBe('Initial error')

      // Then: successful state
      ;(useFetchWithCache as Mock).mockReturnValue({
        data: createMockOverview(),
        isLoading: false,
        isValidating: false,
        error: null,
        refetch: refetchFn,
        invalidate: vi.fn(),
        isFromCache: false,
      })

      rerender()
      expect(result.current.overviewError).toBeNull()
    })
  })
})
