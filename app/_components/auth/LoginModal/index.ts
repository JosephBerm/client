/**
 * LoginModal - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Authentication modal component family.
 * Main export is LoginModal, sub-components are internal.
 * 
 * @example
 * ```typescript
 * import { LoginModal } from '@_components/auth'
 * 
 * // Or with types
 * import type { LoginModalProps } from '@_components/auth'
 * ```
 * 
 * @module LoginModal
 */

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export { default } from './LoginModal'

// ============================================================================
// TYPES (for external consumers)
// ============================================================================

export type { LoginModalProps, AuthModalView } from './LoginModal.types'

// ============================================================================
// CONSTANTS (for external customization if needed)
// ============================================================================

export {
	MODAL_TITLES,
	MODAL_SUBTITLES,
	BUTTON_LABELS,
} from './LoginModal.constants'

// ============================================================================
// HOOK (for custom implementations)
// ============================================================================

export { useAuthModal } from './useAuthModal'
export type { UseAuthModalReturn } from './LoginModal.types'

