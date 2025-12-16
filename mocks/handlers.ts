/**
 * MSW (Mock Service Worker) Request Handlers
 * 
 * Comprehensive API mocking for all public routes.
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api'

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
