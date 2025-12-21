/**
 * MSW (Mock Service Worker) Request Handlers
 * 
 * MAANG-Level: Comprehensive API mocking for all public routes.
 * Provides deterministic test data and handles all public API endpoints.
 * 
 * **What This Provides:**
 * - Mock responses for all public API endpoints
 * - Realistic response structures matching backend
 * - Error scenario testing (400, 404, 500, etc.)
 * - Network failure simulation
 * - Rate limiting simulation
 * 
 * **Usage:**
 * - Automatically used by MSW in test environment
 * - Can be customized per test using server.use()
 * - Supports both success and error scenarios
 * 
 * @see https://mswjs.io/docs/
 */

import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@_shared/services/httpService'
import type { Product } from '@_classes/Product'
import type Quote from '@_classes/Quote'

// ============================================================================
// Base URL Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254'

// ============================================================================
// Mock Data Helpers
// ============================================================================

/**
 * Creates a success API response.
 */
function createSuccessResponse<T>(data: T, message: string = 'success') {
  const apiResponse: ApiResponse<T> = {
    payload: data,
    message,
    statusCode: 200,
  }
  
  return HttpResponse.json(apiResponse, { status: 200 })
}

/**
 * Creates an error API response.
 */
function createErrorResponse(message: string, statusCode: number = 400) {
  const apiResponse: ApiResponse<null> = {
    payload: null,
    message,
    statusCode,
  }
  
  return HttpResponse.json(apiResponse, { status: statusCode })
}

// ============================================================================
// Public Product Endpoints
// ============================================================================

/**
 * Mock product data for testing.
 */
const mockProduct: Partial<Product> = {
  id: 'test-product-1',
  name: 'Test Medical Product',
  sku: 'TEST-001',
  price: 99.99,
  stock: 10,
  category: 'PPE',
  description: 'Test product description',
  manufacturer: 'Test Manufacturer',
  createdAt: new Date('2024-01-01'),
  updatedAt: null,
}

const mockProducts: Partial<Product>[] = [
  mockProduct,
  {
    id: 'test-product-2',
    name: 'Test Product 2',
    sku: 'TEST-002',
    price: 49.99,
    stock: 5,
    category: 'Surgical',
    description: 'Second test product',
    manufacturer: 'Test Manufacturer',
    createdAt: new Date('2024-01-02'),
    updatedAt: null,
  },
]

/**
 * MSW Request Handlers
 * 
 * Handles all public API endpoints for testing.
 */
