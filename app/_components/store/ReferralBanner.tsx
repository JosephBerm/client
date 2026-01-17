/**
 * @fileoverview Referral Banner Component
 *
 * Displays referral attribution banner when a referral is detected.
 * Implements business_flow.md Section 2.2 - Referral-Based Assignment.
 *
 * **Business Flow Compliance:**
 * - Shows referral attribution when ?ref= param is detected
 * - Confirms to user their referral has been captured
 * - Builds trust by acknowledging personal connection
 *
 * **Referral Sources:**
 * - URL Parameter: `?ref=salesrep@email.com`
 * - QR Code: Business card QR code
 * - Manual input in quote form
 *
 * @see business_flow.md Section 2.2 - Referral-Based Assignment
 * @module components/store/ReferralBanner
 * @category Components
 */

'use client'

import { memo } from 'react'

import { UserPlus, X } from 'lucide-react'

import { useReferralTracking } from '@_features/store'
import Button from '@_components/ui/Button'

export interface ReferralBannerProps {
	/** Whether to allow dismissing the banner */
	dismissible?: boolean
	/** Callback when banner is dismissed */
	onDismiss?: () => void
	/** Additional CSS classes */
	className?: string
}

/**
 * Referral Banner Component
 *
 * Shows a friendly message when user arrives via referral link.
 * Helps build trust and confirms the referral was captured.
 */
function ReferralBanner({ dismissible = true, onDismiss, className = '' }: ReferralBannerProps) {
	const { referral, hasReferral } = useReferralTracking()

	// Don't render if no referral
	if (!hasReferral || !referral) {
		return null
	}

	// Format the referral source for display
	const sourceLabel =
		{
			url: 'referral link',
			qr: 'QR code',
			manual: 'your input',
		}[referral.source] || 'referral'

	return (
		<div className={`bg-success/10 border-b border-success/20 ${className}`}>
			<div className='container mx-auto px-4 py-3 md:px-8 max-w-screen-2xl'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex items-center gap-3'>
						<div className='p-2 bg-success/20 rounded-full'>
							<UserPlus className='w-4 h-4 text-success' />
						</div>
						<div className='flex flex-col sm:flex-row sm:items-center sm:gap-2'>
							<span className='text-sm font-medium text-success'>Referral captured!</span>
							<span className='text-xs sm:text-sm text-base-content/70'>
								You were referred via {sourceLabel}. Your dedicated rep will be assigned.
							</span>
						</div>
					</div>

					{dismissible && onDismiss && (
						<Button
							type='button'
							onClick={onDismiss}
							variant='ghost'
							size='xs'
							className='p-1.5 rounded-lg hover:bg-success/20 transition-colors'
							aria-label='Dismiss referral banner'
							leftIcon={<X className='w-4 h-4 text-success' />}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

export default memo(ReferralBanner)
