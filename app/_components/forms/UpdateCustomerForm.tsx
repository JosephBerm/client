'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@_utils/validation-schemas'
import { useFormSubmit } from '@_hooks/useFormSubmit'
import FormInput from './FormInput'
import FormCheckbox from './FormCheckbox'
import Button from '../ui/Button'
import Company from '@_classes/Company'
import Address from '@_classes/common/Address'
import API from '@_services/api'
import { useParams } from 'next/navigation'

interface UpdateCustomerFormProps {
  customer: Company
  onUserUpdate?: (customer: Company) => void
}

export default function UpdateCustomerForm({ customer, onUserUpdate }: UpdateCustomerFormProps) {
  const params = useParams()
  const isCreateMode = params?.id === 'create'

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      taxId: customer.taxId || '',
      website: customer.website || '',
      address: customer.address || undefined,
    },
  })

  const { submit, isSubmitting } = useFormSubmit(
    async (data: CustomerFormData) => {
      // Create a new Company instance to ensure proper type structure
      const customerData = new Company({
        ...customer,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        taxId: data.taxId || '',
        website: data.website || '',
        address: data.address ? new Address(data.address) : customer.address,
      })
      return isCreateMode ? await API.Customers.create(customerData) : await API.Customers.update(customerData)
    },
    {
      successMessage: `Customer ${isCreateMode ? 'created' : 'updated'} successfully`,
      errorMessage: `Failed to ${isCreateMode ? 'create' : 'update'} customer`,
      onSuccess: (result) => {
        if (result) {
          onUserUpdate?.(new Company(result))
        }
      }
    }
  )

  const handleSubmit = async (data: CustomerFormData) => {
    await submit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormInput
        label="Company Name"
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
          {isCreateMode ? 'Create Customer' : 'Update Customer'}
        </Button>
      </div>
    </form>
  )
}

