/**
 * Shared Intersection Observer Manager
 * 
 * Industry best practice: Single observer instance for multiple elements
 * Significantly more efficient than creating one observer per element
 * 
 * **Performance Benefits:**
 * - Single observer handles all elements
 * - Reduced memory overhead
 * - Better scroll performance
 * - Scales to 100+ elements efficiently
 * 
 * **Usage Pattern:**
 * - Create one shared observer per page/component tree
 * - Register/unregister elements as needed
 * - Automatic cleanup on unmount
 * 
 * @module shared/hooks/useSharedIntersectionObserver
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface SharedObserverOptions {
	/** Intersection threshold (0-1, default: 0.1) */
	threshold?: number
	/** Root margin for anticipatory triggering (default: '0px 0px 200px 0px' = 200px before viewport) */
	rootMargin?: string
}

export type IntersectionCallback = (entry: IntersectionObserverEntry) => void

/**
 * Shared Intersection Observer Manager
 * 
 * Manages a single IntersectionObserver instance for multiple elements.
 * Industry standard pattern used by React Intersection Observer library.
 */
class SharedObserverManager {
	private observer: IntersectionObserver | null = null
	private elements: Map<Element, IntersectionCallback> = new Map()
	private options: SharedObserverOptions

	constructor(options: SharedObserverOptions = {}) {
		this.options = {
			threshold: options.threshold ?? 0.1,
			rootMargin: options.rootMargin ?? '0px 0px 200px 0px', // Anticipatory default
		}
	}

	/**
	 * Get or create the shared observer instance
	 */
	private getObserver(): IntersectionObserver | null {
		if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
			return null
		}

		if (!this.observer) {
			try {
				this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
					threshold: this.options.threshold,
					rootMargin: this.options.rootMargin,
				})
			} catch (error) {
				console.warn('Failed to create IntersectionObserver:', error)
				return null
			}
		}

		return this.observer
	}

	/**
	 * Handle intersection changes for all observed elements
	 */
	private handleIntersection(entries: IntersectionObserverEntry[]): void {
		entries.forEach((entry) => {
			const callback = this.elements.get(entry.target)
			if (callback) {
				callback(entry)
			}
		})
	}

	/**
	 * Observe an element with a callback
	 */
	observe(element: Element, callback: IntersectionCallback): void {
		const observer = this.getObserver()
		if (!observer || !element) return

		this.elements.set(element, callback)
		observer.observe(element)
	}

	/**
	 * Unobserve an element
	 */
	unobserve(element: Element): void {
		const observer = this.getObserver()
		if (!observer || !element) return

		this.elements.delete(element)
		observer.unobserve(element)

		// Clean up observer if no elements remain
		if (this.elements.size === 0 && this.observer) {
			this.observer.disconnect()
			this.observer = null
		}
	}

	/**
	 * Disconnect and cleanup
	 */
	disconnect(): void {
		if (this.observer) {
			this.observer.disconnect()
			this.observer = null
		}
		this.elements.clear()
	}
}

/**
 * Global shared observer instances keyed by configuration
 * Different rootMargin/threshold combinations get separate observers
 * This ensures correct behavior when viewport changes (mobile ↔ desktop)
 */
const observerCache = new Map<string, SharedObserverManager>()

/**
 * Create a cache key from observer options
 * Observers with different options get separate instances
 */
function getObserverKey(options: SharedObserverOptions): string {
	const threshold = options.threshold ?? 0.1
	const rootMargin = options.rootMargin ?? '0px 0px -100px 0px'
	return `${threshold}|${rootMargin}`
}

/**
 * Get or create a shared observer for the given configuration
 * Observers are keyed by their configuration to support different rootMargin values
 * (e.g., mobile vs desktop responsive rootMargin)
 */
function getSharedObserver(options: SharedObserverOptions = {}): SharedObserverManager {
	const key = getObserverKey(options)
	
	if (!observerCache.has(key)) {
		observerCache.set(key, new SharedObserverManager(options))
	}
	
	return observerCache.get(key)!
}

/**
 * Hook to use shared Intersection Observer
 * 
 * @param options - Observer options
 * @returns Register and unregister functions
 */
export function useSharedIntersectionObserver(options: SharedObserverOptions = {}) {
	const observerRef = useRef<SharedObserverManager | null>(null)

	// Initialize shared observer - re-initialize if options change
	// This ensures we get the correct observer when rootMargin changes (mobile ↔ desktop)
	// Extract values to avoid object reference issues and satisfy linter
	const thresholdValue = options.threshold
	const rootMarginValue = options.rootMargin
	
	useEffect(() => {
		observerRef.current = getSharedObserver(options)
		return () => {
			// Note: We don't disconnect here because observers are shared
			// Observers are cached and reused across components
			// Cleanup happens on page navigation/unmount
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [thresholdValue, rootMarginValue]) // Only re-run when these specific values change

	const observe = useCallback((element: Element | null, callback: IntersectionCallback) => {
		if (!element || !observerRef.current) return

		observerRef.current.observe(element, callback)
	}, [])

	const unobserve = useCallback((element: Element | null) => {
		if (!element || !observerRef.current) return

		observerRef.current.unobserve(element)
	}, [])

	return { observe, unobserve }
}

