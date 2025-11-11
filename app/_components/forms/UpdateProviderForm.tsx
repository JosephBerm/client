'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { providerSchema, type ProviderFormData } from '@_utils/validation-schemas'
import { useFormSubmit } from '@_hooks/useFormSubmit'
import FormInput from './FormInput'
import Button from '../ui/Button'
import Provider from '@_classes/Provider'
import Address from '@_classes/common/Address'
import API from '@_services/api'
import { useParams } from 'next/navigation'

interface UpdateProviderFormProps {
  provider: Provider
  onUpdate?: (provider: Provider) => void
}

export default function UpdateProviderForm({ provider, onUpdate }: UpdateProviderFormProps) {
  const params = useParams()
  const isCreateMode = params?.id === 'create'

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      taxId: provider.taxId || '',
      website: provider.website || '',
      address: provider.address || undefined,
    },
  })

  const { submit, isSubmitting } = useFormSubmit(
    async (data: ProviderFormData) => {
      // Create a new Provider instance to ensure proper type structure
      const providerData = new Provider({
        ...provider,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        taxId: data.taxId || '',
        website: data.website || '',
        address: data.address ? new Address(data.address) : provider.address,
      })
      return isCreateMode ? await API.Providers.create(providerData) : await API.Providers.update(providerData)
    },
    {
      successMessage: `Provider ${isCreateMode ? 'created' : 'updated'} successfully`,
      errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} provider`,
      onSuccess: (result) => {
        if (result) {
          onUpdate?.(new Provider(result))
        }
      }
    }
  )

  const handleSubmit = async (data: ProviderFormData) => {
    await submit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormInput
        label="Provider Name"
        {...form.register('name')}
        error={form.formState.errors.name}
        disabled={isSubmitting}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email"
          type="email"
          {...form.register('email')}
          error={form.formState.errors.email}
          disabled={isSubmitting}
        />
        <FormInput
          label="Phone"
          type="tel"
          {...form.register('phone')}
          error={form.formState.errors.phone}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Tax ID"
          {...form.register('taxId')}
          error={form.formState.errors.taxId}
          disabled={isSubmitting}
        />
        <FormInput
          label="Website"
          type="url"
          {...form.register('website')}
          error={form.formState.errors.website}
          disabled={isSubmitting}
          placeholder="https://example.com"
        />
      </div>

      {/* Address section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="space-y-4">
          <FormInput
            label="Street"
            {...form.register('address.street')}
            error={form.formState.errors.address?.street}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="City"
              {...form.register('address.city')}
              error={form.formState.errors.address?.city}
              disabled={isSubmitting}
            />
            <FormInput
              label="State/Province"
              {...form.register('address.state')}
              error={form.formState.errors.address?.state}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ZIP/Postal Code"
              {...form.register('address.zipCode')}
              error={form.formState.errors.address?.zipCode}
              disabled={isSubmitting}
            />
            <FormInput
              label="Country"
              {...form.register('address.country')}
              error={form.formState.errors.address?.country}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          {isCreateMode ? 'Create Provider' : 'Update Provider'}
        </Button>
      </div>
    </form>
  )
}

