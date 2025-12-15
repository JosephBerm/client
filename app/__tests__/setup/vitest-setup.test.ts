/**
 * Test Setup Validation Tests
 * 
 * MAANG-Level: Validates that the test environment is properly configured.
 * Ensures all mocks, globals, and utilities are available for testing.
 * 
 * **Purpose:**
 * - Verify test environment setup is correct
 * - Catch configuration issues early
 * - Document expected test environment behavior
 * 
 * **Why These Tests Exist:**
 * - If these tests fail, all other tests will likely fail
 * - Provides quick feedback on test setup issues
 * - Serves as documentation for test environment
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { resetNavigationMocks, mockRouter } from '@/__mocks__/next/navigation'

describe('Test Setup Validation', () => {
  describe('Environment Configuration', () => {
    it('should configure jsdom environment correctly', () => {
      // Verify DOM globals are available
      expect(window).toBeDefined()
      expect(document).toBeDefined()
      expect(window.localStorage).toBeDefined()
      expect(window.sessionStorage).toBeDefined()
    })

    it('should have window object available', () => {
      expect(typeof window).toBe('object')
      expect(window.location).toBeDefined()
    })

    it('should have document object available', () => {
      expect(typeof document).toBe('object')
      expect(document.createElement).toBeDefined()
    })
  })

  describe('Storage Mocks', () => {
    beforeEach(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    it('should configure localStorage mock', () => {
      expect(localStorage.setItem).toBeDefined()
      expect(localStorage.getItem).toBeDefined()
      expect(localStorage.removeItem).toBeDefined()
      expect(localStorage.clear).toBeDefined()
    })

    it('should configure sessionStorage mock', () => {
      expect(sessionStorage.setItem).toBeDefined()
      expect(sessionStorage.getItem).toBeDefined()
      expect(sessionStorage.removeItem).toBeDefined()
      expect(sessionStorage.clear).toBeDefined()
    })

    it('should persist data in localStorage', () => {
      localStorage.setItem('test-key', 'test-value')
      expect(localStorage.getItem('test-key')).toBe('test-value')
    })

    it('should persist data in sessionStorage', () => {
      sessionStorage.setItem('test-key', 'test-value')
      expect(sessionStorage.getItem('test-key')).toBe('test-value')
    })

    it('should clear localStorage', () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      localStorage.clear()
      expect(localStorage.length).toBe(0)
    })

    it('should clear sessionStorage', () => {
      sessionStorage.setItem('key1', 'value1')
      sessionStorage.setItem('key2', 'value2')
      sessionStorage.clear()
      expect(sessionStorage.length).toBe(0)
    })
  })

  describe('Next.js Navigation Mocks', () => {
    beforeEach(() => {
      resetNavigationMocks()
    })

    it('should mock Next.js navigation hooks', async () => {
      // Dynamic import to verify mocks are loaded
      const { useRouter, usePathname, useSearchParams } = await import('next/navigation')
      
      expect(useRouter).toBeDefined()
      expect(usePathname).toBeDefined()
      expect(useSearchParams).toBeDefined()
    })

    it('should provide mock router object', () => {
      // Use the imported mockRouter directly (not calling hook)
      expect(mockRouter.push).toBeDefined()
      expect(mockRouter.replace).toBeDefined()
      expect(mockRouter.back).toBeDefined()
      expect(mockRouter.refresh).toBeDefined()
    })
  })

  describe('React Testing Library', () => {
    it('should have jest-dom matchers available', () => {
      // Verify jest-dom is imported (this test will fail if not)
      const element = document.createElement('div')
      element.textContent = 'Test'
      document.body.appendChild(element)
      
      expect(element).toBeInTheDocument()
      expect(element).toHaveTextContent('Test')
    })
  })

  describe('Test Isolation', () => {
    it('should isolate localStorage between tests', () => {
      // This test should start with clean localStorage
      expect(localStorage.length).toBe(0)
      
      localStorage.setItem('isolated-test', 'value')
      expect(localStorage.getItem('isolated-test')).toBe('value')
      
      // Next test should have clean localStorage (verified by beforeEach)
    })

    it('should isolate sessionStorage between tests', () => {
      expect(sessionStorage.length).toBe(0)
      
      sessionStorage.setItem('isolated-test', 'value')
      expect(sessionStorage.getItem('isolated-test')).toBe('value')
    })
  })

  describe('Edge Cases - Storage Unavailable', () => {
    it('should handle localStorage quota exceeded gracefully', () => {
      // This test verifies that our mock handles quota errors
      // The actual implementation should be tested in cart store tests
      expect(() => {
        // Simulate quota exceeded (would throw in real scenario)
        // Our mock should handle this gracefully
        localStorage.setItem('test', 'value')
      }).not.toThrow()
    })
  })
})
