/**
 * Formatters - Lib Module
 * 
 * Pure formatting functions with no side effects.
 * 
 * **Note**: Date formatting has been moved to `@_lib/dates`.
 * We no longer export formatDate from this module to avoid conflicts.
 * Import from `@_lib` or `@_lib/dates` directly.
 * 
 * @module lib/formatters
 */

export * from './currency'
// Date formatting has moved to @_lib/dates - import from there
export * from './text'

