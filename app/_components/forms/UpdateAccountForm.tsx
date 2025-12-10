/**
 * UpdateAccountForm Component
 *
 * Form for updating user account profile information.
 * Handles personal details, contact information, and shipping address.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - User profile update (username, email, name, etc.)
 * - Nested name fields (first, middle, last)
 * - Date of birth selection
 * - Contact information (phone, mobile)
 * - Optional shipping address
 * - Zod validation with type safety
 * - useFormSubmit hook integration
 * - Responsive grid layout
 * - Loading states during submission
 * - Success callback with updated user
 * - Toast notifications
 *
 * **Form Sections:**
 * - Name: First, middle (optional), last
 * - Credentials: Username (read-only), email
 * - Personal: Date of birth
 * - Contact: Phone, mobile
 * - Shipping: Optional address fields (future enhancement)
 *
 * **Use Cases:**
 * - User profile settings page
 * - Account management dashboard
 * - Admin updating user accounts
 *
 * @example
 * ```tsx
 * import UpdateAccountForm from '@_components/forms/UpdateAccountForm';
 * import { useAuthStore } from '@_features/auth';
 *
 * function ProfileSettingsPage() {
 *   const user = useAuthStore(state => state.user);
 *   const setUser = useAuthStore(state => state.setUser);
 *
 *   if (!user) return <div>Please log in</div>;
 *
 *   return (
 *     <div className="max-w-2xl mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
 *       <UpdateAccountForm
 *         user={user}
 *         onUserUpdate={(updatedUser) => {
 *           setUser(updatedUser);
 *           logger.info('Profile updated successfully', { userId: updatedUser.id });
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module UpdateAccountForm
 */

'use client'

import React, { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { logger, profileUpdateSchema, type ProfileUpdateFormData } from '@_core'

import { useFormSubmit , API } from '@_shared'

import Address from '@_classes/common/Address'
import Name from '@_classes/common/Name'
import type { IUser } from '@_classes/User'
import User from '@_classes/User'

import Button from '@_components/ui/Button'

import FormInput from './FormInput'


/**
 * UpdateAccountForm component props interface.
 */
interface UpdateAccountFormProps {
	/**
	 * Current user object to populate form fields.
	 * Must be a valid user with ID.
	 */
	user: IUser

	/**
	 * Callback fired after successful profile update.
	 * Receives the updated user object.
	 * @param user - Updated user entity
	 */
	onUserUpdate?: (user: IUser) => void
}

/**
 * UpdateAccountForm Component
 *
 * Comprehensive user profile update form with nested field support.
 * Handles complex user entity construction while preserving class methods.
 *
 * **Default Values:**
 * - Pre-fills all fields from user prop
 * - Handles nested name object (first, middle, last)
 * - Converts date strings to Date objects
 * - Preserves optional fields (phone, mobile, shipping)
 *
 * **Submission Logic:**
 * - Constructs new User entity to preserve class methods
 * - Creates new Name entity from form data
 * - Creates new Address entity if shipping details provided
 * - Calls API.Accounts.update with complete user object
 * - Invokes onUserUpdate callback with result
 *
 * **Field Organization:**
 * - Name fields: 2-column grid on desktop
 * - Username: Read-only (cannot be changed)
 * - Other fields: Full width
 * - Submit button: Right-aligned
 *
 * @param props - Component props including user and onUserUpdate
 * @returns UpdateAccountForm component
 */
export default function UpdateAccountForm({ user, onUserUpdate }: UpdateAccountFormProps) {
	const form = useForm<ProfileUpdateFormData>({
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			username: user.username || '',
			email: user.email || '',
			name: {
				first: user.name?.first ?? '',
				middle: user.name?.middle ?? '',
				last: user.name?.last ?? '',
			},
			dateOfBirth: user.dateOfBirth,
			phone: user.phone ?? '',
			mobile: user.mobile ?? '',
			shippingDetails: user.shippingDetails ?? undefined,
		},
	})

	const { submit, isSubmitting } = useFormSubmit(
		async (data: ProfileUpdateFormData) => {
			const updatedUser = new User({
				...user,
				username: data.username,
				email: data.email,
				name: new Name(data.name),
				dateOfBirth: data.dateOfBirth,
				phone: data.phone,
				mobile: data.mobile,
				shippingDetails: data.shippingDetails ? new Address(data.shippingDetails) : user.shippingDetails,
			})
			return API.Accounts.update(updatedUser)
		},
		{
			successMessage: 'Account updated successfully',
			errorMessage: 'Failed to update account',
			onSuccess: (result) => {
				if (result) {
					onUserUpdate?.(new User(result))
				}
			},
		}
	)

	/**
	 * Form submission handler for React Hook Form.
	 * Wraps async handler to satisfy ESLint's no-misused-promises rule.
	 * React Hook Form supports async handlers, but we need to handle the Promise explicitly.
	 * 
	 * FAANG Pattern: Extract event handlers from JSX for separation of concerns.
	 */
	const handleSubmit = useCallback((data: ProfileUpdateFormData): void => {
		void submit(data).catch((error) => {
			// Error already handled in submit function, but catch any unhandled rejections
			logger.error('Unhandled form submission error', {
				error,
				component: 'UpdateAccountForm',
				action: 'handleSubmit',
			})
		})
	}, [submit])

	/**
	 * Form onSubmit handler that properly handles React Hook Form's Promise return.
	 * Extracted from JSX for clean code and separation of concerns.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers to prevent unnecessary re-renders.
	 */
	const onFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
		const submitHandler = form.handleSubmit(handleSubmit)
		const result = submitHandler(e)
		// React Hook Form's handleSubmit may return a Promise if handler is async
		// Handle it explicitly to satisfy ESLint's no-misused-promises rule
		if (result instanceof Promise) {
			void result.catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'UpdateAccountForm',
					action: 'onFormSubmit',
				})
			})
		}
	}, [form, handleSubmit])

	return (
		<form onSubmit={onFormSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="First Name"
					{...form.register('name.first')}
					error={form.formState.errors.name?.first}
					disabled={isSubmitting}
				/>
				<FormInput
					label="Last Name"
					{...form.register('name.last')}
					error={form.formState.errors.name?.last}
					disabled={isSubmitting}
				/>
			</div>

			<FormInput
				label="Middle Name"
				{...form.register('name.middle')}
				error={form.formState.errors.name?.middle}
				disabled={isSubmitting}
			/>

			<FormInput
				label="Username"
				{...form.register('username')}
				error={form.formState.errors.username}
				disabled={true}
				helperText="Username cannot be changed"
			/>

			<FormInput
				label="Email"
				type="email"
				{...form.register('email')}
				error={form.formState.errors.email}
				disabled={isSubmitting}
			/>

			<FormInput
				label="Date of Birth"
				type="date"
				{...form.register('dateOfBirth', { valueAsDate: true })}
				error={form.formState.errors.dateOfBirth}
				disabled={isSubmitting}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					label="Phone"
					type="tel"
					{...form.register('phone')}
					error={form.formState.errors.phone}
					disabled={isSubmitting}
				/>
				<FormInput
					label="Mobile"
					type="tel"
					{...form.register('mobile')}
					error={form.formState.errors.mobile}
					disabled={isSubmitting}
				/>
			</div>

			<div className="flex justify-end">
				<Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
					Update Profile
				</Button>
			</div>
		</form>
	)
}
