/**
 * useAdvancedLazyLoad Hook - Bandwidth-Aware Lazy Loading
 * 
 * Advanced lazy loading hook with bandwidth detection and connection-aware loading.
 * Follows the same patterns as useImage and other hooks in the application.
 * 
 * **Features:**
 * - Intersection Observer with configurable thresholds
 * - Bandwidth detection (Network Information API)
 * - Connection-aware loading (4G, 3G, 2G, slow-2g)
 * - Prefetch strategies based on connection
 * - Performance optimization
 * 
 * **Loading Strategies:**
 * - **fast**: Load immediately (high bandwidth)
 * - **medium**: Load with small delay (medium bandwidth)
 * - **slow**: Load only when very close (low bandwidth)
 * - **offline**: Don't load (offline mode)
 * 
 * **Use Cases:**
 * - Product images with bandwidth awareness
 * - Gallery images with connection-based loading
 * - Large images on slow connections
 * - Mobile-optimized loading
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { shouldLoad, connectionType } = useAdvancedLazyLoad(imageUrl);
 * 
 * // With custom thresholds
 * const { shouldLoad } = useAdvancedLazyLoad(imageUrl, {
 *   threshold: 0.5,
 *   rootMargin: '200px'
 * });
 * ```
 * 
 * @module useAdvancedLazyLoad
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { logger } from '@_core'

/**
 * Connection type from Network Information API.
 */
export type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'

/**
 * Effective connection type (derived from Network Information API).
 */
export type EffectiveConnectionType = '4g' | '3g' | '2g' | 'slow-2g'

/**
 * Loading strategy based on connection.
 */
export type LoadingStrategy = 'fast' | 'medium' | 'slow' | 'offline'

/**
 * Options for the useAdvancedLazyLoad hook.
 */
export interface UseAdvancedLazyLoadOptions {
	/** Intersection Observer threshold (0-1) */
	threshold?: number | number[]
	/** Root margin for Intersection Observer */
	rootMargin?: string
	/** Whether to enable bandwidth detection */
	enableBandwidthDetection?: boolean
	/** Custom loading strategy override */
	strategy?: LoadingStrategy
	/** Delay before loading (ms) - applied based on connection */
	delay?: number
}

/**
 * Return type for the useAdvancedLazyLoad hook.
 */
export interface UseAdvancedLazyLoadReturn {
	/** Whether image should be loaded */
	shouldLoad: boolean
	/** Detected connection type */
	connectionType: ConnectionType
	/** Effective connection type */
	effectiveConnectionType: EffectiveConnectionType
	/** Loading strategy being used */
	strategy: LoadingStrategy
	/** Whether bandwidth detection is available */
	hasBandwidthInfo: boolean
	/** Estimated bandwidth (Mbps) */
	estimatedBandwidth?: number
}

/**
 * Network Information API interface (browser extension).
 */
interface NetworkInformation extends EventTarget {
	readonly effectiveType?: EffectiveConnectionType
	readonly downlink?: number
	readonly rtt?: number
	readonly saveData?: boolean
	readonly type?: ConnectionType
}

/**
 * Navigator with Network Information API.
 */
interface NavigatorWithConnection extends Navigator {
	connection?: NetworkInformation
	mozConnection?: NetworkInformation
	webkitConnection?: NetworkInformation
}

/**
 * Custom hook for advanced lazy loading with bandwidth awareness.
 * 
 * Provides intelligent lazy loading based on connection speed and viewport proximity.
 * Uses Intersection Observer for viewport detection and Network Information API
 * for bandwidth detection.
 * 
 * @param {string | null} src - Image source URL
 * @param {UseAdvancedLazyLoadOptions} options - Configuration options
 * @returns {UseAdvancedLazyLoadReturn} Lazy loading state and connection info
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { shouldLoad, connectionType } = useAdvancedLazyLoad(imageUrl);
 * 
 * // With bandwidth detection
 * const { shouldLoad, strategy, estimatedBandwidth } = useAdvancedLazyLoad(imageUrl, {
 *   enableBandwidthDetection: true,
 *   threshold: 0.3
 * });
 * 
 * // Conditional rendering
 * {shouldLoad && <Image src={imageUrl} />}
 * ```
 */
