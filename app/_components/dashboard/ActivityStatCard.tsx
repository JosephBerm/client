/**
 * ActivityStatCard Component
 * 
 * Elegant activity metric card with refined mobile-first design.
 * Follows FAANG-level best practices (Linear, Notion, Stripe, GitHub).
 * Optimized for small screens with compact, modern layout.
 * 
 * **Mobile-First Design (FAANG Pattern):**
 * - Very Narrow (< 200px): Icon-only mode (Slack/Discord/Linear pattern)
 *   - Icon + Value only (label hidden for space efficiency)
 *   - Ideal for collapsed sidebars or very narrow containers
 *   - Maintains full accessibility via aria-label
 * - Mobile (< 640px): Compact horizontal layout
 *   - Icon left (small, subtle container)
 *   - Value + Label right (value prominent, label below)
 *   - Subtle border, elegant spacing
 *   - Maximum space efficiency
 * - Tablet+ (≥ 640px): Vertical centered layout
 *   - Icon top (larger container)
 *   - Value center (3xl, bold)
 *   - Label bottom (sm, uppercase)
 *   - Spacious, elegant presentation
 * 
 * **Typography Hierarchy (Industry Standard):**
 * - Uses global font size variables (--fz-xs, --fz-2xl, --fz-3xl)
 * - Value: xl mobile (20px) → 2xl tablet (24px) → 3xl desktop (30px)
 * - Label: xs mobile (11px) → xs tablet (12px) → sm desktop (14px)
 * - Icon: 4x4 mobile (16px) → 5x5 tablet (20px) → 6x6 desktop (24px)
 * 
 * **Visual Design:**
 * - Subtle border (base-300) for definition
 * - Rounded corners (lg → xl, progressive)
 * - Background: transparent → base-200 on hover
 * - Icon container: base-200 → primary/10 on hover
 * - Clean, minimal aesthetic
 * 
 * **Theme Conformance:**
 * - Uses DaisyUI color tokens exclusively (base-content, base-200, base-300, primary)
 * - No magic values or hardcoded colors
 * - Respects user theme preference
 * - Proper contrast ratios (WCAG AA)
 * 
 * **Accessibility:**
 * - Semantic link element with aria-label
 * - Clear focus states
 * - Screen reader friendly (full label + value)
 * - Keyboard navigable
 * 
 * **Industry Inspiration:**
 * - Linear Dashboard: Compact horizontal cards on mobile
 * - Notion: Elegant borders, subtle backgrounds
 * - Stripe: Prominent numbers, refined spacing
 * - GitHub: Tabular numbers, clean design
 * 
 * @example
 * ```tsx
 * import { Routes } from '@_features/navigation';
 * <ActivityStatCard
 *   icon={BellRing}
 *   label="Notifications"
 *   value={5}
 *   href={Routes.Notifications.location}
 * />
 * ```
 * 
 * @module ActivityStatCard
 */

'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

/**
 * Props for ActivityStatCard component
 */
export interface ActivityStatCardProps {
	/**
	 * Lucide icon component to display
	 * @example BellRing, ShoppingCart, FileText
	 */
	icon: LucideIcon
	
	/**
	 * Label text for the metric
	 * @example "Notifications", "Orders", "Quotes"
	 */
	label: string
	
	/**
	 * Numeric value to display
	 * @example 5, 10, 0
	 */
	value: number
	
	/**
	 * Navigation URL when card is clicked
	 * @example Routes.Notifications.location, Routes.Orders.location
	 */
	href: string
}

