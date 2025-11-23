/**
 * Types - Barrel Export
 * 
 * Centralized type definitions for the application.
 * Provides type-safe interfaces for navigation, settings, and shared contracts.
 * 
 * **Architecture:**
 * - Single source of truth for shared types
 * - Enables DRY-compliant type usage
 * - Supports Dependency Inversion Principle
 * 
 * @example
 * ```typescript
 * import type { BreadcrumbItem, NavigationRoute, NavigationSection } from '@_types'
 * ```
 * 
 * @module types
 */

// Navigation types
export * from './navigation'

// Settings types
export * from './settings'