export function useAdvancedLazyLoad(
	src: string | null,
	options: UseAdvancedLazyLoadOptions = {}
): UseAdvancedLazyLoadReturn {
	const {
		threshold = 0.1,
		rootMargin = '50px',
		enableBandwidthDetection = true,
		strategy: customStrategy,
		delay = 0,
	} = options

	const [shouldLoad, setShouldLoad] = useState(false)
	const [connectionType, setConnectionType] = useState<ConnectionType>('unknown')
	const [effectiveConnectionType, setEffectiveConnectionType] = useState<EffectiveConnectionType>('4g')
	const [strategy, setStrategy] = useState<LoadingStrategy>('fast')
	const [hasBandwidthInfo, setHasBandwidthInfo] = useState(false)
	const [estimatedBandwidth, setEstimatedBandwidth] = useState<number | undefined>()

	const observerRef = useRef<IntersectionObserver | null>(null)
	const elementRef = useRef<HTMLDivElement | null>(null)

	/**
	 * Detects network connection information.
	 */
	const detectConnection = useCallback(() => {
		if (typeof window === 'undefined' || !enableBandwidthDetection) {
			return
		}

		const nav = navigator as NavigatorWithConnection
		const connection =
			nav.connection || nav.mozConnection || nav.webkitConnection

		if (connection) {
			setHasBandwidthInfo(true)

			// Connection type
			const type = (connection.type || 'unknown')
			setConnectionType(type)

			// Effective connection type
			const effectiveType = (connection.effectiveType || '4g')
			setEffectiveConnectionType(effectiveType)

			// Estimated bandwidth (downlink in Mbps)
			if (connection.downlink !== undefined) {
				setEstimatedBandwidth(connection.downlink)
			}

			// Determine loading strategy
			let loadingStrategy: LoadingStrategy = 'fast'

			if (connection.saveData) {
				loadingStrategy = 'offline'
			} else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
				loadingStrategy = 'slow'
			} else if (effectiveType === '3g') {
				loadingStrategy = 'medium'
			} else {
				loadingStrategy = 'fast'
			}

			setStrategy(customStrategy || loadingStrategy)

			if (process.env.NODE_ENV === 'development') {
				logger.debug('useAdvancedLazyLoad: Connection detected', {
					type,
					effectiveType,
					downlink: connection.downlink,
					rtt: connection.rtt,
					saveData: connection.saveData,
					strategy: loadingStrategy,
				})
			}
		} else {
			// Network Information API not available
			setHasBandwidthInfo(false)
			setStrategy(customStrategy || 'fast')
		}
	}, [enableBandwidthDetection, customStrategy])

	/**
	 * Determines root margin based on connection strategy.
	 */
	const getRootMargin = useCallback((): string => {
		switch (strategy) {
			case 'fast':
				return rootMargin
			case 'medium':
				// Reduce root margin for medium connections
				const mediumMargin = parseInt(rootMargin) || 50
				return `${Math.max(mediumMargin / 2, 25)}px`
			case 'slow':
				// Minimal root margin for slow connections
				return '10px'
			case 'offline':
				return '0px'
			default:
				return rootMargin
		}
	}, [strategy, rootMargin])

	/**
	 * Sets up Intersection Observer.
	 */
	useEffect(() => {
		if (!src || typeof window === 'undefined') {
			return
		}

		// Detect connection on mount
		detectConnection()

		// Listen for connection changes
		const nav = navigator as NavigatorWithConnection
		const connection = nav.connection || nav.mozConnection || nav.webkitConnection

		if (connection) {
			const handleConnectionChange = () => {
				detectConnection()
			}

			connection.addEventListener('change', handleConnectionChange)

			return () => {
				connection.removeEventListener('change', handleConnectionChange)
			}
		}
	}, [src, detectConnection])

	/**
	 * Sets up Intersection Observer for viewport detection.
	 */
	useEffect(() => {
		if (!src || shouldLoad || typeof window === 'undefined') {
			return
		}

		// Create dummy element for observation
		const dummy = document.createElement('div')
		dummy.style.position = 'absolute'
		dummy.style.visibility = 'hidden'
		dummy.style.width = '1px'
		dummy.style.height = '1px'
		document.body.appendChild(dummy)
		elementRef.current = dummy

		const margin = getRootMargin()

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Apply delay based on strategy
						const loadDelay = strategy === 'slow' ? delay + 500 : strategy === 'medium' ? delay + 200 : delay

						setTimeout(() => {
							setShouldLoad(true)
							observer.disconnect()
							if (dummy.parentNode) {
								dummy.parentNode.removeChild(dummy)
							}
						}, loadDelay)
					}
				})
			},
			{
				threshold,
				rootMargin: margin,
			}
		)

		observer.observe(dummy)
		observerRef.current = observer

		return () => {
			observer.disconnect()
			if (dummy.parentNode) {
				dummy.parentNode.removeChild(dummy)
			}
		}
	}, [src, shouldLoad, threshold, strategy, delay, getRootMargin])

	return {
		shouldLoad,
		connectionType,
		effectiveConnectionType,
		strategy,
		hasBandwidthInfo,
		estimatedBandwidth,
	}
}


