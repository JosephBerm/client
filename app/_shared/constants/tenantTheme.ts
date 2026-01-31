/**
 * Tenant Theme Constants
 *
 * Centralizes tenant theme and cache constants for DRY consistency.
 */

// Theme cache configuration
export const TENANT_THEME_CACHE_KEY = 'tenant-theme-cache' as const
export const TENANT_THEME_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

// Enterprise custom CSS constraints (security + performance)
export const TENANT_CUSTOM_CSS_MAX_LENGTH = 10000

// DOM element IDs (centralized to prevent magic strings)
export const TENANT_CUSTOM_CSS_STYLE_ID = 'tenant-custom-css' as const
export const TENANT_THEME_VARS_STYLE_ID = 'tenant-theme-vars' as const
