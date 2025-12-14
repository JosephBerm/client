/**
 * @fileoverview Store Value Proposition Component
 * 
 * Displays key value propositions and trust signals for the store page.
 * Implements business_flow.md recommendations for building customer trust.
 * 
 * **Business Flow Compliance (Section 4 - Competitive Advantages):**
 * - Dedicated Sales Rep messaging (key differentiator)
 * - Quick Quote Guarantee (24-48hr turnaround)
 * - Personalized Pricing through negotiation
 * - Consultative Sales approach
 * 
 * **Design Principles:**
 * - Mobile-first responsive layout
 * - Subtle, professional appearance
 * - Non-intrusive but visible
 * - DaisyUI theme compliant
 * 
 * @see business_flow.md Section 4 - Competitive Advantages
 * @module components/store/StoreValueProposition
 * @category Components
 */

'use client'

import { memo } from 'react'

import { 
	Clock,
	UserCheck,
	MessageSquare,
	Shield,
	Truck,
	BadgePercent,
} from 'lucide-react'

/**
 * Value proposition item structure
 */
interface ValueProp {
	icon: React.ReactNode
	title: string
	description: string
	highlight?: boolean
}

/**
 * Core value propositions per business_flow.md
 */
const VALUE_PROPOSITIONS: ValueProp[] = [
	{
		icon: <Clock className="w-5 h-5" />,
		title: '24-48hr Quotes',
		description: 'Fast turnaround guaranteed',
		highlight: true,
	},
	{
		icon: <UserCheck className="w-5 h-5" />,
		title: 'Dedicated Rep',
		description: 'Personal point of contact',
		highlight: true,
	},
	{
		icon: <BadgePercent className="w-5 h-5" />,
		title: 'Negotiable Pricing',
		description: 'Volume discounts available',
	},
	{
		icon: <MessageSquare className="w-5 h-5" />,
		title: 'Expert Support',
		description: 'Consultative sales approach',
	},
	{
		icon: <Truck className="w-5 h-5" />,
		title: 'Direct Shipping',
		description: 'From verified vendors',
	},
	{
		icon: <Shield className="w-5 h-5" />,
		title: 'Quality Assured',
		description: 'Medical-grade products',
	},
]

export interface StoreValuePropositionProps {
	/** Maximum number of items to show (default: all) */
	maxItems?: number
	/** Layout variant */
	variant?: 'horizontal' | 'compact'
	/** Additional CSS classes */
	className?: string
}

/**
 * Store Value Proposition Component
 * 
 * Displays key value propositions to build trust and set expectations.
 * Crucial for quote-based B2B model where trust is paramount.
 */
function StoreValueProposition({
	maxItems,
	variant = 'horizontal',
	className = '',
}: StoreValuePropositionProps) {
	const items = maxItems ? VALUE_PROPOSITIONS.slice(0, maxItems) : VALUE_PROPOSITIONS

	if (variant === 'compact') {
		return (
			<div className={`flex flex-wrap justify-center gap-4 ${className}`}>
				{items.slice(0, 4).map((prop) => (
					<div
						key={prop.title}
						className={`
							flex items-center gap-2 px-3 py-2 rounded-lg text-sm
							${prop.highlight 
								? 'bg-primary/10 text-primary font-medium' 
								: 'bg-base-200/50 text-base-content/80'
							}
						`}
					>
						{prop.icon}
						<span>{prop.title}</span>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className={`bg-base-100 border-b border-base-200 ${className}`}>
			<div className="container mx-auto px-4 py-4 md:px-8 max-w-screen-2xl">
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
					{items.map((prop) => (
						<div
							key={prop.title}
							className={`
								flex flex-col items-center text-center p-3 rounded-xl
								transition-colors duration-200
								${prop.highlight 
									? 'bg-primary/5 border border-primary/20' 
									: 'bg-base-200/30 hover:bg-base-200/50'
								}
							`}
						>
							<div className={`
								mb-2 p-2 rounded-full
								${prop.highlight 
									? 'bg-primary/10 text-primary' 
									: 'bg-base-300/50 text-base-content/70'
								}
							`}>
								{prop.icon}
							</div>
							<h3 className={`
								text-sm font-semibold mb-0.5
								${prop.highlight ? 'text-primary' : 'text-base-content'}
							`}>
								{prop.title}
							</h3>
							<p className="text-xs text-base-content/60 line-clamp-1">
								{prop.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default memo(StoreValueProposition)

