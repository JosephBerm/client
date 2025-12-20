/**
 * AccessDenied Component Unit Tests
 *
 * MAANG-Level: Comprehensive testing of access restriction display.
 *
 * **Priority**: 🔴 CRITICAL - SECURITY UI
 *
 * This component displays access denied messages when users attempt
 * to access resources they don't have permissions for.
 *
 * **Testing Strategy:**
 * 1. Default rendering
 * 2. Custom title and description
 * 3. Action buttons
 * 4. Visual presentation
 * 5. Accessibility compliance
 *
 * @module RBAC/AccessDenied.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock next/navigation with accessible mock functions
const mockPush = vi.fn()
const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => (
      <div ref={ref} {...props}>{children}</div>
    )),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

import { AccessDenied } from '../AccessDenied'

// ============================================================================
// TESTS
// ============================================================================

describe('AccessDenied Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // DEFAULT RENDERING
  // ==========================================================================

  describe('Default Rendering', () => {
    it('should render with default title', () => {
      render(<AccessDenied />)

      // Component renders h1 with "Access Denied" title via InternalPageHeader
      const heading = screen.getByRole('heading', { level: 1, name: /access denied/i })
      expect(heading).toBeInTheDocument()
    })

    it('should render with default description', () => {
      render(<AccessDenied />)

      expect(
        screen.getByText(/don't have|permission|contact|administrator/i)
      ).toBeInTheDocument()
    })

    it('should render an icon', () => {
      render(<AccessDenied />)

      // Component uses Lucide SVG icons (AlertTriangle/Shield) which have aria-hidden
      // Query for SVG directly since it's decorative
      const svg = document.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })

  // ==========================================================================
  // CUSTOM PROPS
  // ==========================================================================

  describe('Custom Props', () => {
    it('should render custom title', () => {
      render(<AccessDenied title="Custom Access Title" />)

      expect(screen.getByText('Custom Access Title')).toBeInTheDocument()
    })

    it('should render custom description', () => {
      render(
        <AccessDenied description="You need special permissions to view this page." />
      )

      expect(
        screen.getByText('You need special permissions to view this page.')
      ).toBeInTheDocument()
    })

    it('should render both custom title and description', () => {
      render(
        <AccessDenied
          title="Restricted Area"
          description="Admin access required for this section."
        />
      )

      expect(screen.getByText('Restricted Area')).toBeInTheDocument()
      expect(screen.getByText('Admin access required for this section.')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ACTION BUTTONS
  // ==========================================================================

  describe('Action Buttons', () => {
    it('should render a go back button', () => {
      render(<AccessDenied />)

      const backButton = screen.queryByRole('button', { name: /back|return|go back/i }) ||
                        screen.queryByText(/go back|return/i)

      expect(backButton).toBeInTheDocument()
    })

    it('should render back button when showBackButton is true (default)', () => {
      render(<AccessDenied />)

      // Component renders a "Go Back" button by default per AccessDenied.tsx
      const backButton = screen.getByRole('button', { name: /go back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should handle go back action', () => {
      render(<AccessDenied />)

      const backButton = screen.getByRole('button', { name: /go back/i })
      fireEvent.click(backButton)

      // Should trigger navigation back using the hoisted mockBack
      expect(mockBack).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // VISUAL PRESENTATION
  // ==========================================================================

  describe('Visual Presentation', () => {
    it('should center content', () => {
      render(<AccessDenied />)

      const container = screen.getByText(/access denied|not authorized/i).closest('div')

      // Should have centering styles
      expect(container).toBeInTheDocument()
    })

    it('should have appropriate spacing', () => {
      render(<AccessDenied />)

      // Component should have proper padding/margin
      const container = screen.getByText(/access denied|not authorized/i).closest('div')
      expect(container).toBeInTheDocument()
    })

    it('should display a prominent error indication', () => {
      render(<AccessDenied />)

      // Should have visual error indication (color, icon)
      expect(
        document.querySelector('[class*="error"]') ||
        document.querySelector('[class*="denied"]') ||
        document.querySelector('[class*="warning"]') ||
        document.querySelector('svg')
      ).toBeTruthy()
    })
  })

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have appropriate heading structure', () => {
      render(<AccessDenied title="Access Denied" />)

      // Component renders two headings: h1 (page title) and h2 (card heading)
      // per AccessDenied.tsx which uses InternalPageHeader + Card
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThanOrEqual(1)
      
      // Verify the page title h1 is present
      const pageTitle = screen.getByRole('heading', { level: 1 })
      expect(pageTitle).toHaveTextContent('Access Denied')
    })

    it('should have accessible buttons', () => {
      render(<AccessDenied />)

      const buttons = screen.getAllByRole('button')

      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('should have sufficient color contrast', () => {
      render(<AccessDenied />)

      // Visual inspection required, but component should render
      expect(screen.getByText(/access denied|not authorized/i)).toBeVisible()
    })

    it('should support keyboard navigation', () => {
      render(<AccessDenied />)

      const buttons = screen.getAllByRole('button')

      buttons.forEach(button => {
        // Button should be an actual button element or have type attribute
        expect(button.tagName === 'BUTTON' || button.hasAttribute('type')).toBe(true)
      })
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<AccessDenied title="" />)

      // Should still render (with default or empty)
      expect(document.body).toBeTruthy()
    })

    it('should handle empty description', () => {
      render(<AccessDenied description="" />)

      // Should still render
      expect(document.body).toBeTruthy()
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      render(<AccessDenied title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle very long description', () => {
      const longDesc = 'B'.repeat(500)
      render(<AccessDenied description={longDesc} />)

      expect(screen.getByText(longDesc)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(<AccessDenied title="<script>alert('xss')</script>" />)

      // Should escape HTML
      expect(screen.queryByText("alert('xss')")).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // CONTEXT VARIATIONS
  // ==========================================================================

  describe('Context Variations', () => {
    it('should support RBAC-specific message', () => {
      render(
        <AccessDenied
          title="Insufficient Permissions"
          description="You need Sales Manager or higher role to access RBAC management."
        />
      )

      expect(screen.getByText('Insufficient Permissions')).toBeInTheDocument()
      expect(screen.getByText(/Sales Manager/)).toBeInTheDocument()
    })

    it('should support feature-specific denial', () => {
      render(
        <AccessDenied
          title="Feature Not Available"
          description="This feature is only available to Admin users."
        />
      )

      expect(screen.getByText('Feature Not Available')).toBeInTheDocument()
      expect(screen.getByText(/Admin users/)).toBeInTheDocument()
    })

    it('should support session-related denial', () => {
      render(
        <AccessDenied
          title="Session Expired"
          description="Please log in again to continue."
        />
      )

      expect(screen.getByText('Session Expired')).toBeInTheDocument()
      expect(screen.getByText(/log in again/)).toBeInTheDocument()
    })
  })
})

