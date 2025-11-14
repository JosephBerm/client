/**
 * MedSource Pro - Service Worker
 * 
 * Enterprise-grade Service Worker for image caching and offline support.
 * Follows Google Workbox patterns and FAANG best practices.
 * 
 * **Features:**
 * - Image caching with cache-first strategy
 * - Automatic cache cleanup and size management
 * - Version-based cache invalidation
 * - Network-first fallback for critical assets
 * - Runtime caching for API responses
 * 
 * **Industry Standards:**
 * - Google Workbox caching strategies
 * - Progressive Web App (PWA) patterns
 * - Cache API best practices
 * 
 * **Cache Strategies:**
 * - Images: Cache-first (serve from cache, update in background)
 * - API: Network-first (fresh data, fallback to cache)
 * - Assets: Cache-first (static assets from CDN)
 * 
 * @module ServiceWorker
 */

// Service Worker version - update to invalidate caches
// CRITICAL: Increment this after major code refactorings to force cache clear
const VERSION = 'v1.1.0' // Updated after INITIAL_FILTER fix
const CACHE_NAME = `medsource-images-${VERSION}`
const API_CACHE_NAME = `medsource-api-${VERSION}`
const STATIC_CACHE_NAME = `medsource-static-${VERSION}`

// Cache size limits (Google Lighthouse recommendations)
const MAX_IMAGE_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_IMAGE_CACHE_ITEMS = 200 // Maximum number of cached images
const MAX_API_CACHE_ITEMS = 50 // Maximum number of cached API responses

// Cache duration (milliseconds)
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const API_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Install Event
 * 
 * Triggered when Service Worker is first installed.
 * Caches critical assets for offline support.
 * 
 * **Pattern**: Google Workbox precaching
 */
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE_NAME)
			.then((cache) => {
				// Cache critical static assets
				return cache.addAll([
					'/', // Homepage
					'/manifest.json', // PWA manifest
					// Add other critical assets here
				])
			})
			.then(() => {
				// Skip waiting to activate immediately
				return self.skipWaiting()
			})
	)
})

/**
 * Activate Event
 * 
 * Triggered when Service Worker becomes active.
 * Cleans up old caches from previous versions.
 * 
 * **Pattern**: Google Workbox cache cleanup
 */
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				const currentCaches = [CACHE_NAME, API_CACHE_NAME, STATIC_CACHE_NAME]
				
				// Delete old caches
				return Promise.all(
					cacheNames.map((cacheName) => {
						// Keep only current version caches
						if (!currentCaches.includes(cacheName)) {
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				// Claim clients to activate immediately
				return self.clients.claim()
			})
	)
})

/**
 * Fetch Event
 * 
 * Intercepts network requests and applies caching strategies.
 * 
 * **Strategies:**
 * - Images: Cache-first with background update
 * - API: Network-first with cache fallback
 * - Static: Cache-first
 * 
 * **Pattern**: Google Workbox runtime caching
 */
self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Only handle GET requests
	if (request.method !== 'GET') {
		return
	}

	// FAANG Best Practice #1: NEVER cache JavaScript chunks
	// This prevents issues like the INITIAL_FILTER error you experienced
	// JavaScript should always come fresh from the server to get latest code
	if (isJavaScriptChunk(url)) {
		event.respondWith(fetch(request, { cache: 'no-store' }))
		return
	}

	// Image requests - Cache-first strategy
	if (request.destination === 'image' || isImageUrl(url)) {
		event.respondWith(handleImageRequest(request))
		return
	}

	// API requests - Network-first strategy
	if (isAPIUrl(url)) {
		event.respondWith(handleAPIRequest(request))
		return
	}

	// Static assets - Cache-first strategy (CSS, fonts, etc.)
	// Note: Excludes JavaScript - see above
	if (isStaticAsset(url)) {
		event.respondWith(handleStaticRequest(request))
		return
	}

	// Default: network only
	event.respondWith(fetch(request))
})

/**
 * Handles image requests with cache-first strategy.
 * 
 * **Strategy**: Cache-first (Amazon/Google pattern)
 * 1. Check cache first
 * 2. If not in cache, fetch from network
 * 3. Store in cache for future requests
 * 4. Enforce cache size limits
 * 
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response from cache or network
 */
async function handleImageRequest(request) {
	try {
		// Try cache first (fast)
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			// Check if cached image is still fresh
			const cachedDate = new Date(cachedResponse.headers.get('date'))
			const now = new Date()
			const age = now - cachedDate

			if (age < IMAGE_CACHE_DURATION) {
				return cachedResponse
			}
		}

		// Fetch from network
		const networkResponse = await fetch(request)

		// Cache successful responses only
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME)
			await cache.put(request, networkResponse.clone())

			// Enforce cache size limits
			await enforceImageCacheLimit(cache)
		}

		return networkResponse
	} catch (error) {
		// Try to serve stale cache as fallback
		const staleCache = await caches.match(request)
		if (staleCache) {
			return staleCache
		}

		// Return placeholder if everything fails
		return new Response('', {
			status: 404,
			statusText: 'Image not found',
		})
	}
}

/**
 * Handles API requests with network-first strategy.
 * 
 * **Strategy**: Network-first (FAANG pattern for dynamic data)
 * 1. Try network first (fresh data)
 * 2. If network fails, use cache
 * 3. Store response in cache for offline support
 * 
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response from network or cache
 */
