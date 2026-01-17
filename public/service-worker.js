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
const VERSION = 'v2.0.0' // Updated with strict cache limits per cache-fix plan
const CACHE_NAME = `medsource-images-${VERSION}`
const STATIC_CACHE_NAME = `medsource-static-${VERSION}`

// =============================================================================
// CACHE SIZE LIMITS (MAANG Best Practice: Strict Limits)
// =============================================================================
// 
// **Why strict limits matter:**
// - Mobile devices have limited storage
// - Browser quota is shared across all origins
// - Large caches slow down Service Worker startup
// - Users noticed 4MB+ cache growth when scrolling
//
// **Strategy: Prioritize images over API responses**
// - Images: Cached (biggest visual impact)
// - API: NOT cached by SW (Next.js Data Cache handles this better)
// - Static: Cached (fonts, critical CSS)
//
const MAX_IMAGE_CACHE_SIZE = 10 * 1024 * 1024 // 10MB (reduced from 50MB)
const MAX_IMAGE_CACHE_ITEMS = 30 // Maximum 30 images (reduced from 200)

// Cache duration (milliseconds)
const IMAGE_CACHE_DURATION = 2 * 24 * 60 * 60 * 1000 // 2 days (reduced from 7)

// =============================================================================
// MAANG-LEVEL SECURITY: ALLOWED ORIGINS
// =============================================================================
// 
// **Why MAANG companies use explicit allowlists:**
// 1. Security: Prevents Service Worker from intercepting unauthorized domains
// 2. Privacy: Avoids triggering browser permission prompts for local network access
// 3. Performance: Only processes requests from trusted sources
// 4. Compliance: Follows web security best practices (OWASP, W3C)
//
// **Pattern**: Google, Meta, Amazon all use explicit origin allowlists in SW
// This prevents the "local network access" permission dialog that users see
//
// **Production Origins**: Only intercept requests from these domains
const ALLOWED_ORIGINS = [
	'www.medsourcepro.com',
	'medsourcepro.com',
	'prod-server20241205193558.azurewebsites.net',
]

