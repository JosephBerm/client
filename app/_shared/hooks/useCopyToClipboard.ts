/**
 * Copy to Clipboard Hook
 * 
 * Reusable hook for copying text to clipboard with feedback state.
 * Provides temporary "copied" state for UI feedback (2 seconds).
 * 
 * **Features:**
 * - Navigator Clipboard API
 * - Temporary success state (2s)
 * - Error handling
 * - Cleanup on unmount
 * 
 * **Browser Support:**
 * - Modern browsers (Chrome, Firefox, Safari, Edge)
 * - Requires HTTPS in production
 * - Falls back gracefully on error
 * 
 * @example
 * ```tsx
 * import { useCopyToClipboard } from '@_shared/hooks'
 * 
 * function CopyButton() {
 *   const [copied, copyToClipboard] = useCopyToClipboard()
 *   
 *   return (
 *     <button onClick={() => copyToClipboard('Text to copy')}>
 *       {copied ? 'Copied!' : 'Copy'}
 *     </button>
 *   )
 * }
 * ```
 * 
 * @module useCopyToClipboard
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * useCopyToClipboard Hook
 * 
 * Provides copy functionality with temporary success feedback.
 * 
 * @returns Tuple of [copied state, copy function]
 * 
 * @example
 * ```tsx
 * const [copied, copy] = useCopyToClipboard()
 * 
 * <button onClick={() => copy('Hello World')}>
 *   {copied ? <Check /> : <Copy />}
 * </button>
 * ```
 */
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const copyToClipboard = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)

			// Reset after 2 seconds
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			
			timeoutRef.current = setTimeout(() => {
				setCopied(false)
			}, 2000)
		} catch (err) {
			// Silent fail - copy button will just not show feedback
			console.error('Failed to copy to clipboard:', err)
		}
	}, [])

	return [copied, copyToClipboard]
}

