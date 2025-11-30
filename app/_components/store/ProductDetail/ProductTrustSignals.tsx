/**
 * Product Trust Signals Component
 * 
 * Displays trust badges (Verified, Fast Ship, Bulk).
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductTrustSignals
 */

import { ShieldCheck, Truck, Package } from 'lucide-react'

import { ANIMATION_DELAYS, TRUST_SIGNALS } from './ProductDetail.constants'

/**
 * Product Trust Signals
 * 
 * Renders trust signal badges with icons and labels.
 */
export default function ProductTrustSignals() {
	return (
		<div
			className="animate-elegant-reveal flex items-center justify-between gap-4 rounded-2xl border border-base-200 bg-base-200/30 px-6 py-4 backdrop-blur-sm"
			style={{ animationDelay: ANIMATION_DELAYS.TRUST_SIGNALS }}
		>
			<div className="flex flex-col items-center gap-1.5">
				<ShieldCheck className="h-5 w-5 text-base-content/40" />
				<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
					{TRUST_SIGNALS.VERIFIED}
				</span>
			</div>
			<div className="h-8 w-px bg-base-200" />
			<div className="flex flex-col items-center gap-1.5">
				<Truck className="h-5 w-5 text-base-content/40" />
				<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
					{TRUST_SIGNALS.FAST_SHIP}
				</span>
			</div>
			<div className="h-8 w-px bg-base-200" />
			<div className="flex flex-col items-center gap-1.5">
				<Package className="h-5 w-5 text-base-content/40" />
				<span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
					{TRUST_SIGNALS.BULK}
				</span>
			</div>
		</div>
	)
}

