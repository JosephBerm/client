export const fieldWrapperClass = 'flex w-full flex-col gap-2'

/**
 * Elegant Form Label Styles
 * 
 * **Design Principles:**
 * - Mobile-first responsive typography
 * - Professional uppercase styling with refined letter spacing
 * - Smooth color transitions for interactive states
 * - WCAG 2.1 AA compliant contrast ratios
 * - FAANG-level polish with subtle animations
 * 
 * **Typography:**
 * - Base: 0.875rem (14px) - optimal for labels (WCAG compliant)
 * - Responsive: 0.9375rem (15px) on tablets, 1rem (16px) on desktop
 * - Font weight: 600 (semibold) for clear hierarchy
 * - Letter spacing: 0.05em (refined, not excessive)
 * - Line height: 1.4 for optimal readability
 * 
 * **Color & Visual:**
 * - Primary color with 90% opacity for elegant subtlety
 * - Smooth transition on hover/focus for premium feel
 * - Proper spacing with flex layout
 * 
 * **Accessibility:**
 * - Minimum 4.5:1 contrast ratio (WCAG AA)
 * - Clear visual hierarchy
 * - Proper label-input association
 */
export const labelClass =
	'text-sm sm:text-[0.9375rem] md:text-base font-semibold uppercase tracking-[0.05em] text-primary/90 flex items-center gap-1.5 leading-[1.4] transition-colors duration-200 ease-in-out hover:text-primary focus-within:text-primary'

export const helperClass = 'text-xs text-base-content/70 leading-relaxed'

export const errorClass = 'text-xs text-error leading-relaxed'

export const baseFieldClass =
	'input input-bordered w-full rounded-2xl px-5 py-3 text-base transition disabled:cursor-not-allowed'

export const errorFieldClass =
	'border-[var(--error-color)] focus:border-[var(--error-color)] focus:ring-[var(--error-color)]/30'