export const handlers = [
  // ==========================================================================
  // Product Search (Public)
  // ==========================================================================
  http.post(`${API_BASE_URL}/Products/search/public`, async ({ request }) => {
    const body = await request.json() as { page?: number; pageSize?: number; search?: string }
    
    // Simulate search filtering
    let filteredProducts = [...mockProducts]
    
    if (body.search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name?.toLowerCase().includes(body.search!.toLowerCase())
      )
    }
    
    // Simulate pagination
    const page = body.page || 1
    const pageSize = body.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedProducts = filteredProducts.slice(start, end)
    
    const pagedResult = {
      data: paginatedProducts,
      page,
      pageSize,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      hasNext: end < filteredProducts.length,
      hasPrevious: page > 1,
    }
    
    return createSuccessResponse(pagedResult, 'products_retrieved_successfully')
  }),

  // ==========================================================================
  // Get Product by ID (Public)
  // ==========================================================================
  http.get(`${API_BASE_URL}/products/:id`, ({ params }) => {
    const { id } = params
    
    if (id === 'non-existent') {
      return createErrorResponse('Product not found', 404)
    }
    
    const product = mockProducts.find(p => p.id === id) || mockProduct
    
    return createSuccessResponse(product, 'product_retrieved')
  }),

  // ==========================================================================
  // Get Product Categories (Public)
  // ==========================================================================
  http.get(`${API_BASE_URL}/Products/categories/clean`, () => {
    const categories = [
      { id: 1, name: 'PPE' },
      { id: 2, name: 'Surgical' },
      { id: 3, name: 'Medical Equipment' },
    ]
    
    return createSuccessResponse(categories, 'categories_retrieved')
  }),

  // ==========================================================================
  // Quote Submission (Public - No Auth Required)
  // ==========================================================================
  http.post(`${API_BASE_URL}/quotes`, async ({ request }) => {
    const quote = await request.json() as Partial<Quote>
    
    // Validate quote has items
    if (!quote.products || quote.products.length === 0) {
      return createErrorResponse('At least one item is required', 400)
    }
    
    // Simulate rate limiting (for testing)
    // In real tests, you can override this handler to test rate limiting
    const rateLimitHeader = request.headers.get('X-Rate-Limit')
    if (rateLimitHeader === 'exceeded') {
      return HttpResponse.json(
        { message: 'Too many requests', statusCode: 429 },
        { status: 429 }
      )
    }
    
    // Success response
    const createdQuote: Partial<Quote> = {
      ...quote,
      id: 'quote-' + Date.now(),
      createdAt: new Date(),
      status: 'Unread' as any,
    }
    
    return createSuccessResponse('quote_received', 'quote_received')
  }),

  // ==========================================================================
  // Contact Form Submission (Public)
  // ==========================================================================
  http.post(`${API_BASE_URL}/contact`, async ({ request }) => {
    const contactRequest = await request.json() as { email?: string; message?: string } | null
    
    // Basic validation
    if (!contactRequest || !contactRequest.email || !contactRequest.message) {
      return createErrorResponse('Email and message are required', 400)
    }
    
    return createSuccessResponse({ success: true }, 'contact_request_received')
  }),

  // ==========================================================================
  // Authentication Endpoints (Public)
  // ==========================================================================
  http.post(`${API_BASE_URL}/account/login`, async ({ request }) => {
    const credentials = await request.json() as { email: string; password: string }
    
    // Mock authentication
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      return createSuccessResponse('mock-jwt-token', 'login_successful')
    }
    
    return createErrorResponse('Invalid credentials', 401)
  }),

  http.post(`${API_BASE_URL}/account/signup`, async ({ request }) => {
    const signupData = await request.json() as { email?: string; firstName?: string; lastName?: string } | null
    
    // Mock successful signup
    if (!signupData || !signupData.email || !signupData.firstName || !signupData.lastName) {
      return createErrorResponse('Email, first name, and last name are required', 400)
    }
    
    return createSuccessResponse(
      {
        id: 1,
        email: signupData.email,
        name: { first: signupData.firstName, last: signupData.lastName },
        role: 0,
      },
      'signup_successful'
    )
  }),

  // ==========================================================================
  // Account Profile (Protected - but may be used in tests)
  // ==========================================================================
  http.get(`${API_BASE_URL}/account/profile`, () => {
    return createSuccessResponse(
      {
        id: 1,
        email: 'test@example.com',
        name: { first: 'Test', last: 'User' },
        role: 0,
        customerId: 1,
      },
      'profile_retrieved'
    )
  }),

  // ==========================================================================
  // RBAC Endpoints (Admin Protected)
  // ==========================================================================
  
  // Mock Roles Data
  http.get(`${API_BASE_URL}/rbac/roles`, () => {
    const mockRoles = [
      { id: 1, name: 'customer', displayName: 'Customer', level: 0, description: 'Standard customer', isSystemRole: true },
      { id: 2, name: 'sales_rep', displayName: 'Sales Representative', level: 100, description: 'Sales representative', isSystemRole: true },
      { id: 3, name: 'sales_manager', displayName: 'Sales Manager', level: 200, description: 'Sales manager', isSystemRole: true },
      { id: 4, name: 'fulfillment_coordinator', displayName: 'Fulfillment Coordinator', level: 300, description: 'Order fulfillment', isSystemRole: true },
      { id: 5, name: 'admin', displayName: 'Administrator', level: 9999999, description: 'Full system access', isSystemRole: true },
    ]
    
    return createSuccessResponse(mockRoles, 'roles_retrieved')
  }),

  http.get(`${API_BASE_URL}/rbac/roles/:id`, ({ params }) => {
    const { id } = params
    
    const mockRole = {
      id: Number(id),
      name: 'sales_rep',
      displayName: 'Sales Representative',
      level: 100,
      description: 'Sales representative',
      isSystemRole: true,
      rolePermissions: [
        { id: 1, permissionId: 1, permission: { id: 1, name: 'quotes:read:assigned' } },
        { id: 2, permissionId: 2, permission: { id: 2, name: 'quotes:update:assigned' } },
      ],
    }
    
    return createSuccessResponse(mockRole, 'role_retrieved')
  }),

  http.post(`${API_BASE_URL}/rbac/roles`, async ({ request }) => {
    const body = await request.json() as { name?: string; displayName?: string; level?: number } | null
    
    if (!body || !body.name || !body.displayName || body.level === undefined) {
      return createErrorResponse('Name, display name, and level are required', 400)
    }
    
    const newRole = {
      id: Date.now(),
      name: body.name,
      displayName: body.displayName,
      level: body.level,
      isSystemRole: false,
      createdAt: new Date().toISOString(),
    }
    
    return createSuccessResponse(newRole, 'role_created')
  }),

  http.put(`${API_BASE_URL}/rbac/roles/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as { displayName?: string; description?: string } | null
    
    const updatedRole = {
      id: Number(id),
      name: 'sales_rep',
      displayName: body?.displayName || 'Sales Representative',
      description: body?.description || 'Updated description',
      level: 100,
      updatedAt: new Date().toISOString(),
    }
    
    return createSuccessResponse(updatedRole, 'role_updated')
  }),

  http.delete(`${API_BASE_URL}/rbac/roles/:id`, ({ params }) => {
    const { id } = params
    
    // System roles cannot be deleted
    if (Number(id) <= 5) {
      return createErrorResponse('Cannot delete system roles', 400)
    }
    
    return createSuccessResponse(true, 'role_deleted')
  }),

  // Mock Permissions Data
  http.get(`${API_BASE_URL}/rbac/permissions`, () => {
    const mockPermissions = [
      { id: 1, name: 'quotes:read', description: 'Read quotes' },
      { id: 2, name: 'quotes:create', description: 'Create quotes' },
      { id: 3, name: 'quotes:update', description: 'Update quotes' },
      { id: 4, name: 'quotes:delete', description: 'Delete quotes' },
      { id: 5, name: 'quotes:approve', description: 'Approve quotes' },
      { id: 6, name: 'quotes:assign', description: 'Assign quotes' },
      { id: 7, name: 'orders:read', description: 'Read orders' },
      { id: 8, name: 'orders:create', description: 'Create orders' },
      { id: 9, name: 'orders:update', description: 'Update orders' },
      { id: 10, name: 'orders:delete', description: 'Delete orders' },
      { id: 11, name: 'orders:approve', description: 'Approve orders' },
      { id: 12, name: 'users:read', description: 'Read users' },
      { id: 13, name: 'users:create', description: 'Create users' },
      { id: 14, name: 'users:update', description: 'Update users' },
      { id: 15, name: 'users:delete', description: 'Delete users' },
      { id: 16, name: 'settings:manage', description: 'Manage settings' },
    ]
    
    return createSuccessResponse(mockPermissions, 'permissions_retrieved')
  }),

  http.post(`${API_BASE_URL}/rbac/permissions`, async ({ request }) => {
    const body = await request.json() as { name?: string; description?: string } | null
    
    if (!body || !body.name) {
      return createErrorResponse('Permission name is required', 400)
    }
    
    const newPermission = {
      id: Date.now(),
      name: body.name,
      description: body.description || '',
      createdAt: new Date().toISOString(),
    }
    
    return createSuccessResponse(newPermission, 'permission_created')
  }),

  // Role-Permission Assignment
  http.get(`${API_BASE_URL}/rbac/roles/:roleId/permissions`, ({ params }) => {
    const mockRolePermissions = [
      { id: 1, name: 'quotes:read:assigned', description: 'Read assigned quotes' },
      { id: 2, name: 'quotes:update:assigned', description: 'Update assigned quotes' },
      { id: 3, name: 'orders:create', description: 'Create orders' },
    ]
    
    return createSuccessResponse(mockRolePermissions, 'role_permissions_retrieved')
  }),

  http.post(`${API_BASE_URL}/rbac/roles/:roleId/permissions/:permissionId`, ({ params }) => {
    const { roleId, permissionId } = params
    
    return createSuccessResponse(true, 'permission_assigned')
  }),

  http.delete(`${API_BASE_URL}/rbac/roles/:roleId/permissions/:permissionId`, ({ params }) => {
    const { roleId, permissionId } = params
    
    return createSuccessResponse(true, 'permission_removed')
  }),

  http.post(`${API_BASE_URL}/rbac/roles/:roleId/permissions/bulk`, async ({ params, request }) => {
    const { roleId } = params
    const body = await request.json() as { permissionIds?: number[] } | null
    
    if (!body || !body.permissionIds || body.permissionIds.length === 0) {
      return createErrorResponse('Permission IDs are required', 400)
    }
    
    return createSuccessResponse(true, 'permissions_assigned')
  }),

  // ==========================================================================
  // Account Role Stats (for RBAC Dashboard)
  // ==========================================================================
  http.get(`${API_BASE_URL}/accounts/role-stats`, () => {
    const stats = {
      totalAccounts: 150,
      byRole: [
        { role: 0, roleName: 'Customer', count: 120 },
        { role: 100, roleName: 'Sales Representative', count: 15 },
        { role: 200, roleName: 'Sales Manager', count: 8 },
        { role: 300, roleName: 'Fulfillment Coordinator', count: 5 },
        { role: 9999999, roleName: 'Administrator', count: 2 },
      ],
    }
    
    return createSuccessResponse(stats, 'role_stats_retrieved')
  }),

  // ==========================================================================
  // Network Error Simulation
  // ==========================================================================
  // You can add handlers that simulate network errors:
  // http.post(`${API_BASE_URL}/quotes`, () => {
  //   return HttpResponse.error() // Simulates network error
  // }),
]

// ============================================================================
// MSW Server Setup
// ============================================================================

import { setupServer } from 'msw/node'

/**
 * MSW Server instance for Node.js environment (Vitest).
 * Use this in your test setup.
 * 
 * Note: Only available in Node.js environment (test environment).
 * Will throw error if imported in browser context.
 */
export const server = setupServer(...handlers)
