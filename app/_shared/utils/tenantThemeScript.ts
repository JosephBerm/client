/**
 * Builds an inline script that sets the tenant theme on the document root.
 * This script is injected in the HTML head to prevent FOUC (Flash of Unstyled Content).
 *
 * Uses JSON.stringify for the theme name to ensure safe interpolation and prevent XSS.
 *
 * @param themeName - The DaisyUI theme name to apply (e.g., 'light', 'dark', 'corporate')
 * @returns A JavaScript string that sets both data-tenant-theme and data-theme attributes
 *
 * @example
 * ```tsx
 * const script = buildTenantThemeScript('corporate')
 * // Returns:
 * // document.documentElement.setAttribute('data-tenant-theme', "corporate");
 * // document.documentElement.setAttribute('data-theme', "corporate");
 * ```
 */
export function buildTenantThemeScript(themeName: string): string {
	return [
		`document.documentElement.setAttribute('data-tenant-theme', ${JSON.stringify(themeName)});`,
		`document.documentElement.setAttribute('data-theme', ${JSON.stringify(themeName)});`,
	].join('\n')
}
