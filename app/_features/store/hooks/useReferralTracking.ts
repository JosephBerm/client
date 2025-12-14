/**
 * @fileoverview Referral Tracking Hook
 * 
 * Captures and stores referral information from URL parameters.
 * Implements the referral attribution system defined in business_flow.md.
 * 
 * **Business Flow Compliance:**
 * - Captures `?ref=salesrep@email.com` URL parameters
 * - Stores referral in localStorage for quote form auto-fill
 * - Uses persistent storage (localStorage > sessionStorage)
 * - Supports QR code business card referrals
 * 
 * **Referral Sources (per business_flow.md Section 2.2):**
 * - Manual input: Customer types sales rep name/email
 * - QR Code: Business card QR code stores referral in localStorage
 * - URL Parameter: `?ref=salesrep@email.com`
 * - Cookie: Persistent referral tracking (30-90 day window)
 * 
 * @see business_flow.md Section 2.2 - Sales Team Management
 * @module features/store/hooks/useReferralTracking
 * @category Hooks
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

import { logger } from '@_core'

/** Storage key for referral data */
const REFERRAL_STORAGE_KEY = 'medsource_referral'

/** Days until referral expires (permanent by default per business_flow.md recommendation) */
const REFERRAL_EXPIRY_DAYS = 90

/**
 * Referral data structure
 */
export interface ReferralData {
	/** Sales rep email or identifier */
	referredBy: string
	/** Timestamp when referral was captured */
	capturedAt: string
	/** Source of the referral (url, qr, manual) */
	source: 'url' | 'qr' | 'manual'
}

/**
 * Check if referral data has expired
 */
function isReferralExpired(capturedAt: string): boolean {
	const capturedDate = new Date(capturedAt)
	const expiryDate = new Date(capturedDate)
	expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS)
	return new Date() > expiryDate
}

/**
 * Get stored referral data from localStorage
 */
export function getStoredReferral(): ReferralData | null {
	if (typeof window === 'undefined') return null
	
	try {
		const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
		if (!stored) return null
		
		const referralData: ReferralData = JSON.parse(stored)
		
		// Check if expired
		if (isReferralExpired(referralData.capturedAt)) {
			localStorage.removeItem(REFERRAL_STORAGE_KEY)
			logger.info('Referral data expired and removed', {
				component: 'useReferralTracking',
				referredBy: referralData.referredBy,
			})
			return null
		}
		
		return referralData
	} catch (error) {
		logger.warn('Failed to parse referral data', {
			component: 'useReferralTracking',
			error,
		})
		return null
	}
}

/**
 * Store referral data in localStorage
 */
export function storeReferral(referredBy: string, source: ReferralData['source']): void {
	if (typeof window === 'undefined') return
	
	const referralData: ReferralData = {
		referredBy: referredBy.trim().toLowerCase(),
		capturedAt: new Date().toISOString(),
		source,
	}
	
	try {
		localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData))
		logger.info('Referral data stored', {
			component: 'useReferralTracking',
			referredBy: referralData.referredBy,
			source,
		})
	} catch (error) {
		logger.error('Failed to store referral data', {
			component: 'useReferralTracking',
			error,
		})
	}
}

/**
 * Clear stored referral data
 */
export function clearReferral(): void {
	if (typeof window === 'undefined') return
	localStorage.removeItem(REFERRAL_STORAGE_KEY)
}

/**
 * Hook return type
 */
export interface UseReferralTrackingReturn {
	/** Stored referral data (if any) */
	referral: ReferralData | null
	/** Sales rep email/ID from referral */
	referredBy: string | null
	/** Whether a valid referral exists */
	hasReferral: boolean
	/** Manually set referral (for form input) */
	setReferral: (referredBy: string) => void
	/** Clear referral data */
	clearReferral: () => void
}

/**
 * Hook for capturing and managing referral tracking
 * 
 * **Usage:**
 * - Import in store/cart pages to capture URL params
 * - Use `referredBy` in quote submission forms
 * - Referral is automatically captured on page load
 * 
 * @example
 * ```tsx
 * const { referredBy, hasReferral } = useReferralTracking()
 * 
 * // In quote form
 * <input 
 *   value={referredBy || ''} 
 *   disabled={hasReferral}
 *   placeholder="Who referred you?"
 * />
 * ```
 */
export function useReferralTracking(): UseReferralTrackingReturn {
	const searchParams = useSearchParams()
	
	// Capture referral from URL on mount
	useEffect(() => {
		const refParam = searchParams.get('ref')
		
		if (refParam) {
			// Check if we already have a referral
			const existingReferral = getStoredReferral()
			
			if (!existingReferral) {
				// Store new referral from URL
				storeReferral(refParam, 'url')
			} else if (existingReferral.referredBy !== refParam.trim().toLowerCase()) {
				// Log if different referral attempted (don't overwrite - first referrer wins)
				logger.info('Referral already exists, ignoring new URL param', {
					component: 'useReferralTracking',
					existing: existingReferral.referredBy,
					attempted: refParam,
				})
			}
		}
	}, [searchParams])
	
	// Get current referral data
	const referral = getStoredReferral()
	
	// Manual set function (for form inputs)
	const handleSetReferral = useCallback((referredBy: string) => {
		if (!referredBy.trim()) return
		storeReferral(referredBy, 'manual')
	}, [])
	
	return {
		referral,
		referredBy: referral?.referredBy ?? null,
		hasReferral: Boolean(referral),
		setReferral: handleSetReferral,
		clearReferral,
	}
}

