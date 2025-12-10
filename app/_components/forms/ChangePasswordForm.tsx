/**
 * ChangePasswordForm Component
 *
 * Form for changing user password with validation and security best practices.
 * Requires current password verification and new password confirmation.
 * Uses React Hook Form with Zod validation and DRY submission pattern.
 *
 * **Features:**
 * - Current password verification
 * - New password with confirmation
 * - Zod validation (strength requirements)
 * - useFormSubmit hook integration
 * - Loading states during submission
 * - Success/error toast notifications
 * - Form reset on success
 * - Password autocomplete attributes
 *
 * **Security:**
 * - Requires old password verification (prevents unauthorized changes)
 * - Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
 * - Confirmation password must match
 * - Password fields have appropriate autocomplete attributes
 *
 * **Use Cases:**
 * - User profile settings
 * - Security settings page
 * - Admin changing user passwords
 *
 * @example
 * ```tsx
 * import ChangePasswordForm from '@_components/forms/ChangePasswordForm';
 * import { useAuthStore } from '@_features/auth';
 *
 * function ProfilePage() {
 *   const user = useAuthStore(state => state.user);
 *
 *   if (!user) return null;
 *
 *   return (
 *     <div className="max-w-2xl mx-auto p-6">
 *       <h1 className="text-2xl font-bold mb-6">Change Password</h1>
 *       <ChangePasswordForm user={user} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module ChangePasswordForm
 */

'use client'

import React, { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { changePasswordSchema, type ChangePasswordFormData, logger } from '@_core'

import { useFormSubmit , API , notificationService } from '@_shared'

import type { IUser } from '@_classes/User'

import Button from '@_components/ui/Button'

import FormInput from './FormInput'



/**
 * ChangePasswordForm component props interface.
 */
interface ChangePasswordFormProps {
	/**
	 * User object for whom the password is being changed.
	 * Must have an ID for the API call.
	 */
	user: IUser
}

/**
 * ChangePasswordForm Component
 *
 * Password change form with validation, security checks, and user feedback.
 * Handles form submission via useFormSubmit hook with automatic error handling.
 *
 * **Form Fields:**
 * - Old Password: Current password for verification
 * - New Password: New password (must meet strength requirements)
 * - Confirm New Password: Confirmation field (must match new password)
 *
 * **Validation:**
 * - Old password: Required
 * - New password: Min 8 chars, uppercase, lowercase, number, special char
 * - Confirm password: Must match new password
 *
 * **Submission Flow:**
 * 1. Validate form data with Zod schema
 * 2. Call API.Accounts.changePasswordById with user ID and passwords
 * 3. Show success toast and reset form
 * 4. Show error toast if submission fails
 *
 * @param props - Component props including user
 * @returns ChangePasswordForm component
 */
export default function ChangePasswordForm({ user }: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const { submit, isSubmitting } = useFormSubmit(
    async (data: ChangePasswordFormData) => {
      if (!user?.id) {
        notificationService.error('User ID is required', {
          component: 'ChangePasswordForm',
          action: 'validateUser',
        })
        throw new Error('User ID is required')
      }
      // ESLint rule: return-await only in try-catch, but we're in async function
      // Return the promise directly (no await needed here)
      return API.Accounts.changePasswordById(user.id, data.oldPassword, data.newPassword)
    },
    {
      successMessage: 'Password changed successfully',
      errorMessage: 'Failed to change password',
      onSuccess: () => {
        form.reset()
      }
    }
  )

  /**
   * Form submission handler for React Hook Form.
   * Wraps async handler to satisfy ESLint's no-misused-promises rule.
   * React Hook Form supports async handlers, but we need to handle the Promise explicitly.
   * 
   * FAANG Pattern: Extract event handlers from JSX for separation of concerns.
   */
  const handleSubmit = useCallback((data: ChangePasswordFormData): void => {
    void submit(data).catch((error) => {
      // Error already handled in submit function, but catch any unhandled rejections
      logger.error('Unhandled form submission error', {
        error,
        component: 'ChangePasswordForm',
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
          component: 'ChangePasswordForm',
          action: 'onFormSubmit',
        })
      })
    }
  }, [form, handleSubmit])

  return (
    <form onSubmit={onFormSubmit} className="space-y-6 max-w-md">
      <FormInput
        label="Current Password"
        type="password"
        {...form.register('oldPassword')}
        error={form.formState.errors.oldPassword}
        disabled={isSubmitting}
        autoComplete="current-password"
      />

      <FormInput
        label="New Password"
        type="password"
        {...form.register('newPassword')}
        error={form.formState.errors.newPassword}
        disabled={isSubmitting}
        autoComplete="new-password"
      />

      <FormInput
        label="Confirm New Password"
        type="password"
        {...form.register('confirmNewPassword')}
        error={form.formState.errors.confirmNewPassword}
        disabled={isSubmitting}
        autoComplete="new-password"
      />

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          Change Password
        </Button>
      </div>
    </form>
  )
}

