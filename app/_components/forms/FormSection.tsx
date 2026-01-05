/**
 * FormSection Component
 *
 * Groups form fields with visual hierarchy and optional icon.
 * Provides consistent styling for form organization.
 *
 * **Features:**
 * - Title with optional icon
 * - Optional description text
 * - Optional badge (e.g., "Optional")
 * - Subtle background wrapper
 * - Theme-aware styling
 * - Accessible with aria-labelledby
 * - Collapsible support (future)
 *
 * **Use Cases:**
 * - Profile forms (Identity, Account, Contact sections)
 * - Settings pages
 * - Multi-step forms
 * - Complex data entry
 *
 * @example
 * ```tsx
 * import FormSection from '@_components/forms/FormSection';
 * import { User, Phone } from 'lucide-react';
 *
 * <FormSection title="Identity" icon={<User />}>
 *   <FormInput label="First Name" ... />
 *   <FormInput label="Last Name" ... />
 * </FormSection>
 *
 * <FormSection title="Contact" icon={<Phone />} badge="Optional">
 *   <FormInput label="Phone" ... />
 * </FormSection>
 * ```
 *
 * @module FormSection
 */

'use client'

import { type ReactNode, useId } from 'react'

import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

export interface FormSectionProps {
	/** Section title */
	title?: string
	/** Section description */
	description?: string
	/** Icon element (e.g., Lucide icon) */
	icon?: ReactNode
	/** Badge text (e.g., "Optional", "Required") */
	badge?: string
	/** Badge variant */
	badgeVariant?: 'default' | 'primary' | 'warning'
	/** Section content (form fields) */
	children: ReactNode
	/** Additional CSS classes for the section container */
	className?: string
	/** Additional CSS classes for the content wrapper */
	contentClassName?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const badgeVariants: Record<NonNullable<FormSectionProps['badgeVariant']>, string> = {
	default: 'bg-base-300 text-base-content/60',
	primary: 'bg-primary/20 text-primary',
	warning: 'bg-warning/20 text-warning',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FormSection Component
 *
 * Groups related form fields with a title, icon, and visual container.
 * Creates clear visual hierarchy in complex forms.
 */
export default function FormSection({
	title,
	description,
	icon,
	badge,
	badgeVariant = 'default',
	children,
	className,
	contentClassName,
}: FormSectionProps) {
	const hasHeader = title || icon || badge
	const headingId = useId()

	return (
		<section
			className={classNames('space-y-4', className)}
			aria-labelledby={title ? headingId : undefined}
		>
			{/* Header */}
			{hasHeader && (
				<div className="flex items-center gap-3">
					{/* Icon */}
					{icon && (
						<div
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
							aria-hidden="true"
						>
							{icon}
						</div>
					)}

					{/* Title & Description */}
					<div className="flex-1">
						<div className="flex items-center gap-2">
							{title && (
								<h3
									id={headingId}
									className="text-base font-semibold text-base-content"
								>
									{title}
								</h3>
							)}
							{badge && (
								<span
									className={classNames(
										'rounded-full px-2 py-0.5 text-xs font-medium',
										badgeVariants[badgeVariant]
									)}
									aria-label={`${badge} section`}
								>
									{badge}
								</span>
							)}
						</div>
						{description && (
							<p className="mt-0.5 text-sm text-base-content/60">
								{description}
							</p>
						)}
					</div>
				</div>
			)}

			{/* Content wrapper */}
			<div
				className={classNames(
					'rounded-xl bg-base-200/30 p-4',
					// Add top margin only if there's a header
					{ 'mt-3': hasHeader },
					contentClassName
				)}
			>
				{children}
			</div>
		</section>
	)
}
