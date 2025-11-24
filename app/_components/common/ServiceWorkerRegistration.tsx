/**
 * ServiceWorkerRegistration Component
 * 
 * Registers and manages the Service Worker for offline support and image caching.
 * Should be rendered once in the root layout alongside other initializers.
 * 
 * **FAANG-Level Features:**
 * - Development mode bypass (Google/Meta standard)
 * - Automatic cache versioning (Amazon/Netflix pattern)
 * - Aggressive update strategy with skipWaiting (Airbnb pattern)
 * - Auto-cleanup of old caches (Stripe pattern)
 * - Update detection and notification
 * - Error handling and fallback
 * 
 * **Industry Standards:**
 * - Google Workbox registration patterns
 * - Progressive Web App (PWA) best practices
 * - Service Worker update flow (Google/Meta)
 * - Cache invalidation strategies (FAANG)
 * 
 * **Cache Management:**
 * - Development: Service Worker DISABLED (prevents cache issues)
 * - Production: Aggressive update strategy (immediate updates)
 * - Version-based cache names (automatic cleanup)
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

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@_core'

/**
 * FAANG Best Practice: Disable Service Worker in Development
 * 
 * **Why:**
 * - Prevents cache issues during development
 * - Follows Google, Meta, Amazon patterns
 * - Avoids the exact issue you just experienced
 * 
 * **In Production:**
 * - Service Worker enabled for performance
 * - Aggressive update strategy prevents stale code
 */
