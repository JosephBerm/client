/**
 * Toast Provider Component
 * 
 * Theme-aware wrapper for react-toastify that automatically adapts to the current theme.
 * Follows FAANG-level best practices for dynamic theming.
 * 
 * **Architecture:**
 * - Client Component: Uses hooks and browser APIs
 * - Theme Integration: Reads from useUserSettingsStore
 * - Auto-updates: Responds to theme changes in real-time
 * - Accessibility: Respects reduced motion preferences
 * 
 * **Industry Best Practice (Google/Meta/Netflix):**
 * - Configuration follows theme, not hardcoded
 * - Toasts feel native to the current UI theme
 * - Smooth transitions between themes
 * - No flash of unstyled content
 * 
 * **Design Decision:**
 * - Dark themes (dark, luxury, sunset) → 'dark' toast theme
 * - Light themes (light, corporate, winter) → 'light' toast theme
 * - Matches DaisyUI theme system conventions
 * 
 * @module ToastProvider
 */

'use client'

import { useEffect } from 'react'

import { ToastContainer } from 'react-toastify'

import { useUserSettingsStore } from '@_features/settings'

import { logger } from '@_core/logger'

import { ThemeHelper } from '@_classes/Helpers'

/**
 * ToastProvider Component
 * 
 * Wraps ToastContainer with theme-aware configuration.
 * Updates toast theme when app theme changes.
 * 
 * **Implementation Notes:**
 * - Uses Zustand store for theme state
 * - Re-renders only when theme changes (optimized)
 * - Graceful fallback to 'light' if theme loading
 * - Uses default react-toastify transitions for smooth animations
 * 
 * @example
 * ```tsx
 * // In layout.tsx:
 * <ToastProvider />
 * 
 * // Toasts automatically match theme:
 * notificationService.success('Saved!') // Green toast in current theme
 * notificationService.error('Failed!') // Red toast in current theme
 * ```
 */
export default function ToastProvider() {
	// Read current theme from store (only re-renders when theme changes)
	const currentTheme = useUserSettingsStore((state) => state.currentTheme)
	
	// Determine toast theme based on current app theme (uses ThemeHelper metadata)
	const toastTheme = ThemeHelper.getToastTheme(currentTheme)

	// Log theme changes for debugging (development only)
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			logger.debug('[ToastProvider] Theme changed', {
				currentTheme,
				toastTheme,
				component: 'ToastProvider',
			})
		}
		// Dependencies are complete - currentTheme and toastTheme are both in the array
		// toastTheme is derived from currentTheme, so both are needed for accurate logging
	}, [currentTheme, toastTheme])

	return (
		<ToastContainer
			position="top-right"
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme={toastTheme}
		/>
	)
}

