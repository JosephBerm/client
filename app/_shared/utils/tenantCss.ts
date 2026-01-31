/**
 * Tenant CSS Utilities
 *
 * Sanitizes and constrains tenant-provided CSS to reduce risk.
 */
import { TENANT_CUSTOM_CSS_MAX_LENGTH } from '../constants/tenantTheme'

const BLOCKED_PATTERNS = [/@import/gi, /url\s*\(/gi, /expression\s*\(/gi, /javascript:/gi]

/**
 * Sanitizes tenant CSS by stripping high-risk patterns.
 * This is intentionally conservative to prevent CSS-based exfiltration.
 */
export function sanitizeTenantCss(css: string): string {
	let sanitized = css
	for (const pattern of BLOCKED_PATTERNS) {
		sanitized = sanitized.replace(pattern, '')
	}
	return sanitized
}

/**
 * Trims tenant CSS to a maximum length to prevent abuse.
 */
export function trimTenantCss(css: string): string {
	if (css.length <= TENANT_CUSTOM_CSS_MAX_LENGTH) {
		return css
	}
	return css.slice(0, TENANT_CUSTOM_CSS_MAX_LENGTH)
}
