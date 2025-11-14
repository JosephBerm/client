/**
 * ServiceWorkerRegistration Component
 * 
 * Registers and manages the Service Worker for offline support and image caching.
 * Should be rendered once in the root layout alongside other initializers.
 * 
 * **Features:**
 * - Automatic Service Worker registration
 * - Update detection and notification
 * - Error handling and fallback
 * - Development-only logging
 * - Lifecycle management
 * 
 * **Industry Standards:**
 * - Google Workbox registration patterns
 * - Progressive Web App (PWA) best practices
 * - Service Worker update flow (Google/Meta)
 * 
 * **Use Cases:**
 * - Offline image caching
 * - Faster repeat visits
 * - Reduced bandwidth usage
 * - Progressive Web App support
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import ServiceWorkerRegistration from '@_components/common/ServiceWorkerRegistration';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <ServiceWorkerRegistration />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @module ServiceWorkerRegistration
 */

'use client'

import { useEffect, useState } from 'react'
import { logger } from '@_core'

/**
 * ServiceWorkerRegistration Component
 * 
 * Invisible component that registers Service Worker on app mount.
 * Must be rendered in a client component context.
 * 
 * **Registration Flow**:
 * 1. Check browser support
 * 2. Register Service Worker
 * 3. Handle updates
 * 4. Manage lifecycle
 * 
 * **Update Strategy**:
 * - Check for updates on page load
 * - Notify user of available updates
 * - Allow manual update trigger
 * 
 * @returns null - Component does not render any UI
 */
export default function ServiceWorkerRegistration() {
	const [updateAvailable, setUpdateAvailable] = useState(false)
	const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

	useEffect(() => {
		// Only run in browser
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			if (process.env.NODE_ENV === 'development') {
				logger.warn('ServiceWorkerRegistration: Service Workers not supported')
			}
			return
		}

		// Register Service Worker
		registerServiceWorker()

		// Check for updates periodically (every 1 hour)
		const updateInterval = setInterval(() => {
			if (registration) {
				registration.update().catch((error) => {
					logger.error('ServiceWorkerRegistration: Update check failed', { error })
				})
			}
		}, 60 * 60 * 1000) // 1 hour

		return () => {
			clearInterval(updateInterval)
		}
	}, [registration])

	/**
	 * Registers the Service Worker.
	 * 
	 * **Pattern**: Google Workbox registration
	 */
	const registerServiceWorker = async () => {
		try {
			// Wait for page load to avoid blocking
			if (document.readyState !== 'complete') {
				await new Promise((resolve) => {
					window.addEventListener('load', resolve)
				})
			}

			// Register Service Worker
			const reg = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/',
			})

			setRegistration(reg)

			if (process.env.NODE_ENV === 'development') {
				logger.log('ServiceWorkerRegistration: Service Worker registered', {
					scope: reg.scope,
					state: reg.active?.state,
				})
			}

			// Handle updates
			reg.addEventListener('updatefound', () => {
				const newWorker = reg.installing

				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New Service Worker available
							setUpdateAvailable(true)

							if (process.env.NODE_ENV === 'development') {
								logger.log('ServiceWorkerRegistration: Update available')
							}

							// Optionally notify user
							showUpdateNotification()
						}
					})
				}
			})

			// Check for existing updates
			reg.update().catch((error) => {
				logger.error('ServiceWorkerRegistration: Initial update check failed', { error })
			})
		} catch (error) {
			logger.error('ServiceWorkerRegistration: Registration failed', { error })
		}
	}

	/**
	 * Shows update notification to user.
	 * 
	 * **Pattern**: Google Chrome PWA update pattern
	 */
	const showUpdateNotification = () => {
		// In production, you'd show a toast or modal
		// For now, log to console
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'%c🔄 Update Available',
				'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;',
				'Refresh page to get the latest version'
			)
		}
	}

	/**
	 * Triggers Service Worker update.
	 * Call this when user clicks "Update" button.
	 */
	const triggerUpdate = () => {
		if (!registration || !registration.waiting) {
			return
		}

		// Tell Service Worker to skip waiting
		registration.waiting.postMessage({ type: 'SKIP_WAITING' })

		// Reload page when new worker takes control
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload()
		})
	}

	// This component doesn't render anything
	// Update notification would be handled separately (toast/modal)
	return null
}

/**
 * Utility function to manually clear Service Worker caches.
 * Useful for debugging or admin actions.
 * 
 * @example
 * ```typescript
 * import { clearServiceWorkerCache } from '@_components/common/ServiceWorkerRegistration';
 * 
 * // In admin panel or debug menu
 * await clearServiceWorkerCache();
 * console.log('Cache cleared!');
 * ```
 */
export async function clearServiceWorkerCache(): Promise<void> {
	if (!('serviceWorker' in navigator)) {
		return
	}

	const registration = await navigator.serviceWorker.ready
	if (registration.active) {
		registration.active.postMessage({ type: 'CLEAR_CACHE' })
	}

	if (process.env.NODE_ENV === 'development') {
		logger.log('ServiceWorkerRegistration: Cache cleared')
	}
}

/**
 * Gets Service Worker cache statistics.
 * Useful for monitoring and debugging.
 * 
 * @returns {Promise<Array>} Cache statistics
 * 
 * @example
 * ```typescript
 * import { getServiceWorkerCacheStats } from '@_components/common/ServiceWorkerRegistration';
 * 
 * const stats = await getServiceWorkerCacheStats();
 * console.log('Cache stats:', stats);
 * // Output: [{ cacheName: 'medsource-images-v1.0.0', itemCount: 42 }, ...]
 * ```
 */
export async function getServiceWorkerCacheStats(): Promise<any[]> {
	if (!('serviceWorker' in navigator)) {
		return []
	}

	const registration = await navigator.serviceWorker.ready
	if (!registration.active) {
		return []
	}

	return new Promise((resolve) => {
		const messageChannel = new MessageChannel()

		messageChannel.port1.onmessage = (event) => {
			if (event.data.type === 'CACHE_SIZE') {
				resolve(event.data.stats)
			}
		}

		if (registration.active) {
			registration.active.postMessage({ type: 'GET_CACHE_SIZE' }, [messageChannel.port2])
		} else {
			resolve([])
		}

		// Timeout after 5 seconds
		setTimeout(() => resolve([]), 5000)
	})
}

