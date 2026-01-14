/**
 * Auth Components - Barrel Export (Optimized for Tree-Shaking)
 *
 * Authentication-related UI components.
 *
 * @example
 * ```typescript
 * import { LoginModal } from '@_components/auth'
 *
 * // With types
 * import type { LoginModalProps } from '@_components/auth'
 * ```
 *
 * @module auth/components
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { default as LoginModal } from './LoginModal'

// Step-Up Authentication Components (MFA re-verification for sensitive actions)
export { default as StepUpModal } from './StepUpModal'
export { default as StepUpListener } from './StepUpListener'

// Account Status Components
export { default as AccountStatusListener } from './AccountStatusListener'

// ============================================================================
// TYPES
// ============================================================================

export type { LoginModalProps, AuthModalView } from './LoginModal'

// ============================================================================
// HOOKS (for advanced use cases)
// ============================================================================

export { useAuthModal } from './LoginModal'
export type { UseAuthModalReturn } from './LoginModal'
