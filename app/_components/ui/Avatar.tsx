/**
 * Avatar UI Component
 *
 * MAANG-level avatar component with initials fallback and branded gradient.
 * Supports image display, edit overlay, and multiple sizes.
 *
 * **Features:**
 * - Initials extraction from name (first + last)
 * - Branded gradient background (primary → secondary)
 * - Image support with Next.js Image optimization
 * - Edit overlay on hover (optional)
 * - 4 size variants (sm, md, lg, xl)
 * - Theme-aware colors
 * - Accessible
 *
 * **Use Cases:**
 * - User profile display
 * - Account settings
 * - Team member lists
 * - Comments/activity feeds
 *
 * @example
 * ```tsx
 * import Avatar from '@_components/ui/Avatar';
 *
 * // With name (shows initials)
 * <Avatar name={{ first: 'John', last: 'Doe' }} />
 *
 * // With image
 * <Avatar name="John Doe" src="/avatars/john.jpg" />
 *
 * // Editable
 * <Avatar name="John Doe" editable onEditClick={() => openUpload()} />
 *
 * // Different sizes
 * <Avatar name="JD" size="xl" />
 * ```
 *
 * @module Avatar
 */

'use client'

import type { ReactNode } from 'react'

import Image from 'next/image'
import { Camera } from 'lucide-react'
import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarProps {
	/** Name for initials extraction. Can be object with first/last or string */
	name?: { first?: string; last?: string } | string
	/** Image source URL */
	src?: string | null
	/** Size variant */
	size?: 'sm' | 'md' | 'lg' | 'xl'
	/** Additional CSS classes */
	className?: string
	/** Show edit overlay on hover */
	editable?: boolean
	/** Callback when edit overlay is clicked */
	onEditClick?: () => void
	/** Custom fallback content (instead of initials) */
	fallback?: ReactNode
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Size mapping for avatar dimensions
 * Following mobile-first approach with touch-friendly sizes
 */
const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
	sm: 'w-8 h-8 text-xs',     // 32px
	md: 'w-12 h-12 text-sm',   // 48px
	lg: 'w-16 h-16 text-lg',   // 64px
	xl: 'w-24 h-24 text-2xl',  // 96px
}

/**
 * Image sizes for Next.js optimization
 */
const imageSizes: Record<NonNullable<AvatarProps['size']>, number> = {
	sm: 32,
	md: 48,
	lg: 64,
	xl: 96,
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract initials from name
 * @param name - Name object or string
 * @returns Initials (max 2 characters, uppercase), or '?' if invalid
 */
function getInitials(name?: AvatarProps['name']): string {
	if (!name) return '?'

	if (typeof name === 'string') {
		const trimmed = name.trim()
		if (!trimmed) return '?'

		const parts = trimmed.split(/\s+/)
		if (parts.length === 1) {
			return parts[0].charAt(0).toUpperCase() || '?'
		}
		const initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
		return initials || '?'
	}

	const first = name.first?.trim().charAt(0) || ''
	const last = name.last?.trim().charAt(0) || ''
	const initials = (first + last).toUpperCase()

	return initials || '?'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Avatar Component
 *
 * Displays user avatar with image or initials fallback.
 * Features branded gradient background and optional edit overlay.
 */
export default function Avatar({
	name,
	src,
	size = 'md',
	className,
	editable = false,
	onEditClick,
	fallback,
}: AvatarProps) {
	const initials = getInitials(name)
	const hasImage = src && src.trim() !== ''
	const imageSize = imageSizes[size]

	const handleClick = () => {
		if (editable && onEditClick) {
			onEditClick()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (editable && onEditClick && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault()
			onEditClick()
		}
	}

	return (
		<div
			className={classNames(
				// Base styles
				'relative shrink-0 overflow-hidden rounded-full',
				// Size
				sizeClasses[size],
				// Gradient background (visible when no image)
				!hasImage && 'bg-gradient-to-br from-primary to-secondary',
				// Interactive styles for editable
				editable && 'cursor-pointer',
				className
			)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={editable ? 'button' : undefined}
			tabIndex={editable ? 0 : undefined}
			aria-label={editable ? 'Change profile picture' : undefined}
		>
			{/* Image */}
			{hasImage ? (
				<Image
					src={src}
					alt={typeof name === 'string' ? name : `${name?.first || ''} ${name?.last || ''}`.trim() || 'Avatar'}
					width={imageSize}
					height={imageSize}
					className="h-full w-full object-cover"
					priority={size === 'xl'}
				/>
			) : (
				/* Initials fallback */
				<div className="flex h-full w-full items-center justify-center font-semibold text-white">
					{fallback || initials}
				</div>
			)}

			{/* Edit overlay */}
			{editable && (
				<div
					className={classNames(
						'absolute inset-0 flex items-center justify-center',
						'bg-black/50 opacity-0 transition-opacity duration-200',
						'hover:opacity-100 focus-within:opacity-100'
					)}
				>
					<Camera className="h-1/3 w-1/3 text-white" />
				</div>
			)}
		</div>
	)
}
