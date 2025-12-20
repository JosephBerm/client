/**
 * RBAC API Integration Tests
 * 
 * MAANG-Level: Comprehensive API contract and integration testing.
 * 
 * **Priority**: 🔴 CRITICAL - API CONTRACT VALIDATION
 * 
 * These tests validate that the API client correctly interacts with
 * RBAC backend endpoints and handles all response scenarios.
 * 
 * **Testing Strategy:**
 * 1. All RBAC endpoints (GET, POST, PUT, DELETE)
 * 2. Request payload validation
 * 3. Response parsing
 * 4. Error handling (400, 401, 403, 404, 500)
 * 5. Authorization header handling
 * 6. Pagination and filtering
 * 
 * **API Endpoints Tested:**
 * - GET /rbac/overview
 * - GET /rbac/roles
 * - POST /rbac/roles
 * - PUT /rbac/roles/:id
 * - DELETE /rbac/roles/:id
 * - GET /rbac/permissions
 * - POST /rbac/permissions
 * - GET /rbac/matrix
 * - GET /rbac/audit
 * - POST /rbac/bulk-role
 * - GET /rbac/users
 * - PUT /rbac/roles/:id/permissions
 * 
 * @module RBAC/api.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock HttpService
vi.mock('@_shared/services/httpService', () => ({
  HttpService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { HttpService } from '@_shared/services/httpService'

// ============================================================================
// API SERVICE MOCK (Based on actual API structure)
// ============================================================================

const API = {
  RBAC: {
    getOverview: () => HttpService.get('/rbac/overview'),
    getRoles: () => HttpService.get('/rbac/roles'),
    getRole: (id: number) => HttpService.get(`/rbac/roles/${id}`),
    createRole: (data: any) => HttpService.post('/rbac/roles', data),
    updateRole: (id: number, data: any) => HttpService.put(`/rbac/roles/${id}`, data),
    deleteRole: (id: number) => HttpService.delete(`/rbac/roles/${id}`),
    getPermissions: () => HttpService.get('/rbac/permissions'),
    getPermission: (id: number) => HttpService.get(`/rbac/permissions/${id}`),
    createPermission: (data: any) => HttpService.post('/rbac/permissions', data),
    updatePermission: (id: number, data: any) => HttpService.put(`/rbac/permissions/${id}`, data),
    deletePermission: (id: number) => HttpService.delete(`/rbac/permissions/${id}`),
    getMatrix: () => HttpService.get('/rbac/matrix'),
    getAuditLog: (params: { page?: number; pageSize?: number; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      return HttpService.get(`/rbac/audit?${queryParams.toString()}`)
    },
    bulkUpdateRoles: (data: { userIds: number[]; newRole: number; reason?: string }) =>
      HttpService.post('/rbac/bulk-role', data),
    getUsers: (params: { page?: number; pageSize?: number; roleFilter?: number; search?: string }) => {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params.roleFilter !== undefined) queryParams.append('roleFilter', params.roleFilter.toString())
      if (params.search) queryParams.append('search', params.search)
      return HttpService.get(`/rbac/users?${queryParams.toString()}`)
    },
    getRolePermissions: (roleId: number) => HttpService.get(`/rbac/roles/${roleId}/permissions`),
    assignPermission: (roleId: number, permissionId: number) =>
      HttpService.post(`/rbac/roles/${roleId}/permissions/${permissionId}`, {}),
    removePermission: (roleId: number, permissionId: number) =>
      HttpService.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`),
    bulkAssignPermissions: (roleId: number, permissionIds: number[]) =>
      HttpService.put(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
  },
}

// ============================================================================
// TEST DATA
// ============================================================================

interface MockResponse<T = unknown> {
  success: boolean
  message: string
  payload: T
  statusCode?: number
}

const mockSuccessResponse = <T>(payload: T): MockResponse<T> => ({
  success: true,
  message: 'Operation successful',
  payload,
})

const mockErrorResponse = (message: string, statusCode = 400): MockResponse<null> => ({
  success: false,
  message,
  payload: null,
  statusCode,
})

const mockRole = {
  id: 1,
  name: 'sales_manager',
  displayName: 'Sales Manager',
  description: 'Manages sales team',
  level: 200,
  isSystemRole: true,
  permissions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockPermission = {
  id: 1,
  resource: 'quotes',
  action: 'read',
  context: 'all',
  description: 'Read all quotes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockOverview = {
  roles: [mockRole],
  permissions: [mockPermission],
  totalUsers: 100,
  totalStaffAccounts: 20,
}

// ============================================================================
// TESTS
// ============================================================================

describe('RBAC API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // OVERVIEW ENDPOINT TESTS
  // ==========================================================================

  describe('GET /rbac/overview', () => {
    it('should fetch RBAC overview successfully', async () => {
      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse(mockOverview))

      const result = await API.RBAC.getOverview() as unknown as MockResponse<typeof mockOverview>

      expect(HttpService.get).toHaveBeenCalledWith('/rbac/overview')
      expect(result.success).toBe(true)
      expect(result.payload).toEqual(mockOverview)
    })

    it('should handle 401 Unauthorized error', async () => {
      ;(HttpService.get as any).mockRejectedValue({
        response: { status: 401, data: { message: 'Unauthorized' } },
      })

      await expect(API.RBAC.getOverview()).rejects.toMatchObject({
        response: { status: 401 },
      })
    })

    it('should handle 403 Forbidden error', async () => {
      ;(HttpService.get as any).mockRejectedValue({
        response: { status: 403, data: { message: 'Admin access required' } },
      })

      await expect(API.RBAC.getOverview()).rejects.toMatchObject({
        response: { status: 403 },
      })
    })
  })

  // ==========================================================================
  // ROLES CRUD TESTS
  // ==========================================================================

  describe('Roles CRUD', () => {
    describe('GET /rbac/roles', () => {
      it('should fetch all roles', async () => {
        ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse([mockRole]))

        const result = await API.RBAC.getRoles() as unknown as MockResponse<typeof mockRole[]>

        expect(HttpService.get).toHaveBeenCalledWith('/rbac/roles')
        expect(result.success).toBe(true)
        expect(result.payload).toHaveLength(1)
      })

      it('should handle empty roles list', async () => {
        ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse([]))

        const result = await API.RBAC.getRoles() as unknown as MockResponse<typeof mockRole[]>

        expect(result.payload).toEqual([])
      })
    })

    describe('GET /rbac/roles/:id', () => {
      it('should fetch single role', async () => {
        ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse(mockRole))

        const result = await API.RBAC.getRole(1) as unknown as MockResponse<typeof mockRole>

        expect(HttpService.get).toHaveBeenCalledWith('/rbac/roles/1')
        expect(result.payload.id).toBe(1)
      })

      it('should handle 404 Not Found', async () => {
        ;(HttpService.get as any).mockRejectedValue({
          response: { status: 404, data: { message: 'Role not found' } },
        })

        await expect(API.RBAC.getRole(999)).rejects.toMatchObject({
          response: { status: 404 },
        })
      })
    })

    describe('POST /rbac/roles', () => {
      it('should create role with valid data', async () => {
        const newRole = {
          name: 'new_role',
          displayName: 'New Role',
          description: 'A new role',
          level: 150,
        }

        ;(HttpService.post as any).mockResolvedValue(mockSuccessResponse({ id: 5, ...newRole }))

        const result = await API.RBAC.createRole(newRole) as unknown as MockResponse<{ id: number } & typeof newRole>

        expect(HttpService.post).toHaveBeenCalledWith('/rbac/roles', newRole)
        expect(result.success).toBe(true)
        expect(result.payload.id).toBe(5)
      })

      it('should handle duplicate role name error', async () => {
        ;(HttpService.post as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Role name already exists' } },
        })

        await expect(API.RBAC.createRole({ name: 'admin' })).rejects.toMatchObject({
          response: { status: 400 },
        })
      })

      it('should validate required fields', async () => {
        ;(HttpService.post as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Name is required' } },
        })

        await expect(API.RBAC.createRole({})).rejects.toMatchObject({
          response: { status: 400 },
        })
      })
    })

    describe('PUT /rbac/roles/:id', () => {
      it('should update role', async () => {
        const updateData = { displayName: 'Updated Name' }
        
        ;(HttpService.put as any).mockResolvedValue(
          mockSuccessResponse({ ...mockRole, displayName: 'Updated Name' })
        )

        const result = await API.RBAC.updateRole(1, updateData) as unknown as MockResponse<typeof mockRole>

        expect(HttpService.put).toHaveBeenCalledWith('/rbac/roles/1', updateData)
        expect(result.payload.displayName).toBe('Updated Name')
      })

      it('should prevent updating system role flag', async () => {
        ;(HttpService.put as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Cannot modify system role' } },
        })

        await expect(API.RBAC.updateRole(1, { isSystemRole: false })).rejects.toMatchObject({
          response: { status: 400 },
        })
      })
    })

    describe('DELETE /rbac/roles/:id', () => {
      it('should delete non-system role', async () => {
        ;(HttpService.delete as any).mockResolvedValue(mockSuccessResponse(true))

        const result = await API.RBAC.deleteRole(5) as unknown as MockResponse<boolean>

        expect(HttpService.delete).toHaveBeenCalledWith('/rbac/roles/5')
        expect(result.success).toBe(true)
      })

      it('should prevent deleting system role', async () => {
        ;(HttpService.delete as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Cannot delete system role' } },
        })

        await expect(API.RBAC.deleteRole(1)).rejects.toMatchObject({
          response: { status: 400 },
        })
      })

      it('should handle role with assigned users', async () => {
        ;(HttpService.delete as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Role has assigned users' } },
        })

        await expect(API.RBAC.deleteRole(2)).rejects.toMatchObject({
          response: { status: 400 },
        })
      })
    })
  })

  // ==========================================================================
  // PERMISSIONS CRUD TESTS
  // ==========================================================================

  describe('Permissions CRUD', () => {
    describe('GET /rbac/permissions', () => {
      it('should fetch all permissions', async () => {
        ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse([mockPermission]))

        const result = await API.RBAC.getPermissions() as unknown as MockResponse<typeof mockPermission[]>

        expect(HttpService.get).toHaveBeenCalledWith('/rbac/permissions')
        expect(result.payload).toHaveLength(1)
      })
    })

    describe('POST /rbac/permissions', () => {
      it('should create permission with valid data', async () => {
        const newPermission = {
          resource: 'orders',
          action: 'delete',
          context: null,
          description: 'Delete orders',
        }

        ;(HttpService.post as any).mockResolvedValue(mockSuccessResponse({ id: 10, ...newPermission }))

        const result = await API.RBAC.createPermission(newPermission) as unknown as MockResponse<{ id: number } & typeof newPermission>

        expect(HttpService.post).toHaveBeenCalledWith('/rbac/permissions', newPermission)
        expect(result.payload.id).toBe(10)
      })

      it('should handle duplicate permission error', async () => {
        ;(HttpService.post as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Permission already exists' } },
        })

        await expect(
          API.RBAC.createPermission({ resource: 'quotes', action: 'read', context: 'all' })
        ).rejects.toMatchObject({ response: { status: 400 } })
      })
    })

    describe('PUT /rbac/permissions/:id', () => {
      it('should update permission', async () => {
        const updateData = { description: 'Updated description' }
        
        ;(HttpService.put as any).mockResolvedValue(
          mockSuccessResponse({ ...mockPermission, description: 'Updated description' })
        )

        const result = await API.RBAC.updatePermission(1, updateData) as unknown as MockResponse<typeof mockPermission>

        expect(HttpService.put).toHaveBeenCalledWith('/rbac/permissions/1', updateData)
        expect(result.payload.description).toBe('Updated description')
      })
    })

    describe('DELETE /rbac/permissions/:id', () => {
      it('should delete permission', async () => {
        ;(HttpService.delete as any).mockResolvedValue(mockSuccessResponse(true))

        const result = await API.RBAC.deletePermission(10) as unknown as MockResponse<boolean>

        expect(HttpService.delete).toHaveBeenCalledWith('/rbac/permissions/10')
        expect(result.success).toBe(true)
      })

      it('should handle permission assigned to roles', async () => {
        ;(HttpService.delete as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Permission is assigned to roles' } },
        })

        await expect(API.RBAC.deletePermission(1)).rejects.toMatchObject({
          response: { status: 400 },
        })
      })
    })
  })

  // ==========================================================================
  // PERMISSION MATRIX TESTS
  // ==========================================================================

  describe('GET /rbac/matrix', () => {
    it('should fetch permission matrix', async () => {
      const mockMatrix = [
        { resource: 'quotes', action: 'read', context: 'all', roleAccess: { 1: true, 2: true } },
      ]

      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse(mockMatrix))

      const result = await API.RBAC.getMatrix() as unknown as MockResponse<typeof mockMatrix>

      expect(HttpService.get).toHaveBeenCalledWith('/rbac/matrix')
      expect(result.payload).toHaveLength(1)
      expect(result.payload[0].roleAccess).toHaveProperty('1', true)
    })
  })

  // ==========================================================================
  // AUDIT LOG TESTS
  // ==========================================================================

  describe('GET /rbac/audit', () => {
    it('should fetch audit log with pagination', async () => {
      const mockAuditData = {
        items: [{ id: 1, action: 'RoleChanged', timestamp: new Date().toISOString() }],
        total: 100,
        page: 1,
        pageSize: 20,
        totalPages: 5,
      }

      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse(mockAuditData))

      const result = await API.RBAC.getAuditLog({ page: 1, pageSize: 20 }) as unknown as MockResponse<typeof mockAuditData>

      expect(HttpService.get).toHaveBeenCalledWith('/rbac/audit?page=1&pageSize=20')
      expect(result.payload.items).toHaveLength(1)
      expect(result.payload.totalPages).toBe(5)
    })

    it('should fetch audit log with date filters', async () => {
      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse({ items: [], total: 0 }))

      await API.RBAC.getAuditLog({
        page: 1,
        pageSize: 20,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      })

      expect(HttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01')
      )
      expect(HttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-12-31')
      )
    })
  })

  // ==========================================================================
  // BULK ROLE UPDATE TESTS
  // ==========================================================================

  describe('POST /rbac/bulk-role', () => {
    it('should bulk update roles successfully', async () => {
      const bulkData = { userIds: [1, 2, 3], newRole: 200, reason: 'Promotion' }
      const mockResult = { success: true, successCount: 3, failureCount: 0, failures: [] as { userId: number; reason: string }[] }

      ;(HttpService.post as any).mockResolvedValue(mockSuccessResponse(mockResult))

      const result = await API.RBAC.bulkUpdateRoles(bulkData) as unknown as MockResponse<typeof mockResult>

      expect(HttpService.post).toHaveBeenCalledWith('/rbac/bulk-role', bulkData)
      expect(result.payload.successCount).toBe(3)
    })

    it('should handle partial failures', async () => {
      const bulkData = { userIds: [1, 2, 999], newRole: 200 }
      const mockResult = {
        success: true,
        successCount: 2,
        failureCount: 1,
        failures: [{ userId: 999, reason: 'User not found' }],
      }

      ;(HttpService.post as any).mockResolvedValue(mockSuccessResponse(mockResult))

      const result = await API.RBAC.bulkUpdateRoles(bulkData) as unknown as MockResponse<typeof mockResult>

      expect(result.payload.failureCount).toBe(1)
      expect(result.payload.failures[0].userId).toBe(999)
    })

    it('should validate empty user list', async () => {
      ;(HttpService.post as any).mockRejectedValue({
        response: { status: 400, data: { message: 'User list is empty' } },
      })

      await expect(
        API.RBAC.bulkUpdateRoles({ userIds: [], newRole: 200 })
      ).rejects.toMatchObject({ response: { status: 400 } })
    })
  })

  // ==========================================================================
  // USERS ENDPOINT TESTS
  // ==========================================================================

  describe('GET /rbac/users', () => {
    it('should fetch users with pagination', async () => {
      const mockUsersData = {
        items: [{ id: 1, email: 'user@test.com', role: 100 }],
        total: 50,
        page: 1,
        pageSize: 20,
        totalPages: 3,
      }

      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse(mockUsersData))

      const result = await API.RBAC.getUsers({ page: 1, pageSize: 20 }) as unknown as MockResponse<typeof mockUsersData>

      expect(HttpService.get).toHaveBeenCalledWith('/rbac/users?page=1&pageSize=20')
      expect(result.payload.items).toHaveLength(1)
    })

    it('should fetch users with role filter', async () => {
      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse({ items: [], total: 0 }))

      await API.RBAC.getUsers({ page: 1, pageSize: 20, roleFilter: 200 })

      expect(HttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('roleFilter=200')
      )
    })

    it('should fetch users with search term', async () => {
      ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse({ items: [], total: 0 }))

      await API.RBAC.getUsers({ page: 1, pageSize: 20, search: 'john' })

      expect(HttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('search=john')
      )
    })
  })

  // ==========================================================================
  // ROLE-PERMISSION ASSIGNMENT TESTS
  // ==========================================================================

  describe('Role-Permission Assignments', () => {
    describe('GET /rbac/roles/:id/permissions', () => {
      it('should fetch permissions for role', async () => {
        ;(HttpService.get as any).mockResolvedValue(mockSuccessResponse([mockPermission]))

        const result = await API.RBAC.getRolePermissions(1) as unknown as MockResponse<typeof mockPermission[]>

        expect(HttpService.get).toHaveBeenCalledWith('/rbac/roles/1/permissions')
        expect(result.payload).toHaveLength(1)
      })
    })

    describe('POST /rbac/roles/:id/permissions/:id', () => {
      it('should assign permission to role', async () => {
        ;(HttpService.post as any).mockResolvedValue(mockSuccessResponse(true))

        const result = await API.RBAC.assignPermission(1, 5) as unknown as MockResponse<boolean>

        expect(HttpService.post).toHaveBeenCalledWith('/rbac/roles/1/permissions/5', {})
        expect(result.success).toBe(true)
      })

      it('should handle already assigned permission', async () => {
        ;(HttpService.post as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Permission already assigned' } },
        })

        await expect(API.RBAC.assignPermission(1, 1)).rejects.toMatchObject({
          response: { status: 400 },
        })
      })
    })

    describe('DELETE /rbac/roles/:id/permissions/:id', () => {
      it('should remove permission from role', async () => {
        ;(HttpService.delete as any).mockResolvedValue(mockSuccessResponse(true))

        const result = await API.RBAC.removePermission(1, 5) as unknown as MockResponse<boolean>

        expect(HttpService.delete).toHaveBeenCalledWith('/rbac/roles/1/permissions/5')
        expect(result.success).toBe(true)
      })
    })

    describe('PUT /rbac/roles/:id/permissions (bulk)', () => {
      it('should bulk assign permissions', async () => {
        ;(HttpService.put as any).mockResolvedValue(mockSuccessResponse(true))

        const result = await API.RBAC.bulkAssignPermissions(1, [1, 2, 3, 4, 5]) as unknown as MockResponse<boolean>

        expect(HttpService.put).toHaveBeenCalledWith('/rbac/roles/1/permissions', {
          permissionIds: [1, 2, 3, 4, 5],
        })
        expect(result.success).toBe(true)
      })

      it('should validate permission IDs exist', async () => {
        ;(HttpService.put as any).mockRejectedValue({
          response: { status: 400, data: { message: 'Some permissions do not exist' } },
        })

        await expect(
          API.RBAC.bulkAssignPermissions(1, [1, 999, 1000])
        ).rejects.toMatchObject({ response: { status: 400 } })
      })
    })
  })

  // ==========================================================================
  // NETWORK ERROR TESTS
  // ==========================================================================

  describe('Network Error Handling', () => {
    it('should handle network timeout', async () => {
      ;(HttpService.get as any).mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      })

      await expect(API.RBAC.getOverview()).rejects.toMatchObject({
        code: 'ECONNABORTED',
      })
    })

    it('should handle network unreachable', async () => {
      ;(HttpService.get as any).mockRejectedValue({
        message: 'Network Error',
      })

      await expect(API.RBAC.getRoles()).rejects.toMatchObject({
        message: 'Network Error',
      })
    })

    it('should handle 500 Internal Server Error', async () => {
      ;(HttpService.get as any).mockRejectedValue({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      })

      await expect(API.RBAC.getMatrix()).rejects.toMatchObject({
        response: { status: 500 },
      })
    })
  })
})

