import { ThemeService } from '@_services/ThemeService'
import { UserSettingsService } from '@_services/UserSettingsService'

/**
 * Theme initialization script that runs after React hydrates
 * Syncs theme and sets up system theme change listener
 * The inline script in the head already prevents FOUC
 */
if (typeof window !== 'undefined') {
	// Sync theme (in case inline script and this diverge)
	ThemeService.initializeTheme()
	
	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	const handleSystemThemeChange = () => {
		// Only apply system theme if user hasn't manually set a preference
		const storedTheme = UserSettingsService.getSetting('theme')
		
		if (!storedTheme) {
			const systemTheme = ThemeService.getSystemTheme()
			ThemeService.applyTheme(systemTheme)
		}
	}
	
	// Modern browsers
	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener('change', handleSystemThemeChange)
	} else {
		// Fallback for older browsers
		mediaQuery.addListener(handleSystemThemeChange)
	}
}