/**
 * ActivityStatCard Component
 * 
 * Elegant stat card with industry-standard sizing (Stripe, Linear, Notion, GitHub).
 * Mobile-first design maximizing horizontal space while maintaining proportional typography.
 * 
 * **Layout Structure:**
 * - Mobile (< 640px): Full-width horizontal (icon left → value + label right)
 *   - Icon: Subtle container on left (shrink-0)
 *   - Right content: Takes ALL remaining space (flex-1)
 *   - Value: Prominent, right-aligned (industry-standard size)
 *   - Label: Below value, right-aligned for elegance
 *   - Maximum space utilization with proportional sizing
 * - Tablet+ (≥ 640px): Vertical centered layout (icon top → value center → label bottom)
 * 
 * **Visual Hierarchy (Industry Best Practice):**
 * - **Icon**: Subtle background container (36px mobile → 40px tablet → 44px desktop)
 * - **Value**: Proportional, bold, tabular-nums (xl/2xl mobile → 2xl tablet → 3xl desktop)
 * - **Label**: Subtle, uppercase, tracked (xs mobile → sm tablet+)
 * - **Right alignment**: Elegant, professional look on mobile
 * 
 * **Typography (Industry Standard - Stripe/Linear/Notion):**
 * - Value: text-xl mobile (20px) → text-2xl tablet (24px) → text-3xl desktop (30px)
 *   - Matches industry standards (Stripe: 20-24px mobile, 28-32px desktop)
 *   - Linear: 20-24px mobile, 24-28px desktop
 *   - Notion: 20-24px mobile, 24-28px desktop
 * - Label: text-xs mobile (12px) → text-sm tablet+ (14px)
 * - Icon: w-4 h-4 mobile (16px) → w-5 h-5 tablet (20px) → w-5 h-5 desktop (20px)
 * 
 * **Design Elements:**
 * - Subtle border (base-300) for elegant definition
 * - Rounded corners (lg → xl, progressive)
 * - Background: transparent → base-200 on hover
 * - Icon container: base-200 → primary/10 on hover
 * - Scale: 1 → 1.02 (subtle lift, mobile) → 1.05 (desktop)
 * - Full-width on mobile for maximum space
 * 
 * **Spacing (Mobile-First - Proportional):**
 * - Padding: p-3.5 mobile (14px) → p-4 tablet (16px) → p-5 desktop (20px)
 * - Gap: gap-3 mobile (12px) → gap-2 tablet+ (8px)
 * - Icon container: w-9 h-9 mobile (36px) → w-10 h-10 tablet (40px) → w-11 h-11 desktop (44px)
 * - Right content: flex-1 (takes ALL available space)
 * 
 * **Theme Conformance:**
 * - Uses DaisyUI color tokens exclusively
 * - No magic values or hardcoded colors
 * - Respects user theme preference
 * - Proper contrast ratios (WCAG AA)
 * 
 * @param props - ActivityStatCard props
 * @returns Clickable activity stat card component
 */
export default function ActivityStatCard({ icon: Icon, label, value, href }: ActivityStatCardProps) {
	return (
		<Link 
			href={href}
			className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 p-3.5 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-base-300 bg-base-100 transition-all duration-200 hover:bg-base-200 hover:border-primary/30 motion-safe:hover:scale-[1.02] sm:motion-safe:hover:scale-105 group min-w-0 sm:min-w-fit w-full"
			aria-label={`${label}: ${value}`}
		>
			{/* Icon Container - Proportional, elegant */}
			<div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-base-200 group-hover:bg-primary/10 transition-colors shrink-0">
				<Icon 
					className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-base-content/60 group-hover:text-primary transition-colors" 
					aria-hidden="true" 
				/>
			</div>
			
			{/* Content - Maximized horizontal space on mobile, centered on tablet+ */}
			<div className="flex-1 sm:flex-none min-w-0 flex flex-col items-end sm:items-center justify-center gap-1 sm:gap-1.5">
				{/* Value - Industry-standard size, prominent, right-aligned on mobile */}
				<p className="text-xl sm:text-2xl md:text-3xl font-bold text-base-content group-hover:text-primary transition-colors leading-tight tabular-nums">
					{value}
				</p>
				
				{/* Label - Hidden at very narrow widths (< 200px) for icon-only mode (Slack/Discord/Linear pattern) */}
				<span className="hidden min-[200px]:inline text-xs sm:text-sm font-medium uppercase tracking-wider text-base-content/60 group-hover:text-primary transition-colors whitespace-nowrap">
					{label}
				</span>
			</div>
		</Link>
	)
}

