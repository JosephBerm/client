/**
 * AvatarUpload Component
 *
 * Avatar with file upload capability for profile photo management.
 * Builds on Avatar component with file input, preview, and validation.
 *
 * **Features:**
 * - Hidden file input triggered on click
 * - Client-side preview before upload
 * - File size validation (default 5MB max)
 * - File type validation (JPEG, PNG, WebP)
 * - Loading state during upload
 * - Remove button for existing photos
 * - Error display
 * - Accessible
 *
 * **Use Cases:**
 * - Profile settings
 * - Account management
 * - Team member photos
 * - User onboarding
 *
 * @example
 * ```tsx
 * import AvatarUpload from '@_components/ui/AvatarUpload';
 *
 * <AvatarUpload
 *   name={{ first: 'John', last: 'Doe' }}
 *   currentImagePath={user.profilePicturePath}
 *   onImageSelect={handleUpload}
 *   onImageRemove={handleRemove}
 *   uploading={isUploading}
 *   error={uploadError}
 * />
 * ```
 *
 * @module AvatarUpload
 */

'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import classNames from 'classnames'

import Avatar, { type AvatarProps } from './Avatar'

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarUploadProps extends Omit<AvatarProps, 'editable' | 'onEditClick' | 'src'> {
	/** Current image path (from server) */
	currentImagePath?: string | null
	/** Callback when a file is selected */
	onImageSelect?: (file: File) => void
	/** Callback when image is removed */
	onImageRemove?: () => void
	/** Show loading state during upload */
	uploading?: boolean
	/** Error message to display */
	error?: string
	/** Maximum file size in MB (default: 5) */
	maxSizeMB?: number
	/** Accepted file types */
	acceptedTypes?: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MAX_SIZE_MB = 5
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AvatarUpload Component
 *
 * Displays avatar with upload functionality.
 * Click to open file picker, with remove button for existing images.
 */
export default function AvatarUpload({
	name,
	currentImagePath,
	onImageSelect,
	onImageRemove,
	uploading = false,
	error,
	maxSizeMB = DEFAULT_MAX_SIZE_MB,
	acceptedTypes = DEFAULT_ACCEPTED_TYPES,
	size = 'xl',
	className,
	...avatarProps
}: AvatarUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)

	// Cleanup blob URL on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
		}
	}, [previewUrl])

	// Determine which image to show (preview takes precedence)
	const displaySrc = previewUrl || currentImagePath || null
	const hasImage = !!displaySrc

	/**
	 * Handle click to open file picker
	 */
	const handleClick = useCallback(() => {
		if (!uploading) {
			inputRef.current?.click()
		}
	}, [uploading])

	/**
	 * Validate file before accepting
	 */
	const validateFile = useCallback((file: File): string | null => {
		// Check file type
		if (!acceptedTypes.includes(file.type)) {
			return 'Please upload a JPEG, PNG, or WebP image'
		}

		// Check file size
		const maxBytes = maxSizeMB * 1024 * 1024
		if (file.size > maxBytes) {
			return `Image must be smaller than ${maxSizeMB}MB`
		}

		return null
	}, [acceptedTypes, maxSizeMB])

	/**
	 * Handle file selection
	 */
	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validate
		const validationErr = validateFile(file)
		if (validationErr) {
			setValidationError(validationErr)
			return
		}

		// Clear any previous errors
		setValidationError(null)

		// Revoke previous preview URL to prevent memory leak
		setPreviewUrl((prev) => {
			if (prev) {
				URL.revokeObjectURL(prev)
			}
			return URL.createObjectURL(file)
		})

		// Notify parent
		onImageSelect?.(file)

		// Reset input so same file can be selected again
		e.target.value = ''
	}, [validateFile, onImageSelect])

	/**
	 * Handle image removal
	 */
	const handleRemove = useCallback((e: React.MouseEvent) => {
		e.stopPropagation()

		// Revoke preview URL if exists
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
			setPreviewUrl(null)
		}

		// Clear errors
		setValidationError(null)

		// Notify parent
		onImageRemove?.()
	}, [previewUrl, onImageRemove])

	/**
	 * Handle keyboard interaction
	 */
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
			e.preventDefault()
			inputRef.current?.click()
		}
	}, [uploading])

	// Combined error message
	const displayError = validationError || error

	return (
		<div className={classNames('relative inline-flex flex-col items-center gap-3', className)}>
			{/* Avatar with overlay */}
			<div
				className={classNames(
					'relative cursor-pointer',
					uploading && 'pointer-events-none'
				)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={0}
				aria-label="Upload profile picture"
			>
				{/* Avatar base */}
				<Avatar
					name={name}
					src={displaySrc}
					size={size}
					{...avatarProps}
				/>

				{/* Upload overlay */}
				<div
					className={classNames(
						'absolute inset-0 flex items-center justify-center rounded-full',
						'bg-black/50 transition-opacity duration-200',
						uploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'
					)}
				>
					{uploading ? (
						<Loader2 className="h-1/3 w-1/3 animate-spin text-white" />
					) : (
						<Camera className="h-1/3 w-1/3 text-white" />
					)}
				</div>

				{/* Remove button (only show if has image and not uploading) */}
				{hasImage && !uploading && (
					<button
						type="button"
						onClick={handleRemove}
						className={classNames(
							'absolute -right-1 -top-1 z-10',
							'flex h-6 w-6 items-center justify-center rounded-full',
							'bg-error text-error-content shadow-md',
							'transition-transform duration-150 hover:scale-110',
							'focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2'
						)}
						aria-label="Remove profile picture"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
			</div>

			{/* Helper text */}
			<div className="text-center">
				<button
					type="button"
					onClick={handleClick}
					disabled={uploading}
					className={classNames(
						'inline-flex items-center gap-1.5 text-sm font-medium',
						'text-primary hover:text-primary/80 transition-colors',
						'focus:outline-none focus:underline',
						uploading && 'pointer-events-none opacity-50'
					)}
				>
					<Upload className="h-4 w-4" />
					{hasImage ? 'Change photo' : 'Upload photo'}
				</button>
				<p className="mt-1 text-xs text-base-content/50">
					JPEG, PNG, or WebP. Max {maxSizeMB}MB.
				</p>
			</div>

			{/* Error message */}
			{displayError && (
				<p className="text-xs text-error" role="alert">
					{displayError}
				</p>
			)}

			{/* Hidden file input */}
			<input
				ref={inputRef}
				type="file"
				accept={acceptedTypes.join(',')}
				onChange={handleFileChange}
				className="hidden"
				aria-hidden="true"
			/>
		</div>
	)
}
