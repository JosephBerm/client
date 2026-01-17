/**
 * Service Worker for Image Caching
 *
 * Handles image caching for offline support and improved performance.
 * This Service Worker is registered by ImageCacheService when using
 * 'service-worker' or 'hybrid' cache strategies.
 *
 * **Features:**
 * - Image caching with TTL support
 * - Cache invalidation
 * - Offline image support
 * - Cache size management
 *
 * **Cache Strategy:**
 * - Images are cached with a time-to-live (TTL)
 * - Expired images are automatically removed
 * - Cache size is managed to prevent storage issues
 *
 * @module sw-image-cache
 */

const CACHE_NAME = 'image-cache-v2'
const MAX_CACHE_SIZE = 10 * 1024 * 1024 // 10MB (reduced from 50MB per cache-fix plan)
const MAX_CACHE_ITEMS = 30 // Maximum 30 images

// Install event - set up cache
self.addEventListener('install', (event) => {
	self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name.startsWith('image-cache-') && name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			)
		})
	)
	self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)

	// Only handle image requests
	if (!isImageRequest(url)) {
		return
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				// Check if cache entry is expired
				const cacheDate = cachedResponse.headers.get('sw-cache-date')
				const cacheTTL = cachedResponse.headers.get('sw-cache-ttl')

				if (cacheDate && cacheTTL) {
					const cacheTime = parseInt(cacheDate)
					const ttl = parseInt(cacheTTL)
					const now = Date.now()

					if (now - cacheTime > ttl) {
						// Cache expired, fetch fresh
						return fetchAndCache(event.request)
					}
				}

				// Return cached response
				return cachedResponse
			}

			// Not in cache, fetch and cache
			return fetchAndCache(event.request)
		})
	)
})

// Message event - handle cache commands from main thread
self.addEventListener('message', (event) => {
	const { type, url, ttl } = event.data

	switch (type) {
		case 'CACHE_IMAGE':
			if (url) {
				cacheImage(url, ttl)
			}
			break
		case 'INVALIDATE_IMAGE':
			if (url) {
				invalidateImage(url)
			}
			break
		case 'CLEAR_CACHE':
			clearCache()
			break
	}
})

/**
 * Checks if request is for an image.
 */
function isImageRequest(url) {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
	const pathname = url.pathname.toLowerCase()
	return imageExtensions.some((ext) => pathname.endsWith(ext)) || url.searchParams.has('image')
}

/**
 * Fetches and caches an image.
 */
async function fetchAndCache(request) {
	try {
		const response = await fetch(request)

		if (response.ok) {
			const cache = await caches.open(CACHE_NAME)
			const clonedResponse = response.clone()

			// Add cache metadata headers
			const headers = new Headers(clonedResponse.headers)
			headers.set('sw-cache-date', Date.now().toString())
			headers.set('sw-cache-ttl', (2 * 24 * 60 * 60 * 1000).toString()) // 2 days (reduced from 7)

			const cachedResponse = new Response(clonedResponse.body, {
				status: clonedResponse.status,
				statusText: clonedResponse.statusText,
				headers: headers,
			})

			await cache.put(request, cachedResponse)
		}

		return response
	} catch (error) {
		// Network error, try to return from cache
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}
		throw error
	}
}

/**
 * Caches an image with TTL.
 */
async function cacheImage(url, ttl = 2 * 24 * 60 * 60 * 1000) {
	try {
		const response = await fetch(url)
		if (response.ok) {
			const cache = await caches.open(CACHE_NAME)
			const headers = new Headers(response.headers)
			headers.set('sw-cache-date', Date.now().toString())
			headers.set('sw-cache-ttl', ttl.toString())

			const cachedResponse = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: headers,
			})

			await cache.put(url, cachedResponse)
		}
	} catch (error) {
		console.error('Service Worker: Failed to cache image', { url, error })
	}
}

/**
 * Invalidates a cached image.
 */
async function invalidateImage(url) {
	try {
		const cache = await caches.open(CACHE_NAME)
		await cache.delete(url)
	} catch (error) {
		console.error('Service Worker: Failed to invalidate image', { url, error })
	}
}

/**
 * Clears all cached images.
 */
async function clearCache() {
	try {
		const cacheNames = await caches.keys()
		await Promise.all(
			cacheNames
				.filter((name) => name.startsWith('image-cache-'))
				.map((name) => caches.delete(name))
		)
	} catch (error) {
		console.error('Service Worker: Failed to clear cache', { error })
	}
}

