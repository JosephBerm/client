/**
 * ImageServiceInitializer Component
 *
 * Client-side component that initializes image services on application load.
 * Manages image preloading service and cache service initialization.
 * Should be rendered once in the root layout alongside AuthInitializer and UserSettingsInitializer.
 *
 * **Architecture (Church of God Pattern):**
 * - Single initialization point via service initialization methods
 * - Called once on mount with empty dependency array
 * - Initializes ImagePreloadService and ImageCacheService
 * - Handles errors gracefully with fallbacks
 * - No UI rendering (returns null)
 *
 * **Services Initialized:**
 * - ImagePreloadService: Intelligent image preloading with priority queue
 * - ImageCacheService: Browser cache management (optional Service Worker)
 *
 * **Initialization Process:**
 * 1. Verify ImagePreloadService is ready (uses static defaults)
 * 2. Initialize ImageCacheService with browser strategy (50MB limit)
 * 3. Handle errors gracefully (services continue to work without full initialization)
 *
 * **SSR Considerations:**
 * - Initialization only runs client-side ('use client' directive)
 * - Returns null (no UI rendering)
 * - Services are available immediately after initialization
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import AuthInitializer from '@_components/common/AuthInitializer';
 * import UserSettingsInitializer from '@_components/common/UserSettingsInitializer';
 * import ImageServiceInitializer from '@_components/common/ImageServiceInitializer';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <AuthInitializer />
 *         <UserSettingsInitializer />
 *         <ImageServiceInitializer />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @module ImageServiceInitializer
 */

'use client'

import { useEffect } from 'react'
import { ImagePreloadService } from '@_services/ImagePreloadService'
import { ImageCacheService } from '@_services/ImageCacheService'
import { logger } from '@_utils/logger'

/**
 * ImageServiceInitializer Component
 *
 * Invisible component that initializes all image services on app mount.
 * Must be rendered in a client component context.
 *
 * **Implementation Details:**
 * - Verifies ImagePreloadService is ready (uses static defaults, no init needed)
 * - Initializes ImageCacheService with browser strategy (50MB limit)
 * - Runs once on mount (empty dependency array)
 * - Handles errors gracefully with logging
 * - Returns null (no UI rendering)
 *
 * **Initialization Process:**
 * 1. Verify ImagePreloadService readiness (service uses static defaults)
 * 2. Initialize ImageCacheService (browser cache, optional Service Worker)
 * 3. Services are ready for use immediately after initialization
 *
 * **Performance:**
 * - Single initialization call (not reactive)
 * - Services handle their own state management
 * - No unnecessary re-renders
 * - Graceful degradation if initialization fails
 *
 * **Important Notes:**
 * - Must be placed in a client component ('use client')
 * - Should be rendered high in the component tree (root layout)
 * - Only runs once per application load
 * - Services continue to work even if initialization fails (graceful degradation)
 *
 * @returns null - Component does not render any UI
 */
export default function ImageServiceInitializer() {
	useEffect(() => {
		// Initialize image services on mount
		// Only run once - empty dependency array ensures this
		
		const initializeServices = async () => {
			try {
				// ImagePreloadService is ready to use without explicit initialization
				// The service uses static properties with defaults (maxConcurrent: 3)
				// It will be configured when preload() is called with options
				// No initialization needed - service is ready to use
				
				if (process.env.NODE_ENV === 'development') {
					logger.log('ImageServiceInitializer: ImagePreloadService ready', {
						note: 'Service uses static defaults (maxConcurrent: 3)',
					})
				}
			} catch (error) {
				// Graceful degradation - service will still work
				logger.error('ImageServiceInitializer: Error checking ImagePreloadService', { error })
			}

			try {
				// Initialize ImageCacheService
				// Strategy: 'browser' (uses browser HTTP cache)
				// Max size: 50MB (reasonable limit for image cache)
				// Service Worker: Not enabled by default (can be enabled later if needed)
				await ImageCacheService.initialize('browser', 50 * 1024 * 1024)
				
				if (process.env.NODE_ENV === 'development') {
					logger.log('ImageServiceInitializer: ImageCacheService initialized', {
						strategy: 'browser',
						maxSize: '50MB',
					})
				}
			} catch (error) {
				// Graceful degradation - cache service will still work with browser cache
				logger.error('ImageServiceInitializer: Failed to initialize ImageCacheService', { error })
			}
		}

		initializeServices()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Empty array - only run once on mount

	// This component doesn't render anything
	return null
}

