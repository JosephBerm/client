/**
 * useImage Hook
 * 
 * Custom React hook for managing image loading state with error handling and retry logic.
 * Follows the same patterns as other hooks in the application (useFormSubmit, useServerTable).
 * 
 * **Features:**
 * - Loading state management
 * - Error handling with retry
 * - Automatic retry on failure
 * - Intersection Observer for lazy loading
 * - Performance tracking
 * 
 * **Use Cases:**
 * - Product images with error recovery
 * - Lazy loading images below the fold
 * - Image loading with retry logic
 * - Performance monitoring
 * 
 * @module useImage
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { logger } from '@_core'

import { ImageService } from '../services/ImageService'

/**
 * Options for the useImage hook.
 */
export interface UseImageOptions {
	/** Whether to load image immediately (priority loading) */
	priority?: boolean
	/** Maximum number of retry attempts on failure */
	retryCount?: number
	/** Delay between retries in milliseconds */
	retryDelay?: number
	/** Callback when image loads successfully */
	onLoad?: () => void
	/** Callback when image fails to load */
	onError?: (error: Error) => void
	/** Whether to use Intersection Observer for lazy loading */
	lazy?: boolean
	/** Root margin for Intersection Observer (default: '50px') */
	rootMargin?: string
}

/**
 * Return type for the useImage hook.
 */
export interface UseImageReturn {
	/** Image source URL (may be null) */
	src: string | null
	/** Whether image is currently loading */
	isLoading: boolean
	/** Whether image failed to load */
	isError: boolean
	/** Whether image loaded successfully */
	isLoaded: boolean
	/** Function to manually retry loading */
	retry: () => void
}

/**
 * Custom hook for managing image loading state.
 * 
 * Handles loading, error states, and automatic retry logic.
 * Supports lazy loading with Intersection Observer.
 * 
 * @param {string | null} src - Image source URL
 * @param {UseImageOptions} options - Configuration options
 * @returns {UseImageReturn} Image state and control functions
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { src, isLoading, isError, isLoaded } = useImage(imageUrl);
 * 
 * // With retry and callbacks
 * const { src, isLoading, isError, retry } = useImage(imageUrl, {
 *   retryCount: 3,
 *   onLoad: () => logger.info('Image loaded', { imageUrl }),
 *   onError: (error) => logger.error('Image failed to load', { error, imageUrl })
 * });
 * 
 * // Lazy loading
 * const { src, isLoading } = useImage(imageUrl, {
 *   lazy: true,
 *   rootMargin: '100px'
 * });
 * ```
 */
export function useImage(
	src: string | null,
	options: UseImageOptions = {}
): UseImageReturn {
	const {
		priority = false,
		retryCount = 3,
		retryDelay = 1000,
		onLoad,
		onError,
		lazy = !priority,
		rootMargin = '50px',
	} = options

	const [isLoading, setIsLoading] = useState<boolean>(!priority && !!src)
	const [isError, setIsError] = useState<boolean>(false)
	const [isLoaded, setIsLoaded] = useState<boolean>(false)
	const [shouldLoad, setShouldLoad] = useState<boolean>(priority || !lazy)

	const retryCountRef = useRef<number>(0)
	const _imgRef = useRef<HTMLImageElement | null>(null)
	const observerRef = useRef<IntersectionObserver | null>(null)

	// Load image function
	const loadImage = useCallback(
		async (imageSrc: string | null) => {
			if (!imageSrc) {
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			setIsError(false)

			try {
				const success = await ImageService.retryLoad(imageSrc, retryCount, retryDelay)

				if (success) {
					setIsLoaded(true)
					setIsLoading(false)
					setIsError(false)
					retryCountRef.current = 0
					onLoad?.()
				} else {
					setIsError(true)
					setIsLoading(false)
					const error = new Error(`Failed to load image: ${imageSrc}`)
					onError?.(error)
					logger.error('useImage: Image load failed', { src: imageSrc, retries: retryCountRef.current })
				}
			} catch (error) {
				setIsError(true)
				setIsLoading(false)
				const err = error instanceof Error ? error : new Error('Unknown error')
				onError?.(err)
				logger.error('useImage: Image load error', { src: imageSrc, error })
			}
		},
		[retryCount, retryDelay, onLoad, onError]
	)

	// Retry function
	const retry = useCallback(() => {
		if (src) {
			retryCountRef.current = 0
			setIsError(false)
			setIsLoaded(false)
			loadImage(src)
		}
	}, [src, loadImage])

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (!lazy || !src || shouldLoad || typeof window === 'undefined') {
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setShouldLoad(true)
						observer.disconnect()
					}
				})
			},
			{ rootMargin }
		)

		// Create a dummy element to observe
		const dummyElement = document.createElement('div')
		dummyElement.style.position = 'absolute'
		dummyElement.style.visibility = 'hidden'
		document.body.appendChild(dummyElement)

		observer.observe(dummyElement)
		observerRef.current = observer

		return () => {
			observer.disconnect()
			document.body.removeChild(dummyElement)
		}
	}, [lazy, src, shouldLoad, rootMargin])

	// Load image when src changes or shouldLoad becomes true
	useEffect(() => {
		if (shouldLoad && src) {
			loadImage(src)
		} else if (!src) {
			setIsLoading(false)
			setIsError(false)
			setIsLoaded(false)
		}
	}, [src, shouldLoad, loadImage])

	// Cleanup
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [])

	return {
		src,
		isLoading,
		isError,
		isLoaded,
		retry,
	}
}

