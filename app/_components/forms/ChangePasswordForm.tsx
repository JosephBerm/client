'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordFormData } from '@_utils/validation-schemas'
import { useFormSubmit } from '@_hooks/useFormSubmit'
import FormInput from './FormInput'
import Button from '../ui/Button'
import type { IUser } from '@_classes/User'
import API from '@_services/api'
import { toast } from 'react-toastify'

interface ChangePasswordFormProps {
  user: IUser
}

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
        toast.error('User ID is required')
        throw new Error('User ID is required')
      }
      return await API.Accounts.changePasswordById(user.id, data.oldPassword, data.newPassword)
    },
    {
      successMessage: 'Password changed successfully',
      errorMessage: 'Failed to change password',
      onSuccess: () => {
        form.reset()
      }
    }
  )

  const handleSubmit = async (data: ChangePasswordFormData) => {
    await submit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-md">
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

