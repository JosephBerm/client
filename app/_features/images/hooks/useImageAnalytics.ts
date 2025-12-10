/**
 * useImageAnalytics Hook - Performance Tracking
 * 
 * Custom React hook for tracking image loading performance and user interactions.
 * Follows the same patterns as other hooks in the application.
 * 
 * **Features:**
 * - Load time tracking
 * - Error rate monitoring
 * - User interaction tracking
 * - Performance metrics collection
 * - Optional analytics integration
 * 
 * **Metrics Tracked:**
 * - Image load time (time to first byte, time to load)
 * - Error rate
 * - Retry attempts
 * - User interactions (clicks, views)
 * - Cache hit rate
 * 
 * **Use Cases:**
 * - Performance monitoring
 * - Error tracking
 * - User behavior analysis
 * - A/B testing
 * - Performance optimization
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { trackLoad, trackError, trackInteraction } = useImageAnalytics();
 * 
 * // Track image load
 * trackLoad(imageUrl, loadTime);
 * 
 * // Track error
 * trackError(imageUrl, error);
 * 
 * // Track user interaction
 * trackInteraction('click', imageUrl);
 * ```
 * 
 * @module useImageAnalytics
 */

'use client'

import { useCallback, useRef } from 'react'

import { logger } from '@_core'

/**
 * Image load metrics.
 */
export interface ImageLoadMetrics {
	/** Image URL */
	url: string
	/** Load start time (timestamp) */
	startTime: number
	/** Load end time (timestamp) */
	endTime?: number
	/** Total load time in milliseconds */
	loadTime?: number
	/** Whether load was successful */
	success: boolean
	/** Error message if failed */
	error?: string
	/** Retry attempts */
	retryCount?: number
	/** Image dimensions (if available) */
	dimensions?: { width: number; height: number }
	/** Image file size in bytes (if available) */
	fileSize?: number
}

/**
 * User interaction type.
 */
export type InteractionType = 'click' | 'view' | 'zoom' | 'hover' | 'download'

/**
 * User interaction data.
 */
export interface ImageInteraction {
	/** Interaction type */
	type: InteractionType
	/** Image URL */
	url: string
	/** Timestamp */
	timestamp: number
	/** Additional metadata */
	metadata?: Record<string, any>
}

/**
 * Options for the useImageAnalytics hook.
 */
export interface UseImageAnalyticsOptions {
	/** Whether to enable analytics tracking */
	enabled?: boolean
	/** Custom analytics handler function */
	onTrack?: (event: string, data: any) => void
	/** Whether to log metrics (development only) */
	logMetrics?: boolean
	/** Sample rate (0-1, default: 1.0 = 100%) */
	sampleRate?: number
}

/**
 * Return type for the useImageAnalytics hook.
 */
export interface UseImageAnalyticsReturn {
	/** Track image load start */
	trackLoadStart: (url: string) => void
	/** Track image load completion */
	trackLoad: (url: string, success: boolean, error?: Error) => void
	/** Track image error */
	trackError: (url: string, error: Error, retryCount?: number) => void
	/** Track user interaction */
	trackInteraction: (type: InteractionType, url: string, metadata?: Record<string, any>) => void
	/** Get performance metrics */
	getMetrics: () => ImageLoadMetrics[]
	/** Clear metrics */
	clearMetrics: () => void
}

/**
 * Custom hook for image analytics and performance tracking.
 * 
 * Provides comprehensive tracking of image loading performance and user interactions.
 * Can be integrated with analytics services (Google Analytics, Mixpanel, etc.).
 * 
 * @param {UseImageAnalyticsOptions} options - Analytics configuration
 * @returns {UseImageAnalyticsReturn} Analytics tracking functions
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { trackLoad, trackError, trackInteraction } = useImageAnalytics();
 * 
 * // With custom analytics handler
 * const { trackLoad } = useImageAnalytics({
 *   onTrack: (event, data) => {
 *     // Send to analytics service
 *     analytics.track(event, data);
 *   }
 * });
 * 
 * // Track image load
 * useEffect(() => {
 *   const startTime = performance.now();
 *   trackLoadStart(imageUrl);
 *   
 *   img.onload = () => {
 *     const loadTime = performance.now() - startTime;
 *     trackLoad(imageUrl, true);
 *   };
 * }, [imageUrl]);
 * ```
 */
