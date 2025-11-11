'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileUpdateSchema, type ProfileUpdateFormData } from '@_utils/validation-schemas'
import { useFormSubmit } from '@_hooks/useFormSubmit'
import FormInput from './FormInput'
import Button from '../ui/Button'
import User, { type IUser } from '@_classes/User'
import Name from '@_classes/common/Name'
import Address from '@_classes/common/Address'
import API from '@_services/api'

interface UpdateAccountFormProps {
  user: IUser
  onUserUpdate?: (user: IUser) => void
}

export default function UpdateAccountForm({ user, onUserUpdate }: UpdateAccountFormProps) {
  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      name: {
        first: user.name?.first || '',
        middle: user.name?.middle || '',
        last: user.name?.last || '',
      },
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
      phone: user.phone || '',
      mobile: user.mobile || '',
      shippingDetails: user.shippingDetails || undefined,
    },
  })

  const { submit, isSubmitting } = useFormSubmit(
    async (data: ProfileUpdateFormData) => {
      // Create a new User instance to ensure proper type structure
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
      return await API.Accounts.update(updatedUser)
    },
    {
      successMessage: 'Account updated successfully',
      errorMessage: 'Failed to update account',
      onSuccess: (result) => {
        if (result) {
          onUserUpdate?.(new User(result))
        }
      }
    }
  )

  const handleSubmit = async (data: ProfileUpdateFormData) => {
    await submit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Name fields */}
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

      {/* Username & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Username"
          {...form.register('username')}
          error={form.formState.errors.username}
          disabled={isSubmitting}
        />
        <FormInput
          label="Email"
          type="email"
          {...form.register('email')}
          error={form.formState.errors.email}
          disabled={isSubmitting}
        />
      </div>

      {/* Phone numbers */}
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

      {/* Shipping Address */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
        <div className="space-y-4">
          <FormInput
            label="Street"
            {...form.register('shippingDetails.street')}
            error={form.formState.errors.shippingDetails?.street}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              {...form.register('shippingDetails.city')}
              error={form.formState.errors.shippingDetails?.city}
              disabled={isSubmitting}
            />
            <FormInput
              label="State/Province"
              {...form.register('shippingDetails.state')}
              error={form.formState.errors.shippingDetails?.state}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ZIP/Postal Code"
              {...form.register('shippingDetails.zipCode')}
              error={form.formState.errors.shippingDetails?.zipCode}
              disabled={isSubmitting}
            />
            <FormInput
              label="Country"
              {...form.register('shippingDetails.country')}
              error={form.formState.errors.shippingDetails?.country}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          Update Account
        </Button>
      </div>
    </form>
  )
}