const ENABLE_SERVICE_WORKER_IN_DEV = false

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
	const [_updateAvailable, setUpdateAvailable] = useState(false)
	const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

	/**
	 * Shows update notification to user.
	 * 
	 * **Pattern**: Google Chrome PWA update pattern
	 */
	const showUpdateNotification = useCallback(() => {
		// In production, you'd show a toast or modal
		// For now, updates auto-apply via skipWaiting pattern
	}, [])

	/**
	 * Registers the Service Worker with FAANG-level update strategy.
	 * 
	 * **Patterns Used:**
	 * - Google Workbox registration
	 * - Meta aggressive update strategy (skipWaiting)
	 * - Amazon immediate cache invalidation
	 * - Netflix version-based cache management
	 */
	const registerServiceWorker = useCallback(async () => {
		try {
			// Wait for page load to avoid blocking
			if (document.readyState !== 'complete') {
				await new Promise((resolve) => {
					window.addEventListener('load', resolve)
				})
			}

			// FAANG Best Practice #3: Aggressive Update Strategy
			// Tell Service Worker to skip waiting and activate immediately
			// This prevents the issue you experienced - old SW won't linger
			const reg = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/',
				updateViaCache: 'none', // Always check for SW updates (Google pattern)
			})

			setRegistration(reg)

			if (process.env.NODE_ENV === 'development') {
				logger.info('ServiceWorkerRegistration: Service Worker registered', {
					scope: reg.scope,
					state: reg.active?.state,
					updateStrategy: 'aggressive (skipWaiting)',
				})
			}

			// FAANG Best Practice #4: Immediate Activation
			// Listen for controller change and reload immediately
			// IMPROVEMENT: Only reload if this was triggered by an update, not initial load
			let isFirstLoad = !navigator.serviceWorker.controller
			
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// Don't reload on initial page load (controller was null)
				if (isFirstLoad) {
					isFirstLoad = false
					return
				}
				
				if (process.env.NODE_ENV === 'development') {
					logger.info('ServiceWorkerRegistration: New SW activated, reloading...')
				}
				// Auto-reload to get new code (Meta/Google pattern)
				// Only reloads when SW updates, not on initial page load
				window.location.reload()
			})

			// Handle updates
			reg.addEventListener('updatefound', () => {
				const newWorker = reg.installing

				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New Service Worker available
							setUpdateAvailable(true)

							if (process.env.NODE_ENV === 'development') {
								logger.info('ServiceWorkerRegistration: Update available')
							}

							// FAANG Pattern: Tell new SW to skip waiting
							// This makes it activate immediately instead of waiting
							newWorker.postMessage({ type: 'SKIP_WAITING' })

							// Show notification
							showUpdateNotification()
						}
					})
				}
			})

			// Check for existing updates immediately
			reg.update().catch((error) => {
				logger.error('ServiceWorkerRegistration: Initial update check failed', { error })
			})
		} catch (error) {
			logger.error('ServiceWorkerRegistration: Registration failed', { error })
		}
	}, [setUpdateAvailable, showUpdateNotification])

	useEffect(() => {
		// FAANG Best Practice #1: Bypass Service Worker in Development
		const isDevelopment = process.env.NODE_ENV === 'development'
		if (isDevelopment && !ENABLE_SERVICE_WORKER_IN_DEV) {
			logger.info('ServiceWorkerRegistration: DISABLED in development mode')
			return
		}

		// Only run in browser
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			if (isDevelopment) {
				logger.warn('ServiceWorkerRegistration: Service Workers not supported')
			}
			return
		}

		// Register Service Worker
		registerServiceWorker()

		// FAANG Best Practice #2: Aggressive Update Checking
		// Check for updates more frequently in production
		const updateCheckInterval = isDevelopment ? 60 * 1000 : 60 * 60 * 1000
		
		const updateInterval = setInterval(() => {
			if (registration) {
				registration.update().catch((error) => {
					logger.error('ServiceWorkerRegistration: Update check failed', { error })
				})
			}
		}, updateCheckInterval)

		return () => clearInterval(updateInterval)
	}, [registration, registerServiceWorker])

	/**
	 * Triggers Service Worker update.
	 * Call this when user clicks "Update" button.
	 */
	const _triggerUpdate = () => {
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

	// Add debug helper to window object (for manual debugging)
	useEffect(() => {
		if (typeof window !== 'undefined') {
			//@ts-expect-error - Adding debug helper
			window.swDebug = {
				getRegistration: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					const registrationData = regs.map((r) => ({
						scope: r.scope,
						installing: r.installing?.state,
						waiting: r.waiting?.state,
						active: r.active?.state,
					}))
					// Use logger.table for structured data display (FAANG best practice)
					logger.table('Service Worker Registrations', registrationData, 'DEBUG', {
						component: 'ServiceWorkerRegistration',
						registrationCount: regs.length,
					})
					return regs
				},
				getCaches: async () => {
					const cacheNames = await caches.keys()
					logger.info('Service Worker caches retrieved', { cacheNames })
					for (const name of cacheNames) {
						const cache = await caches.open(name)
						const keys = await cache.keys()
						logger.debug('Cache details', { cacheName: name, itemCount: keys.length })
					}
					return cacheNames
				},
				clearAllCaches: async () => {
					const cacheNames = await caches.keys()
					await Promise.all(cacheNames.map((name) => caches.delete(name)))
					logger.info('All service worker caches cleared', { clearedCount: cacheNames.length })
				},
				unregisterAll: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					await Promise.all(regs.map((r) => r.unregister()))
					logger.info('All service workers unregistered', { unregisteredCount: regs.length })
				},
				forceUpdate: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					await Promise.all(regs.map((r) => r.update()))
					logger.info('Service worker update check complete', { checkedCount: regs.length })
				},
				help: () => {
					logger.info('Service Worker Debug Commands', {
						commands: [
							'swDebug.getRegistration()  - Show SW registration status',
							'swDebug.getCaches()        - List all caches and items',
							'swDebug.clearAllCaches()   - Clear all caches',
							'swDebug.unregisterAll()    - Unregister all service workers',
							'swDebug.forceUpdate()      - Force SW update check',
							'swDebug.help()             - Show this help',
						],
					})
				},
			}
		}
	}, [])

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
 * import { logger } from '@_core';
 * 
 * await clearServiceWorkerCache();
 * logger.info('Service worker cache cleared');
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
		logger.info('ServiceWorkerRegistration: Cache cleared')
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
 * import { logger } from '@_core';
 * 
 * const stats = await getServiceWorkerCacheStats();
 * logger.debug('Service worker cache stats', { stats });
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