export function useImageAnalytics(
	options: UseImageAnalyticsOptions = {}
): UseImageAnalyticsReturn {
	const {
		enabled = true,
		onTrack,
		logMetrics = process.env.NODE_ENV === 'development',
		sampleRate = 1.0,
	} = options

	// Store metrics in ref to avoid re-renders
	const metricsRef = useRef<Map<string, ImageLoadMetrics>>(new Map())
	const loadStartTimesRef = useRef<Map<string, number>>(new Map())

	/**
	 * Check if tracking should occur (sample rate).
	 */
	const shouldTrack = useCallback((): boolean => {
		if (!enabled) {return false}
		return Math.random() < sampleRate
	}, [enabled, sampleRate])

	/**
	 * Track image load start.
	 */
	const trackLoadStart = useCallback(
		(url: string) => {
			if (!shouldTrack() || !url) {return}

			const startTime = performance.now()
			loadStartTimesRef.current.set(url, startTime)

			const metric: ImageLoadMetrics = {
				url,
				startTime,
				success: false,
			}

			metricsRef.current.set(url, metric)

			if (logMetrics) {
				logger.debug('ImageAnalytics: Load start', { url, startTime })
			}
		},
		[shouldTrack, logMetrics]
	)

	/**
	 * Track image load completion.
	 */
	const trackLoad = useCallback(
		(url: string, success: boolean, error?: Error) => {
			if (!shouldTrack() || !url) {return}

			const startTime = loadStartTimesRef.current.get(url) || performance.now()
			const endTime = performance.now()
			const loadTime = endTime - startTime

			const metric: ImageLoadMetrics = {
				url,
				startTime,
				endTime,
				loadTime,
				success,
				error: error?.message,
			}

			metricsRef.current.set(url, metric)
			loadStartTimesRef.current.delete(url)

			if (logMetrics) {
				logger.debug('ImageAnalytics: Load complete', { url, loadTime, success })
			}

			// Call custom analytics handler
			if (onTrack) {
				onTrack('image_load', {
					url,
					loadTime,
					success,
					error: error?.message,
				})
			}
		},
		[shouldTrack, onTrack, logMetrics]
	)

	/**
	 * Track image error.
	 */
	const trackError = useCallback(
		(url: string, error: Error, retryCount?: number) => {
			if (!shouldTrack() || !url) {return}

			const startTime = loadStartTimesRef.current.get(url) || performance.now()
			const endTime = performance.now()
			const loadTime = endTime - startTime

			const metric: ImageLoadMetrics = {
				url,
				startTime,
				endTime,
				loadTime,
				success: false,
				error: error.message,
				retryCount,
			}

			metricsRef.current.set(url, metric)

			if (logMetrics) {
				logger.error('ImageAnalytics: Load error', { url, error: error.message, retryCount })
			}

			// Call custom analytics handler
			if (onTrack) {
				onTrack('image_error', {
					url,
					loadTime,
					error: error.message,
					retryCount,
				})
			}
		},
		[shouldTrack, onTrack, logMetrics]
	)

	/**
	 * Track user interaction.
	 */
	const trackInteraction = useCallback(
		(type: InteractionType, url: string, metadata?: Record<string, any>) => {
			if (!shouldTrack() || !url) {return}

			const interaction: ImageInteraction = {
				type,
				url,
				timestamp: Date.now(),
				metadata,
			}

			if (logMetrics) {
				logger.debug('ImageAnalytics: Interaction', { interaction })
			}

			// Call custom analytics handler
			if (onTrack) {
				onTrack('image_interaction', interaction)
			}
		},
		[shouldTrack, onTrack, logMetrics]
	)

	/**
	 * Get all performance metrics.
	 */
	const getMetrics = useCallback((): ImageLoadMetrics[] => {
		return Array.from(metricsRef.current.values())
	}, [])

	/**
	 * Clear all metrics.
	 */
	const clearMetrics = useCallback(() => {
		metricsRef.current.clear()
		loadStartTimesRef.current.clear()
	}, [])

	return {
		trackLoadStart,
		trackLoad,
		trackError,
		trackInteraction,
		getMetrics,
		clearMetrics,
	}
}