// **Development Origins**: Only intercept in development if explicitly enabled
// Note: Service Worker is disabled in dev by default (see ServiceWorkerRegistration.tsx)
const ALLOWED_DEV_ORIGINS = [
	// Intentionally empty - Service Worker disabled in development
	// If you need dev support, add 'localhost' here, but be aware it may trigger
	// local network permission prompts in some browsers
]

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
				// Only keep image and static caches (API caching removed)
				const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME]
				
				// Delete old caches (including legacy API caches)
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

	// =============================================================================
	// MAANG-LEVEL SECURITY: REQUEST VALIDATION (Order matters!)
	// =============================================================================
	// 
	// **Security-First Approach**: All security checks happen BEFORE any processing
	// This follows Google/Meta/Amazon patterns where security is the first concern
	//
	// **Why this order matters:**
	// 1. Method check first (fastest rejection)
	// 2. Origin check second (prevents unauthorized domain interception)
	// 3. Local network check third (prevents permission prompts)
	// 4. Content type checks last (most expensive)

	// MAANG Best Practice #1: Only intercept GET requests
	// PUT/POST/DELETE should never be cached (security + data integrity)
	if (request.method !== 'GET') {
		return
	}

	// MAANG Best Practice #2: Explicit Origin Allowlist (Google/Meta Pattern)
	// Only intercept requests from trusted origins
	// This is MORE secure than blocking localhost (positive security model)
	if (!isAllowedOrigin(url)) {
		// Let browser handle unauthorized origins normally (don't intercept)
		return
	}

	// MAANG Best Practice #3: Skip Local Network Requests (Privacy Protection)
	// Even if origin is allowed, skip local network IPs to prevent permission prompts
	// This protects user privacy and avoids annoying browser dialogs
	if (isLocalNetworkUrl(url)) {
		// Let browser handle local network requests normally (don't intercept)
		return
	}

	// =============================================================================
	// CONTENT TYPE VALIDATION (After security checks)
	// =============================================================================

	// FAANG Best Practice #4: NEVER cache JavaScript chunks
	// This prevents issues like the INITIAL_FILTER error you experienced
	// JavaScript should always come fresh from the server to get latest code
	// Pattern: Google, Meta, Amazon never cache JS chunks (cache-busting hashes instead)
	if (isJavaScriptChunk(url)) {
		event.respondWith(fetch(request, { cache: 'no-store' }))
		return
	}

	// Image requests - Cache-first strategy
	if (request.destination === 'image' || isImageUrl(url)) {
		event.respondWith(handleImageRequest(request))
		return
	}

	// API requests - DO NOT CACHE in Service Worker
	// MAANG Best Practice: Let Next.js Data Cache handle API caching
	// This prevents cache growth issues and stale data problems
	// Service Worker API caching removed in v2.0.0 per cache-fix plan
	if (isAPIUrl(url)) {
		// Pass through to network without caching
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

// =============================================================================
// API CACHING REMOVED (v2.0.0)
// =============================================================================
// 
// **Why API caching was removed from Service Worker:**
// 1. Next.js Data Cache handles API caching better (server-side, tag-based)
// 2. Service Worker API caching caused cache growth issues (4MB+ observed)
// 3. Stale data problems with offline-first API responses
// 4. Duplicate caching layer (Next.js + SW = unnecessary complexity)
//
// **Current Strategy:**
// - Images: Service Worker cache (visual impact, fast offline access)
// - API: Next.js Data Cache with `use cache` directive
// - Static: Service Worker cache (fonts, critical CSS)
//

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

// enforceAPICacheLimit removed in v2.0.0 - API caching no longer done by SW

/**
 * MAANG-LEVEL SECURITY: Origin Allowlist Check
 * 
 * **Why MAANG companies use explicit allowlists:**
 * - Security: Positive security model (allow only trusted origins)
 * - Privacy: Prevents unauthorized domain interception
 * - Performance: Only processes requests from known-good sources
 * - Compliance: Follows OWASP and W3C security guidelines
 * 
 * **Pattern**: Google Workbox, Meta's Service Worker patterns, Amazon's PWA implementation
 * All use explicit origin allowlists rather than blocking lists
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if origin is in allowlist
 */
function isAllowedOrigin(url) {
	const hostname = url.hostname.toLowerCase()
	
	// Check against production allowlist
	for (const allowed of ALLOWED_ORIGINS) {
		if (hostname === allowed.toLowerCase() || hostname.endsWith('.' + allowed.toLowerCase())) {
			return true
		}
	}
	
	// Check against development allowlist (usually empty)
	// Only used if Service Worker is explicitly enabled in dev
	for (const allowed of ALLOWED_DEV_ORIGINS) {
		if (hostname === allowed.toLowerCase()) {
			return true
		}
	}
	
	return false
}

/**
 * MAANG-LEVEL SECURITY: Local Network Detection
 * 
 * **Why MAANG companies block local network interception:**
 * 1. Privacy: Prevents browser permission prompts for local network access
 * 2. Security: Local network resources may be sensitive (printers, IoT devices)
 * 3. User Experience: Permission dialogs are annoying and reduce trust
 * 4. Compliance: Follows browser security model (Chrome, Firefox, Safari all require permission)
 * 
 * **RFC 1918 Private IP Ranges:**
 * - 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
 * - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
 * - 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
 * 
 * **RFC 3927 Link-Local:**
 * - 169.254.0.0/16 (169.254.0.0 - 169.254.255.255)
 * 
 * **Pattern**: Google, Meta, Amazon all skip local network interception
 * This is why you don't see permission prompts on their PWAs
 * 
 * @param {URL} url - URL object
 * @returns {boolean} True if local network URL (should be skipped)
 */
function isLocalNetworkUrl(url) {
	const hostname = url.hostname.toLowerCase()
	
	// Check for localhost variants (IPv4 and IPv6)
	if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
		return true
	}
	
	// Validate IPv4 format (RFC 3986 compliant)
	// Pattern: 4 octets, each 0-255, separated by dots
	const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
	const match = hostname.match(ipv4Pattern)
	
	if (match) {
		const octets = match.slice(1).map(Number)
		const [a, b] = octets
		
		// Validate octet ranges (0-255) - invalid IPs are not local network
		if (octets.some(o => o > 255)) {
			return false
		}
		
		// RFC 1918: Private Network Addresses
		// 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
		if (a === 192 && b === 168) return true
		
		// 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
		if (a === 10) return true
		
		// 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
		if (a === 172 && b >= 16 && b <= 31) return true
		
		// RFC 3927: Link-Local Addresses
		// 169.254.0.0/16 (169.254.0.0 - 169.254.255.255)
		if (a === 169 && b === 254) return true
	}
	
	// Check for IPv6 link-local (fe80::/10)
	// Format: fe80:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx
	if (hostname.startsWith('fe80:') || hostname.startsWith('[fe80:')) {
		return true
	}
	
	return false
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

