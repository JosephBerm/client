import { TENANT_CUSTOM_CSS_STYLE_ID } from '../constants/tenantTheme'
import { sanitizeTenantCss, trimTenantCss } from './tenantCss'

/**
 * Applies tenant-provided custom CSS to the document.
 * Sanitizes and trims content before injection.
 *
 * NOTE: Business logic (e.g., tier checks) should be handled by the caller.
 * This utility only handles DOM manipulation.
 *
 * @param customCss - The raw CSS string to apply (undefined to remove existing)
 * @param styleId - The ID for the style element (defaults to centralized constant)
 */
export function applyTenantCustomCss(customCss?: string, styleId: string = TENANT_CUSTOM_CSS_STYLE_ID) {
	const existingStyle = document.getElementById(styleId) as HTMLStyleElement | null

	if (!customCss) {
		if (existingStyle) {
			existingStyle.remove()
		}
		return
	}

	const sanitized = trimTenantCss(sanitizeTenantCss(customCss))

	if (existingStyle) {
		existingStyle.textContent = sanitized
		return
	}

	const style = document.createElement('style')
	style.id = styleId
	style.textContent = sanitized
	document.head.appendChild(style)
}

/**
 * Validates that a URL is safe for use as a favicon.
 * Only allows http, https, and data URIs.
 *
 * @param url - The URL to validate
 * @returns True if the URL is safe, false otherwise
 */
function isValidFaviconUrl(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false
	}

	try {
		// Allow data URIs for inline favicons
		if (url.startsWith('data:image/')) {
			return true
		}

		const parsed = new URL(url, window.location.origin)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
	} catch {
		return false
	}
}

/**
 * Updates or inserts the favicon link tag.
 * Validates the URL to prevent XSS via javascript: or other malicious protocols.
 *
 * @param faviconUrl - The URL of the favicon (http, https, or data URI)
 */
export function updateFavicon(faviconUrl: string) {
	if (!isValidFaviconUrl(faviconUrl)) {
		return
	}

	const link = document.querySelector("link[rel*='icon']")
	if (link instanceof HTMLLinkElement) {
		link.href = faviconUrl
		return
	}

	const newLink = document.createElement('link')
	newLink.rel = 'icon'
	newLink.href = faviconUrl
	document.head.appendChild(newLink)
}
