/**
 * useImageError Hook - Advanced Error Recovery
 * 
 * Custom React hook for advanced image error handling and recovery strategies.
 * Follows the same patterns as useImage and useFormSubmit hooks.
 * 
 * **Features:**
 * - Advanced error recovery with fallback chain
 * - Multiple retry strategies
 * - Error reporting
 * - User-friendly error messages
 * - Automatic fallback image selection
 * 
 * **Error Recovery Strategies:**
 * - **retry**: Retry with exponential backoff
 * - **fallback**: Try fallback image URLs
 * - **placeholder**: Show placeholder after max retries
 * - **silent**: Fail silently (for non-critical images)
 * 
 * **Use Cases:**
 * - Product images with fallback chain
 * - Critical images requiring retry
 * - Non-critical images with silent failure
 * - Images with multiple fallback sources
 * 
 * @example
 * ```typescript
 * // Basic usage with retry
 * const { error, retry, hasError } = useImageError(imageUrl, {
 *   strategy: 'retry',
 *   maxRetries: 3
 * });
 * 
 * // With fallback chain
 * const { error, currentUrl, hasError } = useImageError(imageUrl, {
 *   strategy: 'fallback',
 *   fallbackUrls: [fallback1, fallback2, placeholderUrl]
 * });
 * ```
 * 
 * @module useImageError
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { ImageService } from '../services/ImageService'
import { logger } from '@_core'

/**
 * Error recovery strategy.
 */
export type ErrorStrategy = 'retry' | 'fallback' | 'placeholder' | 'silent'

/**
 * Options for the useImageError hook.
 */
export interface UseImageErrorOptions {
	/** Error recovery strategy */
	strategy?: ErrorStrategy
	/** Maximum number of retry attempts */
	maxRetries?: number
	/** Delay between retries in milliseconds */
	retryDelay?: number
	/** Array of fallback image URLs to try */
	fallbackUrls?: string[]
	/** Callback when all recovery attempts fail */
	onFinalError?: (error: Error) => void
	/** Whether to log errors (development only) */
	logErrors?: boolean
}

/**
 * Return type for the useImageError hook.
 */
export interface UseImageErrorReturn {
	/** Current image URL (may change if fallback is used) */
	currentUrl: string | null
	/** Whether an error has occurred */
	hasError: boolean
	/** Error object if error occurred */
	error: Error | null
	/** Current retry attempt number */
	retryAttempt: number
	/** Function to manually retry */
	retry: () => void
	/** Function to reset error state */
	reset: () => void
}

/**
 * Custom hook for advanced image error handling.
 * 
 * Provides sophisticated error recovery with multiple strategies.
 * Follows industry best practices for error handling in image loading.
 * 
 * @param {string | null} src - Primary image source URL
 * @param {UseImageErrorOptions} options - Error handling configuration
 * @returns {UseImageErrorReturn} Error state and control functions
 * 
 * @example
 * ```typescript
 * // Retry strategy
 * const { currentUrl, hasError, retry } = useImageError(imageUrl, {
 *   strategy: 'retry',
 *   maxRetries: 3,
 *   retryDelay: 1000
 * });
 * 
 * // Fallback chain
 * const { currentUrl, hasError } = useImageError(imageUrl, {
 *   strategy: 'fallback',
 *   fallbackUrls: [
 *     'https://cdn.example.com/fallback1.jpg',
 *     'https://cdn.example.com/fallback2.jpg',
 *     '/placeholder.jpg'
 *   ]
 * });
 * ```
 */
export function useImageError(
	src: string | null,
	options: UseImageErrorOptions = {}
): UseImageErrorReturn {
	const {
		strategy = 'retry',
		maxRetries = 3,
		retryDelay = 1000,
		fallbackUrls = [],
		onFinalError,
		logErrors = true,
	} = options

	const [currentUrl, setCurrentUrl] = useState<string | null>(src)
	const [hasError, setHasError] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const [retryAttempt, setRetryAttempt] = useState(0)
	const [fallbackIndex, setFallbackIndex] = useState(0)

	// Update current URL when src changes
	useEffect(() => {
		setCurrentUrl(src)
		setHasError(false)
		setError(null)
		setRetryAttempt(0)
		setFallbackIndex(0)
	}, [src])

	/**
	 * Handle image error with selected strategy.
	 */
	const handleError = useCallback(
		async (errorUrl: string) => {
			if (logErrors) {
				logger.error('useImageError: Image load error', { url: errorUrl, strategy })
			}

			switch (strategy) {
				case 'retry':
					if (retryAttempt < maxRetries) {
						const newAttempt = retryAttempt + 1
						setRetryAttempt(newAttempt)

						// Wait before retry (exponential backoff)
						const delay = retryDelay * Math.pow(2, retryAttempt)
						await new Promise((resolve) => setTimeout(resolve, delay))

						// Retry loading
						const success = await ImageService.retryLoad(errorUrl, 1, 0)
						if (!success) {
							// Retry failed, try again or give up
							if (newAttempt >= maxRetries) {
								setHasError(true)
								const err = new Error(`Failed to load image after ${maxRetries} retries`)
								setError(err)
								onFinalError?.(err)
							}
						} else {
							// Retry succeeded
							setHasError(false)
							setError(null)
						}
					} else {
						setHasError(true)
						const err = new Error(`Failed to load image after ${maxRetries} retries`)
						setError(err)
						onFinalError?.(err)
					}
					break

				case 'fallback':
					if (fallbackIndex < fallbackUrls.length) {
						const nextFallback = fallbackUrls[fallbackIndex]
						setFallbackIndex(fallbackIndex + 1)
						setCurrentUrl(nextFallback)
						setRetryAttempt(0) // Reset retry for fallback
					} else {
						setHasError(true)
						const err = new Error('All fallback images failed to load')
						setError(err)
						onFinalError?.(err)
					}
					break

				case 'placeholder':
					setHasError(true)
					setCurrentUrl(null) // Will trigger placeholder display
					const err = new Error('Image failed to load')
					setError(err)
					onFinalError?.(err)
					break

				case 'silent':
					setHasError(true)
					setCurrentUrl(null)
					// Don't set error or call onFinalError for silent failures
					break
			}
		},
		[strategy, retryAttempt, maxRetries, retryDelay, fallbackIndex, fallbackUrls, onFinalError, logErrors]
	)

	/**
	 * Manually retry loading.
	 */
	const retry = useCallback(() => {
		if (currentUrl) {
			setRetryAttempt(0)
			setHasError(false)
			setError(null)
			handleError(currentUrl)
		}
	}, [currentUrl, handleError])

	/**
	 * Reset error state.
	 */
	const reset = useCallback(() => {
		setCurrentUrl(src)
		setHasError(false)
		setError(null)
		setRetryAttempt(0)
		setFallbackIndex(0)
	}, [src])

	return {
		currentUrl,
		hasError,
		error,
		retryAttempt,
		retry,
		reset,
	}
}