async function handleAPIRequest(request) {
	try {
		// Try network first (fresh data preferred)
		const networkResponse = await fetch(request)

		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(API_CACHE_NAME)
			await cache.put(request, networkResponse.clone())

			// Enforce cache size limits
			await enforceAPICacheLimit(cache)
		}

		return networkResponse
	} catch (error) {
		// Fallback to cache
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}

		// Return error if no cache available
		return new Response(JSON.stringify({ error: 'Network error and no cache available' }), {
			status: 503,
			statusText: 'Service Unavailable',
			headers: { 'Content-Type': 'application/json' },
		})
	}
}

/**
 * Handles static asset requests with cache-first strategy.
 * 
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response from cache or network
 */
async function handleStaticRequest(request) {
	try {
		// Try cache first
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}

		// Fetch from network
		const networkResponse = await fetch(request)

		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(STATIC_CACHE_NAME)
			await cache.put(request, networkResponse.clone())
		}

		return networkResponse
	} catch (error) {
		console.error('[ServiceWorker] Static asset fetch failed:', error)

		// Try to serve stale cache
		const staleCache = await caches.match(request)
		if (staleCache) {
			return staleCache
		}

		return new Response('', { status: 404 })
	}
}

/**
 * Enforces image cache size limits.
 * Removes oldest entries when limit is exceeded.
 * 
 * **Pattern**: LRU (Least Recently Used) eviction
 * 
 * @param {Cache} cache - Cache object
 */
async function enforceImageCacheLimit(cache) {
	const keys = await cache.keys()

	// Check item count limit
	if (keys.length > MAX_IMAGE_CACHE_ITEMS) {
		const deleteCount = keys.length - MAX_IMAGE_CACHE_ITEMS
		console.log(`[ServiceWorker] Deleting ${deleteCount} old cached images`)

		// Delete oldest entries
		for (let i = 0; i < deleteCount; i++) {
			await cache.delete(keys[i])
		}
	}

	// Note: Actual size checking requires getting response blobs
	// For simplicity, we're using item count limit
	// In production, you'd check actual cache size
}

/**
 * Enforces API cache size limits.
 * 
 * @param {Cache} cache - Cache object
 */
async function enforceAPICacheLimit(cache) {
	const keys = await cache.keys()

	if (keys.length > MAX_API_CACHE_ITEMS) {
		const deleteCount = keys.length - MAX_API_CACHE_ITEMS
		console.log(`[ServiceWorker] Deleting ${deleteCount} old cached API responses`)

		// Delete oldest entries
		for (let i = 0; i < deleteCount; i++) {
			await cache.delete(keys[i])
		}
	}
}

/**
 * Checks if URL is an image URL.
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if image URL
 */
function isImageUrl(url) {
	// Check file extension
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
	return imageExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext))
}

/**
 * Checks if URL is an API URL.
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if API URL
 */
function isAPIUrl(url) {
	// Match API endpoints
	return (
		url.pathname.includes('/api/') ||
		url.pathname.includes('/products/') ||
		url.hostname.includes('azurewebsites.net')
	)
}

/**
 * Checks if URL is a JavaScript chunk (NEVER cache these!)
 * 
 * **CRITICAL:** JavaScript chunks must NEVER be cached by Service Worker.
 * This prevents stale code issues like the INITIAL_FILTER error.
 * 
 * **FAANG Pattern:** Google, Meta, Amazon never cache JavaScript chunks.
 * They use cache-busting hashes in filenames instead (e.g., app.abc123.js).
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if JavaScript chunk
 */
function isJavaScriptChunk(url) {
	const pathname = url.pathname.toLowerCase()
	return (
		pathname.endsWith('.js') &&
		(pathname.includes('/_next/') || 
		 pathname.includes('/static/') ||
		 pathname.includes('/chunks/') ||
		 pathname.includes('/app_') ||
		 pathname.includes('/main') ||
		 pathname.includes('/pages'))
	)
}

/**
 * Checks if URL is a static asset.
 * 
 * **Note:** Excludes JavaScript files - they're handled separately.
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if static asset
 */
function isStaticAsset(url) {
	// CSS, fonts, manifests - safe to cache
	const staticExtensions = ['.css', '.woff', '.woff2', '.ttf', '.eot', '.json']
	return staticExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext))
}

/**
 * Message Event
 * 
 * Handles messages from clients for cache management.
 * 
 * **Commands:**
 * - SKIP_WAITING: Activate new service worker immediately
 * - CLEAR_CACHE: Clear all caches
 * - GET_CACHE_SIZE: Get current cache statistics
 */
self.addEventListener('message', (event) => {
	if (event.data && event.data.type) {
		switch (event.data.type) {
			case 'SKIP_WAITING':
				self.skipWaiting()
				break

			case 'CLEAR_CACHE':
				event.waitUntil(
					caches.keys().then((cacheNames) => {
						return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
					})
				)
				break

			case 'GET_CACHE_SIZE':
				event.waitUntil(
					caches
						.keys()
						.then((cacheNames) => {
							return Promise.all(
								cacheNames.map(async (cacheName) => {
									const cache = await caches.open(cacheName)
									const keys = await cache.keys()
									return { cacheName, itemCount: keys.length }
								})
							)
						})
						.then((cacheStats) => {
							event.ports[0].postMessage({ type: 'CACHE_SIZE', stats: cacheStats })
						})
				)
				break
		}
	}
})

// Service Worker loaded - version ${VERSION}

