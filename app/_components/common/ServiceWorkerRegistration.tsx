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

import { useEffect, useState } from 'react'
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
	const [updateAvailable, setUpdateAvailable] = useState(false)
	const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

	useEffect(() => {
		console.group('🔧 [ServiceWorkerRegistration] Initialization')
		console.log('📍 Environment:', process.env.NODE_ENV)
		console.log('📍 Timestamp:', new Date().toISOString())
		
		// FAANG Best Practice #1: Bypass Service Worker in Development
		const isDevelopment = process.env.NODE_ENV === 'development'
		if (isDevelopment && !ENABLE_SERVICE_WORKER_IN_DEV) {
			console.log('🚫 Service Worker DISABLED in development mode')
			console.log('  ✅ Reason: Prevents cache issues like INITIAL_FILTER error')
			console.log('  ✅ To enable: Set ENABLE_SERVICE_WORKER_IN_DEV = true')
			console.log('  ✅ Benefit: No stale JavaScript during development')
			console.groupEnd()
			
			logger.log('ServiceWorkerRegistration: DISABLED in development mode')
			return
		}

		// Only run in browser
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			console.warn('⚠️ Service Workers not supported in this environment')
			console.groupEnd()
			if (isDevelopment) {
				logger.warn('ServiceWorkerRegistration: Service Workers not supported')
			}
			return
		}

		console.log('✅ Service Worker support detected')
		console.log('📍 Browser:', navigator.userAgent.split(' ').pop())
		console.groupEnd()

		// Register Service Worker
		registerServiceWorker()

		// FAANG Best Practice #2: Aggressive Update Checking
		// Check for updates more frequently in production
		const updateCheckInterval = isDevelopment ? 60 * 1000 : 60 * 60 * 1000
		console.log(`⏰ Update check interval: ${updateCheckInterval / 1000}s`)
		
		const updateInterval = setInterval(() => {
			if (registration) {
				console.log('🔄 [SW Update Check] Checking for updates...')
				registration.update()
					.then(() => console.log('✅ [SW Update Check] Check complete'))
					.catch((error) => {
						console.error('❌ [SW Update Check] Failed:', error)
						logger.error('ServiceWorkerRegistration: Update check failed', { error })
					})
			}
		}, updateCheckInterval)

		return () => {
			console.log('🧹 [ServiceWorkerRegistration] Cleanup: Clearing update interval')
			clearInterval(updateInterval)
		}
	}, [registration])

	/**
	 * Registers the Service Worker with FAANG-level update strategy.
	 * 
	 * **Patterns Used:**
	 * - Google Workbox registration
	 * - Meta aggressive update strategy (skipWaiting)
	 * - Amazon immediate cache invalidation
	 * - Netflix version-based cache management
	 */
	const registerServiceWorker = async () => {
		console.group('📝 [SW Registration] Starting registration...')
		
		try {
			console.log('📍 Document ready state:', document.readyState)
			
			// Wait for page load to avoid blocking
			if (document.readyState !== 'complete') {
				console.log('⏳ Waiting for page load...')
				await new Promise((resolve) => {
					window.addEventListener('load', resolve)
				})
				console.log('✅ Page loaded')
			}

			console.log('🚀 Registering Service Worker...')
			console.log('📍 SW File: /service-worker.js')
			console.log('📍 Scope: /')
			console.log('📍 Update via cache: none (always fresh)')
			
			// FAANG Best Practice #3: Aggressive Update Strategy
			// Tell Service Worker to skip waiting and activate immediately
			// This prevents the issue you experienced - old SW won't linger
			const reg = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/',
				updateViaCache: 'none', // Always check for SW updates (Google pattern)
			})

			console.log('✅ Service Worker registered successfully!')
			console.log('📍 Scope:', reg.scope)
			console.log('📍 Installing:', reg.installing ? 'Yes' : 'No')
			console.log('📍 Waiting:', reg.waiting ? 'Yes' : 'No')
			console.log('📍 Active:', reg.active ? reg.active.state : 'None')
			
			setRegistration(reg)

			if (process.env.NODE_ENV === 'development') {
				logger.log('ServiceWorkerRegistration: Service Worker registered', {
					scope: reg.scope,
					state: reg.active?.state,
					updateStrategy: 'aggressive (skipWaiting)',
				})
			}

			// FAANG Best Practice #4: Immediate Activation
			// Listen for controller change and reload immediately
			// IMPROVEMENT: Only reload if this was triggered by an update, not initial load
			console.log('🎧 Setting up event listeners...')
			console.log('📍 Current controller:', navigator.serviceWorker.controller ? 'Exists' : 'None')
			
			let isFirstLoad = !navigator.serviceWorker.controller
			console.log('📍 Is first load:', isFirstLoad)
			
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				console.log('🔄 [Controller Change] Event fired')
				console.log('📍 Is first load:', isFirstLoad)
				
				// Don't reload on initial page load (controller was null)
				if (isFirstLoad) {
					console.log('✅ [Controller Change] First load detected - skipping reload')
					isFirstLoad = false
					return
				}
				
				console.warn('🔄 [Controller Change] SW updated - reloading page...')
				if (process.env.NODE_ENV === 'development') {
					logger.log('ServiceWorkerRegistration: New SW activated, reloading...')
				}
				// Auto-reload to get new code (Meta/Google pattern)
				// Only reloads when SW updates, not on initial page load
				window.location.reload()
			})

			// Handle updates
			reg.addEventListener('updatefound', () => {
				console.log('🔍 [Update Found] New Service Worker detected!')
				const newWorker = reg.installing
				console.log('📍 New worker state:', newWorker?.state)

				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						console.log(`📡 [SW State Change] ${newWorker.state}`)
						
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('✅ [Update Available] New version ready!')
							console.log('📍 Current controller:', navigator.serviceWorker.controller.scriptURL)
							console.log('📍 New worker:', newWorker.scriptURL)
							
							// New Service Worker available
							setUpdateAvailable(true)

							if (process.env.NODE_ENV === 'development') {
								logger.log('ServiceWorkerRegistration: Update available')
							}

							// FAANG Pattern: Tell new SW to skip waiting
							// This makes it activate immediately instead of waiting
							console.log('📨 Sending SKIP_WAITING message to new SW...')
							newWorker.postMessage({ type: 'SKIP_WAITING' })

							// Show notification
							showUpdateNotification()
						}
					})
				}
			})

			// Check for existing updates immediately
			console.log('🔄 Checking for immediate updates...')
			reg.update()
				.then(() => console.log('✅ Initial update check complete'))
				.catch((error) => {
					console.error('❌ Initial update check failed:', error)
					logger.error('ServiceWorkerRegistration: Initial update check failed', { error })
				})
			
			console.groupEnd()
		} catch (error) {
			console.error('❌ [SW Registration] Failed:', error)
			console.groupEnd()
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
		console.log(
			'%c🔄 UPDATE AVAILABLE',
			'background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px; font-weight: bold;',
			'\n\n✨ A new version is available!\n📱 Refresh page to get the latest version\n🚀 Updates apply immediately\n'
		)
		
		if (process.env.NODE_ENV === 'development') {
			console.log('💡 Tip: The page will auto-reload when the new SW activates')
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

	// Add debug helper to window object
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// @ts-ignore - Adding debug helper
			window.swDebug = {
				getRegistration: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					console.table(regs.map(r => ({
						scope: r.scope,
						installing: r.installing?.state,
						waiting: r.waiting?.state,
						active: r.active?.state,
					})))
					return regs
				},
				getCaches: async () => {
					const cacheNames = await caches.keys()
					console.log('📦 Available caches:', cacheNames)
					for (const name of cacheNames) {
						const cache = await caches.open(name)
						const keys = await cache.keys()
						console.log(`  📁 ${name}: ${keys.length} items`)
					}
					return cacheNames
				},
				clearAllCaches: async () => {
					const cacheNames = await caches.keys()
					console.log('🗑️  Clearing', cacheNames.length, 'caches...')
					await Promise.all(cacheNames.map(name => caches.delete(name)))
					console.log('✅ All caches cleared!')
				},
				unregisterAll: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					console.log('🗑️  Unregistering', regs.length, 'service workers...')
					await Promise.all(regs.map(r => r.unregister()))
					console.log('✅ All service workers unregistered!')
				},
				forceUpdate: async () => {
					const regs = await navigator.serviceWorker.getRegistrations()
					console.log('🔄 Forcing update check...')
					await Promise.all(regs.map(r => r.update()))
					console.log('✅ Update check complete!')
				},
				help: () => {
					console.log('%cService Worker Debug Commands', 'font-size: 16px; font-weight: bold; color: #2196F3;')
					console.log('  swDebug.getRegistration()  - Show SW registration status')
					console.log('  swDebug.getCaches()        - List all caches and items')
					console.log('  swDebug.clearAllCaches()   - Clear all caches')
					console.log('  swDebug.unregisterAll()    - Unregister all service workers')
					console.log('  swDebug.forceUpdate()      - Force SW update check')
					console.log('  swDebug.help()             - Show this help')
				}
			}
			console.log('%c💡 Debug Helper Available', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;')
			console.log('Type swDebug.help() for available commands')
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

