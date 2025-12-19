/**
 * Quote Detail Hooks - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Custom hooks for quote detail page functionality.
 * Each hook handles a specific concern (data, actions, permissions).
 * 
 * **Architecture:**
 * - Named exports enable optimal tree-shaking
 * - Types exported alongside implementations
 * - Organized by concern (data, actions, permissions)
 * 
 * **Import Pattern:**
 * ```tsx
 * // ✅ GOOD: Import from barrel
 * import { useQuoteDetails, useQuotePermissions } from './hooks'
 * 
 * // ❌ BAD: Direct file imports
 * import { useQuoteDetails } from './hooks/useQuoteDetails'
 * ```
 * 
 * @module app/quotes/[id]/_components/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

export { useQuoteDetails } from './useQuoteDetails'
export type { UseQuoteDetailsReturn } from './useQuoteDetails'

// ============================================================================
// PERMISSION HOOKS
// ============================================================================

export { useQuotePermissions } from './useQuotePermissions'
export type { UseQuotePermissionsReturn } from './useQuotePermissions'

// ============================================================================
// ACTION HOOKS
// ============================================================================

export { useQuoteActions } from './useQuoteActions'
export type { UseQuoteActionsReturn } from './useQuoteActions'

export { useAutoMarkQuoteAsRead } from './useAutoMarkQuoteAsRead'
export type { UseAutoMarkQuoteAsReadConfig } from './useAutoMarkQuoteAsRead'

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

export { useQuoteAssignment } from './useQuoteAssignment'
export type { UseQuoteAssignmentReturn } from './useQuoteAssignment'

